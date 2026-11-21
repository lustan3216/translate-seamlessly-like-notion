import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { SITE_LOCALES } from '../src/lib/site-config.mjs';

// Brand artwork only: no App UI, screenshot pixels, device frames or capture claims.
const destination = new URL('../public/app-preview/social-v2/', import.meta.url);
const read = async (file) => readFile(new URL(`../${file}`, import.meta.url));
const copy = Object.assign({}, ...await Promise.all(['base', 'asia', 'europe-a', 'europe-b']
  .map(async (group) => JSON.parse(await read(`src/translations/marketing/${group}.json`)))));
const logo = await read('public/app-preview/logo.png');
const features = [
  { key: 'feature.voice', icon: 'mic-01' },
  { key: 'feature.photos', icon: 'image-01' },
  { key: 'feature.chat', icon: 'bubble-chat-question' },
  { key: 'feature.widget', icon: 'book' },
];
const icons = Object.fromEntries(await Promise.all(features.map(async ({ icon }) =>
  [icon, (await read(`public/app-preview/icons/${icon}.svg`)).toString('base64')])));
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const hash = (data) => createHash('sha256').update(data).digest('hex');
const nativeFonts = { 'zh-tw': 'Heiti TC', 'zh-cn': 'Heiti SC', ja: 'Hiragino Sans', ko: 'Apple SD Gothic Neo', th: 'Thonburi' };
const textWidth = async (text, family, size) => (await sharp({ text: { text: escape(text), font: `${family} ${size}`, rgba: true } }).metadata()).width;
async function fit(texts, family, maximum, initial, minimum) {
  for (let size = initial; size >= minimum; size -= 2) {
    if ((await Promise.all(texts.map((text) => textWidth(text, family, size)))).every((width) => width <= maximum)) return size;
  }
  throw new Error(`Text does not fit: ${texts.join(' / ')}`);
}
async function wrap(text, family, size, locale, width) {
  const pieces = [...new Intl.Segmenter(locale, { granularity: 'word' }).segment(text)].map(({ segment }) => segment);
  const lines = [];
  let line = '';
  for (const piece of pieces) {
    const proposed = line + piece;
    if (line.trim() && await textWidth(proposed.trim(), family, size) > width) {
      lines.push(line.trim()); line = piece.trimStart();
    } else line = proposed;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

await mkdir(destination, { recursive: true });
const images = [];
for (const { code, tag } of SITE_LOCALES) {
  const language = copy[code];
  assert.ok(language, `Missing marketing copy: ${code}`);
  const family = nativeFonts[code] || 'Arial';
  const headlines = [language['hero.title'], language['hero.accent']];
  const headlineSize = await fit(headlines, family, 1056, 70, 44);
  const eyebrowSize = await fit([language['hero.eyebrow']], family, 1056, 20, 16);
  const cards = [];
  for (const [index, feature] of features.entries()) {
    const label = language[feature.key];
    const lines = await wrap(label, family, 17, tag, 204);
    assert.ok(lines.length <= 2, `Feature label is too long: ${code}/${feature.key}`);
    const x = 72 + index * 270;
    cards.push(`<g transform="translate(${x} 468)"><rect width="246" height="110" rx="16" fill="${index % 2 ? '#efeee8' : '#ffffff'}"/><image href="data:image/svg+xml;base64,${icons[feature.icon]}" x="20" y="16" width="28" height="28"/><text x="20" y="72" font-size="17" fill="#323330">${lines.map((line, i) => `<tspan x="20" dy="${i ? 24 : 0}">${escape(line)}</tspan>`).join('')}</text></g>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" xml:lang="${tag}">
<title>AnyTranslator — ${escape(language['hero.eyebrow'])}</title>
<desc>Localized brand illustration. It is not an App screenshot.</desc>
<defs><clipPath id="brand-logo"><rect x="72" y="55" width="48" height="48" rx="10"/></clipPath></defs>
<rect width="1200" height="630" fill="#f6f4ee"/>
<g font-family="${family}, sans-serif" font-weight="400">
<image href="data:image/png;base64,${logo.toString('base64')}" x="72" y="55" width="48" height="48" clip-path="url(#brand-logo)"/>
<text x="134" y="88" font-family="Arial, sans-serif" font-size="28" font-weight="600" fill="#202020">AnyTranslator</text>
<circle cx="78" cy="165" r="4" fill="#6a7ff1"/>
<text x="94" y="172" font-size="${eyebrowSize}" fill="#62645f">${escape(language['hero.eyebrow'])}</text>
<text x="72" y="276" font-size="${headlineSize}" fill="#202020">${escape(headlines[0])}</text>
<text x="72" y="366" font-size="${headlineSize}" fill="#777a74">${escape(headlines[1])}</text>
${cards.join('\n')}
</g></svg>\n`;
  const svgName = `${code}.svg`;
  const jpgName = `${code}.jpg`;
  const svgData = Buffer.from(svg);
  const jpeg = await sharp(svgData).jpeg({ quality: 92, mozjpeg: true }).toBuffer();
  const metadata = await sharp(jpeg).metadata();
  assert.equal(metadata.width, 1200); assert.equal(metadata.height, 630);
  await writeFile(new URL(svgName, destination), svgData);
  await writeFile(new URL(jpgName, destination), jpeg);
  images.push({ locale: code, languageTag: tag, artworkKind: 'marketing-illustration', nativeCapture: false,
    src: `/app-preview/social-v2/${jpgName}`, source: `/app-preview/social-v2/${svgName}`,
    width: 1200, height: 630, fontFamily: family, headlineSize,
    bytes: jpeg.length, sha256: hash(jpeg), sourceSHA256: hash(svgData),
    copyKeys: ['hero.eyebrow', 'hero.title', 'hero.accent', ...features.map(({ key }) => key)] });
}
assert.equal(images.length, 19);
await writeFile(new URL('manifest.json', destination), JSON.stringify({
  revision: 'brand-social-v2-20261114', generatedAt: new Date().toISOString(), artworkKind: 'marketing-illustration', nativeCapture: false,
  processing: 'Code-native SVG using translated site copy, unchanged local brand logo and official Hugeicons; rendered directly to 1200×630 JPEG. No old App screenshots or reconstructed App UI are used.',
  inputs: { logo: '/app-preview/logo.png', logoSHA256: hash(logo), icons: features.map(({ icon }) => `/app-preview/icons/${icon}.svg`) },
  imageCount: images.length, images,
}, null, 2) + '\n');
console.log(`Generated ${images.length} localized 1200×630 brand social cards (SVG + JPEG); these are marketing illustrations, not native App captures.`);
