import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readAffiliate } from '../api/plan-quotas.mjs';
import { writeLiveAccountFunction } from './prepare-vercel-account-function.mjs';

const websiteRoot = fileURLToPath(new URL('../', import.meta.url));
const nativePrefix = '/app-preview/native/';
const localizedPrefix = '/app-preview/localized-ui/';
const retiredPrefixes = ['app-preview/product/', 'app-preview/screens/', 'app-preview/social/'];
const pricingFunctions = {
  'api/asc-prices': ['api/asc-prices.mjs', 'scripts/sync-asc-prices.mjs', 'src/data/asc-price-snapshot.mjs', 'src/data/asc-prices.json'],
  'api/plan-quotas': ['api/plan-quotas.mjs', 'src/data/main-pricing.json'],
};
const json = async (file) => JSON.parse(await readFile(file, 'utf8'));

function inside(root, relative) {
  assert.ok(relative && !path.isAbsolute(relative) && !relative.split(/[\\/]/).includes('..'), `Unsafe relative path: ${relative}`);
  const resolved = path.resolve(root, relative);
  assert.ok(resolved.startsWith(`${path.resolve(root)}${path.sep}`), `Path escapes its root: ${relative}`);
  return resolved;
}

async function plainPath(root, relative) {
  let current = root;
  for (const part of relative.split('/')) {
    current = inside(current, part);
    try {
      assert.ok(!(await lstat(current)).isSymbolicLink(), `Symlinks are not permitted: ${current}`);
    } catch (error) {
      if (error.code === 'ENOENT') break;
      throw error;
    }
  }
  return inside(root, relative);
}

async function filesIn(root, relative = '') {
  const files = [];
  for (const entry of await readdir(relative ? inside(root, relative) : root, { withFileTypes: true })) {
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    assert.ok(!entry.isSymbolicLink(), `Symlinks are not permitted: ${name}`);
    if (entry.isDirectory()) files.push(...await filesIn(root, name));
    else {
      assert.ok(entry.isFile(), `Unsupported file type: ${name}`);
      files.push(name);
    }
  }
  return files.sort();
}

async function hash(file) {
  const digest = createHash('sha256');
  for await (const chunk of createReadStream(file)) digest.update(chunk);
  return digest.digest('hex');
}

function imagePath(src, prefix) {
  assert.equal(typeof src, 'string', 'A selected image must have a URL path.');
  assert.ok(src.startsWith(prefix) && /^\/[a-z0-9/-]+\.webp$/.test(src), `Invalid selected image path: ${src}`);
  assert.ok(!/\/(?:chat|screen-translation)(?:-\d+)?\.webp$/.test(src) || prefix !== nativePrefix, `Withheld native example is selected: ${src}`);
  return src;
}

function imageUrls(image, prefix) {
  const urls = [imagePath(image.src, prefix)];
  if (image.srcSet) {
    for (const candidate of image.srcSet.split(',')) {
      const [src, width, extra] = candidate.trim().split(/\s+/);
      assert.ok(/^[1-9]\d*w$/.test(width) && !extra, `Invalid image srcSet: ${candidate}`);
      urls.push(imagePath(src, prefix));
    }
  }
  assert.ok(!image.gallery || Array.isArray(image.gallery), 'Image gallery must be an array.');
  for (const shot of image.gallery || []) urls.push(...imageUrls(shot, prefix));
  return urls;
}

function privateFile(file) {
  return /(?:^|\/)(?:\.git|\.secrets|\.vercel|raw|proof|private|native-captures)(?:\/|$)/i.test(file)
    || /(?:^|\/)(?:manifest\.json|prerender-manifest\.json|captures\.json|\.env(?:\.[^/]*)?|\.DS_Store)$/i.test(file)
    || /\.(?:proof|review|adoptable|safe)\.json$|\.map$/i.test(file);
}

