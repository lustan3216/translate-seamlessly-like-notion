import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { linkSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const prefix = '/app-preview/localized-ui/20261118/';
const publicRoot = path.join(root, 'public');
const imageRoot = path.join(publicRoot, prefix);
const adoptedPath = path.join(root, 'output/imagegen-localization-220/adopted.json');
const options = { quality: 85, effort: 6, smartSubsample: true, lossless: false };
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const dimensions = ({ width, height }) => [width, height];

assert.equal(process.argv.length, 2, 'Usage: node scripts/reencode-localized-ui.mjs');
const stage = path.join(imageRoot, '.reencode-localized-ui');
mkdirSync(stage);
let keepStage = false;
try {
  const originalAdopted = readFileSync(adoptedPath);
  const adopted = JSON.parse(originalAdopted);
  const proofs = adopted.images.filter(({ src }) => src.startsWith(prefix));
  const files = readdirSync(imageRoot, { recursive: true, withFileTypes: true })
    .filter(({ name }) => name.endsWith('.webp'))
    .map((entry) => {
      assert.ok(entry.isFile(), `Expected a regular WebP file: ${entry.name}`);
      return '/' + path.relative(publicRoot, path.join(entry.parentPath, entry.name));
    }).sort();
  assert.ok(files.length > 0, 'No localized WebP files found.');
  assert.deepEqual(proofs.map(({ src }) => src).sort(), files, 'Every WebP must have one adopted proof.');
  const jobs = [];
  let beforeBytes = 0;
  let afterBytes = 0;
  const date = new Date().toISOString().slice(0, 10);
  for (const proof of proofs) {
    const target = path.join(publicRoot, proof.src);
    const original = readFileSync(target);
    const originalHash = sha(original);
    assert.equal(originalHash, proof.output.sha256, proof.src);
    assert.equal(original.length, proof.output.bytes, proof.src);
    beforeBytes += original.length;

    if (proof.reencode) {
      // Re-running must never apply a second lossy encode.
      afterBytes += original.length;
      continue;
    }

    const source = sharp(original);
    const size = await source.metadata();
    assert.equal(size.format, 'webp', proof.src);
    assert.deepEqual(dimensions(size), dimensions(proof.output), proof.src);
    const encoded = await source.webp(options).toBuffer();
    const result = await sharp(encoded).metadata();
    assert.equal(result.format, 'webp', proof.src);
    assert.deepEqual(dimensions(result), dimensions(size), proof.src);
    assert.ok(encoded.length < original.length, `Re-encoding did not shrink ${proof.src}`);

    const next = path.join(stage, `${jobs.length}.webp`);
    const backup = path.join(stage, `${jobs.length}.original`);
    writeFileSync(next, encoded);
    jobs.push({ target, originalHash, next, backup });
    proof.output.sha256 = sha(encoded);
    proof.output.bytes = encoded.length;
    proof.reencode = { ...options, date };
    afterBytes += encoded.length;
  }
  assert.ok(afterBytes < 60_000_000, `Re-encoded directory exceeds the 60 MB target: ${afterBytes} bytes`);

  if (jobs.length) {
    const nextAdopted = path.join(stage, 'adopted.json');
    writeFileSync(nextAdopted, JSON.stringify(adopted, null, 2) + '\n');
    assert.ok(originalAdopted.equals(readFileSync(adoptedPath)), 'Adopted proof changed during encoding.');
    for (const { target, originalHash, backup } of jobs) {
      assert.equal(sha(readFileSync(target)), originalHash, `WebP changed during encoding: ${target}`);
      linkSync(target, backup);
    }

    let published = 0;
    try {
      for (const { target, next } of jobs) {
        renameSync(next, target);
        published++;
      }
      renameSync(nextAdopted, adoptedPath);
    } catch (error) {
      keepStage = true;
      for (const { target, backup } of jobs.slice(0, published).reverse()) renameSync(backup, target);
      keepStage = false;
      throw error;
    }
  }

  console.log(JSON.stringify({ images: files.length, reencoded: jobs.length, beforeBytes, afterBytes }));
} finally {
  if (!keepStage) rmSync(stage, { recursive: true });
}
