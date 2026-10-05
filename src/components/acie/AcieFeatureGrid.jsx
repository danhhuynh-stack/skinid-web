const ACIE_FEATURES = [
  {
    index: '01',
    title: 'Vi điểm AI',
    description: 'Quan sát gần hơn',
  },
  {
    index: '02',
    title: 'Routine cá nhân',
    description: 'Gợi ý vừa với làn da',
  },
  {
    index: '03',
    title: 'Theo dõi mỗi ngày',
    description: 'Hiểu thay đổi theo thời gian',
  },
];

export default function AcieFeatureGrid({ className = '' }) {
  return (
    <div className={`acie-feature-grid ${className}`.trim()} aria-label="Điểm nổi bật của ACIE">
      {ACIE_FEATURES.map((feature) => (
        <span className="acie-feature-card" key={feature.index}>
          <i aria-hidden="true">{feature.index}</i>
          <span>
            <b>{feature.title}</b>
            <small>{feature.description}</small>
          </span>
        </span>
      ))}
    </div>
  );
}
