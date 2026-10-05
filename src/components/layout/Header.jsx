import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { assetUrl } from '../../assets/index.js';
import { useAuth } from '../../features/auth/index.js';
import { useCart } from '../../features/cart/index.js';

export const navigationGroups = [
  {
    id: 'steps', title: 'Bước chăm sóc da', note: 'Từng bước nhỏ, chăm sóc mỗi ngày.',
    links: [
      ['Làm sạch & tẩy trang', '/products?step=cleanser'],
      ['Toner & cân bằng', '/products?step=toner'],
      ['Tinh chất & đặc trị', '/products?step=treatment'],
      ['Dưỡng ẩm', '/products?step=moisturizer'],
      ['Chống nắng', '/products?step=sunscreen'],
      ['Cơ thể & nước hoa', '/products?step=special']
    ],
    image: '/images/products/rilastil/rilastil-serum-cap-cam-aqua-intense-gel-serum.png',
    imageAlt: 'Tinh chất dưỡng ẩm Rilastil Aqua', previewTitle: 'Một chút chăm sóc, dành riêng cho da.',
    previewLabel: 'Khám phá sản phẩm nổi bật', previewHref: '/#featured-products'
  },
  {
    id: 'needs', title: 'Nhu cầu làn da', note: 'Bắt đầu từ điều làn da đang cần.',
    links: [
      ['Da dầu & mụn', '/products?benefit=tri-mun-kiem-dau'],
      ['Da khô & cấp ẩm', '/products?benefit=cap-am-chuyen-sau'],
      ['Phục hồi & làm dịu', '/products?benefit=phuc-hoi-diu-da'],
      ['Sáng da & mờ thâm', '/products?benefit=sang-da-mo-tham'],
      ['Chống lão hóa', '/products?benefit=chong-lao-hoa']
    ],
    image: '/images/banners/ai-skin-model-v1.png', imageAlt: 'Khám phá nhu cầu làn da cùng SkinID',
    previewTitle: 'Chưa biết làn da cần gì?', previewLabel: 'Khám phá soi da AI', previewHref: '/skin-analysis'
  },
  {
    id: 'brands', title: 'Thương hiệu', note: 'Khám phá thế giới chăm sóc của bạn.',
    links: [
      ['Rilastil · Chăm sóc da', '/products?brand=rilastil'],
      ['TWON · Chăm sóc cơ thể', '/products?brand=twon'],
      ["D’VAH · Nước hoa", '/products?brand=dvah']
    ],
    image: '/images/products/rilastil/rilastil-serum-tai-tao-va-chong-lao-hoa-30ml-rilastil-multirepair-retinol-tech.avif',
    imageAlt: 'Tinh chất Rilastil', previewTitle: 'Mỗi thương hiệu, một câu chuyện.',
    previewLabel: 'Ghé thăm các thương hiệu', previewHref: '/#brands'
  }
];

