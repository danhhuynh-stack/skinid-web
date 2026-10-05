import { exportUserPdfReport } from '../services/profilePdfExport.js';

function scoreTheme(score) {
  if (score < 60) {
    return {
      score: 'bg-gradient-to-br from-[#FF7893] to-[#BD3F5B] text-white shadow-[0_8px_20px_rgba(224,62,98,0.25)]',
      chip: 'bg-[#FFF2F4] text-[#BD3F5B]'
    };
  }
  if (score < 75) {
    return {
      score: 'bg-gradient-to-br from-[#FBBF24] to-[#D97706] text-white shadow-[0_8px_20px_rgba(217,119,6,0.22)]',
      chip: 'bg-[#FEF3C7] text-[#B45309]'
    };
  }
  return {
    score: 'bg-gradient-to-br from-[#34D399] to-[#059669] text-white shadow-[0_8px_20px_rgba(5,150,105,0.22)]',
    chip: 'bg-[#ECFDF5] text-[#047857]'
  };
}

function openScanDetail(scanId, scanIndex) {
  document.dispatchEvent(new CustomEvent('skinid:scan-detail-open', { detail: { scanId, scanIndex } }));
}

export default function ProfileHistoryTimeline({ history = [] }) {
  if (!history.length) {
    return (
      <div id="timeline-scan-container" className="space-y-4">
        <div className="text-center py-10 text-[#6F686B]">
          <div className="profile-empty-illustration mx-auto" aria-hidden="true">
            <span className="profile-empty-illustration__face"></span>
            <span className="profile-empty-illustration__spark profile-empty-illustration__spark--one">✦</span>
            <span className="profile-empty-illustration__spark profile-empty-illustration__spark--two">✦</span>
          </div>
          <p className="font-extrabold text-base text-[#282326] mt-4">Chưa có dữ liệu phiên soi da nào</p>
          <p className="text-xs text-[#6F686B] mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
            Thực hiện soi da 3 góc với công nghệ AI thị giác để khám phá 12 chỉ số cấu trúc và routine dược mỹ phẩm cá nhân hóa.
          </p>
          <a href="/skin-analysis" className="profile-btn profile-btn--primary">Bắt đầu Soi Da AI Ngay</a>
        </div>
      </div>
    );
  }

  return (
    <div id="timeline-scan-container" className="space-y-4">
      {history.map((scan, index) => {
        const score = Number(scan.healthScore) || 0;
        const scanId = scan.id ?? index;
        const theme = scoreTheme(score);
        const open = () => openScanDetail(scanId, index);
        const sessionNumber = history.length - index;

        return (
          <article
            key={scan.id || `${scan.dateFormatted || 'scan'}-${index}`}
            className="profile-history-card p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 cursor-pointer group"
            onClick={open}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                open();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Mở chi tiết phiên soi da ${sessionNumber}`}
          >
            <div className="flex items-center gap-5 min-w-0">
              {/* Score badge with squircle glow */}
              <div className={`${theme.score} w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                <span className="text-2xl leading-none font-black">{score}</span>
                <span className="text-[9px] font-extrabold tracking-widest uppercase opacity-90 mt-0.5">ĐIỂM</span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h4 className="font-extrabold text-[#282326] text-base group-hover:text-[#E06D81] transition-colors">
                    Phiên Soi Da #{sessionNumber}
                  </h4>
                  {index === 0 && (
                    <span className="bg-[#FFF0F4] text-[#E06D81] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E06D81]"></span>
                      Mới nhất
                    </span>
                  )}
                  <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${theme.chip}`}>
                    {scan.skinType || 'Chưa xác định'}
                  </span>
                </div>

                <p className="text-xs text-[#6F686B] flex items-center gap-2 flex-wrap">
                  <span>{scan.dateFormatted || 'Gần đây'}</span>
                  <span>·</span>
                  <span>Tuổi da AI: <strong className="text-[#282326] font-bold">{scan.skinAge || '--'} tuổi</strong></span>
                </p>
              </div>
            </div>

            {/* Quick action pill buttons */}
            <div
              className="action-group flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#F0ECEE] flex-shrink-0"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => exportUserPdfReport({ scan })}
                className="profile-action profile-action--quiet profile-action--compact"
                title="Xuất báo cáo PDF phiên này"
              >
                <svg className="w-3.5 h-3.5 text-[#E06D81]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>Xuất PDF</span>
              </button>

              <a
                href="https://zalo.me/0924093461"
                target="_blank"
                rel="noreferrer"
                className="profile-action profile-action--consult profile-action--compact"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/></svg>
                <span>Tư vấn dược sĩ</span>
              </a>

              <button
                type="button"
                onClick={open}
                className="profile-action profile-action--primary profile-action--compact"
              >
                <span>Xem chi tiết</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
