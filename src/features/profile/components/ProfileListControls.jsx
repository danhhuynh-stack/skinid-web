import { useRef } from 'react';

export default function ProfileListControls({ id, label, placeholder, query, onQueryChange, shown, total }) {
  const input = useRef(null);
  return (
    <div className="profile-list-controls">
      <div className="profile-list-search">
        <label htmlFor={`${id}-search`}>{label}</label>
        <div className="profile-list-search-field">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
          <input ref={input} id={`${id}-search`} type="search" value={query} onChange={event => onQueryChange(event.target.value)} placeholder={placeholder} aria-controls={id} />
          {query && <button type="button" onClick={() => { onQueryChange(''); input.current?.focus(); }} aria-label={`Xóa ${label.toLocaleLowerCase('vi-VN')}`}>×</button>}
        </div>
      </div>
      <p role="status">Hiển thị <strong>{shown}</strong> / {total}{query.trim() ? ' kết quả phù hợp' : ' mục'}</p>
    </div>
  );
}

export function ProfileListMore({ id, shown, total, batchSize, onMore, onCollapse }) {
  if (total <= batchSize) return null;
  return (
    <div className="profile-list-more">
      {shown < total && <button type="button" className="profile-btn profile-btn--secondary" aria-controls={id} onClick={onMore}>Xem thêm {Math.min(batchSize, total - shown)} mục <span aria-hidden="true">↓</span></button>}
      {shown > batchSize && <button type="button" className="profile-action profile-action--quiet" aria-controls={id} onClick={() => { onCollapse(); document.getElementById(`${id}-search`)?.focus({ preventScroll: true }); document.getElementById(`${id}-search`)?.scrollIntoView({ block: 'center', behavior: 'auto' }); }}>Thu gọn</button>}
    </div>
  );
}