async function prepare(root, liveBilling = false) {
  const dist = await plainPath(root, 'dist');
  const publicRoot = await plainPath(root, 'public');
  const release = await plainPath(root, 'output/vercel-release/.vercel/output');
  const native = await json(inside(root, 'src/data/native-product-screens.json'));
  const localized = await json(inside(root, 'src/data/localized-ui-screens.json'));
  const vercel = await json(inside(root, 'vercel.json'));
  assert.ok(Array.isArray(vercel.routes) && vercel.routes.length, 'vercel.json must contain routes.');
  const nativeImages = new Set(Object.values(native).flatMap((features) => Object.values(features).flatMap((image) => imageUrls(image, nativePrefix))));
  assert.ok(nativeImages.size, 'Native image selection must not be empty.');
  const localizedImages = new Set();
  for (const images of Object.values(localized)) {
    assert.ok(Array.isArray(images), 'Localized registry entries must be arrays.');
    for (const image of images) {
      assert.ok(nativeImages.has(image.sourceNative), `Localized image refers to an unselected native source: ${image.sourceNative}`);
      for (const src of imageUrls(image, localizedPrefix)) localizedImages.add(src);
    }
  }
  const selected = new Set([...nativeImages, ...localizedImages]);
  const publish = (file) => !privateFile(file) && !retiredPrefixes.some((prefix) => file.startsWith(prefix))
    && (!file.startsWith(nativePrefix.slice(1)) || nativeImages.has(`/${file}`))
    && (!file.startsWith(localizedPrefix.slice(1)) || localizedImages.has(`/${file}`));
  const distFiles = await filesIn(dist);
  const pricingSources = new Map(await Promise.all(Object.values(pricingFunctions).flat().map(async (file) => {
    const source = await plainPath(root, file);
    assert.ok((await lstat(source)).isFile(), `Missing pricing runtime input: ${file}`);
    return [file, source];
  })));
  const { affiliate } = await json(pricingSources.get('src/data/main-pricing.json'));
  assert.deepEqual(affiliate, readAffiliate(affiliate), 'The packaged affiliate snapshot must contain only public settings.');
  for (const file of distFiles.filter((name) => /\.(?:html|js|css)$/i.test(name))) {
    const text = (await readFile(inside(dist, file), 'utf8')).replaceAll('\\/', '/');
    for (const prefix of retiredPrefixes)
      assert.ok(!text.includes(prefix), `Retired image directory is still referenced by ${file}: ${prefix}`);
  }
  const expected = distFiles.filter(publish);
  assert.ok(expected.includes('index.html') && expected.includes('404.html'), 'Build must include index.html and 404.html.');
  assert.ok(vercel.routes.some((route) => route.dest === '/404.html' && route.status === 404), 'Preserve the explicit 404 route.');
  for (const src of selected) {
    const relative = src.slice(1);
    assert.ok(expected.includes(relative), `Selected image missing from dist; rebuild before packaging: ${src}`);
    const original = await plainPath(publicRoot, relative);
    assert.equal(await hash(inside(dist, relative)), await hash(original), `dist image differs from current public asset; rebuild: ${src}`);
  }

  // Validate inputs before replacing only this script's disposable release output.
  await rm(release, { recursive: true, force: true });
  const staticRoot = inside(release, 'static');
  await mkdir(staticRoot, { recursive: true });
  let bytes = 0;
  for (const file of expected) {
    const source = inside(dist, file);
    const target = inside(staticRoot, file);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(source, target);
    assert.equal(await hash(target), await hash(source), `Copied file hash differs: ${file}`);
    bytes += (await lstat(target)).size;
  }
  assert.deepEqual(await filesIn(staticRoot), expected, 'Release static files differ from the filtered dist.');
  const published = await filesIn(staticRoot);
  assert.ok(published.every(publish), 'Release includes private metadata or an unselected image.');
  assert.ok(!published.some((file) => retiredPrefixes.some((prefix) => file.startsWith(prefix))), 'Release includes retired image directories.');
  assert.deepEqual(published.filter((file) => file.startsWith(nativePrefix.slice(1)) || file.startsWith(localizedPrefix.slice(1))).sort(), [...selected].map((src) => src.slice(1)).sort());
  const routes = liveBilling ? [
    { src: '^/api/account-catalog(?:/.*)?$', status: 404 },
    { src: '^/api/account/billing/catalog$', dest: '/api/account-catalog?account_route=billing/catalog' },
    { src: '^/api/account/billing/guest-checkout$', dest: '/api/account-catalog?account_route=billing/guest-checkout' },
    { src: '^/api/account/billing/guest-resend$', dest: '/api/account-catalog?account_route=billing/guest-resend' },
    { src: '^/api/account/billing/guest-status$', dest: '/api/account-catalog?account_route=billing/guest-status' },
    ...vercel.routes,
  ] : vercel.routes;
  const config = { version: 3, routes };
  await writeFile(inside(release, 'config.json'), `${JSON.stringify(config, null, 2)}\n`);
  assert.deepEqual(await json(inside(release, 'config.json')), config, 'Build Output API routes changed.');
  const functions = Object.keys(pricingFunctions);
  for (const [name, files] of Object.entries(pricingFunctions)) {
    const functionRoot = inside(release, `functions/${name}.func`);
    for (const file of files) {
      const source = pricingSources.get(file);
      const target = inside(functionRoot, file);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(source, target);
      assert.equal(await hash(target), await hash(source), `Copied function file hash differs: ${file}`);
    }
    await writeFile(inside(functionRoot, '.vc-config.json'), JSON.stringify({
      runtime: 'nodejs24.x', handler: `${name}.mjs`, launcherType: 'Nodejs', maxDuration: 10,
    }) + '\n');
    assert.deepEqual(await filesIn(functionRoot), ['.vc-config.json', ...files].sort());
  }
  if (liveBilling) {
    await writeLiveAccountFunction(release, 'account-catalog');
    functions.push('api/account-catalog');
  }
  assert.deepEqual((await readdir(release)).sort(), ['config.json', 'functions', 'static']);
  return { version: 3, files: published.length, bytes, functions, nativeImages: nativeImages.size, localizedImages: localizedImages.size, excludedFiles: distFiles.length - published.length, routes: routes.length, configSHA256: await hash(inside(release, 'config.json')) };
}

