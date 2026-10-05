const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

export async function sendSkinReportEmail(userEmail, reportData = {}) {
  if (!userEmail) throw new Error('Tài khoản chưa có địa chỉ email nhận báo cáo.');
  const userName = reportData.userName || 'Quý khách';
  const products = reportData.recommendedRoutineProducts || [];
  const routine = products.map((product, index) => `${index + 1}. ${product.name || product.id}`).join('\n') || 'Xem phác đồ tại SkinID.vn';
  const subject = `[SkinID.vn] Báo cáo phân tích da AI - ${userName}`;
  const body = `Xin chào ${userName},\n\nĐiểm sức khỏe da: ${reportData.healthScore || 0}/100\nLoại da: ${reportData.skinType || 'Chưa xác định'}\nTuổi da AI: ${reportData.skinAge || 0}\n\nPhác đồ tham khảo:\n${routine}\n\nKết quả chỉ mang tính tham khảo, không thay thế chẩn đoán y khoa.`;
  const response = await fetch(EMAILJS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: 'service_skinid', template_id: 'template_skinid_report', user_id: 'vO9X_skinid_public',
      template_params: {
        to_email: userEmail, to_name: userName, health_score: reportData.healthScore || 0,
        skin_type: reportData.skinType || '', skin_age: reportData.skinAge || 0,
        routine_list: routine, subject
      }
    })
  });
  if (!response.ok) {
    throw new Error('Chưa thể gửi báo cáo qua email. Báo cáo vẫn được lưu trong lịch sử soi da.');
  }
  return { success: true };
}
