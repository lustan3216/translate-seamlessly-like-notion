import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { SITE_URL, SITE_ROUTES, SITE_LOCALES, canonicalUrl, languageFromSearch, languageForLocation, localesForPath, outputPath } from '../src/lib/site-config.mjs';

const decode = (value) => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'");
const attr = (tag, name) => decode(tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] || '');
const tags = (html, element) => [...html.matchAll(new RegExp(`<${element}\\b[^>]*>`, 'g'))].map((match) => match[0]);
const read = (file) => fs.readFile(file, 'utf8');

assert.equal(SITE_LOCALES.length, 19);
assert.equal(languageFromSearch(''), 'en', 'The English canonical URL must override saved preferences.');
assert.equal(languageFromSearch('?lang=unknown'), 'en');
assert.equal(languageFromSearch('?lang=zh-tw&utm_source=test'), 'zh-tw');
assert.equal(canonicalUrl('/support?lang=ru#help', 'zh-tw'), `${SITE_URL}/support?lang=zh-tw`);

const robots = await read('public/robots.txt');
assert.equal((robots.match(/^User-agent:/gm) || []).length, 1, 'Use one unambiguous robots group.');
assert.ok(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
assert.ok(!/Crawl-delay|Disallow: \/(?:assets|app-preview|lovable-uploads)\//.test(robots));

const sitemap = await read('public/sitemap.xml');
assert.ok(sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'));
assert.ok(!sitemap.includes('<lastmod>'), 'A build date is not a page modification date.');
assert.ok(!/[&](?!amp;|lt;|gt;|quot;|apos;)/.test(sitemap), 'XML must escape ampersands.');
const pageCopy = new Map();
const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
assert.equal(entries.length, 40);
assert.equal(new Set(entries.map((entry) => decode(entry.match(/<loc>([^<]+)<\/loc>/)[1]))).size, 40);
for (const route of SITE_ROUTES) {
  for (const { code, tag } of localesForPath(route)) {
    const canonical = canonicalUrl(route, code);
    const entry = entries.find((entry) => decode(entry.match(/<loc>([^<]+)<\/loc>/)[1]) === canonical);
    assert.ok(entry, `Missing sitemap entry: ${canonical}`);
    const alternates = tags(entry, 'xhtml:link');
    assert.equal(alternates.length, localesForPath(route).length + 1);
    for (const locale of localesForPath(route)) assert.ok(alternates.some((link) => attr(link, 'hreflang') === locale.tag && attr(link, 'href') === canonicalUrl(route, locale.code)), `Missing reciprocal alternate: ${canonical} / ${locale.code}`);
    assert.ok(alternates.some((link) => attr(link, 'hreflang') === 'x-default' && attr(link, 'href') === canonicalUrl(route, 'en')));

    const html = await read(`dist/${outputPath(route, code)}`);
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1];
    assert.ok(head, `Missing head: ${canonical}`);
    assert.equal(attr(tags(html, 'html')[0], 'lang'), tag);
    assert.ok(html.includes('data-prerendered="true"'));
    assert.ok(!html.includes('<!--ssr-outlet-->') && !html.includes('<!--seo-start-->'));
    assert.ok(!html.includes('data-lov-id'), 'Production prerender must not include development tagger attributes.');
    assert.equal((head.match(/<title\b/g) || []).length, 1);
    assert.ok(/<title[^>]*>[^<]{3,}<\/title>/.test(head));
    const metas = tags(head, 'meta');
    const descriptions = metas.filter((meta) => attr(meta, 'name') === 'description');
    assert.equal(descriptions.length, 1);
    assert.ok(attr(descriptions[0], 'content').length > 12, `Empty description: ${canonical}`);
    const links = tags(head, 'link');
    const canonicals = links.filter((link) => attr(link, 'rel') === 'canonical');
    assert.equal(canonicals.length, 1);
    assert.equal(attr(canonicals[0], 'href'), canonical);
    assert.equal(attr(metas.find((meta) => attr(meta, 'property') === 'og:url'), 'content'), canonical);
    const htmlAlternates = links.filter((link) => attr(link, 'rel') === 'alternate');
    assert.equal(htmlAlternates.length, localesForPath(route).length + 1);
    for (const locale of localesForPath(route)) assert.ok(htmlAlternates.some((link) => attr(link, 'hrefLang') === locale.tag && attr(link, 'href') === canonicalUrl(route, locale.code)), `Missing HTML alternate: ${canonical} / ${locale.code}`);
    pageCopy.set(`${route}:${code}`, { title: head.match(/<title[^>]*>([^<]+)<\/title>/)[1], description: attr(descriptions[0], 'content') });
    const body = html.match(/<body>([\s\S]*?)<\/body>/)?.[1];
    assert.ok(/<h1\b[^>]*>/.test(body), `Missing static page content: ${canonical}`);
    assert.ok(!/>\s*(?:landing|support|meta)\.[A-Za-z][^<]*</.test(body), `Untranslated key in rendered body: ${canonical}`);
  }
}
for (const route of SITE_ROUTES) {
  const english = pageCopy.get(`${route}:en`);
  for (const { code } of localesForPath(route).filter((locale) => locale.code !== 'en')) {
    const localized = pageCopy.get(`${route}:${code}`);
    assert.notDeepEqual(localized, english, `English metadata fallback: ${route} / ${code}`);
    assert.notEqual(localized.description, english.description, `English description fallback: ${route} / ${code}`);
  }
}
const config = JSON.parse(await read('vercel.json'));
const routeRules = config.routes;
assert.equal(routeRules.findIndex((rule) => rule.handle === 'filesystem'), 42, 'Localized routes and legal redirects must resolve before filesystem.');
assert.equal(routeRules.at(-1).status, 404);
const resolveRoute = (pathname, search = '') => {
  const query = new URLSearchParams(search);
  return routeRules.find((rule) => rule.src && new RegExp(rule.src).test(pathname) && (!rule.has || rule.has.every((condition) => query.has(condition.key) && (!condition.value || new RegExp(condition.value).test(query.get(condition.key))))));
};
for (const route of SITE_ROUTES) {
  for (const { code } of localesForPath(route)) {
    const search = code === 'en' ? '' : `?lang=${code}`;
    assert.equal(resolveRoute(route, search)?.dest, `/${outputPath(route, code)}`, `Incorrect hosting route: ${route} / ${code}`);
  }
  if (localesForPath(route).length === 1) {
    for (const { code } of SITE_LOCALES) {
      const redirect = resolveRoute(route, `?lang=${code}`);
      assert.equal(redirect?.status, 308, `Legal language URL must redirect: ${route} / ${code}`);
      assert.equal(redirect.headers.Location, route);
      assert.equal(languageForLocation(route, `?lang=${code}`), 'en');
      assert.equal(canonicalUrl(route, code), `${SITE_URL}${route}`);
    }
  }
}
for (const unknown of ['/missing-page', '/assets/missing.js', '/app-preview/missing.png']) {
  const match = routeRules.find((rule) => rule.src && new RegExp(rule.src).test(unknown));
  assert.equal(match?.status, 404, `Must not serve a successful SPA fallback: ${unknown}`);
}
const notFound = await read('dist/404.html');
assert.ok(/name="robots" content="noindex,nofollow"/.test(notFound));
console.log('SEO checks passed: 40 static pages (19 home + 19 support + 2 English legal documents), reciprocal hreflang, self canonicals, sitemap, robots, and true 404 routing.');
