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
import { syncOrderToS3 } from './services/s3Service.js';
import { sendTelegramOrderNotification } from './services/telegramService.js';

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
    return localProduct ? { ...localProduct, ...remoteProduct } : remoteProduct || null;
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
  const now = new Date();

  // Validate coupon against Firestore promotions or fallback
  const couponCode = String(payload.couponCode || '').trim().toUpperCase();
  let discountAmount = 0;
  let isFreeshipCoupon = false;
  let promotionDoc = null;

  if (couponCode) {
    if (hasFirestore) {
      try {
        promotionDoc = await getDocument(env, `promotions/${couponCode}`);
      } catch (err) {
        console.warn('[Worker Promo Lookup Warning]', err.message);
      }
    }

    // Fallback dictionary for offline / staging / standard coupons
    if (!promotionDoc) {
      const STATIC_COUPONS = {
        SKINID10: { code: 'SKINID10', type: 'percent', discountValue: 10, minOrderValue: 200000, maxDiscount: 150000, active: true },
        WELCOME50: { code: 'WELCOME50', type: 'fixed', discountValue: 50000, minOrderValue: 300000, maxDiscount: 50000, active: true },
        FREESHIP: { code: 'FREESHIP', type: 'freeship', discountValue: 30000, minOrderValue: 0, maxDiscount: 30000, active: true }
      };
      promotionDoc = STATIC_COUPONS[couponCode] || null;
    }

    if (!promotionDoc) {
      throw new ApiError(400, 'invalid_coupon', `Mã giảm giá "${couponCode}" không tồn tại hoặc đã bị xóa.`);
    }

    if (promotionDoc.active === false) {
      throw new ApiError(400, 'coupon_inactive', `Mã giảm giá "${couponCode}" đã tạm ngừng áp dụng.`);
    }

    const nowIso = now.toISOString();
    if (promotionDoc.startAt && String(promotionDoc.startAt) > nowIso) {
      throw new ApiError(400, 'coupon_not_started', `Mã giảm giá "${couponCode}" chưa đến thời gian áp dụng.`);
    }
    if (promotionDoc.endAt && String(promotionDoc.endAt) < nowIso) {
      throw new ApiError(400, 'coupon_expired', `Mã giảm giá "${couponCode}" đã hết hạn sử dụng.`);
    }

    const minOrder = Number(promotionDoc.minOrderValue || promotionDoc.minOrder || 0);
    if (minOrder > 0 && subtotal < minOrder) {
      throw new ApiError(
        400,
        'coupon_min_order',
        `Đơn hàng cần tối thiểu ${minOrder.toLocaleString('vi-VN')}đ để sử dụng mã "${couponCode}".`
      );
    }

    const usageLimit = Number(promotionDoc.usageLimit || 0);
    const usedCount = Number(promotionDoc.usedCount || 0);
    if (usageLimit > 0 && usedCount >= usageLimit) {
      throw new ApiError(400, 'coupon_limit_exceeded', `Mã giảm giá "${couponCode}" đã hết lượt sử dụng.`);
    }

    const pType = String(promotionDoc.type || 'percent').toLowerCase();
    const val = Number(promotionDoc.discountValue || promotionDoc.value || 0);
    const maxCap = Number(promotionDoc.maxDiscount || 0);

    if (pType === 'percent') {
      discountAmount = Math.round(subtotal * (val / 100));
      if (maxCap > 0) discountAmount = Math.min(discountAmount, maxCap);
    } else if (pType === 'fixed') {
      discountAmount = Math.min(subtotal, val);
    } else if (pType === 'freeship') {
      isFreeshipCoupon = true;
    }
  }

  // Shipping Fee calculation (standard BCT rules)
  function resolveShippingFee(provinceName, orderSubtotal, isFreeShip) {
    if (isFreeShip || orderSubtotal >= 500000) return 0;
    const name = String(provinceName || '').toLowerCase();
    if (name.includes('hồ chí minh') || name.includes('hcm')) return 25000;
    if (name.includes('hà nội') || name.includes('đà nẵng') || name.includes('bình dương') || name.includes('đồng nai')) return 30000;
    return 30000;
  }
  const shippingFee = resolveShippingFee(shippingAddress.provinceName, subtotal, isFreeshipCoupon);
  if (isFreeshipCoupon) {
    discountAmount = Math.min(30000, 30000);
  }
  const finalTotal = Math.max(0, subtotal - discountAmount) + shippingFee;

  const idempotencyKey = String(request.headers.get('idempotency-key') || payload.idempotencyKey || '').trim();
  let orderId = crypto.randomUUID().replaceAll('-', '');
  if (idempotencyKey) {
    if (!/^[A-Za-z0-9_-]{8,100}$/.test(idempotencyKey)) throw new ApiError(400, 'invalid_idempotency_key', 'Mã xác nhận đơn hàng không hợp lệ.');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${user.sub}:${idempotencyKey}`));
    orderId = [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('').slice(0, 32);
    const existingOrder = hasFirestore ? await getDocument(env, `orders/${orderId}`) : devOrdersStore.get(orderId);
    if (existingOrder && existingOrder.userId === user.sub) {
      return json(request, env, {
        success: true,
        duplicate: true,
        orderId,
        subtotal: existingOrder.subtotal,
        discount: existingOrder.discountAmount || 0,
        shippingFee: existingOrder.shippingFee,
        total: existingOrder.total,
        status: existingOrder.status,
        message: 'Đơn hàng đã được ghi nhận trước đó.'
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
    const writes = [
      updateWrite(env, `orders/${orderId}`, order, null, { exists: false }),
      updateWrite(env, `users/${user.sub}`, profile, Object.keys(profile)),
      updateWrite(env, `users/${user.sub}/addresses/default`, address),
      updateWrite(env, `users/${user.sub}/activities/${orderId}`, activity),
      { delete: documentName(env, `users/${user.sub}/commerce/cart`) }
    ];
    if (couponCode && promotionDoc && hasFirestore) {
      const nextCount = (Number(promotionDoc.usedCount) || 0) + 1;
      writes.push(
        updateWrite(env, `promotions/${couponCode}`, { usedCount: nextCount, updatedAtServer: now }, ['usedCount', 'updatedAtServer'])
      );
    }
    await commitWrites(env, writes);
  } else {
    order.id = orderId;
    devOrdersStore.set(orderId, order);
  }

  // Resilient fail-safe synchronization to S3 POS
  let s3SyncStatus = 'pending';
  if (typeof syncOrderToS3 === 'function') {
    try {
      const s3Result = await syncOrderToS3({ orderId, order, env, timeoutMs: 4000 });
      s3SyncStatus = s3Result.s3SyncStatus || 'pending';
      if (s3Result.success) {
        const s3Fields = {
          s3SyncStatus: 'synced',
          s3OrderId: s3Result.s3OrderId,
          s3SyncedAt: s3Result.syncedAt,
          ...(s3Result.s3CustomerId ? { s3CustomerId: s3Result.s3CustomerId } : {})
        };
        if (hasFirestore) {
          await commitWrites(env, [
            updateWrite(env, `orders/${orderId}`, s3Fields, Object.keys(s3Fields))
          ]).catch(err => console.warn('[Worker S3 Update Warning]', err.message));
        } else {
          Object.assign(order, s3Fields);
        }
      }
    } catch (err) {
      console.warn('[Worker S3 Sync Exception]', err.message);
    }
  }

  // Instant real-time alert via Telegram
  try {
    if (typeof sendTelegramOrderNotification === 'function') {
      sendTelegramOrderNotification({ orderId, order, env }).catch(err => {
        console.warn('[Worker Telegram Sync Exception]', err.message);
      });
    }
  } catch (err) {
    console.warn('[Worker Telegram Dispatch Error]', err.message);
  }

  return json(request, env, { success: true, orderId, subtotal, discount: discountAmount, shippingFee, total: order.total, s3SyncStatus }, 201);
}

async function resyncOrderToS3(request, env, user, orderId) {
  if (user.admin !== true) throw new ApiError(403, 'permission_denied', 'Chỉ quản trị viên mới có thể đồng bộ đơn hàng sang S3.');
  const hasFirestore = isFirestoreConfigured(env);
  let order = null;
  if (hasFirestore) {
    order = await getDocument(env, `orders/${orderId}`);
  } else {
    order = devOrdersStore.get(orderId);
  }
  if (!order) throw new ApiError(404, 'order_not_found', 'Không tìm thấy đơn hàng.');

  const s3Result = await syncOrderToS3({ orderId, order, env, timeoutMs: 8000 });
  const s3Fields = {
    s3SyncStatus: s3Result.s3SyncStatus || (s3Result.success ? 'synced' : 'pending'),
    ...(s3Result.s3OrderId ? { s3OrderId: s3Result.s3OrderId } : {}),
    ...(s3Result.syncedAt ? { s3SyncedAt: s3Result.syncedAt } : {}),
    ...(s3Result.s3CustomerId ? { s3CustomerId: s3Result.s3CustomerId } : {}),
    ...(s3Result.error ? { s3Error: s3Result.error } : {})
  };

  if (hasFirestore) {
    await commitWrites(env, [
      updateWrite(env, `orders/${orderId}`, s3Fields, Object.keys(s3Fields))
    ]);
  } else {
    Object.assign(order, s3Fields);
  }

  return json(request, env, { success: true, orderId, s3Result });
}


const VALID_ORDER_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['completed', 'returned', 'cancelled'],
  completed: [],
  returned: [],
  cancelled: []
};

async function transitionOrderStatus(request, env, user, orderId) {
  if (user.admin !== true) {
    throw new ApiError(403, 'permission_denied', 'Chỉ quản trị viên mới có thể cập nhật trạng thái đơn hàng.');
  }
  const hasFirestore = isFirestoreConfigured(env);
  let order = null;
  if (hasFirestore) {
    order = await getDocument(env, `orders/${orderId}`);
  } else {
    order = devOrdersStore.get(orderId);
  }
  if (!order) throw new ApiError(404, 'order_not_found', 'Không tìm thấy đơn hàng.');

  const body = await request.json().catch(() => ({}));
  const targetStatus = text(body.targetStatus, 'trạng thái đích', 40).toLowerCase();
  const note = String(body.note || '').trim().slice(0, 500);

  const currentStatus = String(order.status || 'pending').toLowerCase();
  const allowed = VALID_ORDER_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw new ApiError(
      400,
      'invalid_transition',
      `Không thể chuyển trạng thái đơn hàng từ "${currentStatus}" sang "${targetStatus}". Các trạng thái hợp lệ tiếp theo: ${allowed.join(', ') || 'Không có (đây là trạng thái kết thúc)'}.`
    );
  }

  const now = new Date();
  const transitionEntry = {
    from: currentStatus,
    to: targetStatus,
    changedBy: user.email || user.sub,
    note,
    timestamp: now.toISOString()
  };
  const statusHistory = Array.isArray(order.statusHistory) ? [...order.statusHistory, transitionEntry] : [transitionEntry];

  const updateFields = {
    status: targetStatus,
    statusHistory,
    updatedAt: now
  };

  // If transition to confirmed and S3 POS is not synced yet, trigger S3 sync
  let s3SyncResult = null;
  if (targetStatus === 'confirmed' && order.s3SyncStatus !== 'synced') {
    if (typeof syncOrderToS3 === 'function') {
      try {
        const res = await syncOrderToS3({ orderId, order: { ...order, status: targetStatus }, env, timeoutMs: 4000 });
        if (res.success) {
          updateFields.s3SyncStatus = 'synced';
          updateFields.s3OrderId = res.s3OrderId;
          updateFields.s3SyncedAt = res.syncedAt;
          s3SyncResult = res;
        }
      } catch (s3Err) {
        console.warn('[Worker Transition S3 Warning]', s3Err.message);
      }
    }
  }

  if (hasFirestore) {
    await commitWrites(env, [
      updateWrite(env, `orders/${orderId}`, updateFields, Object.keys(updateFields))
    ]);
  } else {
    Object.assign(order, updateFields);
  }

  return json(request, env, {
    success: true,
    orderId,
    previousStatus: currentStatus,
    status: targetStatus,
    statusHistory,
    s3SyncResult
  });
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
  const s3ResyncMatch = url.pathname.match(/^\/api\/admin\/orders\/([^/]+)\/resync-s3$/);
  if (request.method === 'POST' && s3ResyncMatch) return resyncOrderToS3(request, env, user, decodeURIComponent(s3ResyncMatch[1]));
  const transitionMatch = url.pathname.match(/^\/api\/admin\/orders\/([^/]+)\/transition$/);
  if (request.method === 'POST' && transitionMatch) return transitionOrderStatus(request, env, user, decodeURIComponent(transitionMatch[1]));
  const orderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (request.method === 'PATCH' && orderMatch) return cancelOrder(request, env, user, decodeURIComponent(orderMatch[1]));
  if (request.method === 'POST' && url.pathname === '/api/analyze-skin') return analyzeSkin(request, env, user);
  const userMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (request.method === 'DELETE' && userMatch) return deleteUser(request, env, user, decodeURIComponent(userMatch[1]));
  throw new ApiError(404, 'not_found', 'Không tìm thấy API được yêu cầu.');
}


// ========================================================
// TECHNICAL SEO & EDGE DYNAMIC RENDERING (BCT & BOTS)
// ========================================================

const BOT_USER_AGENTS = new RegExp(
  'googlebot|bingbot|yandex|baiduspider|facebookexternalhit|facebot|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator|whatsapp|flipboard|tumblr|bitlybot|skypeuripreview|nuzzel|discordbot|google page speed|qwantify|bitrix link preview|xing-content-crawler|chrome-lighthouse|telegrambot|integration-test|zalo',
  'i'
);

function isBotRequest(request) {
  const ua = request.headers.get('User-Agent') || '';
  return BOT_USER_AGENTS.test(ua);
}

function handleRobotsTxt(url) {
  const robots = `# https://skinid.vn/robots.txt
# SkinID - Hệ thống Dược Mỹ Phẩm & Chăm Sóc Da Chuẩn Y Khoa
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/

Sitemap: ${url.origin}/sitemap.xml
`;
  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  });
}

function handleSitemapXml(url) {
  const origin = url.origin;
  const today = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/products', priority: '0.9', changefreq: 'daily' },
    { loc: '/skin-analysis', priority: '0.9', changefreq: 'weekly' },
    { loc: '/khuyen-mai', priority: '0.8', changefreq: 'weekly' },
    { loc: '/blog', priority: '0.8', changefreq: 'daily' },
    { loc: '/goc-cham-da', priority: '0.8', changefreq: 'weekly' },
    { loc: '/tin-tuc', priority: '0.7', changefreq: 'weekly' },
    { loc: '/tra-cuu-cong-bo', priority: '0.7', changefreq: 'monthly' },
    { loc: '/compliance', priority: '0.7', changefreq: 'monthly' },
    { loc: '/kiem-chung', priority: '0.7', changefreq: 'monthly' },
    // Bộ 6 chính sách website SkinID.vn nộp Bộ Công Thương
    { loc: '/chinh-sach-bao-mat', priority: '0.8', changefreq: 'monthly' },
    { loc: '/chinh-sach-van-chuyen', priority: '0.8', changefreq: 'monthly' },
    { loc: '/chinh-sach-doi-tra', priority: '0.8', changefreq: 'monthly' },
    { loc: '/chinh-sach-thanh-toan', priority: '0.8', changefreq: 'monthly' },
    { loc: '/dieu-khoan-giao-dich', priority: '0.8', changefreq: 'monthly' },
    { loc: '/quy-trinh-khieu-nai', priority: '0.8', changefreq: 'monthly' }
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const route of staticRoutes) {
    xml += `  <url>
    <loc>${origin}${route.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>\n`;
  }

  for (const product of SERVER_CATALOG) {
    const pLoc = `${origin}/products/${encodeURIComponent(product.id)}`;
    xml += `  <url>
    <loc>${pLoc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}

const POLICY_META_MAP = {
  '/chinh-sach-bao-mat': {
    title: 'Chính sách Bảo mật Thông tin & Bảo vệ Dữ liệu Cá nhân | SkinID.vn',
    desc: 'Chính sách bảo mật thông tin và bảo vệ dữ liệu cá nhân theo Luật BV dữ liệu số 91/2025/QH15 và Nghị định 52/2013/NĐ-CP của SkinID.vn.'
  },
  '/chinh-sach-van-chuyen': {
    title: 'Chính sách Kiểm hàng & Vận chuyển Giao nhận | SkinID.vn',
    desc: 'Quy định kiểm hàng đồng kiểm khi nhận và thời gian vận chuyển toàn quốc cho đơn hàng dược mỹ phẩm SkinID.vn.'
  },
  '/chinh-sach-doi-tra': {
    title: 'Chính sách Đổi trả & Hoàn tiền Minh bạch | SkinID.vn',
    desc: 'Chính sách đổi trả sản phẩm trong 7 ngày, quy trình hoàn tiền minh bạch cho khách hàng SkinID.vn.'
  },
  '/chinh-sach-thanh-toan': {
    title: 'Chính sách & Phương thức Thanh toán An toàn | SkinID.vn',
    desc: 'Hướng dẫn thanh toán COD, chuyển khoản ngân hàng qua cổng bảo mật của CÔNG TY TNHH FIELDMAN trên SkinID.vn.'
  },
  '/dieu-khoan-giao-dich': {
    title: 'Điều khoản Dịch vụ & Giao dịch Chung | SkinID.vn',
    desc: 'Điều khoản và điều kiện giao dịch mua sắm trực tuyến trên website thương mại điện tử SkinID.vn.'
  },
  '/quy-trinh-khieu-nai': {
    title: 'Quy trình Tiếp nhận & Giải quyết Khiếu nại | SkinID.vn',
    desc: 'Quy trình 5 bước tiếp nhận, xử lý khiếu nại khách hàng nhanh chóng, minh bạch theo chuẩn Bộ Công Thương.'
  }
};

async function applyDynamicSeo(request, env, url, response) {
  const pathname = url.pathname;
  let targetProduct = null;

  // Check product route: /products/:id or query ?product=:id
  const productMatch = pathname.match(/^\/products\/([^/]+)$/);
  if (productMatch) {
    const rawId = decodeURIComponent(productMatch[1]);
    targetProduct = bundledProducts.get(rawId) || SERVER_CATALOG.find(p => p.slug === rawId || p.id === rawId);
    if (!targetProduct && env && isFirestoreConfigured(env)) {
      try {
        const remoteDoc = await getDocument(env, `products/${rawId}`);
        if (remoteDoc && remoteDoc.name) targetProduct = remoteDoc;
      } catch (err) {
        console.warn('[SkinID Edge SEO] Firestore lookup error for product:', rawId, err.message);
      }
    }
  } else if (url.searchParams.has('product')) {
    const pId = url.searchParams.get('product');
    targetProduct = bundledProducts.get(pId) || SERVER_CATALOG.find(p => p.slug === pId || p.id === pId);
    if (!targetProduct && env && isFirestoreConfigured(env)) {
      try {
        const remoteDoc = await getDocument(env, `products/${pId}`);
        if (remoteDoc && remoteDoc.name) targetProduct = remoteDoc;
      } catch (err) {
        console.warn('[SkinID Edge SEO] Firestore lookup error for product query:', pId, err.message);
      }
    }
  }

  if (targetProduct) {
    const title = `${targetProduct.name} - ${targetProduct.brand || 'Chính Hãng'} | SkinID Dược Mỹ Phẩm`;
    const desc = (targetProduct.uses || targetProduct.description || `Dược mỹ phẩm chính hãng ${targetProduct.name} của ${targetProduct.brand}. Tư vấn da liễu chuyên sâu tại SkinID.vn.`).slice(0, 160);
    const img = targetProduct.image ? (targetProduct.image.startsWith('http') ? targetProduct.image : `${url.origin}${targetProduct.image}`) : `${url.origin}/images/og-default.jpg`;
    const canonical = `${url.origin}/products/${targetProduct.slug || targetProduct.id}`;
    const price = Number(targetProduct.price) || 0;

    const schemaProduct = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": targetProduct.name,
      "image": [img],
      "description": desc,
      "brand": {
        "@type": "Brand",
        "name": targetProduct.brand || "SkinID"
      },
      "offers": {
        "@type": "Offer",
        "url": canonical,
        "priceCurrency": "VND",
        "price": price,
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": "CÔNG TY TNHH FIELDMAN"
        }
      }
    };

    const rewriter = new HTMLRewriter()
      .on('title', {
        element(el) {
          el.setInnerContent(title);
        }
      })
      .on('meta[name="description"]', {
        element(el) {
          el.setAttribute('content', desc);
        }
      })
      .on('head', {
        element(el) {
          el.append(`<link rel="canonical" href="${canonical}" />`, { html: true });
          el.append(`<meta property="og:title" content="${title}" />`, { html: true });
          el.append(`<meta property="og:description" content="${desc}" />`, { html: true });
          el.append(`<meta property="og:image" content="${img}" />`, { html: true });
          el.append(`<meta property="og:url" content="${canonical}" />`, { html: true });
          el.append(`<meta property="og:type" content="product" />`, { html: true });
          el.append(`<meta property="og:site_name" content="SkinID.vn" />`, { html: true });
          el.append(`<meta name="twitter:card" content="summary_large_image" />`, { html: true });
          el.append(`<meta name="twitter:title" content="${title}" />`, { html: true });
          el.append(`<meta name="twitter:description" content="${desc}" />`, { html: true });
          el.append(`<meta name="twitter:image" content="${img}" />`, { html: true });
          el.append(`<script type="application/ld+json">${JSON.stringify(schemaProduct)}</script>`, { html: true });
        }
      });

    return rewriter.transform(response);
  }

  // Check policy route
  const policyMeta = POLICY_META_MAP[pathname];
  if (policyMeta) {
    const canonical = `${url.origin}${pathname}`;
    const rewriter = new HTMLRewriter()
      .on('title', {
        element(el) {
          el.setInnerContent(policyMeta.title);
        }
      })
      .on('meta[name="description"]', {
        element(el) {
          el.setAttribute('content', policyMeta.desc);
        }
      })
      .on('head', {
        element(el) {
          el.append(`<link rel="canonical" href="${canonical}" />`, { html: true });
          el.append(`<meta property="og:title" content="${policyMeta.title}" />`, { html: true });
          el.append(`<meta property="og:description" content="${policyMeta.desc}" />`, { html: true });
          el.append(`<meta property="og:url" content="${canonical}" />`, { html: true });
        }
      });
    return rewriter.transform(response);
  }

  return response;
}

