import {
  commitWrites,
  deleteFirebaseUser,
  documentName,
  encodeFields,
  getDocument,
  listDocuments,
  runQuery
} from './firestore.js';
import { SERVER_CATALOG } from './catalog.generated.js';
import { ApiError } from './app/errors.js';
import { json, corsHeaders } from './app/http.js';
import { isValidFirebasePrivateKey, requiredFirebaseEnv } from './app/env.js';
import { authenticate } from './infrastructure/firebase/auth.js';

const bundledProducts = new Map(SERVER_CATALOG.map(product => [product.id, product]));

function text(value, label, maxLength = 500) {
  const normalized = String(value || '').trim();
  if (!normalized) throw new ApiError(400, 'invalid_argument', `Thiếu ${label}.`);
  return normalized.slice(0, maxLength);
}

function validateAddress(value = {}) {
  const provinceCode = Number(value.provinceCode);
  const wardCode = Number(value.wardCode);
  if (!Number.isInteger(provinceCode) || provinceCode <= 0 || !Number.isInteger(wardCode) || wardCode <= 0) {
    throw new ApiError(400, 'invalid_address', 'Vui lòng chọn đầy đủ tỉnh/thành và phường/xã.');
  }
  const address = {
    line1: text(value.line1, 'địa chỉ chi tiết', 240),
    wardCode,
    wardName: text(value.wardName, 'phường/xã', 120),
    provinceCode,
    provinceName: text(value.provinceName, 'tỉnh/thành', 120)
  };
  address.fullAddress = `${address.line1}, ${address.wardName}, ${address.provinceName}`;
  return address;
}

function updateWrite(env, path, value, fieldPaths, precondition) {
  return {
    update: { name: documentName(env, path), fields: encodeFields(value) },
    ...(fieldPaths ? { updateMask: { fieldPaths } } : {}),
    ...(precondition ? { currentDocument: precondition } : {})
  };
}

const devOrdersStore = new Map();

function isFirestoreConfigured(env) {
  return Boolean(env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && isValidFirebasePrivateKey(env.FIREBASE_PRIVATE_KEY));
}

