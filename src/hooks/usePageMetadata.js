import { useEffect } from 'react';

export default function usePageMetadata({ title, description, bodyClass = '' }) {
  useEffect(() => {
    document.title = title;
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) descriptionTag.setAttribute('content', description);
    document.body.className = bodyClass;

    return () => {
      document.body.className = '';
    };
  }, [bodyClass, description, title]);
}
