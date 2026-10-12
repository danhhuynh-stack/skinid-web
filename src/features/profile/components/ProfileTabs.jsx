import { useEffect, useRef } from 'react';

export default function ProfileTabs({ activeTab, onSelect, hoverPaused = false, ordersCount = 0 }) {
  const tabs = [
    ['profile', 'Hồ sơ cá nhân'],
    ['history', 'Lịch sử soi da'],
    ['orders', ordersCount > 0 ? `Đơn hàng (${ordersCount})` : 'Đơn hàng'],
    ['settings', 'Cài đặt']
  ];
  const timer = useRef(null);
  const buttons = useRef([]);
  const cancelHover = () => { clearTimeout(timer.current); timer.current = null; };
  useEffect(() => {
    cancelHover();
    return cancelHover;
  }, [activeTab, hoverPaused]);
  const hover = (event, tab) => {
    cancelHover();
    if (hoverPaused || tab === activeTab || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    timer.current = setTimeout(() => onSelect(tab), 180);
  };
  const keyboard = (event, index) => {
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    cancelHover();
    onSelect(tabs[next][0]);
    buttons.current[next]?.focus();
  };
  return <div className="profile-tabs" role="tablist" aria-label="Khu vực hồ sơ" style={{ '--profile-tab-index': Math.max(0, tabs.findIndex(([tab]) => tab === activeTab)) }} onPointerLeave={cancelHover}>
    <span className="profile-tab-indicator" aria-hidden="true" />
    {tabs.map(([tab, label], index) => <button ref={element => { buttons.current[index] = element; }} key={tab} id={`profile-tab-${tab}`} type="button" role="tab" aria-controls={`profile-panel-${tab}`} aria-selected={activeTab === tab} tabIndex={activeTab === tab ? 0 : -1} onPointerEnter={event => hover(event, tab)} onPointerLeave={cancelHover} onPointerDown={cancelHover} onKeyDown={event => keyboard(event, index)} onClick={() => { cancelHover(); onSelect(tab); }} className={`tab-btn${activeTab === tab ? ' active' : ''}`}>{label}</button>)}
  </div>;
}
