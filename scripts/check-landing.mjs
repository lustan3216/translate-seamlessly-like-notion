import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const translationSource = readFileSync(new URL('../src/translations/landing.ts', import.meta.url), 'utf8');
const translations = JSON.parse(translationSource.slice(translationSource.indexOf('= ') + 2, translationSource.lastIndexOf(';')));
const languageSource = readFileSync(new URL('../src/contexts/LanguageContext.tsx', import.meta.url), 'utf8');
const languages = [...languageSource.matchAll(/\{ code: '([^']+)'/g)].map((match) => match[1]);
assert.equal(languages.length, 19);
assert.deepEqual(Object.keys(translations).sort(), languages.sort());

const keys = Object.keys(translations.en).sort();
assert.equal(keys.length, 68);
for (const [language, copy] of Object.entries(translations)) {
  assert.deepEqual(Object.keys(copy).sort(), keys, `Missing landing copy: ${language}`);
  for (const [key, value] of Object.entries(copy)) {
    assert.equal(typeof value, 'string', `${language}: ${key}`);
    assert.ok(value.trim(), `Empty landing copy: ${language}: ${key}`);
  }
}

for (const asset of [
  'logo.png',
  ...['arrow-right-01-round', 'arrow-down-01-round', 'tick-02', 'language-square', 'mic-01', 'bot', 'file-search', 'restaurant-01', 'keyboard-01', 'book', 'bubble-chat-question', 'image-01', 'clock-01'].map((icon) => `icons/${icon}.svg`),
]) {
  assert.ok(readFileSync(new URL(`../public/app-preview/${asset}`, import.meta.url)).length, `Empty asset: ${asset}`);
}

const captures = JSON.parse(readFileSync(new URL('../public/app-preview/captures.json', import.meta.url), 'utf8'));
for (const locale of ['en', 'ru']) {
  for (const screen of ['translate', 'voice', 'agent', 'menu', 'document', 'chat']) {
    const path = `screens/${locale}/${screen}.png`;
    const capture = captures.captures.find((item) => item.path === path);
    assert.ok(capture, `Missing screenshot provenance: ${path}`);
    const image = readFileSync(new URL(`../public/app-preview/${path}`, import.meta.url));
    assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `Invalid screenshot: ${path}`);
    assert.deepEqual([image.readUInt32BE(16), image.readUInt32BE(20)], [1320, 2868]);
    assert.equal(createHash('sha256').update(image).digest('hex'), capture.sha256, `Changed original screenshot: ${path}`);
  }
}

console.log(`Verified 19 landing languages, ${keys.length} nonempty keys each, official icons, and 12 original full-resolution screenshots with matching SHA-256.`);
