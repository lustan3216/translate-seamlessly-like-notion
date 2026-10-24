import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import { SITE_LOCALES, SITE_ROUTES, localizedPath, outputPath, localesForPath } from '../src/lib/site-config.mjs';

// Vite's build-time module loader emits jsxDEV, so use its matching React runtime.
process.env.NODE_ENV = 'development';

const template = await fs.readFile('dist/index.html', 'utf8');
const server = await createServer({ mode: 'production', server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, ssr: { noExternal: ['react-helmet-async'] } });
const manifest = [];
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
  const writePage = async (url, destination) => {
    const result = render(url);
    const html = template
      .replace(/<html[^>]*>/, `<html ${result.htmlAttributes}>`)
      .replace(/<!--seo-start-->[\s\S]*?<!--seo-end-->/, result.head)
      .replace('<div id="root"><!--ssr-outlet--></div>', `<div id="root" data-prerendered="true">${result.html}</div>`);
    if (!html.includes('data-prerendered="true"') || html.includes('<!--ssr-outlet-->')) throw new Error(`Incomplete prerender: ${url}`);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, html);
    return html;
  };
  for (const route of SITE_ROUTES) {
    for (const locale of localesForPath(route)) {
      const url = localizedPath(route, locale.code);
      const output = outputPath(route, locale.code);
      const html = await writePage(url, `dist/${output}`);
      if (locale.code === 'en' && route === '/') await fs.writeFile('dist/index.html', html);
      manifest.push({ url, language: locale.tag, output });
    }
  }
  await writePage('/404', 'dist/404.html');
  await fs.writeFile('dist/prerender-manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Pre-rendered ${manifest.length} localized pages plus a 404 page.`);
} finally {
  await server.close();
}