function generateSitemapXml(request, env) {
  const origin = new URL(request.url).origin;
  const staticRoutes = [
    '',
    'products',
    'khuyen-mai',
    'blog',
    'skin-analysis',
    'acie',
    'tra-cuu-cong-bo',
    'chinh-sach-bao-mat',
    'chinh-sach-van-chuyen',
    'chinh-sach-doi-tra',
    'chinh-sach-thanh-toan',
    'dieu-khoan-giao-dich',
    'quy-trinh-khieu-nai'
  ];

  const now = new Date().toISOString().split('T')[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const r of staticRoutes) {
    const loc = r ? `${origin}/${r}` : `${origin}/`;
    const priority = r === '' ? '1.0' : (r === 'products' ? '0.9' : '0.8');
    xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
  }

  for (const p of SERVER_CATALOG) {
    const slug = p.slug || p.id;
    xml += `  <url>\n    <loc>${origin}/products/${slug}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith('/api/')) return await handleApi(request, env);
      if (url.pathname === '/sitemap.xml') return generateSitemapXml(request, env);
      const response = await env.ASSETS.fetch(request);
      if (request.method === 'GET' && response.status === 200 && response.headers.get('content-type')?.includes('text/html')) {
        return await applyDynamicSeo(request, env, url, response);
      }
      return response;
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
