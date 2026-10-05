import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBodyScrollLock } from '../../shared/hooks/useBodyScrollLock.js';

const CONSULTATIONS = [
  ['tri-mun-kiem-dau', 'Da dầu & mụn', 'Dầu thừa, bít tắc, sau mụn'],
  ['cap-am-chuyen-sau', 'Khô & thiếu ẩm', 'Căng rát, bong tróc, thiếu nước'],
  ['phuc-hoi-diu-da', 'Phục hồi & làm dịu', 'Da nhạy cảm, đỏ rát, yếu'],
  ['sang-da-mo-tham', 'Sắc tố & lão hóa', 'Không đều màu, nếp nhăn']
];

const POLICIES = {
  shipping: {
    eyebrow: 'Mua hàng an tâm', title: 'Giao hàng & đổi trả',
    paragraphs: ['Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000₫. Sản phẩm lỗi từ nhà sản xuất hoặc tem niêm phong không còn nguyên vẹn được hỗ trợ đổi trong 7 ngày kể từ khi nhận hàng.', 'Vui lòng giữ hóa đơn và quay video khi mở kiện để việc hỗ trợ diễn ra nhanh chóng.']
  },
  privacy: {
    eyebrow: 'Quyền riêng tư', title: 'Bảo mật dữ liệu',
    paragraphs: ['SkinID chỉ sử dụng thông tin khách hàng để hỗ trợ tư vấn, xử lý đơn hàng và cung cấp trải nghiệm đã được khách hàng đồng ý.', 'Thông tin cá nhân không được kinh doanh hoặc chia sẻ cho bên thứ ba ngoài phạm vi cần thiết để cung cấp dịch vụ.']
  },
  terms: {
    eyebrow: 'Thông tin sử dụng', title: 'Điều khoản & lưu ý',
    paragraphs: ['Nội dung tư vấn và gợi ý routine trên website mang tính chất tham khảo. Sản phẩm chăm sóc da không phải là thuốc và không thay thế chẩn đoán, điều trị y khoa.', 'Với tình trạng da viêm, kích ứng kéo dài hoặc có dấu hiệu bệnh lý, khách hàng nên thăm khám bác sĩ da liễu.']
  }
};

function CloseIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

export default function StorefrontModals() {
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [policy, setPolicy] = useState(null);
  useBodyScrollLock(consultationOpen, 'consultation');
  useBodyScrollLock(Boolean(policy), 'policy');

  const openConsultation = useCallback(() => {
    setConsultationOpen(true);
  }, []);
  const closeConsultation = useCallback(() => {
    setConsultationOpen(false);
  }, []);
  const openPolicy = useCallback(type => {
    setPolicy(POLICIES[type] || POLICIES.terms);
  }, []);
  const closePolicy = useCallback(() => {
    setPolicy(null);
  }, []);

  useEffect(() => {
    const handleConsultationOpen = () => openConsultation();
    const handlePolicyOpen = (event) => openPolicy(event.detail?.policy);
    const keydown = event => {
      if (event.key === 'Escape') { closeConsultation(); closePolicy(); }
    };
    document.addEventListener('skinid:consultation-open', handleConsultationOpen);
    document.addEventListener('skinid:policy-open', handlePolicyOpen);
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('skinid:consultation-open', handleConsultationOpen);
      document.removeEventListener('skinid:policy-open', handlePolicyOpen);
      document.removeEventListener('keydown', keydown);
    };
  }, [closeConsultation, closePolicy, openConsultation, openPolicy]);

  const destination = selected ? `/products?benefit=${encodeURIComponent(selected)}` : '/products';

  return (
    <div className="storefront-modals-root">
      <div id="consultation-modal" className={`modal${consultationOpen ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="consult-title" onClick={event => { if (event.target === event.currentTarget) closeConsultation(); }}>
        <div className="modal-panel">
          <button className="modal-close" type="button" onClick={closeConsultation} aria-label="Đóng"><CloseIcon /></button>
          <div className="modal-content">
            <span className="modal-kicker">HỖ TRỢ CHỌN SẢN PHẨM</span>
            <h2 id="consult-title">Bạn đang quan tâm điều gì nhất?</h2>
            <p>Chọn một nhu cầu để lọc nhanh nhóm sản phẩm tham khảo.</p>
            <div className="consult-grid">
              {CONSULTATIONS.map(([value, label, description]) => (
                <button key={value} className={`consult-option${selected === value ? ' is-selected' : ''}`} type="button" aria-pressed={selected === value} onClick={() => setSelected(value)}>
                  <strong>{label}</strong><span>{description}</span>
                </button>
              ))}
            </div>
            <div className="consent-box"><span>Gợi ý chỉ mang tính tham khảo. Với tình trạng viêm hoặc kích ứng kéo dài, hãy gặp bác sĩ da liễu.</span></div>
            <Link className={`btn btn--primary btn--full${selected ? '' : ' is-disabled'}`} to={destination} aria-disabled={!selected} onClick={event => { if (!selected) event.preventDefault(); else closeConsultation(); }}>
              {selected ? 'Xem sản phẩm phù hợp' : 'Chọn một nhu cầu để xem sản phẩm'}
            </Link>
          </div>
        </div>
      </div>
      <div id="policy-modal" className={`modal${policy ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="policy-title" onClick={event => { if (event.target === event.currentTarget) closePolicy(); }}>
        <div className="modal-panel">
          <button className="modal-close" type="button" onClick={closePolicy} aria-label="Đóng"><CloseIcon /></button>
          <div id="policy-content" className="modal-content">
            {policy && <><span className="modal-kicker">{policy.eyebrow}</span><h2 id="policy-title">{policy.title}</h2>{policy.paragraphs.map(text => <p key={text}>{text}</p>)}</>}
          </div>
        </div>
      </div>
    </div>
  );
}
