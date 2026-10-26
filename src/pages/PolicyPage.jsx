import { useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import OfferBar from '../components/layout/OfferBar.jsx';
import Footer from '../components/layout/Footer.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import ProductDetailModal from '../features/catalog/ProductDetailModal.jsx';
import usePageMetadata from '../hooks/usePageMetadata.js';
import { LEGAL_POLICIES, POLICY_LIST, COMPANY_INFO, getPolicyBySlug } from '../data/legalPolicies.js';
import PolicyContentRenderer, { renderInlineText } from '../components/policies/PolicyContentRenderer.jsx';

function PolicyIcon({ id, className = "w-4 h-4" }) {
  if (id === 'chinh-sach-bao-mat') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }
  if (id === 'chinh-sach-van-chuyen') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    );
  }
  if (id === 'chinh-sach-doi-tra') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <polyline points="23 20 23 14 17 14" />
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
      </svg>
    );
  }
  if (id === 'chinh-sach-thanh-toan') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    );
  }
  if (id === 'dieu-khoan-giao-dich') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function PolicyPage({ explicitSlug = null }) {
  const { policySlug } = useParams();
  const location = useLocation();

  // Xác định slug từ props, params hoặc pathname
  const activeSlug = useMemo(() => {
    if (explicitSlug) return explicitSlug;
    if (policySlug) return policySlug;
    const path = location.pathname.replace(/^\/+|\/+$/g, '');
    if (LEGAL_POLICIES[path]) return path;
    return 'chinh-sach-bao-mat';
  }, [explicitSlug, policySlug, location.pathname]);

  const policy = useMemo(() => {
    return getPolicyBySlug(activeSlug) || LEGAL_POLICIES['chinh-sach-bao-mat'];
  }, [activeSlug]);

  usePageMetadata({
    title: policy.seoTitle,
    description: policy.seoDesc
  });

  // Cuộn lên đầu trang khi chuyển chính sách
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSlug]);

  return (
    <>
      <OfferBar />
      <Header />

      <main className="min-h-screen bg-[#faf8f9] text-[#282326] py-6 sm:py-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap" aria-label="Đường dẫn">
            <Link to="/" className="hover:text-rose-600 transition-colors">Trang chủ</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600">Chính sách &amp; Quy định</span>
            <span className="text-gray-300">/</span>
            <span className="text-rose-700 font-semibold">{policy.shortTitle}</span>
          </nav>

          {/* Main 2-Column Grid */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* CỘT TRÁI (Sticky Sidebar Điều Hướng 6 Chính Sách) */}
            <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-5 sticky top-24">
              
              {/* Card Danh sách 6 chính sách */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Hồ Sơ Bộ Công Thương
                  </h2>
                </div>

                <div className="space-y-1.5">
                  {POLICY_LIST.map((item, index) => {
                    const isActive = item.slug === policy.slug;
                    return (
                      <Link
                        key={item.slug}
                        to={`/${item.slug}`}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200/70 shadow-2xs'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isActive ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <PolicyIcon id={item.id} className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1 leading-snug">
                          <span className="block truncate">{item.shortTitle}</span>
                          <span className="text-[10px] text-gray-400 font-normal">Mục {index + 1}</span>
                        </div>
                        {isActive && (
                          <span className="text-rose-600 text-xs font-bold">›</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Card Tuân thủ quy chế TMĐT */}
              <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-2xl border border-emerald-100 p-4 shadow-2xs text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider block">
                      QUY CHẾ HOẠT ĐỘNG
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold block leading-tight">
                      Tuân thủ Nghị định 52/2013/NĐ-CP
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-600 mt-2.5 leading-relaxed">
                  Hệ thống SkinID.vn xây dựng theo đúng quy chế TMĐT bán hàng và đang trong tiến trình hoàn tất thủ tục thông báo với Bộ Công Thương.
                </p>
                <div className="text-[10px] text-emerald-800 font-medium mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                  <span>Trạng thái: Đang nộp hồ sơ trực tuyến</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
              </div>

              {/* Card Hotline Hỗ Trợ Pháp Chế */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs text-xs space-y-2">
                <div className="font-bold text-gray-900 text-[11px] uppercase tracking-wider text-rose-700">
                  {COMPANY_INFO.name}
                </div>
                <div className="text-gray-500">
                  <span className="font-semibold text-gray-700">Mã số thuế:</span> {COMPANY_INFO.taxCode}
                </div>
                <div className="text-gray-500">
                  <span className="font-semibold text-gray-700">Cấp ngày:</span> {COMPANY_INFO.issueDate} ({COMPANY_INFO.issuePlace})
                </div>
                <div className="text-gray-500">
                  <span className="font-semibold text-gray-700">Đại diện pháp luật:</span>{' '}
                  <span className="font-bold text-gray-800">{COMPANY_INFO.legalRepresentative}</span>
                </div>
                <div className="text-gray-500">
                  <span className="font-semibold text-gray-700">Hotline:</span>{' '}
                  <a href={`tel:${COMPANY_INFO.hotline}`} className="text-rose-700 font-bold hover:underline">
                    {COMPANY_INFO.hotlineDisplay}
                  </a>
                </div>
                <div className="text-gray-500">
                  <span className="font-semibold text-gray-700">Email:</span>{' '}
                  <a href={`mailto:${COMPANY_INFO.email}`} className="text-gray-800 font-medium hover:underline">
                    {COMPANY_INFO.email}
                  </a>
                </div>
                <div className="text-gray-500">
                  <span className="font-semibold text-gray-700">Zalo CSKH:</span>{' '}
                  <a href={COMPANY_INFO.zaloUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">
                    {COMPANY_INFO.zaloName}
                  </a>
                </div>
              </div>

            </aside>

            {/* CỘT PHẢI (Nội Dung Toàn Văn Chính Sách) */}
            <article className="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-sm">
              
              {/* Header của bài viết */}
              <div className="pb-6 mb-8 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                    {policy.badge}
                  </span>
                  <span className="text-xs text-gray-400">
                    Ngày có hiệu lực: <strong className="text-gray-700">{policy.effectiveDate}</strong>
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
                  {policy.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                  Công bố chính thức bởi {COMPANY_INFO.name} áp dụng cho toàn bộ hoạt động giao dịch trên website thương mại điện tử SkinID.vn.
                </p>

                {/* Quick Anchor Bar (Mục lục nhảy nhanh) */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Xem nhanh:
                  </span>
                  {policy.sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="px-2.5 py-1 rounded-lg text-xs bg-gray-50 hover:bg-rose-50 hover:text-rose-700 text-gray-600 font-medium border border-gray-100 transition-colors"
                    >
                      {sec.heading.split('–')[0].split(':')[0]}
                    </a>
                  ))}
                </div>
              </div>

              {/* Danh sách các Section nội dung */}
              <div className="space-y-10 text-gray-700 text-sm leading-relaxed">
                {policy.sections.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-28">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                      <span className="w-1.5 h-4 rounded-full bg-rose-600 flex-shrink-0" />
                      <span>{section.heading}</span>
                    </h2>

                    {/* Nội dung dạng Text */}
                    {section.content && (
                      <PolicyContentRenderer content={section.content} />
                    )}

                    {/* Nội dung dạng Table */}
                    {section.type === 'table' && section.tableData && (
                      <div className="my-4 overflow-x-auto rounded-xl border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                          <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider">
                            <tr>
                              {section.tableData.headers.map((th, i) => (
                                <th key={i} className="px-4 py-3 border-r border-gray-200 last:border-r-0">
                                  {th}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {section.tableData.rows.map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-gray-50/70 transition-colors">
                                {row.map((cell, colIndex) => (
                                  <td
                                    key={colIndex}
                                    className={`px-4 py-3 border-r border-gray-100 last:border-r-0 align-top ${
                                      colIndex === 0 ? 'font-semibold text-gray-900 bg-gray-50/30' : 'text-gray-600'
                                    }`}
                                  >
                                    {renderInlineText(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Extra Callout hoặc Text sau Table */}
                    {section.extraContent && (
                      <div className="mt-4">
                        <PolicyContentRenderer content={section.extraContent} />
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* Footer bài viết chính sách */}
              <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-500">
                <div>
                  Văn bản có hiệu lực từ ngày: <strong className="text-gray-800">{policy.effectiveDate}</strong>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="#top"
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1 text-rose-600 font-semibold hover:underline"
                  >
                    <span>Về đầu trang</span>
                    <span aria-hidden="true">↑</span>
                  </a>
                </div>
              </div>

            </article>

          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
      <StorefrontModals />
      <ProductDetailModal />
    </>
  );
}