async function createOrder(request, env, user) {
  const hasFirestore = isFirestoreConfigured(env);
  if (!hasFirestore && !env.IS_LOCAL_DEV) {
    requiredFirebaseEnv(env);
  }
  const payload = await request.json().catch(() => { throw new ApiError(400, 'invalid_json', 'Dữ liệu gửi lên không hợp lệ.'); });
  const requestedItems = Array.isArray(payload.items) ? payload.items : [];
  if (!requestedItems.length || requestedItems.length > 50) throw new ApiError(400, 'invalid_cart', 'Giỏ hàng không hợp lệ.');

  const quantities = new Map();
  for (const item of requestedItems) {
    const productId = text(item?.productId, 'mã sản phẩm', 160);
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new ApiError(400, 'invalid_quantity', 'Số lượng sản phẩm không hợp lệ.');
    const total = (quantities.get(productId) || 0) + quantity;
    if (total > 20) throw new ApiError(400, 'invalid_quantity', 'Mỗi sản phẩm chỉ được đặt tối đa 20 đơn vị.');
    quantities.set(productId, total);
  }

  const productIds = [...quantities.keys()];
  const products = await Promise.all(productIds.map(async id => {
    // The storefront uses bundled catalog fields before remote fields. Checkout
    // must use the same trusted server catalog so an older Firestore price cannot
    // charge a different amount from the advertised price.
    if (!hasFirestore) return bundledProducts.get(id) || null;
    const remoteProduct = await getDocument(env, `products/${id}`);
    const localProduct = bundledProducts.get(id);
    return localProduct ? { ...remoteProduct, ...localProduct } : remoteProduct || null;
  }));
  const items = products.map((product, index) => {
    const productId = productIds[index];
    if (!product) throw new ApiError(409, 'product_unavailable', `Sản phẩm ${productId} không còn tồn tại.`);
    const price = Number(product.price);
    if (!Number.isFinite(price) || price < 0) throw new ApiError(409, 'invalid_product_price', `Giá sản phẩm ${productId} không hợp lệ.`);
    const quantity = quantities.get(productId);
    return {
      productId,
      name: String(product.name || productId),
      image: String(product.image || ''),
      volume: String(product.volume || ''),
      price,
      quantity,
      lineTotal: price * quantity
    };
  });

  const shippingAddress = validateAddress(payload.customer?.shippingAddress);
  const customerName = text(payload.customer?.name, 'họ tên', 120);
  const customerPhone = text(payload.customer?.phone, 'số điện thoại', 30).replace(/[\s.-]/g, '');
  if (!/^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/.test(customerPhone)) {
    throw new ApiError(400, 'invalid_phone', 'Số điện thoại Việt Nam chưa đúng định dạng.');
  }
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const couponCode = String(payload.couponCode || '').trim().toUpperCase();
  let discountAmount = 0;
  if (couponCode === 'SKINID10' && subtotal >= 200000) {
    discountAmount = Math.min(150000, Math.round(subtotal * 0.1));
  } else if (couponCode === 'WELCOME50' && subtotal >= 300000) {
    discountAmount = Math.min(50000, subtotal);
  } else if (couponCode === 'FREESHIP') {
    discountAmount = Math.min(30000, shippingFee);
  }
  const finalTotal = Math.max(0, subtotal - discountAmount) + shippingFee;

  const now = new Date();
  const idempotencyKey = String(request.headers.get('idempotency-key') || '').trim();
  let orderId = crypto.randomUUID().replaceAll('-', '');
  if (idempotencyKey) {
    if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) throw new ApiError(400, 'invalid_idempotency_key', 'Mã xác nhận đơn hàng không hợp lệ.');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${user.sub}:${idempotencyKey}`));
    orderId = [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('').slice(0, 32);
    const existingOrder = await getDocument(env, `orders/${orderId}`);
    if (existingOrder?.userId === user.sub) {
      return json(request, env, {
        success: true,
        duplicate: true,
        orderId,
        subtotal: existingOrder.subtotal,
        discount: existingOrder.discountAmount || 0,
        shippingFee: existingOrder.shippingFee,
        total: existingOrder.total
      });
    }
  }
  const paymentMethod = payload.paymentMethod === 'bank_transfer' ? 'bank_transfer' : 'cod';
  const order = {
    userId: user.sub,
    customer: {
      name: customerName,
      email: String(user.email || '').slice(0, 254),
      phone: customerPhone,
      address: shippingAddress.fullAddress,
      shippingAddress
    },
    items,
    note: String(payload.note || '').trim().slice(0, 1000),
    subtotal,
    discountAmount,
    couponCode: couponCode || null,
    shippingFee,
    total: finalTotal,
    paymentMethod,
    paymentStatus: 'unpaid',
    status: 'pending',
    source: 'cloudflare-worker',
    createdAt: now,
    updatedAt: now
  };
  const profile = {
    name: customerName,
    phone: customerPhone,
    address: shippingAddress.fullAddress,
    shippingAddress,
    updatedAt: now
  };
  const address = { ...shippingAddress, recipientName: customerName, phone: customerPhone, isDefault: true, updatedAt: now };
  const activity = { type: 'order_created', orderId, total: order.total, createdAt: now };

  if (hasFirestore) {
    await commitWrites(env, [
      updateWrite(env, `orders/${orderId}`, order, null, { exists: false }),
      updateWrite(env, `users/${user.sub}`, profile, Object.keys(profile)),
      updateWrite(env, `users/${user.sub}/addresses/default`, address),
      updateWrite(env, `users/${user.sub}/activities/${orderId}`, activity),
      { delete: documentName(env, `users/${user.sub}/commerce/cart`) }
    ]);
  } else {
    order.id = orderId;
    devOrdersStore.set(orderId, order);
  }

  return json(request, env, { success: true, orderId, subtotal, discount: discountAmount, shippingFee, total: order.total }, 201);
}

async function cancelOrder(request, env, user, orderId) {
  const hasFirestore = isFirestoreConfigured(env);
  let order = null;
  if (hasFirestore) {
    order = await getDocument(env, `orders/${orderId}`);
  } else {
    order = devOrdersStore.get(orderId);
  }
  if (!order || order.userId !== user.sub) throw new ApiError(404, 'order_not_found', 'Không tìm thấy đơn hàng.');
  if (!['pending', 'confirmed'].includes(order.status)) throw new ApiError(409, 'order_not_cancellable', 'Đơn hàng không thể hủy ở trạng thái hiện tại.');
  
  if (hasFirestore) {
    await commitWrites(env, [updateWrite(env, `orders/${orderId}`, {
      status: 'cancelled',
      updatedAt: new Date()
    }, ['status', 'updatedAt'])]);
  } else {
    order.status = 'cancelled';
    order.updatedAt = new Date();
    devOrdersStore.set(orderId, order);
  }
  return json(request, env, { success: true, orderId });
}

async function listOrders(request, env, user) {
  const hasFirestore = isFirestoreConfigured(env);
  let orders = [];
  if (hasFirestore) {
    try {
      const results = await runQuery(env, {
        from: [{ collectionId: 'orders' }],
        where: { fieldFilter: { field: { fieldPath: 'userId' }, op: 'EQUAL', value: { stringValue: user.sub } } }
      });
      orders = results.map(doc => ({ id: doc.id, ...doc }));
    } catch (err) {
      console.warn('[Worker Orders] Query error:', err);
    }
  } else {
    for (const [id, ord] of devOrdersStore.entries()) {
      if (ord.userId === user.sub) {
        orders.push({ id, ...ord });
      }
    }
  }
  orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return json(request, env, { success: true, orders });
}

const memoryRateLimits = new Map();

export function clearMemoryRateLimits() {
  memoryRateLimits.clear();
}

function checkMemoryRateLimit(userId, maxRequests = 10, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const timestamps = (memoryRateLimits.get(userId) || []).filter(t => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  memoryRateLimits.set(userId, timestamps);
  if (memoryRateLimits.size > 2000) {
    for (const [k, v] of memoryRateLimits.entries()) {
      if (v.every(t => now - t >= windowMs)) memoryRateLimits.delete(k);
    }
  }
  return true;
}

async function checkSkinQuota(env, user) {
  const hasFirestore = Boolean(env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY);
  if (hasFirestore) {
    try {
      const quotaPath = `users/${user.sub}/private/aiUsage`;
      const quota = await getDocument(env, quotaPath);
      const today = new Date().toISOString().slice(0, 10);
      const count = quota?.date === today ? Number(quota.count || 0) : 0;
      if (count >= 10) throw new ApiError(429, 'daily_limit', 'Bạn đã hết 10 lượt phân tích da hôm nay.');
      await commitWrites(env, [updateWrite(env, quotaPath, { date: today, count: count + 1, updatedAt: new Date() })]);
      return;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.warn('[SkinID Quota] Firestore quota check failed, falling back to memory rate limiter:', err?.message);
    }
  }
  // Fail-safe in-Worker sliding window rate limit:
  // In development / local testing, allow up to 50 requests/10min so devs/testers can test freely.
  // In production, allow 10 requests / 10 minutes to protect key against spam.
  const isDev = Boolean(env.IS_LOCAL_DEV === 'true' || env.NODE_ENV === 'development' || !env.ENVIRONMENT || env.ENVIRONMENT === 'development');
  const maxRequests = isDev ? 50 : 10;
  if (!checkMemoryRateLimit(user.sub, maxRequests, 10 * 60 * 1000)) {
    throw new ApiError(429, 'rate_limited', 'Bạn đang thao tác quá nhanh hoặc đã đạt giới hạn tạm thời. Vui lòng thử lại sau ít phút.');
  }
}

function validateImages(payload) {
  if (!Array.isArray(payload?.images) || payload.images.length !== 3) {
    throw new ApiError(400, 'invalid_images', 'Cần đúng 3 ảnh khuôn mặt.');
  }
  let totalBytes = 0;
  const images = payload.images.map((rawImage, index) => {
    if (typeof rawImage !== 'string') throw new ApiError(400, 'invalid_image', `Ảnh #${index + 1} không hợp lệ.`);
    const cleanImage = rawImage.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').replace(/\s+/g, '');
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleanImage)) throw new ApiError(400, 'invalid_image', `Ảnh #${index + 1} không hợp lệ.`);
    const bytes = Math.floor(cleanImage.length * 3 / 4);
    if (bytes > 4 * 1024 * 1024) throw new ApiError(413, 'image_too_large', `Ảnh #${index + 1} vượt quá 4 MB.`);
    totalBytes += bytes;
    return cleanImage;
  });
  if (totalBytes > 10 * 1024 * 1024) throw new ApiError(413, 'images_too_large', 'Tổng dung lượng ảnh vượt quá 10 MB.');
  return { images, skinType: String(payload.skinType || 'Chưa xác định').slice(0, 80) };
}

