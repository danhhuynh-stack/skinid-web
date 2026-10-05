export default function TrustBenefits() {
  return (
    <section className="trust-strip" aria-label="Cam kết mua hàng">
      <div className="container trust-grid">
        <div data-reveal data-reveal-delay="0"><i data-feather="shield"></i><span><b>Hàng chính hãng</b><small>Nguồn gốc minh bạch</small></span></div>
        <div data-reveal data-reveal-delay="70"><i data-feather="truck"></i><span><b>Giao hàng toàn quốc</b><small>Miễn phí từ 500.000₫</small></span></div>
        <div data-reveal data-reveal-delay="140"><i data-feather="refresh-cw"></i><span><b>Đổi trả trong 7 ngày</b><small>Với lỗi từ nhà sản xuất</small></span></div>
        <div data-reveal data-reveal-delay="210"><i data-feather="headphones"></i><span><b>Hỗ trợ tận tâm</b><small>08:00–21:00 mỗi ngày</small></span></div>
      </div>
    </section>
  );
}