async function selfTest() {
  const root = await mkdtemp(path.join(tmpdir(), 'vercel-output-self-test-'));
  const put = async (file, content) => { const target = inside(root, file); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, content); };
  const native = '/app-preview/native/current/zh-tw/chat-chat-scenario.webp';
  const gallery = '/app-preview/native/current/zh-tw/chat-chat-entry.webp';
  const responsive = '/app-preview/native/current/zh-tw/chat-chat-scenario-768.webp';
  const edit = '/app-preview/localized-ui/current/en/chat-chat-scenario.webp';
  try {
    const routes = [{ handle: 'filesystem' }, { src: '/.*', dest: '/404.html', status: 404 }];
    for (const file of Object.values(pricingFunctions).flat()) await put(file, file);
    const affiliate = { commissionPercent: 25, commissionMonths: 12, attributionDays: 180, joinUrl: 'https://affiliates.creem.io/join/example' };
    await put('src/data/main-pricing.json', JSON.stringify({ plans: {}, affiliate }));
    await put('vercel.json', JSON.stringify({ routes }));
    await put('src/data/native-product-screens.json', JSON.stringify({ 'zh-tw': { chat: { src: native, srcSet: `${responsive} 768w, ${native} 1290w`, gallery: [{ src: gallery }] } } }));
    await put('src/data/localized-ui-screens.json', JSON.stringify({ en: [{ src: edit, sourceNative: native }] }));
    for (const file of ['index.html', '404.html', '_localized/en/index.html', 'assets/app.js', 'structured-data.json', 'app-preview/social-v2/en.jpg']) await put(`dist/${file}`, file);
    for (const src of [native, gallery, responsive, edit]) { await put(`dist${src}`, src); await put(`public${src}`, src); }
    const excluded = ['app-preview/native/manifest.json', 'app-preview/native/old/zh-tw/chat.webp', 'app-preview/native/old/zh-tw/screen-translation.webp', 'app-preview/localized-ui/old/en/chat.webp', 'app-preview/product/en/text.webp', 'app-preview/screens/en/translate.png', 'app-preview/social/en.jpg', 'app-preview/social/manifest.json', 'prerender-manifest.json', 'raw/capture.png', 'proof/receipt.json', 'private/source.txt', '.env', '.vercel/project.json', 'assets/app.js.map'];
    for (const file of excluded) await put(`dist/${file}`, 'must not publish');
    const result = await prepare(root);
    assert.equal(result.files, 10); assert.equal(result.excludedFiles, excluded.length);
    assert.deepEqual(result.functions, ['api/asc-prices', 'api/plan-quotas']);
    assert.deepEqual((await json(inside(root, 'output/vercel-release/.vercel/output/config.json'))).routes, routes);
    const candidate = await prepare(root, true);
    assert.deepEqual(candidate.functions, ['api/asc-prices', 'api/plan-quotas', 'api/account-catalog']);
    const candidateConfig = await json(inside(root, 'output/vercel-release/.vercel/output/config.json'));
    assert.deepEqual(candidateConfig.routes, [
      { src: '^/api/account-catalog(?:/.*)?$', status: 404 },
      { src: '^/api/account/billing/catalog$', dest: '/api/account-catalog?account_route=billing/catalog' },
      { src: '^/api/account/billing/guest-checkout$', dest: '/api/account-catalog?account_route=billing/guest-checkout' },
      { src: '^/api/account/billing/guest-resend$', dest: '/api/account-catalog?account_route=billing/guest-resend' },
      { src: '^/api/account/billing/guest-status$', dest: '/api/account-catalog?account_route=billing/guest-status' },
      ...routes,
    ]);
    const functionsRoot = inside(root, 'output/vercel-release/.vercel/output/functions/api');
    assert.deepEqual((await readdir(functionsRoot)).sort(), ['account-catalog.func', 'asc-prices.func', 'plan-quotas.func']);
    const catalogFunction = inside(functionsRoot, 'account-catalog.func');
    assert.equal(await readFile(inside(catalogFunction, 'handler.mjs'), 'utf8'), 'export { liveCatalogProxy as default } from "./proxy.mjs";\n');
    assert.equal(await hash(inside(catalogFunction, 'proxy.mjs')), await hash(inside(websiteRoot, 'scripts/vercel-account-preview-proxy.mjs')));
    const quotaFunction = inside(functionsRoot, 'plan-quotas.func');
    assert.deepEqual(await filesIn(quotaFunction), ['.vc-config.json', 'api/plan-quotas.mjs', 'src/data/main-pricing.json']);
    assert.equal((await json(inside(quotaFunction, '.vc-config.json'))).handler, 'api/plan-quotas.mjs');
    assert.deepEqual((await json(inside(quotaFunction, 'src/data/main-pricing.json'))).affiliate, affiliate);
    for (const file of excluded) assert.equal(await readFile(inside(root, `dist/${file}`), 'utf8'), 'must not publish', 'Never remove dist/private source files.');
    for (const file of ['index.html', 'assets/app.js', 'assets/styles.css']) {
      for (const prefix of retiredPrefixes) {
        await put(`dist/${file}`, `"/${prefix}old.webp"`);
        await assert.rejects(prepare(root), /Retired image directory is still referenced/);
        assert.equal(await readFile(inside(root, 'output/vercel-release/.vercel/output/static/index.html'), 'utf8'), 'index.html', 'Reject references before replacing the previous artifact.');
      }
      if (file.endsWith('.css')) await rm(inside(root, `dist/${file}`));
      else await put(`dist/${file}`, file);
    }
    await put('dist/assets/app.js', '"\\/app-preview\\/product\\/old.webp"');
    await assert.rejects(prepare(root), /Retired image directory is still referenced/);
    await put('dist/assets/app.js', 'assets/app.js');
    await put(`dist${edit}`, 'stale build');
    await assert.rejects(prepare(root), /differs from current public asset/);
    await put(`dist${edit}`, edit);
    await put('src/data/localized-ui-screens.json', JSON.stringify({ en: [{ src: '/app-preview/localized-ui/../escape.webp', sourceNative: native }] }));
    await assert.rejects(prepare(root), /Invalid selected image path/);
    await put('src/data/localized-ui-screens.json', JSON.stringify({ en: [{ src: edit, sourceNative: '/app-preview/native/old/zh-tw/chat.webp' }] }));
    await assert.rejects(prepare(root), /unselected native source/);
    await put('src/data/localized-ui-screens.json', '{}');
    await symlink(inside(root, 'public'), inside(root, 'dist/escape'));
    await assert.rejects(prepare(root), /Symlinks are not permitted/);
    console.log('Vercel output self-test passed: pricing function bundles, exact selected src/srcSet/gallery, unchanged routes/static/404/social-v2, source/copy hashes, retired-directory/reference rejection, stale-build/path/symlink rejection, private/history exclusion and source preservation.');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--self-test'), 'Usage: node scripts/prepare-vercel-output.mjs [--self-test]');
try {
  if (process.argv[2] === '--self-test') await selfTest();
  else console.log(JSON.stringify(await prepare(websiteRoot, process.env.VITE_SHARED_ACCOUNT_LIVE === '1'), null, 2));
} catch (error) {
  console.error(`Vercel output preparation failed: ${error.message}`);
  process.exitCode = 1;
}
