import { useEffect, useState } from 'react';
import { DEFAULT_BLOG_ARTICLES } from '../../data/blogArticles.js';

function readPublishedArticles() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('skinid_admin_blog_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((a) => (a.status || 'published') === 'published' && a.active !== false);
        }
      }
    }
  } catch {}
  return DEFAULT_BLOG_ARTICLES;
}

export default function HomeBlogTeaser() {
  const [articles, setArticles] = useState(readPublishedArticles);

  useEffect(() => {
    const handleSync = () => setArticles(readPublishedArticles());
    window.addEventListener('storage', handleSync);
    window.addEventListener('skinid:blog-updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('skinid:blog-updated', handleSync);
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Cẩm Nang Chăm Sóc Da Khoa Học
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1 max-w-xl">
              Kiến thức thành phần minh bạch và hướng dẫn thiết lập chu trình dưỡng da 4 bước từ đội ngũ chuyên gia SkinID.
            </p>
          </div>
          <a
            href="/blog"
            className="text-xs md:text-sm font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 group self-start md:self-auto"
          >
            Xem tất cả bài viết <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topArticles.map(article => (
            <a
              key={article.id}
              href="/blog"
              className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group p-5 hover:border-rose-300"
            >
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                  {article.stepLabel}
                </span>
                <span>{article.readTime}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-rose-600 transition-colors leading-snug mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-1">
                {article.excerpt}
              </p>
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                <span>{article.date}</span>
                <span className="text-rose-600 font-bold group-hover:underline">Đọc bài →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