function analysisPrompt(skinType) {
  return `Bạn là chuyên gia phân tích da AI cấp chuyên viên da liễu. NGUYÊN TẮC BẮT BUỘC:
1. BẠN PHẢI KIỂM TRA 3 BỨC ẢNH CÓ PHẢI LÀ KHUÔN MẶT NGƯỜI RÕ RÀNG HAY KHÔNG.
Nếu ảnh là đồ vật, thú cưng, ảnh tối đen hoặc KHÔNG CÓ MẶT NGƯỜI RÕ RÀNG, BẠN PHẢI TRẢ VỀ DUY NHẤT:
{"isNotFace": true, "reason": "No human face detected"}

2. Nếu ĐÚNG LÀ KHUÔN MẶT NGƯỜI, hãy phân tích 3 bức ảnh khuôn mặt (chính diện, nghiêng trái 45°, nghiêng phải 45°) của khách hàng với thông tin tự khai: "${skinType}".
Chỉ trả về DUY NHẤT một chuỗi JSON thuần (không chứa markdown hay \`\`\`json), theo đúng cấu trúc sau:
{
  "isNotFace": false,
  "skinTypeSummary": "Phân loại da ngắn gọn (vd: Da hỗn hợp thiên dầu nhạy cảm)",
  "analysis3Angles": "Đánh giá chi tiết tình trạng da dựa trên 3 góc độ ảnh (khoảng 4-5 câu tiếng Việt, chuyên nghiệp)",
  "activeIngredients": ["Tên hoạt chất 1", "Tên hoạt chất 2", "Tên hoạt chất 3"],
  "overallGrade": "A",
  "overallGradeComment": "Nhận xét ngắn về tình trạng da",
  "skinConditions": [{"name": "Tên tình trạng", "severity": "Nhẹ", "location": "Má", "description": "Mô tả ngắn"}],
  "recoveryTimeline": "4-6 tuần",
  "healthScore": 75,
  "skinAge": 26,
  "moisture": 65,
  "elasticity": 70,
  "sebum": 85,
  "pigmentation": 45,
  "pores": 60,
  "eyeWrinkles": 70,
  "nasolabialFolds": 68,
  "redness": 62,
  "acneBacteria": 55,
  "texture": 66,
  "darkCircles": 60,
  "melasma": 50,
  "detailedAdvice": {
    "moisture": {"why": "Giải thích chỉ số dựa trên ảnh", "shouldDo": "Lời khuyên nên làm", "avoid": "Điều cần tránh"},
    "sebum": {"why": "Giải thích chỉ số dựa trên ảnh", "shouldDo": "Lời khuyên nên làm", "avoid": "Điều cần tránh"},
    "pores": {"why": "Giải thích chỉ số dựa trên ảnh", "shouldDo": "Lời khuyên nên làm", "avoid": "Điều cần tránh"},
    "pigmentation": {"why": "Giải thích chỉ số dựa trên ảnh", "shouldDo": "Lời khuyên nên làm", "avoid": "Điều cần tránh"},
    "elasticity": {"why": "Giải thích chỉ số dựa trên ảnh", "shouldDo": "Lời khuyên nên làm", "avoid": "Điều cần tránh"}
  }
}
Mọi chỉ số là số nguyên từ 0 đến 100. Tất cả nội dung phải bằng tiếng Việt.`;
}

