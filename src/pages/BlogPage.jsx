import { useState } from 'react';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import OfferBar from '../components/layout/OfferBar.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import ProductDetailModal from '../features/catalog/ProductDetailModal.jsx';
import { useCatalog, getProductById, formatPrice } from '../features/catalog/index.js';
import { useCart } from '../features/cart/index.js';
import usePageMetadata from '../hooks/usePageMetadata.js';

const BLOG_ARTICLES = [
  {
    id: 'bao-toan-mang-lipid-sinh-hoc-sua-rua-mat-ph-5-5',
    step: 'cleanser',
    stepLabel: 'Bước 01 · Làm sạch',
    title: 'Bảo toàn màng lipid sinh học: Bí quyết chọn sữa rửa mặt chuẩn pH 5.5 cho da nhạy cảm',
    author: 'SkinID Medical Advisory Board',
    readTime: '4 phút đọc',
    date: '12 Tháng 10, 2026',
    image: '/images/products/rilastil/rilastil-serum-cap-cam-aqua-intense-gel-serum.png',
    excerpt: 'Làm sạch quá mức bằng các chất hoạt động bề mặt mạnh có thể phá vỡ hàng rào bảo vệ tự nhiên, dẫn đến bùng phát viêm mụn và mất nước xuyên biểu bì (TEWL).',
    content: [
      {
        heading: '1. Màng Acid Mantle là gì và tại sao pH 5.5 lại quan trọng?',
        text: 'Lớp màng acid mantle trên bề mặt da là một hỗn hợp nhũ tương gồm bã nhờn, mồ hôi và các acid béo tự do. Độ pH sinh lý lý tưởng dao động từ 4.7 đến 5.75. Khi bạn dùng các loại sữa rửa mặt có tính kiềm cao (pH > 7), màng bảo vệ này bị cuốn trôi, khiến vi khuẩn C. acnes dễ dàng xâm nhập và các enzyme giữ ẩm tự nhiên bị ức chế.'
      },
      {
        heading: '2. Phân biệt làm sạch dịu nhẹ và làm sạch bào mòn',
        text: 'Sữa rửa mặt chuẩn y khoa không tạo cảm giác "kinh kít" căng rát sau khi rửa. Thay vào đó, nền da phải giữ được độ ẩm mịn, đàn hồi tự nhiên nhờ các hoạt chất như Ceramides, Hyaluronic Acid và các gốc làm sạch dịu lành chiết xuất từ thực vật.'
      },
      {
        heading: '3. Khuyến nghị từ chuyên gia SkinID',
        text: 'Đối với làn da dầu mụn nhạy cảm, hãy ưu tiên sữa rửa mặt dạng gel không chứa xà phòng. Đối với làn da khô ráp mất nước, sữa rửa mặt dạng nhũ tương dịu nhẹ là sự lựa chọn tối ưu để bảo tồn lượng lipid gian bào.'
      }
    ],
    relatedProductIds: ['rilastil-1774', 'rilastil-523']
  },
  {
    id: 'cong-nghe-cap-am-da-tang-hyaluronic-acid',
    step: 'treatment',
    stepLabel: 'Bước 02 · Tinh chất đặc trị',
    title: 'Giải mã công nghệ cấp ẩm đa tầng: HA phân tử thấp thâm nhập tế bào như thế nào?',
    author: 'Bs. CKII Da Liễu Nguyễn Phương Thảo',
    readTime: '5 phút đọc',
    date: '10 Tháng 10, 2026',
    image: '/images/products/rilastil/rilastil-serum-tai-tao-va-chong-lao-hoa-30ml-rilastil-multirepair-retinol-tech.avif',
    excerpt: 'Không phải mọi loại Hyaluronic Acid đều thẩm thấu như nhau. Hiểu rõ kích thước phân tử giúp bạn phục hồi nền da căng mọng hiệu quả gấp 3 lần.',
    content: [
      {
        heading: '1. Khác biệt giữa HA phân tử cao và phân tử thấp',
        text: 'HA trọng lượng phân tử cao (HMW-HA) tạo màng khóa ẩm bề mặt, ngăn chặn bốc hơi nước tức thì. Trong khi đó, HA trọng lượng phân tử cực thấp (LMW-HA) có khả năng len lỏi xuống tận các lớp biểu bì sâu hơn, kích thích sản sinh collagen nội sinh và tái cấu trúc nền da.'
      },
      {
        heading: '2. Ứng dụng công nghệ Dược mỹ phẩm Ý từ Rilastil',
        text: 'Phức hợp Aqua Intense của Rilastil kết hợp song hành cả hai phân tử HA cùng công nghệ Hydraboost sinh học, duy trì khả năng giữ nước lên đến 72 giờ liên tục ngay cả trong môi trường điều hòa nhiệt độ thấp.'
      },
      {
        heading: '3. Cách phối hợp tinh chất vào routine hàng ngày',
        text: 'Thoa tinh chất cấp ẩm ngay khi da còn hơi ẩm sau bước làm sạch hoặc xịt khoáng để các phân tử HA hấp thụ và ngậm nước tối đa trước khi khóa ẩm bằng kem dưỡng.'
      }
    ],
    relatedProductIds: ['rilastil-525', 'rilastil-2067']
  },
  {
    id: 'khoa-am-72h-ngan-chan-tewl',
    step: 'moisturizer',
    stepLabel: 'Bước 03 · Khóa ẩm 72H',
    title: 'Khóa ẩm chuyên sâu 72H: Bí quyết chặn đứng hiện tượng mất nước qua biểu bì (TEWL)',
    author: 'SkinID Research & Clinical Board',
    readTime: '4 phút đọc',
    date: '08 Tháng 10, 2026',
    image: '/images/products/rilastil/rilastil-kem-cap-am-chuyen-sau-72h-rilastil-aqua-intense-72h-gel-cream.png',
    excerpt: 'Mất nước qua biểu bì (Transepidermal Water Loss) là thủ phạm chính khiến da xỉn màu, bong tróc và nhanh xuất hiện nếp nhăn sớm.',
    content: [
      {
        heading: '1. Cơ chế bốc hơi nước và sụp đổ hàng rào màng tế bào',
        text: 'Ngay cả khi bạn đã cấp ẩm bằng toner hay serum, nếu thiếu bước khóa ẩm bằng chất làm mềm (emollients) và chất khóa ẩm (occlusives), hơn 60% lượng nước vừa được cấp sẽ bốc hơi vào không khí chỉ sau 30 phút.'
      },
      {
        heading: '2. Cấu trúc Gel-Cream thẩm thấu tức thì không bí tắc',
        text: 'Các loại kem khóa ẩm dược mỹ phẩm thế hệ mới như Rilastil Aqua Intense 72H sử dụng kết cấu Gel-Cream ma trận nhung lụa, vừa khóa chặt độ ẩm trong tế bào vừa đảm bảo lỗ chân lông luôn thông thoáng, hoàn toàn không gây nhân mụn (non-comedogenic).'
      }
    ],
    relatedProductIds: ['rilastil-2067', 'rilastil-1774']
  },
  {
    id: 'chong-nang-pho-rong-khang-anh-sang-xanh-hev',
    step: 'sunscreen',
    stepLabel: 'Bước 04 · Bảo vệ',
    title: 'Chống nắng phổ rộng & Kháng tia HEV: Tiêu chuẩn vàng bảo vệ da sau peel & laser',
    author: 'SkinID Medical Advisory Board',
    readTime: '6 phút đọc',
    date: '05 Tháng 10, 2026',
    image: '/images/products/rilastil/rilastil-kem-chong-nang-kiem-soat-nhon-va-ngan-ngua-mun-spf-50-rilastil-sun-system-water-touch-mat-tinted.png',
    excerpt: 'Tia UVA xuyên qua cửa kính và ánh sáng xanh từ màn hình thiết bị điện tử âm thầm phá hủy mạng lưới collagen mỗi ngày.',
    content: [
      {
        heading: '1. Mối nguy tiềm ẩn từ tia HEV (Ánh sáng xanh)',
        text: 'Nghiên cứu da liễu cho thấy ánh sáng xanh phát ra từ smartphone và máy tính thâm nhập sâu hơn cả tia UVB, kích hoạt gốc tự do ROS gây tăng sắc tố dai dẳng và đốm nâu khó điều trị.'
      },
      {
        heading: '2. Công nghệ màng lọc Water Touch thế hệ mới',
        text: 'Công thức Water Touch của dòng kem chống nắng Rilastil Sun System mang lại trải nghiệm mỏng nhẹ như nước, kháng nước, không để lại vệt trắng và tạo khiên chắn quang học toàn diện trước UVA, UVB và tia xanh HEV.'
      }
    ],
    relatedProductIds: ['rilastil-1857']
  },
  {
    id: 'phan-tich-da-ai-3-goc-do',
    step: 'all',
    stepLabel: 'Cẩm nang công nghệ',
    title: 'Phân tích da AI 3 góc độ: Đọc hiểu chỉ số bã nhờn, sắc tố và độ ẩm chuẩn xác',
    author: 'Đội ngũ Kỹ thuật & Da liễu AI SkinID',
    readTime: '3 phút đọc',
    date: '01 Tháng 10, 2026',
    image: '/images/banners/ai-skin-model-v1.png',
    excerpt: 'Khám phá cách mạng thị giác máy tính và mô hình deep learning giúp phát hiện các tổn thương dưới da mà mắt thường không thể nhìn thấy.',
    content: [
      {
        heading: '1. Soi da 3 góc độ: Trực diện, Nghiêng trái và Nghiêng phải',
        text: 'Chỉ chụp một góc chính diện sẽ bỏ sót các vùng nhạy cảm như cánh mũi, viền hàm và gò má. Hệ thống AI của SkinID phân tích toàn diện 3 góc để lập bản đồ phân bố bã nhờn và tổn thương sắc tố.'
      },
      {
        heading: '2. Cá nhân hóa phác đồ dược mỹ phẩm thực chứng',
        text: 'Sau khi nhận kết quả phân tích AI, người dùng được cung cấp phác đồ 4 bước tương thích chính xác với nhu cầu da thực tế, loại bỏ việc mua sắm thử nghiệm lãng phí.'
      }
    ],
    relatedProductIds: ['rilastil-1774', 'rilastil-525', 'rilastil-2067', 'rilastil-1857']
  }
];

