import { useEffect, useState } from 'react';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import OfferBar from '../components/layout/OfferBar.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import ProductDetailModal from '../features/catalog/ProductDetailModal.jsx';
import { getProductById, formatPrice } from '../features/catalog/index.js';
import { useCart } from '../features/cart/index.js';
import { DEFAULT_BLOG_ARTICLES } from '../data/blogArticles.js';
import { fetchAdminBlogPosts } from '../features/admin/index.js';
import usePageMetadata from '../hooks/usePageMetadata.js';

const ROUTINE_TABS = [
  { id: 'all', label: 'Tất cả bài viết' },
  { id: 'cleanser', label: 'Bước 1 · Làm sạch' },
  { id: 'treatment', label: 'Bước 2 · Tinh chất & HA' },
  { id: 'moisturizer', label: 'Bước 3 · Khóa ẩm 72H' },
  { id: 'sunscreen', label: 'Bước 4 · Chống nắng' }
];

function readInitialBlogArticles() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('skinid_admin_blog_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch {}
  return DEFAULT_BLOG_ARTICLES;
}

export default function BlogPage() {
  usePageMetadata({
    title: 'Cẩm Nang Chăm Sóc Da & Kiến Thức Skincare Khoa Học — SkinID.vn',
    description: 'Cẩm nang chăm sóc da khoa học theo 4 bước routine: Làm sạch, Tinh chất, Khóa ẩm, Bảo vệ từ đội ngũ chuyên gia SkinID.'
  });

  const { addToCart } = useCart();
  const [articles, setArticles] = useState(readInitialBlogArticles);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchAdminBlogPosts()
      .then((posts) => {
        if (mounted && Array.isArray(posts) && posts.length > 0) {
          setArticles(posts);
        }
      })
      .catch(() => {});

    const handleSync = () => {
      const updated = readInitialBlogArticles();
      if (mounted && updated?.length) setArticles(updated);
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('skinid:blog-updated', handleSync);
    return () => {
      mounted = false;
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('skinid:blog-updated', handleSync);
    };
  }, []);

  const publishedArticles = articles.filter(
    (a) => (a.status || 'published') === 'published' && a.active !== false
  );

  const filteredArticles = publishedArticles.filter((article) => {
    const matchTab = activeTab === 'all' || article.step === activeTab;
    if (!matchTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(article.title || '').toLowerCase().includes(q) ||
      String(article.excerpt || '').toLowerCase().includes(q) ||
      String(article.author || '').toLowerCase().includes(q)
    );
  });

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
            <span className="text-gray-900 font-semibold">Cẩm nang Skincare (Blog)</span>
          </nav>

          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-gray-200/80 shadow-xs mb-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <span className="text-xs uppercase tracking-widest font-extrabold text-rose-600 mb-2 block">
                  SKINID SKINCARE JOURNAL
                </span>
                <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
                  Cẩm Nang Chăm Sóc Da Khoa Học
                </h1>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Phân tích thành phần minh bạch, giải mã hoạt chất dưỡng da và hướng dẫn thiết lập chu trình skincare 4 bước tối ưu cùng đội ngũ chuyên gia SkinID.
                </p>
              </div>

              <div className="w-full lg:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm bài viết, hoạt chất, bước dưỡng..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-gray-200 rounded-2xl text-xs text-gray-800 outline-none focus:bg-white focus:border-rose-400 transition"
                />
              </div>
            </div>

            {/* Routine Tabs */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
              {ROUTINE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
              <p className="text-sm text-gray-500">Không tìm thấy bài viết nào phù hợp với tiêu chí đang chọn.</p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
              >
                Xem tất cả bài viết
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => {
                const isProductCutout = String(article.image || '').startsWith('/images/products/');
                return (
                  <article
                    key={article.id}
                    className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className={`h-52 bg-stone-100 flex items-center justify-center relative overflow-hidden ${isProductCutout ? 'p-6' : ''}`}>
                      <img
                        src={article.image || '/images/products/rilastil/rilastil-serum-cap-cam-aqua-intense-gel-serum.png'}
                        alt={article.title}
                        className={`group-hover:scale-105 transition-transform duration-300 ${
                          isProductCutout ? 'max-h-full max-w-full object-contain' : 'w-full h-full object-cover'
                        }`}
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-rose-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-rose-100 shadow-2xs">
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
                        <span className="text-[11px] text-gray-400 font-medium truncate max-w-[65%]">
                          Bởi {article.author}
                        </span>
                        <span className="text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Đọc tiếp <span>→</span>
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Full Article Reader Modal */}
          {selectedArticle && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in"
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedArticle(null); }}
            >
              <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                    {selectedArticle.stepLabel}
                  </span>
                  <button
                    type="button"
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedArticle(null)}
                    aria-label="Đóng bài viết"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg>
                  </button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                  {/* Ảnh bìa bài viết trong Modal */}
                  {selectedArticle.image && (
                    <div className="h-60 sm:h-72 w-full rounded-2xl bg-stone-100 overflow-hidden flex items-center justify-center border border-gray-100">
                      <img
                        src={selectedArticle.image}
                        alt={selectedArticle.title}
                        className={`w-full h-full ${
                          String(selectedArticle.image).startsWith('/images/products/')
                            ? 'object-contain p-6'
                            : 'object-cover'
                        }`}
                      />
                    </div>
                  )}

                  <div>
                    <div className="text-xs text-gray-400 mb-2 flex flex-wrap items-center gap-2">
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

                  {selectedArticle.excerpt && (
                    <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 text-xs md:text-sm text-rose-900 leading-relaxed font-medium">
                      {selectedArticle.excerpt}
                    </div>
                  )}

                  <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
                    {(selectedArticle.content || []).map((sec, idx) => (
                      <div key={idx} className="space-y-2.5">
                        {sec.heading && <h3 className="font-bold text-gray-900 text-base">{sec.heading}</h3>}
                        {sec.text && <p className="text-gray-600 whitespace-pre-line leading-relaxed">{sec.text}</p>}
                        {sec.image && (
                          <figure className="my-3 rounded-2xl overflow-hidden border border-gray-200 bg-stone-50 p-2.5">
                            <img
                              src={sec.image}
                              alt={sec.imageCaption || sec.heading || selectedArticle.title}
                              className="max-h-80 w-full object-contain rounded-xl mx-auto"
                            />
                            {sec.imageCaption && (
                              <figcaption className="text-xs text-gray-500 text-center mt-2 italic">
                                {sec.imageCaption}
                              </figcaption>
                            )}
                          </figure>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Related Products Recommendation */}
                  {selectedArticle.relatedProductIds?.length > 0 && (
                    <div className="pt-6 border-t border-gray-100">
                      <h4 className="text-sm font-extrabold uppercase tracking-wide text-gray-900 mb-4 flex items-center gap-2">
                        <span>✨ Sản phẩm khuyên dùng trong bài viết</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedArticle.relatedProductIds.map((pid) => {
                          const prod = getProductById(pid);
                          if (!prod) return null;
                          return (
                            <div
                              key={prod.id}
                              className="p-3 rounded-xl border border-gray-200 bg-stone-50 flex items-center justify-between gap-3 hover:border-rose-300 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {prod.image && (
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-10 h-10 rounded-lg object-contain bg-white border border-gray-100 p-0.5 flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-gray-900 truncate">{prod.name}</h5>
                                  <span className="text-xs font-extrabold text-rose-600">{formatPrice(prod.price)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  type="button"
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:border-rose-400 cursor-pointer"
                                  onClick={() => openDetailModal(prod.id)}
                                >
                                  Chi tiết
                                </button>
                                <button
                                  type="button"
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-2xs cursor-pointer"
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
