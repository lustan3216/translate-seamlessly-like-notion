import { SITE_LOCALES, SITE_ROUTES, canonicalUrl, localesForPath } from '@/lib/site-config.mjs';

export interface SitemapEntry {
  url: string;
  alternates?: Array<{ tag: string; href: string }>;
  lastmod?: string;
}

const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const generateSitemap = (entries: SitemapEntry[]): string => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map((entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>${entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ''}
${(entry.alternates || []).map(({ tag, href }) => `    <xhtml:link rel="alternate" hreflang="${tag}" href="${escapeXml(href)}" />`).join('\n')}
  </url>`).join('\n')}
</urlset>
`;

export const getStaticSitemapEntries = (): SitemapEntry[] => SITE_ROUTES.map((route) => ({ url: canonicalUrl(route, 'en') }));

export const generateMultilingualSitemap = (): string => generateSitemap(SITE_ROUTES.flatMap((route) => localesForPath(route).map(({ code }) => ({
  url: canonicalUrl(route, code),
  alternates: [...localesForPath(route).map((locale) => ({ tag: locale.tag, href: canonicalUrl(route, locale.code) })), { tag: 'x-default', href: canonicalUrl(route, 'en') }],
}))));
