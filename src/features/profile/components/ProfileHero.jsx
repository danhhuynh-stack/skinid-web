import { useEffect, useRef, useState } from 'react';

function joinDate(user) {
  try {
    const value = typeof user?.createdAt?.toDate === 'function' ? user.createdAt.toDate() : new Date(user?.createdAt);
    if (!Number.isNaN(value.getTime())) return value.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
  } catch {
    return 'SkinID';
  }
  return 'SkinID';
}

export default function ProfileHero({ user, historyCount, isLoading, onAvatarChange }) {
  const inputRef = useRef(null);
  const [imageFailed, setImageFailed] = useState(false);
  const name = user?.name || 'Thành viên SkinID';
  const showImage = user?.picture && !imageFailed;

  useEffect(() => setImageFailed(false), [user?.picture]);

  return (
    <section className="profile-hero p-7 sm:p-9 mb-8 relative overflow-hidden">
      {/* Soft Ambient Radiance */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#FFD6DE]/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute right-1/3 -bottom-10 w-52 h-52 bg-[#DBF1FF]/45 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="profile-avatar-shell">
            {showImage
              ? <img src={user.picture} alt={`Ảnh đại diện của ${name}`} referrerPolicy="no-referrer" className="profile-avatar" onError={() => setImageFailed(true)} />
              : <div className="profile-avatar profile-avatar--fallback">{name.trim().charAt(0).toUpperCase() || 'U'}</div>}
            <input ref={inputRef} id="profile-avatar-input" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onAvatarChange} />
            <button
              type="button"
              className="profile-avatar-edit"
              onClick={() => inputRef.current?.click()}
              aria-label="Thay đổi ảnh đại diện"
              title="Thay đổi ảnh đại diện"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </button>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2 min-h-[34px]">
              {isLoading ? (
                <span className="inline-block animate-pulse bg-rose-100/70 rounded-full h-8 w-44"></span>
              ) : (
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#282326]">{name}</h2>
              )}
              {user && (
                <span className="profile-provider-badge">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E06D81]"></span>
                  {user.provider === 'google' ? 'Google Account' : 'Thành viên SkinID'}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#6F686B] mb-3.5 min-h-[20px]">{user?.email || ''}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs text-[#6F686B] font-medium">
              <span className="profile-meta-pill">
                <svg className="w-3.5 h-3.5 text-[#E06D81]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Tham gia: <strong className="text-[#282326] font-bold">{joinDate(user)}</strong>
              </span>

              <span className="profile-meta-pill">
                <svg className="w-3.5 h-3.5 text-[#E06D81]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                Đã soi da: <strong className="text-[#E06D81] font-extrabold">{historyCount} phiên</strong>
              </span>
            </div>
          </div>
        </div>

        <a href="/skin-analysis" className="profile-btn profile-btn--primary w-full sm:w-auto justify-center self-center md:self-start">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          <span>Soi Da AI Mới</span>
        </a>
      </div>
    </section>
  );
}