const ROUTINE_TABS = [
  { id: 'all', label: 'Tất cả bài viết' },
  { id: 'cleanser', label: 'Bước 1 · Làm sạch' },
  { id: 'treatment', label: 'Bước 2 · Đặc trị & HA' },
  { id: 'moisturizer', label: 'Bước 3 · Khóa ẩm 72H' },
  { id: 'sunscreen', label: 'Bước 4 · Chống nắng' }
];

export default function BlogPage() {
  usePageMetadata({
    title: 'Góc Chăm Da & Kiến Thức Dược Mỹ Phẩm Chuẩn Y Khoa — SkinID.vn',
    description: 'Cẩm nang chăm sóc da khoa học theo 4 bước routine: Làm sạch, Đặc trị, Khóa ẩm, Bảo vệ từ chuyên gia da liễu SkinID.'
  });

  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filteredArticles = activeTab === 'all'
    ? BLOG_ARTICLES
    : BLOG_ARTICLES.filter(a => a.step === activeTab);

  const openDetailModal = (productId) => {
    document.dispatchEvent(new CustomEvent('skinid:open-product-detail', {
      detail: { productId }
    }));
  };

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    await addToCart(productId);
  };

  return (
    <>
      <OfferBar />
      <Header />
      <main className="blog-page min-h-screen bg-stone-50 pb-20">
        <div className="container py-6">
          <nav className="catalog-breadcrumb mb-6 text-xs text-gray-500 flex items-center gap-2" aria-label="Đường dẫn">
            <a href="/" className="hover:text-rose-600">Trang chủ</a>
            <span aria-hidden="true">/</span>
            <span className="text-gray-900 font-semibold">Góc chăm da (Blog)</span>
          </nav>

          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-gray-200/80 shadow-xs mb-10">
            <div className="max-w-2xl">
              <span className="text-xs uppercase tracking-widest font-extrabold text-rose-600 mb-2 block">
                SKINID MEDICAL JOURNAL
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
                Góc Chăm Da Chuẩn Y Khoa
              </h1>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Khoa học thực chứng, phân tích thành phần minh bạch và hướng dẫn thiết lập chu trình dưỡng da 4 bước cùng các bác sĩ và chuyên gia dược mỹ phẩm SkinID.
              </p>
            </div>

            {/* Routine Tabs */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
              {ROUTINE_TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <article
                key={article.id}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="h-48 bg-stone-100 flex items-center justify-center p-6 relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-rose-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-rose-100">
                    {article.stepLabel}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <span>{article.readTime}</span>
                      <span>·</span>
                      <span>{article.date}</span>
                    </div>
                    <h2 className="text-base font-bold text-gray-900 group-hover:text-rose-600 transition-colors leading-snug mb-2">
                      {article.title}
                    </h2>
                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-medium">Bởi {article.author}</span>
                    <span className="text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Đọc tiếp <span>→</span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Full Article Reader Modal */}
          {selectedArticle && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in"
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedArticle(null); }}
            >
              <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                    {selectedArticle.stepLabel}
                  </span>
                  <button
                    type="button"
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
                    onClick={() => setSelectedArticle(null)}
                    aria-label="Đóng bài viết"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg>
                  </button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                  <div>
                    <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                      <span>{selectedArticle.readTime}</span>
                      <span>·</span>
                      <span>{selectedArticle.date}</span>
                      <span>·</span>
                      <span>Tác giả: {selectedArticle.author}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-snug">
                      {selectedArticle.title}
                    </h2>
                  </div>

                  <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 text-xs md:text-sm text-rose-900 leading-relaxed font-medium">
                    {selectedArticle.excerpt}
                  </div>

                  <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                    {selectedArticle.content.map((sec, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <h3 className="font-bold text-gray-900 text-base">{sec.heading}</h3>
                        <p className="text-gray-600">{sec.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Related Products Recommendation */}
                  {selectedArticle.relatedProductIds?.length > 0 && (
                    <div className="pt-6 border-t border-gray-100">
                      <h4 className="text-sm font-extrabold uppercase tracking-wide text-gray-900 mb-4 flex items-center gap-2">
                        <span>🧪 Sản phẩm khuyên dùng trong bài viết</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedArticle.relatedProductIds.map(pid => {
                          const prod = getProductById(pid);
                          if (!prod) return null;
                          return (
                            <div
                              key={prod.id}
                              className="p-3 rounded-xl border border-gray-200 bg-stone-50 flex items-center justify-between gap-3 hover:border-rose-300 transition-colors"
                            >
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-gray-900 truncate">{prod.name}</h5>
                                <span className="text-xs font-extrabold text-rose-600">{formatPrice(prod.price)}</span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  type="button"
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:border-rose-400"
                                  onClick={() => openDetailModal(prod.id)}
                                >
                                  Chi tiết
                                </button>
                                <button
                                  type="button"
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-2xs"
                                  onClick={(e) => handleAddToCart(e, prod.id)}
                                >
                                  + Giỏ
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileNav />
      <StorefrontModals />
      <ProductDetailModal />
    </>
  );
}
