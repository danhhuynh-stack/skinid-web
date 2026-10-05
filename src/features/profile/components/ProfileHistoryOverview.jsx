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

export default function ProfileHistoryOverview({ history = [] }) {
  const latest = history[0];
  const maxScore = history.reduce((maximum, scan) => Math.max(maximum, numeric(scan.healthScore)), 0);

  return (
    <>
      {/* 4 Luminous Stat Cards */}
      <div className="profile-stats mb-8">
        <div className="profile-stat">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-[#BD3F5B] uppercase tracking-wider">Tổng Phiên Soi</span>
            <span className="w-8 h-8 rounded-full bg-[#FFF0F4] text-[#E06D81] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </span>
          </div>
          <h3 className="text-3xl font-black text-[#282326] tracking-tight">{history.length}</h3>
          <span className="text-[11px] text-[#6F686B] mt-1">Dữ liệu phân tích lưu trữ</span>
        </div>

        <div className="profile-stat">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-[#1B6CA8] uppercase tracking-wider">Điểm Cao Nhất</span>
            <span className="w-8 h-8 rounded-full bg-[#EEF7FF] text-[#1B6CA8] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </span>
          </div>
          <h3 className="text-3xl font-black text-[#E06D81] tracking-tight">{maxScore}<span className="text-sm font-bold text-[#6F686B]">/100</span></h3>
          <span className="text-[11px] text-[#6F686B] mt-1">Đỉnh cao phục hồi</span>
        </div>

        <div className="profile-stat">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-[#0D7A53] uppercase tracking-wider">Tuổi Da Gần Nhất</span>
            <span className="w-8 h-8 rounded-full bg-[#F0FAF5] text-[#0D7A53] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </span>
          </div>
          <h3 className="text-3xl font-black text-[#0D7A53] tracking-tight">{latest?.skinAge ? `${latest.skinAge} tuổi` : '--'}</h3>
          <span className="text-[11px] text-[#6F686B] mt-1">Đo đạc từ thị giác máy tính</span>
        </div>

        <div className="profile-stat">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-[#B3630A] uppercase tracking-wider">Thể Trạng Da</span>
            <span className="w-8 h-8 rounded-full bg-[#FFF7ED] text-[#B3630A] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            </span>
          </div>
          <h3 className="text-lg font-black text-[#282326] truncate tracking-tight">{latest?.skinType || 'Chưa soi da'}</h3>
          <span className="text-[11px] text-[#6F686B] mt-1">Tình trạng ghi nhận phiên mới</span>
        </div>
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
