import { useEffect } from 'react';

/**
 * Dependency-free per-page SEO helper.
 * Sets <title>, meta description, canonical, Open Graph / Twitter tags and JSON-LD.
 * NOTE: this only reaches search engines reliably when the page is prerendered / SSR'd
 * (e.g. react-snap, Prerender.io, Next.js, or Vite SSG). See the summary notes.
 */
const upsert = (selector, tag, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(tag);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
};

export default function Seo({ title, description, canonical, image, jsonLd }) {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    if (title) {
      document.title = title;
      upsert('meta[property="og:title"]', 'meta', { property: 'og:title', content: title });
      upsert('meta[name="twitter:title"]', 'meta', { name: 'twitter:title', content: title });
    }

    if (description) {
      upsert('meta[name="description"]', 'meta', { name: 'description', content: description });
      upsert('meta[property="og:description"]', 'meta', {
        property: 'og:description',
        content: description
      });
      upsert('meta[name="twitter:description"]', 'meta', {
        name: 'twitter:description',
        content: description
      });
    }

    if (canonical) {
      upsert('meta[name="robots"]', 'meta', { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' });
      upsert('link[rel="canonical"]', 'link', { rel: 'canonical', href: canonical });
      upsert('meta[property="og:url"]', 'meta', { property: 'og:url', content: canonical });
    }

    if (image) {
      upsert('meta[property="og:image"]', 'meta', { property: 'og:image', content: image });
      upsert('meta[name="twitter:image"]', 'meta', { name: 'twitter:image', content: image });
    }

    let script;
    if (jsonLdString) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', 'true');
      script.text = jsonLdString;
      document.head.appendChild(script);
    }

    return () => {
      if (script && script.parentNode) script.parentNode.removeChild(script);
    };
  }, [title, description, canonical, image, jsonLdString]);

  return null;
}
