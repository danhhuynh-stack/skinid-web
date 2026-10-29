import { useEffect, useState } from 'react';
import { DEFAULT_BLOG_ARTICLES } from '../../data/blogArticles.js';
import { fetchBlogPosts } from '../../features/content/index.js';

export default function HomeBlogTeaser() {
  const [articles, setArticles] = useState(DEFAULT_BLOG_ARTICLES);

  useEffect(() => {
    let mounted = true;
    fetchBlogPosts()
      .then((posts) => {
        if (mounted && Array.isArray(posts) && posts.length > 0) {
          setArticles(posts.filter((a) => (a.status || 'published') === 'published' && a.active !== false));
        }
      })
      .catch(() => {});

    const handleSync = (event) => {
      if (!mounted) return;
      if (event.detail?.posts && Array.isArray(event.detail.posts)) {
        setArticles(event.detail.posts.filter((a) => (a.status || 'published') === 'published' && a.active !== false));
      } else {
        fetchBlogPosts().then((posts) => {
          if (mounted && Array.isArray(posts)) {
            setArticles(posts.filter((a) => (a.status || 'published') === 'published' && a.active !== false));
          }
        }).catch(() => {});
      }
    };

    window.addEventListener('skinid:blog-updated', handleSync);
    window.addEventListener('skinid:blog-posts-updated', handleSync);
    return () => {
      mounted = false;
      window.removeEventListener('skinid:blog-updated', handleSync);
      window.removeEventListener('skinid:blog-posts-updated', handleSync);
    };
  }, []);

  const topArticles = articles.slice(0, 3);

  return (
    <section className="section bg-stone-50/70 border-t border-stone-200/60 py-16" aria-label="Cẩm nang chăm sóc da khoa học">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest font-extrabold text-rose-600 block mb-1.5">
              GÓC CHĂM DA · SKINID JOURNAL
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">
              Kiến thức Skincare chuẩn y khoa
            </h2>
          </div>
          <a
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-700 transition"
          >
            Xem tất cả bài viết
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topArticles.map((article) => (
            <article
              key={article.id}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200/70 hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col"
            >
              <a href={`/blog#${article.id}`} className="block relative aspect-16/10 overflow-hidden bg-stone-100">
                <img
                  src={article.image || '/images/products/placeholder.png'}
                  alt={article.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-rose-600 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                  {article.stepLabel || 'Cẩm nang'}
                </span>
              </a>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-600 mb-2 font-medium">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime || '3 phút đọc'}</span>
                  </div>
                  <h3 className="font-bold text-base text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug mb-2">
                    <a href={`/blog#${article.id}`}>{article.title}</a>
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-600">
                    {article.author || 'SkinID Advisory'}
                  </span>
                  <a
                    href={`/blog#${article.id}`}
                    className="text-xs font-bold text-rose-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
                  >
                    Đọc tiếp →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
