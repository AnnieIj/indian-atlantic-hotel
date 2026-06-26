import { useEffect } from 'react';

const SITE_NAME = 'Indian Atlantic Hotel and Suites';
const ORIGIN = 'https://indianatlantichotel.com';
const DEFAULT_IMAGE = `${ORIGIN}/logo.png`;

// Sets or updates a <meta> tag by name or property.
const setMeta = (attr, key, content) => {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

/**
 * Per-page SEO. Sets a unique title, description, canonical URL, and social
 * tags for each route so Google indexes every page distinctly instead of
 * treating the whole SPA as one "Indian Atlantic Hotel and Suites" page.
 *
 * Props:
 *  - title:       page title (site name is appended automatically)
 *  - description: meta description (~150-160 chars, keyword-rich)
 *  - path:        route path for the canonical URL, e.g. "/rooms"
 *  - image:       optional social share image (absolute or root-relative)
 */
const Seo = ({ title, description, path = '/', image }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const url = `${ORIGIN}${path}`;
    const img = image
      ? (image.startsWith('http') ? image : `${ORIGIN}${image}`)
      : DEFAULT_IMAGE;

    document.title = fullTitle;
    setMeta('name', 'description', description);

    // Canonical URL
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Open Graph + Twitter
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', img);
  }, [title, description, path, image]);

  return null;
};

export default Seo;
