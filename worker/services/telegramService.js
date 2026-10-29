/**
 * Telegram Order Notification Service
 * Sends instant real-time alerts to Fieldman operations team on new orders
 */

export async function sendTelegramOrderNotification({ orderId, order, env, fetchFn = fetch }) {
  const botToken = env?.TELEGRAM_BOT_TOKEN || env?.TELEGRAM_TOKEN;
  const chatId = env?.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return { success: false, reason: 'unconfigured' };
  }

  const money = (val) => new Intl.NumberFormat('vi-VN', {
    style: 'currency', currency: 'VND', maximumFractionDigits: 0
  }).format(Number(val) || 0);

  const itemsList = Array.isArray(order.items)
    ? order.items.map(it => `  • <b>${it.name || it.productId}</b> (x${it.quantity || 1}) - ${money(it.price * (it.quantity || 1))}`).join('\n')
    : '  • Không có chi tiết sản phẩm';

  const paymentText = order.paymentMethod === 'bank_transfer'
    ? '💳 <b>Chuyển khoản VietQR (VCB)</b>'
    : '💵 <b>COD (Tiền mặt khi nhận hàng)</b>';

  const message = [
    `🔔 <b>[ĐƠN HÀNG MỚI TẠI SKINID.VN]</b>`,
    `<b>Mã đơn:</b> <code>#${orderId}</code>`,
    `<b>Thời gian:</b> ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
    `------------------------------------`,
    `👤 <b>Khách hàng:</b> ${order.customer?.name || 'Khách vãng lai'}`,
    `📞 <b>Điện thoại:</b> <code>${order.customer?.phone || 'Chưa có'}</code>`,
    `📍 <b>Địa chỉ:</b> ${order.customer?.address || 'Tại quầy'}`,
    `📝 <b>Ghi chú:</b> ${order.note || 'Không có'}`,
    `------------------------------------`,
    `📦 <b>Sản phẩm:</b>\n${itemsList}`,
    `------------------------------------`,
    `💰 <b>Tạm tính:</b> ${money(order.subtotal)}`,
    order.discountAmount > 0 ? `🎟 <b>Giảm giá:</b> -${money(order.discountAmount)}` : null,
    `🚚 <b>Phí vận chuyển:</b> ${money(order.shippingFee)}`,
    `👉 <b>TỔNG CỘNG:</b> <b>${money(order.total)}</b>`,
    `💳 <b>Hình thức:</b> ${paymentText}`,
    order.source ? `🌐 <b>Nguồn:</b> ${order.source}` : null
  ].filter(Boolean).join('\n');

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[Telegram Notify Error]', res.status, errText);
      return { success: false, status: res.status, error: errText };
    }

    return { success: true };
  } catch (error) {
    console.warn('[Telegram Notify Exception]', error.message);
    return { success: false, error: error.message };
  }
}
