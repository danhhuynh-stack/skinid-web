import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import OfferBar from '../components/layout/OfferBar.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import { assetUrl } from '../assets/index.js';
import { DEFAULT_BLOG_ARTICLES } from '../data/blogArticles.js';
import { fetchAdminBlogPosts } from '../features/admin/index.js';
import { useCatalog } from '../features/catalog/hooks/useCatalog.js';
import { formatPrice } from '../features/catalog/index.js';
import { useCart } from '../features/cart/index.js';
import usePageMetadata from '../hooks/usePageMetadata.js';

export default function BlogDetailPage() {
  const { postSlug } = useParams();
  const [articles, setArticles] = useState(DEFAULT_BLOG_ARTICLES);
  const { products } = useCatalog();
  const { addToCart } = useCart();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchAdminBlogPosts()
      .then((posts) => {
        if (mounted && Array.isArray(posts) && posts.length > 0) {
          setArticles(posts);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const article = useMemo(() => {
    if (!postSlug) return null;
    const clean = String(postSlug).toLowerCase().trim();
    return articles.find((a) => (a.slug && a.slug.toLowerCase() === clean) || a.id === clean) || null;
  }, [postSlug, articles]);

  // Sản phẩm liên quan được nhắc trong bài viết
  const relatedProducts = useMemo(() => {
    if (!article?.featuredProductIds?.length || !products?.length) return [];
    return products.filter((p) => article.featuredProductIds.includes(p.id));
  }, [article, products]);

  const pageTitle = article
    ? `${article.title} — Cẩm Nang Skincare | SkinID.vn`
    : 'Cẩm Nang Chăm Sóc Da Khoa Học — SkinID.vn';
  const pageDesc = article
    ? (article.excerpt || article.summary || article.title).slice(0, 160)
    : 'Kiến thức da liễu và hướng dẫn chăm sóc da khoa học từ chuyên gia SkinID.';
  const canonicalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/blog/${article?.slug || article?.id || postSlug}`
    : `https://skinid.vn/blog/${postSlug}`;

  usePageMetadata({
    title: pageTitle,
    description: pageDesc,
    canonical: canonicalUrl
  });

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        <OfferBar />
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex w-16 h-16 rounded-full bg-rose-50 text-[#D04862] items-center justify-center mb-4 text-2xl font-bold">!</div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2">Không tìm thấy bài viết</h1>
          <p className="text-slate-600 mb-6 text-sm">Bài viết bạn đang tìm kiếm có thể đã được gỡ bỏ hoặc chuyển đổi đường dẫn.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1A1A1A] text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
            Quay lại Cẩm nang Skincare
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col justify-between">
      <OfferBar />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 mb-6 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-slate-900 transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-slate-900 transition-colors">Cẩm nang Skincare</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate max-w-sm">{article.title}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-[#D04862] text-xs font-semibold mb-4 border border-rose-200/60">
            <span>{article.category || 'Da Liễu Khoa Học'}</span>
            {article.readingTime && <span>· {article.readingTime} phút đọc</span>}
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight tracking-tight mb-4">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mb-6">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between border-y border-stone-200/80 py-3.5 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden flex items-center justify-center font-bold text-slate-700">
                S
              </div>
              <div>
                <span className="font-semibold text-slate-900 block">{article.author || 'Đội ngũ Y khoa SkinID'}</span>
                <span>{article.publishedAt || 'Tháng 10/2026'}</span>
              </div>
            </div>

            {/* Social Share */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              >
                {copied ? '✓ Đã sao chép' : 'Sao chép link'}
              </button>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        {article.image && (
          <div className="w-full aspect-video rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 mb-10 shadow-xs">
            <img
              src={article.image.startsWith('http') ? article.image : assetUrl(article.image)}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <article className="prose prose-stone max-w-none text-slate-700 leading-relaxed text-base sm:text-lg mb-14 space-y-6">
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <div>
              <p>{article.summary || article.excerpt}</p>
              <h3 className="font-bold text-xl text-slate-900 pt-4">1. Nguyên tắc lâm sàng và cơ chế tác động</h3>
              <p>
                Việc lựa chọn các hoạt chất tương thích sinh học (biocompatible) là chìa khóa để phục hồi màng lipid tự nhiên của làn da. Khi da gặp tình trạng khô ráp, kích ứng hoặc tăng tiết dầu mất kiểm soát, hàng rào bảo vệ (skin barrier) đã bị tổn thương sâu.
              </p>
              <h3 className="font-bold text-xl text-slate-900 pt-4">2. Quy trình chăm sóc theo chuẩn 4 bước y khoa</h3>
              <p>
                - <strong>Bước 1: Làm sạch êm dịu</strong>: Không phá vỡ độ pH sinh lý (5.5).<br />
                - <strong>Bước 2: Cấp ẩm &amp; Hoạt chất chuyên sâu</strong>: Bổ sung Hyaluronic Acid đa tầng, Niacinamide hoặc B5.<br />
                - <strong>Bước 3: Khóa ẩm 72 Giờ</strong>: Ngăn chặn mất nước qua biểu bì (TEWL).<br />
                - <strong>Bước 4: Bảo vệ quang phổ rộng</strong>: Ngăn ngừa tia UVA/UVB và ánh sáng xanh.
              </p>
            </div>
          )}
        </article>

        {/* Featured Products in this article */}
        {relatedProducts.length > 0 && (
          <div className="bg-rose-50/50 rounded-3xl border border-rose-100 p-6 sm:p-8 mb-14">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 mb-4">
              Sản phẩm khuyên dùng trong bài viết
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedProducts.map((prod) => (
                <div key={prod.id} className="bg-white p-4 rounded-2xl border border-stone-200/60 flex gap-4 items-center">
                  <img
                    src={prod.image?.startsWith('http') ? prod.image : assetUrl(prod.image)}
                    alt={prod.name}
                    className="w-16 h-16 object-contain rounded-lg bg-stone-50 p-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#D04862] uppercase block">{prod.brand}</span>
                    <h3 className="text-xs font-semibold text-slate-900 truncate mb-1">{prod.name}</h3>
                    <span className="text-xs font-bold text-slate-900 block mb-2">{formatPrice(prod.price)}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => addToCart(prod)}
                        className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] text-white text-[11px] font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        + Giỏ hàng
                      </button>
                      <Link
                        to={`/products/${prod.slug || prod.id}`}
                        className="px-2.5 py-1 rounded-lg border border-stone-300 text-slate-700 text-[11px] font-medium hover:bg-stone-50 transition-colors"
                      >
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="pt-6 border-t border-stone-200 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#D04862] transition-colors"
          >
            ← Quay lại danh mục Cẩm nang Skincare
          </Link>
        </div>
      </main>

      <Footer />
      <MobileNav />
      <StorefrontModals />
    </div>
  );
}
