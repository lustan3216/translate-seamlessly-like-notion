import fs from 'node:fs';
import { SITE_URL, SITE_LOCALES, SITE_ROUTES, canonicalUrl, localesForPath } from '../src/lib/site-config.mjs';

const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const entries = SITE_ROUTES.flatMap((route) => localesForPath(route).map(({ code }) => {
  const alternates = [...localesForPath(route).map((locale) => ({ tag: locale.tag, href: canonicalUrl(route, locale.code) })), { tag: 'x-default', href: canonicalUrl(route, 'en') }];
  return `  <url>\n    <loc>${escapeXml(canonicalUrl(route, code))}</loc>\n${alternates.map(({ tag, href }) => `    <xhtml:link rel="alternate" hreflang="${tag}" href="${escapeXml(href)}" />`).join('\n')}\n  </url>`;
}));
fs.writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`);
fs.writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\nDisallow: /_localized/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`Generated sitemap with ${entries.length} localized canonical URLs.`);
