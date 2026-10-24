import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';

const sourceRoot = process.argv[2];
assert.ok(sourceRoot, 'Pass the approved App Store design directory as the first argument.');
const design = JSON.parse(await readFile(path.join(sourceRoot, 'manifest.json'), 'utf8'));
const locales = { en: 'en-US', ko: 'ko', ja: 'ja', fr: 'fr-FR', de: 'de-DE', es: 'es-ES', it: 'it', 'pt-br': 'pt-BR', fi: 'fi', da: 'da', nl: 'nl-NL', no: 'no', sv: 'sv', 'zh-cn': 'zh-Hans', 'zh-tw': 'zh-Hant', id: 'id', vi: 'vi', th: 'th', ru: 'ru' };
const features = { agent: '02-agent', menu: '03-menu', document: '05-document', keyboard: '08-keyboard', widget: '09-widget', voice: '04-voice', text: '01-overview', chat: '06-chat', helper: '07-helper' };
const screens = {};
const provenance = [];
for (const [locale, sourceLocale] of Object.entries(locales)) {
  screens[locale] = {};
  await mkdir(`public/app-preview/product/${locale}`, { recursive: true });
  for (const [feature, id] of Object.entries(features)) {
    const slide = design.slides.find(item => item.locale === sourceLocale && item.id === id);
    assert.ok(slide?.renderedAsset, `${locale}/${feature}: missing approved screenshot`);
    const original = await readFile(path.join(sourceRoot, slide.renderedAsset));
    const originalSHA256 = createHash('sha256').update(original).digest('hex');
    assert.equal(originalSHA256, slide.assetSha256, `${locale}/${feature}: source changed`);
    const { data, info } = await sharp(original).resize({ width: 768, withoutEnlargement: true })
      .webp({ quality: 90, effort: 4 }).toBuffer({ resolveWithObject: true });
    assert.ok(info.width > 0 && info.height > info.width);
    const src = `/app-preview/product/${locale}/${feature}.webp`;
    await writeFile(`public${src}`, data);
    screens[locale][feature] = { src, width: info.width, height: info.height };
    provenance.push({ locale, feature, sourceLocale, original: slide.renderedAsset, originalSHA256,
      src, width: info.width, height: info.height, bytes: data.length,
      sha256: createHash('sha256').update(data).digest('hex') });
  }
}
assert.equal(provenance.length, 171);
await mkdir('src/data', { recursive: true });
await writeFile('src/data/product-screens.json', JSON.stringify(screens, null, 2) + '\n');
await writeFile('public/app-preview/product/manifest.json', JSON.stringify({
  approvedDesignRevision: design.designRevision,
  imageCount: provenance.length,
  processing: 'Whole approved App bitmap resized to at most 768px and encoded as WebP; no content, crop or UI alteration. Original files are unchanged. Localized illustrations are reused from the approved design, not claimed as new native captures.',
  images: provenance,
}, null, 2) + '\n');
const creativeRoot = path.join(sourceRoot, 'creative-assets-20261014/drafts/three-benefit-all-locales');
const creative = JSON.parse(await readFile(path.join(creativeRoot, 'manifest.json'), 'utf8'));
const socialImages = [];
await mkdir('public/app-preview/social', { recursive: true });
for (const [locale, sourceLocale] of Object.entries(locales)) {
  const asset = creative.assets.find(item => item.locale === sourceLocale && item.format === 'header');
  assert.ok(asset, `Missing approved social artwork: ${locale}`);
  const original = await readFile(path.join(creativeRoot, asset.export));
  assert.equal(createHash('sha256').update(original).digest('hex'), asset.pngSHA256);
  const { data, info } = await sharp(original).resize({ width: 1200 }).flatten({ background: '#f5f5f3' })
    .jpeg({ quality: 90, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  const src = `/app-preview/social/${locale}.jpg`;
  await writeFile(`public${src}`, data);
  socialImages.push({ locale, src, width: info.width, height: info.height, originalSHA256: asset.pngSHA256,
    sha256: createHash('sha256').update(data).digest('hex') });
}
await writeFile('public/app-preview/social/manifest.json', JSON.stringify({ images: socialImages }, null, 2) + '\n');
console.log(`Prepared ${provenance.length} localized approved App images (${Math.round(provenance.reduce((sum, row) => sum + row.bytes, 0) / 1024 / 1024)} MB).`);