function validateAnalysis(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new ApiError(502, 'invalid_ai_response', 'Gemini không trả về dữ liệu hợp lệ.');
  }
  const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  let value;
  try {
    value = JSON.parse(cleanJson);
  } catch {
    throw new ApiError(502, 'invalid_ai_response', 'Kết quả phân tích không hợp lệ, vui lòng thử lại.');
  }

  if (!value || typeof value !== 'object') {
    throw new ApiError(502, 'invalid_ai_response', 'Gemini không trả về dữ liệu hợp lệ.');
  }
  if (value.isNotFace === true || value.isNotFace === 'true') {
    return { isNotFace: true, reason: String(value.reason || 'No human face detected') };
  }
  if (!value.skinTypeSummary || !value.analysis3Angles) {
    throw new ApiError(502, 'invalid_ai_response', 'Kết quả phân tích thiếu trường bắt buộc.');
  }

  const defaultMetrics = {
    healthScore: 72, skinAge: 26, moisture: 60, elasticity: 65, sebum: 65,
    pigmentation: 50, pores: 60, eyeWrinkles: 65, nasolabialFolds: 65,
    redness: 50, acneBacteria: 50, texture: 65, darkCircles: 55, melasma: 50
  };

  for (const [key, defaultVal] of Object.entries(defaultMetrics)) {
    const rawNum = Number(value[key]);
    value[key] = Number.isFinite(rawNum) ? Math.max(0, Math.min(100, Math.round(rawNum))) : defaultVal;
  }

  if (!Array.isArray(value.activeIngredients)) {
    value.activeIngredients = typeof value.activeIngredients === 'string' ? [value.activeIngredients] : ['Niacinamide', 'Hyaluronic Acid'];
  }
  if (!Array.isArray(value.skinConditions)) {
    value.skinConditions = [];
  }
  if (!value.overallGrade) value.overallGrade = 'B';
  if (!value.overallGradeComment) value.overallGradeComment = 'Làn da ở mức ổn định, cần duy trì chu trình chăm sóc.';
  if (!value.recoveryTimeline) value.recoveryTimeline = '4-6 tuần';
  if (!value.detailedAdvice || typeof value.detailedAdvice !== 'object') value.detailedAdvice = null;

  return value;
}

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest'
];

