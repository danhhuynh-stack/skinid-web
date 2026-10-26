import fs from 'fs';

const adminPagePath = 'D:\\skinid-web-extracted\\src\\pages\\AdminPage.jsx';
let content = fs.readFileSync(adminPagePath, 'utf8');

const s3AutoSyncMarker = 's3AutoSync';
const idxS3 = content.indexOf(s3AutoSyncMarker);

if (idxS3 !== -1 && !content.includes('gaId')) {
  // Tìm thẻ đóng của card khối 3 S3 POS (sau s3AutoSync, tìm </div>\r?\n\s*<\/div>\r?\n\s*<\/div>)
  const subStr = content.slice(idxS3);
  const matchClose = subStr.match(/<\/div>\s*<\/div>\s*<\/div>/);
  if (matchClose) {
    const insertPos = idxS3 + matchClose.index + matchClose[0].length;
    
    const trackingCardHtml = `\n\n              {/* Khối 4: Cấu hình Tiếp thị & Mã Theo dõi (SEO & Analytics Tracking) */}
              <div className="card-luxury p-5 space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <span>📊</span> 4. Cấu hình Tiếp thị & Mã Theo dõi (SEO & Analytics Tracking)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tích hợp trực tiếp mã đo lường Google Analytics 4, Tag Manager, Meta Pixel và thẻ xác minh Google Search Console.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Injected
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Google Analytics 4 (GA4 ID)
                      </label>
                      <input
                        type="text"
                        value={systemSettings.gaId || ''}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, gaId: e.target.value.trim() }))}
                        placeholder="G-XXXXXXXXXX"
                        className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-[#E06D81] focus:ring-2 focus:ring-[#E06D81]/15 transition text-slate-800 font-mono text-xs"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">Đo lường lượng truy cập và hành vi khách hàng.</span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Google Tag Manager (GTM ID)
                      </label>
                      <input
                        type="text"
                        value={systemSettings.gtmId || ''}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, gtmId: e.target.value.trim() }))}
                        placeholder="GTM-XXXXXXX"
                        className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-[#E06D81] focus:ring-2 focus:ring-[#E06D81]/15 transition text-slate-800 font-mono text-xs"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">Quản lý các thẻ tiếp thị nâng cao.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Meta Pixel ID (Facebook / Instagram Ads)
                      </label>
                      <input
                        type="text"
                        value={systemSettings.metaPixelId || ''}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, metaPixelId: e.target.value.trim() }))}
                        placeholder="VD: 123456789012345"
                        className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-[#E06D81] focus:ring-2 focus:ring-[#E06D81]/15 transition text-slate-800 font-mono text-xs"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">Theo dõi chuyển đổi đơn hàng cho quảng cáo Facebook.</span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Google Site Verification Meta Tag
                      </label>
                      <input
                        type="text"
                        value={systemSettings.googleSiteVerification || ''}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, googleSiteVerification: e.target.value.trim() }))}
                        placeholder="google-site-verification=abc..."
                        className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-[#E06D81] focus:ring-2 focus:ring-[#E06D81]/15 transition text-slate-800 font-mono text-xs"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">Xác minh quyền sở hữu website trên Google Search Console.</span>
                    </div>
                  </div>
                </div>
              </div>`;

    content = content.slice(0, insertPos) + trackingCardHtml + content.slice(insertPos);
    console.log('Inserted SEO & Analytics Tracking block at pos:', insertPos);
    fs.writeFileSync(adminPagePath, content, 'utf8');
  } else {
    console.log('Could not find closing div of S3 POS block');
  }
} else {
  console.log('Either s3AutoSync not found or gaId already present.');
}
