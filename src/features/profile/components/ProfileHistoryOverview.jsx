const chartWidth = 760;
const chartHeight = 280;
const padding = { top: 32, right: 28, bottom: 52, left: 48 };

function numeric(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function chartPoint(value, index, count) {
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const x = count <= 1 ? padding.left + plotWidth / 2 : padding.left + (index / (count - 1)) * plotWidth;
  const y = padding.top + (1 - Math.min(100, Math.max(0, value)) / 100) * plotHeight;
  return { x, y };
}

function shortDate(value) {
  return String(value || '').split(' ')[0] || '--/--';
}

function ProgressChart({ history }) {
  if (!history.length) {
    return (
      <div className="profile-empty-state">
        <div className="profile-empty-illustration" aria-hidden="true">
          <span className="profile-empty-illustration__face"></span>
          <span className="profile-empty-illustration__spark profile-empty-illustration__spark--one">✦</span>
          <span className="profile-empty-illustration__spark profile-empty-illustration__spark--two">✦</span>
        </div>
        <strong>Hành trình làn da bắt đầu từ lần soi đầu tiên</strong>
        <span>Thực hiện phân tích để theo dõi thay đổi qua từng lần chăm sóc.</span>
        <a href="/skin-analysis" className="profile-btn profile-btn--primary">Bắt đầu soi da</a>
      </div>
    );
  }

  const chronological = [...history].reverse();
  const scorePoints = chronological.map((scan, index) => chartPoint(numeric(scan.healthScore), index, chronological.length));
  const agePoints = chronological.map((scan, index) => chartPoint(numeric(scan.skinAge), index, chronological.length));
  const labelStep = Math.max(1, Math.ceil(chronological.length / 6));

  // Build area path for score gradient under the line
  const baselineY = chartHeight - padding.bottom;
  const areaPoints = [
    `${scorePoints[0].x},${baselineY}`,
    ...scorePoints.map((p) => `${p.x},${p.y}`),
    `${scorePoints[scorePoints.length - 1].x},${baselineY}`
  ].join(' ');

  return (
    <div className="h-full w-full flex flex-col justify-between" role="img" aria-label="Biểu đồ điểm sức khỏe da và tuổi da AI theo thời gian">
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold mb-3" aria-hidden="true">
        <span className="flex items-center gap-2 text-[#E06D81]">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#FF7893] to-[#E06D81] shadow-[0_0_8px_rgba(224,109,129,0.5)]"></span>
          Điểm sức khỏe làn da (0 - 100)
        </span>
        <span className="flex items-center gap-2 text-[#282326]">
          <span className="w-5 border-t-2 border-dashed border-[#282326]"></span>
          Tuổi da ước tính AI
        </span>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[calc(100%-36px)] overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="scoreStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF7893" />
            <stop offset="50%" stopColor="#E06D81" />
            <stop offset="100%" stopColor="#BD3F5B" />
          </linearGradient>
          <linearGradient id="scoreAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E06D81" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#E06D81" stopOpacity="0.0" />
          </linearGradient>
          <filter id="scoreGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#E06D81" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Grid horizontal lines */}
        {[0, 25, 50, 75, 100].map((value) => {
          const { y } = chartPoint(value, 0, 1);
          return (
            <g key={value}>
              <line x1={padding.left} x2={chartWidth - padding.right} y1={y} y2={y} stroke="#F0ECEE" strokeWidth="1" strokeDasharray={value === 0 ? 'none' : '4 4'} />
              <text x={padding.left - 12} y={y + 4} textAnchor="end" className="fill-[#6F686B] text-[10px] font-semibold">{value}</text>
            </g>
          );
        })}

        {/* Area fill */}
        {scorePoints.length > 1 && (
          <polygon points={areaPoints} fill="url(#scoreAreaGrad)" />
        )}

        {/* Score polyline */}
        <polyline
          points={scorePoints.map(({ x, y }) => `${x},${y}`).join(' ')}
          fill="none"
          stroke="url(#scoreStrokeGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#scoreGlow)"
        />

        {/* Skin Age dashed polyline */}
        <polyline
          points={agePoints.map(({ x, y }) => `${x},${y}`).join(' ')}
          fill="none"
          stroke="#282326"
          strokeWidth="2"
          strokeDasharray="5 5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Score marker dots */}
        {scorePoints.map((point, index) => (
          <g key={chronological[index].id || index} className="cursor-pointer group">
            <circle cx={point.x} cy={point.y} r="8" fill="#E06D81" opacity="0.15" />
            <circle cx={point.x} cy={point.y} r="5" fill="#FFFFFF" stroke="#E06D81" strokeWidth="2.5" />
            {(index % labelStep === 0 || index === chronological.length - 1) && (
              <text x={point.x} y={chartHeight - 16} textAnchor="middle" className="fill-[#6F686B] text-[10px] font-bold">
                Lần {index + 1} · {shortDate(chronological[index].dateFormatted)}
              </text>
            )}
          </g>
        ))}

        {/* Age marker dots */}
        {agePoints.map((point, index) => (
          <circle key={`age-${chronological[index].id || index}`} cx={point.x} cy={point.y} r="3" fill="#282326" />
        ))}
      </svg>
    </div>
  );
}

