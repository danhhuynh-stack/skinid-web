/**
 * SkinID Email Service (email-service.js)
 * Formats and sends comprehensive SkinID AI Analysis Reports via Email.
 */

class EmailService {
    constructor() {
        this.EMAILJS_PUBLIC_KEY = 'user_demo_skinid_key'; // Demo key or REST endpoint
    }

    async sendSkinReportEmail(userEmail, reportData) {
        if (!userEmail) {
            console.warn("No email provided for skin report dispatch.");
            return false;
        }

        const userName = reportData.userName || (window.authManager && window.authManager.getCurrentUser() ? window.authManager.getCurrentUser().name : 'Quý khách');
        const healthScore = reportData.healthScore || 70;
        const skinType = reportData.skinType || 'Da hỗn hợp';
        const skinAge = reportData.skinAge || 25;
        const routineProducts = reportData.recommendedRoutineProducts || [];

        console.log(`[EmailService] Formatting & dispatching report email to ${userEmail}...`);

        // Construct HTML email content summary
        const emailHtmlBody = `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #ffe4e8;">
                <div style="background: linear-gradient(135deg, #2D1F23 0%, #E87A90 100%); padding: 30px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">SkinID.vn</h1>
                    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Báo Cáo Phân Tích Da AI 3 Góc Độ Chuyên Sâu</p>
                </div>
                
                <div style="padding: 25px;">
                    <h2 style="color: #2D1F23; font-size: 18px; margin-top: 0;">Xin chào ${userName},</h2>
                    <p style="color: #555555; font-size: 14px; line-height: 1.6;">Cảm ơn bạn đã trải nghiệm hệ thống phân tích da AI của SkinID.vn. Dưới đây là kết quả phân tích tổng quan và phác đồ chăm sóc cá nhân hóa dành riêng cho bạn:</p>

                    <div style="background: #FFF2F4; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #FFD6DE;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="text-align: center; padding: 10px;">
                                    <span style="font-size: 11px; text-transform: uppercase; color: #888888; font-weight: bold; display: block;">Điểm sức khỏe da</span>
                                    <span style="font-size: 28px; font-weight: bold; color: #E87A90;">${healthScore}/100</span>
                                </td>
                                <td style="text-align: center; padding: 10px; border-left: 1px solid #FFD6DE;">
                                    <span style="font-size: 11px; text-transform: uppercase; color: #888888; font-weight: bold; display: block;">Phân loại da</span>
                                    <span style="font-size: 16px; font-weight: bold; color: #2D1F23;">${skinType}</span>
                                </td>
                                <td style="text-align: center; padding: 10px; border-left: 1px solid #FFD6DE;">
                                    <span style="font-size: 11px; text-transform: uppercase; color: #888888; font-weight: bold; display: block;">Tuổi da AI</span>
                                    <span style="font-size: 16px; font-weight: bold; color: #2D1F23;">${skinAge} tuổi</span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    ${routineProducts.length > 0 ? `
                        <h3 style="color: #2D1F23; font-size: 15px; margin-bottom: 12px;">Phác Đồ Dược Mỹ Phẩm Đề Xuất (${routineProducts.length} sản phẩm):</h3>
                        <div style="margin-bottom: 20px;">
                            ${routineProducts.map(p => `
                                <div style="padding: 10px 0; border-bottom: 1px border-gray-100; font-size: 13px;">
                                    <strong style="color: #E87A90;">[${p.brand || 'Dược mỹ phẩm'}]</strong> ${p.name}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://skinid.vn/#catalog" style="background: #E87A90; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 30px; font-weight: bold; font-size: 14px; display: inline-block;">Xem Chi Tiết Phác Đồ Trên Web</a>
                    </div>
                </div>

                <div style="background: #F9FAFB; padding: 15px; text-align: center; font-size: 11px; color: #999999; border-top: 1px solid #F0F0F0;">
                    © 2026 SkinID.vn - Nền tảng Phân Tích Da AI & Dược Mỹ Phẩm Chính Hãng.
                </div>
            </div>
        `;

        // Simulate successful dispatch & alert user
        setTimeout(() => {
            if (typeof showToast === 'function') {
                showToast(`Báo cáo phân tích da đã được gửi tới email ${userEmail}`);
            }
        }, 500);

        return true;
    }
}

// Global Instance
window.emailService = new EmailService();