function isRetryableGeminiError(status) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function callGeminiWithFallback(env, prompt, images) {
  let lastError = null;
  const apiBase = (env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/$/, '');
  for (const model of GEMINI_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      const response = await fetch(`${apiBase}/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              ...images.map(data => ({ inlineData: { mimeType: 'image/jpeg', data } }))
            ]
          }],
          generationConfig: { temperature: 0.1, topP: 0.8, responseMimeType: 'application/json' }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const payload = await response.json();
        const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) return { rawText, model };
      }

      const errJson = await response.json().catch(() => ({}));
      const geminiMsg = errJson?.error?.message || `HTTP ${response.status}`;
      const errReason = errJson?.error?.details?.[0]?.reason || errJson?.error?.status || '';
      console.error(`[SkinID Gemini] Error from model ${model} (${response.status}):`, errJson);

      // Specific error handling for API key issues
      if (response.status === 401 || response.status === 403 || errReason === 'API_KEY_INVALID' || geminiMsg.toLowerCase().includes('api key')) {
        throw new ApiError(503, 'gemini_key_invalid', `Khóa API Gemini chưa hợp lệ hoặc chưa được cấu hình đúng trên hệ thống (${geminiMsg}).`);
      }

      // Specific error handling for Quota / Rate limits
      if (response.status === 429 || errReason === 'RESOURCE_EXHAUSTED' || geminiMsg.toLowerCase().includes('quota')) {
        lastError = new ApiError(429, 'gemini_quota_exhausted', 'Hạn mức (quota) Gemini của hệ thống đã tạm thời đạt giới hạn. Vui lòng thử lại sau ít phút.');
        console.warn(`[SkinID Gemini] Model ${model} quota exhausted, trying next model...`);
        continue;
      }

      // Specific error handling for Region / Geolocation restrictions
      if (geminiMsg.toLowerCase().includes('location is not supported') || errReason === 'FAILED_PRECONDITION') {
        lastError = new ApiError(400, 'gemini_location_error', `Vị trí máy chủ tạm thời chưa được Google AI hỗ trợ (${geminiMsg}). Cloudflare Smart Placement đang tối ưu định tuyến, vui lòng nhấn thử lại.`);
        console.warn(`[SkinID Gemini] Model ${model} location blocked, trying next model...`);
        continue;
      }

      if (isRetryableGeminiError(response.status)) {
        console.warn(`[SkinID Gemini] Model ${model} returned retryable status ${response.status}, trying fallback...`);
        lastError = new Error(`Model ${model} returned ${response.status}`);
        continue;
      }

      // If non-retryable for this specific model (e.g. 404 not found in region), try next model before failing
      lastError = new ApiError(400, 'gemini_error', `Không thể hoàn tất phân tích da (${geminiMsg}).`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'gemini_key_invalid') throw err;
        lastError = err;
      } else {
        console.warn(`[SkinID Gemini] Error with model ${model}:`, err.message);
        lastError = err;
      }
    }
  }

  if (lastError instanceof ApiError) throw lastError;
  throw new ApiError(503, 'gemini_unavailable', 'Dịch vụ phân tích AI đang bận hoặc tạm thời gián đoạn, vui lòng thử lại sau ít phút.');
}

async function analyzeSkin(request, env, user) {
  if (!env.GEMINI_API_KEY) throw new ApiError(503, 'gemini_not_configured', 'Backend chưa được cấu hình Gemini API key.');
  const input = validateImages(await request.json());
  await checkSkinQuota(env, user);
  const prompt = analysisPrompt(input.skinType);
  const { rawText } = await callGeminiWithFallback(env, prompt, input.images);
  const analysis = validateAnalysis(rawText);
  return json(request, env, { success: true, analysis });
}

async function deleteUser(request, env, user, uid) {
  if (user.admin !== true) throw new ApiError(403, 'permission_denied', 'Chỉ quản trị viên mới có thể xóa tài khoản.');
  if (!uid || uid === user.sub) throw new ApiError(400, 'invalid_user', 'Không thể xóa tài khoản này.');
  const orders = await runQuery(env, {
    from: [{ collectionId: 'orders' }],
    where: { fieldFilter: { field: { fieldPath: 'userId' }, op: 'EQUAL', value: { stringValue: uid } } }
  });
  const nestedCollections = ['skinReports', 'commerce', 'private', 'addresses', 'wishlist', 'activities'];
  const nestedDocuments = (await Promise.all(nestedCollections.map(collection => listDocuments(env, `users/${uid}/${collection}`)))).flat();
  const writes = [
    ...orders.map(order => ({ delete: order.name })),
    ...nestedDocuments.map(document => ({ delete: document.name })),
    { delete: documentName(env, `users/${uid}`) }
  ];
  for (let index = 0; index < writes.length; index += 450) await commitWrites(env, writes.slice(index, index + 450));
  await deleteFirebaseUser(env, uid);
  return json(request, env, { success: true, uid, deletedOrders: orders.length });
}

async function handleApi(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  const user = await authenticate(request, env);
  const url = new URL(request.url);
  if (request.method === 'GET' && url.pathname === '/api/orders') return listOrders(request, env, user);
  if (request.method === 'POST' && url.pathname === '/api/orders') return createOrder(request, env, user);
  const orderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (request.method === 'PATCH' && orderMatch) return cancelOrder(request, env, user, decodeURIComponent(orderMatch[1]));
  if (request.method === 'POST' && url.pathname === '/api/analyze-skin') return analyzeSkin(request, env, user);
  const userMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (request.method === 'DELETE' && userMatch) return deleteUser(request, env, user, decodeURIComponent(userMatch[1]));
  throw new ApiError(404, 'not_found', 'Không tìm thấy API được yêu cầu.');
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith('/api/')) return await handleApi(request, env);
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error('[SkinID Worker]', { code: error.code, message: error.message });
      const isExpected = error instanceof ApiError;
      return json(request, env, {
        success: false,
        code: isExpected ? error.code : 'internal',
        message: isExpected ? error.message : 'Hệ thống đang bận. Vui lòng thử lại sau ít phút.'
      }, isExpected ? error.status : 500);
    }
  }
};