function Icon({ name }) {
  const paths = {
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>,
    bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    arrow: <path d="m9 5 7 7-7 7" />
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function Header() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { toggleCart, totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [mobileLevel, setMobileLevel] = useState(false);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 720px)').matches);
  const trigger = useRef(null);
  const drawer = useRef(null);
  const panel = useRef(null);
  const closeTimer = useRef(null);
  const groupTimer = useRef(null);
  const pinned = useRef(false);
  const group = navigationGroups.find(item => item.id === activeGroup);
  const isCompact = () => compact;
  const cancelClose = () => window.clearTimeout(closeTimer.current);
  const cancelGroup = () => window.clearTimeout(groupTimer.current);
  const close = useCallback((restoreFocus = true) => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(groupTimer.current);
    setIsOpen(false);
    setActiveGroup(null);
    setMobileLevel(false);
    pinned.current = false;
    if (restoreFocus) requestAnimationFrame(() => trigger.current?.focus());
  }, []);
  const open = () => {
    cancelClose();
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) setIsOpen(true);
  };
  const openPinned = () => { cancelClose(); pinned.current = true; setIsOpen(true); };
  const scheduleClose = () => {
    cancelClose();
    if (!pinned.current) closeTimer.current = window.setTimeout(() => close(), 220);
  };
  const selectGroup = (id, enterPanel = false) => {
    cancelGroup();
    cancelClose();
    setActiveGroup(id);
    if (enterPanel) {
      pinned.current = true;
      setMobileLevel(true);
      requestAnimationFrame(() => panel.current?.querySelector('a')?.focus());
    }
  };
  const hoverGroup = (event, id) => {
    if (event.pointerType !== 'mouse' || isCompact()) return;
    cancelGroup();
    groupTimer.current = window.setTimeout(() => setActiveGroup(id), 90);
  };
  const scheduleGroupClose = event => {
    if (isCompact() || (event?.pointerType && event.pointerType !== 'mouse')) return;
    cancelGroup();
    groupTimer.current = window.setTimeout(() => setActiveGroup(null), 180);
  };
  const back = () => {
    setMobileLevel(false);
    requestAnimationFrame(() => document.getElementById('nav-group-' + activeGroup)?.focus());
  };

  useEffect(() => {
    if (!isOpen) return;
    // The portal is outside #root, so background controls are inert while the drawer is open.
    const root = document.getElementById('root');
    const wasInert = root?.inert;
    if (root) root.inert = true;
    document.body.classList.add('navigation-drawer-open');
    const focusDrawer = () => {
      if (!drawer.current?.contains(document.activeElement)) drawer.current?.querySelector('[data-first-link]')?.focus();
    };
    const frame = requestAnimationFrame(focusDrawer);
    // Recheck after the entrance transition; a just-hidden element may reject focus.
    const focusTimer = window.setTimeout(focusDrawer, 280);
    const onKeyDown = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close(); return; }
      if (event.key !== 'Tab') return;
      pinned.current = true;
      const items = [...drawer.current.querySelectorAll('a[href],button,input')].filter(item => !item.disabled && item.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (!drawer.current.contains(document.activeElement)) { event.preventDefault(); first?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(focusTimer);
      if (root) root.inert = wasInert;
      document.body.classList.remove('navigation-drawer-open');
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [isOpen, close]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 720px)');
    const resize = event => { setCompact(event.matches); close(); };
    media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, [close]);
  useEffect(() => () => { window.clearTimeout(closeTimer.current); window.clearTimeout(groupTimer.current); }, []);

  const account = () => {
    if (isAuthenticated) window.location.href = '/profile';
    else openAuthModal();
  };

  const navigateToHomeSection = (event, hash) => {
    close(false);
    document.body.classList.remove('navigation-drawer-open');
    if (window.location.pathname !== '/') {
      window.location.href = '/' + hash;
      return;
    }
    if (event) event.preventDefault();
    window.history.pushState(null, '', hash);
    setTimeout(() => {
      const target = document.querySelector(hash);
      if (target) {
        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.offsetHeight : 89;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
      }
    }, 60);
  };

  return <>
    <header className="site-header skinid-header minimal-header">
      <div className="container header-main">
        <button ref={trigger} className="minimal-menu-trigger" type="button" aria-expanded={isOpen} aria-controls="product-menu" aria-haspopup="dialog" onMouseEnter={open} onMouseLeave={scheduleClose} onClick={openPinned} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); openPinned(); } }}><Icon name="menu" /><span>Menu</span></button>
        <a className="brand" href="/" aria-label="SkinID.vn — Trang chủ"><img src={assetUrl('/images/logo.png')} alt="" /><span><b>SkinID</b><em>.vn</em></span></a>
        <div className="header-actions">
          <a className="header-compliance" href="/tra-cuu-cong-bo"><Icon name="shield" /><span>Tra cứu công bố</span></a>
          <a className="icon-btn" href="/products#catalog-search" aria-label="Tìm sản phẩm"><Icon name="search" /></a>
          <button className="icon-btn minimal-account" type="button" aria-label="Tài khoản" onClick={account}><Icon name="user" /></button>
          <button className="icon-btn cart-button" type="button" aria-label={`Mở giỏ hàng, ${totalItems} sản phẩm`} onClick={toggleCart}><Icon name="bag" /><span id="cart-badge" className={totalItems ? '' : 'opacity-0'}>{totalItems}</span></button>
        </div>
      </div>
    </header>
    {createPortal(<div className={'navigation-layer' + (isOpen ? ' is-open' : '')} inert={!isOpen} aria-hidden={!isOpen}>
      <div className="navigation-backdrop" onClick={() => close()} />
      <div ref={drawer} id="product-menu" className={'navigation-drawer' + (group ? ' has-submenu' : '') + (mobileLevel ? ' is-sublevel' : '')} role="dialog" aria-modal="true" aria-labelledby="navigation-title" onMouseEnter={cancelClose} onMouseLeave={scheduleClose} onPointerDown={() => { pinned.current = true; }}>
        <div className="drawer-heading"><div><span className="drawer-eyebrow">SKINID.VN</span><h2 id="navigation-title">Chăm sóc theo cách của bạn</h2></div><button type="button" className="drawer-close" aria-label="Đóng menu" onClick={() => close()}><Icon name="close" /></button></div>
        <div className="drawer-columns">
          <nav className="drawer-primary" aria-label="Khám phá SkinID">
            <div className="drawer-primary-scroll">
            <a className="drawer-all" href="/products" data-first-link onClick={() => close(false)}>Tất cả sản phẩm <span aria-hidden="true">↗</span></a>
            <span className="drawer-eyebrow drawer-section-label">TÌM ĐIỀU PHÙ HỢP</span>
            {navigationGroups.map((item, index) => <button key={item.id} id={'nav-group-' + item.id} className={'drawer-group' + (activeGroup === item.id ? ' is-active' : '')} type="button" aria-controls="drawer-submenu" aria-expanded={activeGroup === item.id && (!compact || mobileLevel)} onPointerEnter={event => hoverGroup(event, item.id)} onPointerLeave={scheduleGroupClose} onFocus={() => { if (!isCompact()) selectGroup(item.id); }} onClick={() => selectGroup(item.id, true)} onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); selectGroup(item.id, true); } }}><span className="drawer-number">0{index + 1}</span><span>{item.title}</span><Icon name="arrow" /></button>)}
            <div className="drawer-explore"><span className="drawer-eyebrow">CÙNG SKINID KHÁM PHÁ</span><a href="/#featured-products" onClick={(event) => navigateToHomeSection(event, '#featured-products')}>Sản phẩm nổi bật <span aria-hidden="true">↗</span></a><a href="/#skin-advisor" onClick={(event) => navigateToHomeSection(event, '#skin-advisor')}>Chọn theo làn da <span aria-hidden="true">↗</span></a><a href="/#acie-teaser" onClick={(event) => navigateToHomeSection(event, '#acie-teaser')}>Gặp gỡ ACIE <small>Sắp ra mắt</small></a><a href="/skin-analysis" onClick={() => close(false)}>Soi da AI <span aria-hidden="true">↗</span></a></div>
            {compact && <button className="drawer-account" type="button" onClick={() => { close(false); requestAnimationFrame(account); }}><Icon name="user" />Tài khoản của bạn</button>}
            </div>
            <a className="drawer-compliance" href="/tra-cuu-cong-bo" onClick={() => close(false)}><Icon name="shield" /><span>Tra cứu phiếu công bố<small>Thông tin sản phẩm minh bạch</small></span><span aria-hidden="true">↗</span></a>
          </nav>
          <nav ref={panel} id="drawer-submenu" className="drawer-secondary" aria-label={group?.title || 'Danh mục con'} aria-hidden={!group} onPointerEnter={cancelGroup} onPointerLeave={scheduleGroupClose} onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); back(); } }}>
            <button className="drawer-back" type="button" onClick={back}>← Quay lại menu</button>
            {group && <><span className="drawer-eyebrow">{group.title}</span><h3>{group.note}</h3>
            <div className="drawer-links" key={group.id}>{group.links.map(([label, href]) => <a key={href} href={href} onClick={() => close(false)}>{label}<span aria-hidden="true">↗</span></a>)}</div>
            <a className={'drawer-editorial drawer-editorial--' + group.id} href={group.previewHref} onClick={(event) => {
              if (group.previewHref?.startsWith('/#')) {
                navigateToHomeSection(event, group.previewHref.slice(1));
              } else {
                close(false);
              }
            }}><img src={assetUrl(group.image)} alt={group.imageAlt} /><div><span className="drawer-eyebrow">GỢI Ý TỪ SKINID</span><p>{group.previewTitle}</p><span className="drawer-editorial-cta">{group.previewLabel} →</span></div></a></>}
          </nav>
        </div>
      </div>
    </div>, document.body)}
  </>;
}
