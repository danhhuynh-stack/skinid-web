import { useEffect } from 'react';
import { useSystemSettings } from '../context/SystemSettingsContext.jsx';

export default function TrackingScripts() {
  const settings = useSystemSettings();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Google Site Verification
    if (settings.gscVerification) {
      let meta = document.querySelector('meta[name="google-site-verification"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', settings.gscVerification);
    }

    // 2. Google Analytics 4 (GA4)
    if (settings.ga4Id && !document.getElementById('ga4-script')) {
      const scriptTag = document.createElement('script');
      scriptTag.id = 'ga4-script';
      scriptTag.async = true;
      scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(settings.ga4Id)}`;
      document.head.appendChild(scriptTag);

      const inlineScript = document.createElement('script');
      inlineScript.id = 'ga4-inline';
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.ga4Id}');
      `;
      document.head.appendChild(inlineScript);
    }

    // 3. Google Tag Manager (GTM)
    if (settings.gtmId && !document.getElementById('gtm-script')) {
      const gtmScript = document.createElement('script');
      gtmScript.id = 'gtm-script';
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${settings.gtmId}');
      `;
      document.head.appendChild(gtmScript);
    }

    // 4. Meta Pixel (Facebook Pixel)
    if (settings.metaPixelId && !document.getElementById('fb-pixel-script')) {
      const pixelScript = document.createElement('script');
      pixelScript.id = 'fb-pixel-script';
      pixelScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.metaPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(pixelScript);
    }
  }, [settings.ga4Id, settings.gtmId, settings.metaPixelId, settings.gscVerification]);

  return null;
}