function StatIcon({ type }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {type === 'sessions' && <><rect x="7" y="3" width="13" height="16" rx="2" /><path d="M4 7v13a2 2 0 0 0 2 2h10M11 8h5M11 12h5" /></>}
      {type === 'score' && <><path d="M4 18a9 9 0 1 1 16 0M12 13l4-5M5 13h1M18 13h1M12 4v2" /><circle cx="12" cy="13" r="2" /></>}
      {type === 'age' && <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
      {type === 'skin' && <><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3M8 9h.01M16 9h.01M12 10v3M9 16q3 2 6 0" /></>}
    </svg>
  );
}

export default function ProfileHistoryOverview({ history = [] }) {
  const latest = history[0];
  const maxScore = history.reduce((maximum, scan) => Math.max(maximum, numeric(scan.healthScore)), 0);

  return (
    <>
      <div className="profile-stats mb-8">
        {[
          { icon: 'sessions', label: 'Tổng phiên soi', value: history.length, note: 'Phiên phân tích đã lưu' },
          { icon: 'score', label: 'Điểm cao nhất', value: <>{maxScore}<small>/100</small></>, note: 'Điểm sức khỏe làn da' },
          { icon: 'age', label: 'Tuổi da gần nhất', value: latest?.skinAge != null ? <>{latest.skinAge}<small> tuổi</small></> : '—', note: 'Ước tính từ phiên soi mới nhất' },
          { icon: 'skin', label: 'Tình trạng da', value: latest?.skinType || 'Chưa soi da', note: 'Ghi nhận từ phiên soi mới nhất', text: true }
        ].map((stat) => (
          <div className="profile-stat" key={stat.icon}>
            <div className="profile-stat-heading">
              <span className="profile-stat-icon"><StatIcon type={stat.icon} /></span>
              <span className="profile-stat-label">{stat.label}</span>
            </div>
            <h3 className={`profile-stat-value${stat.text ? ' profile-stat-value--text' : ''}`}>{stat.value}</h3>
            <p className="profile-stat-note">{stat.note}</p>
          </div>
        ))}
      </div>

      {/* Floating Chart Surface */}
      <div className="profile-surface p-7 sm:p-9 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#F0ECEE]">
          <div>
            <h2 className="text-xl font-extrabold text-[#282326] tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E06D81] shadow-[0_0_8px_rgba(224,109,129,0.5)]"></span>
              Biểu Đồ Tiến Trình Sức Khỏe Làn Da
            </h2>
            <p className="text-xs text-[#6F686B] mt-1">Quan sát nhịp độ thay đổi qua từng mốc thời gian để tối ưu hóa routine dưỡng chất.</p>
          </div>
          <span className="self-start sm:self-auto text-xs font-bold text-[#BD3F5B] bg-[#FFF2F4] px-3.5 py-1 rounded-full">
            Dữ liệu tham khảo AI
          </span>
        </div>

        <div className="profile-chart-area h-64 sm:h-72 w-full">
          <ProgressChart history={history} />
        </div>
      </div>
    </>
  );
}
