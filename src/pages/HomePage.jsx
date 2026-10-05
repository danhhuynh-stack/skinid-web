import { useEffect, useRef } from 'react';
import SkincareRoutine from '../components/analysis/SkincareRoutine.jsx';
import ProductDetailModal from '../features/catalog/ProductDetailModal.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import AcieTeaser from '../components/home/AcieTeaser.jsx';
import BrandShowcase from '../components/home/BrandShowcase.jsx';
import HelpSection from '../components/home/HelpSection.jsx';
import HeroBanner from '../components/home/HeroBanner.jsx';
import FeaturedProducts from '../components/home/FeaturedProducts.jsx';
import TrustBenefits from '../components/home/TrustBenefits.jsx';
import Footer from '../components/layout/Footer.jsx';
import Header from '../components/layout/Header.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import OfferBar from '../components/layout/OfferBar.jsx';
import useLegacyApplication from '../hooks/useLegacyApplication.js';
import usePageMetadata from '../hooks/usePageMetadata.js';
import useScrollReveal from '../hooks/useScrollReveal.js';

export default function HomePage() {
  const mainRef = useRef(null);
  usePageMetadata({
    title: 'SkinID.vn — Phân tích da AI & Dược mỹ phẩm Chính Hãng',
    description: 'Nền tảng phân tích da AI và mua dược mỹ phẩm Rilastil, chăm sóc cơ thể TWON và nước hoa D\'VAH chính hãng tại SkinID.vn.'
  });
  useLegacyApplication('home');
  useScrollReveal(mainRef);

  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => document.body.classList.remove('home-page-active');
  }, []);

  useEffect(() => {
    const scrollToHash = (behaviorOverride) => {
      if (!window.location.hash) return;
      const target = document.querySelector(window.location.hash);
      if (!target) return;
      const behavior = behaviorOverride || (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
      const header = document.querySelector('.site-header');
      const headerHeight = header ? header.offsetHeight : 89;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior
      });
    };
    const handleHashChange = () => scrollToHash();
    const handleWindowLoad = () => scrollToHash();
    scrollToHash();
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('load', handleWindowLoad, { once: true });
    const settleTimer = window.setTimeout(() => scrollToHash('instant'), 500);
    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('load', handleWindowLoad);
    };
  }, []);

  return (
    <>
      <OfferBar revealOnUpScroll />
      <Header />
      <main id="top" ref={mainRef} className="home-refresh ambient-page-canvas scroll-reveal-root">
        <HeroBanner />
        <FeaturedProducts />
        <HelpSection />
        <BrandShowcase />
        <AcieTeaser />
        <TrustBenefits />
      </main>
      <Footer />
      <MobileNav />
      <StorefrontModals />
      <ProductDetailModal />
      <SkincareRoutine />
    </>
  );
}
