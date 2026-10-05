import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './assets/index.js';
import './styles/site.css';
import './styles/soft-storefront.css';
import './styles/navigation-drawer.css';
import './styles/home-refresh.css';
import './styles/scroll-reveal.css';
import './styles/scan-refresh.css';
import './styles/typography.css';
import './styles/home-scenes.css';
import './styles/editorial-titles.css';
import './styles/ambient-canvas.css';
import './styles/acie-editorial.css';
import './shared/ui/route-status.css';
import './styles/responsive-layout.css';
import { initializeAnalytics, installLegacyFirebaseBridge } from './infrastructure/firebase/index.js';
import { installLegacyRuntimeConfig } from './shared/config/runtime.js';

installLegacyRuntimeConfig();
installLegacyFirebaseBridge();
initializeAnalytics();

window.trackSkinIDEvent = function trackSkinIDEvent(eventName, eventParams = {}) {
  console.log(`[Analytics Event] ${eventName}:`, eventParams);
  if (typeof window.gtag === 'function') window.gtag('event', eventName, eventParams);
  if (typeof window.fbq === 'function') window.fbq('trackCustom', eventName, eventParams);
};

createRoot(document.getElementById('root')).render(<App />);
