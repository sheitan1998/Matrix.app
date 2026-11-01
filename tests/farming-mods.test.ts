import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCatalogPage } from '../base44/shared/farmingCatalog.ts';
import { parseModDetails } from '../base44/shared/farmingModDetails.ts';
import { allowedGiantsUrl, resolveGiantsDownload } from '../base44/shared/giantsMedia.ts';
import { farmingPublicMod } from '../base44/shared/farmingDelivery.ts';
import { farmingDownloadError } from '../base44/shared/farmingDownloadError.ts';
import {
  cacheFarmingCatalog,
  farmingModShareUrl,
  farmingSearchWithMod,
  farmingSearchWithoutMod,
  isValidFarmingModId,
  readCachedFarmingCatalog,
} from '../src/components/tuto-gaming/farmingModCatalog.js';

test('catalog parser assigns the requested category and sanitizes text', () => {
  const html = `
    <div class="mod-item">
      <a href="mod.php?mod_id=123456&title=fs2025">
        <img src="https://cdn40.giants-software.com/modHub/storage/00123456/iconBig.jpg">
      </a>
      <h4> Fendt &amp; Friends </h4>
      <span>By: Studio Test</span>
      <div>4.8&nbsp;(42)</div>
    </div>`;
  const [mod] = parseCatalogPage(html, 'tractors');
  assert.equal(mod.id, '123456');
  assert.equal(mod.categoryId, 'tractors');
  assert.equal(mod.title, 'Fendt & Friends');
  assert.equal(mod.rating, 4.8);
});

test('detail parser exposes a unique ordered screenshot gallery', () => {
  const html = `
    <h2 class="title-label">Gallery Mod</h2>
    <img src="https://cdn40.giants-software.com/modHub/storage/00123456/screenshot0.jpg">
    <a href="https://cdn40.giants-software.com/modHub/storage/00123456/screenshot1.png">View</a>
    <img src="https://cdn40.giants-software.com/modHub/storage/00123456/screenshot0.jpg">
    <a href="https://cdn40.giants-software.com/modHub/storage/00123456/FS25_Gallery.zip">DOWNLOAD</a>`;
  const mod = parseModDetails(html, '123456');
  assert.deepEqual(mod.images, [
    'https://cdn40.giants-software.com/modHub/storage/00123456/screenshot0.jpg',
    'https://cdn40.giants-software.com/modHub/storage/00123456/screenshot1.png',
  ]);
  assert.equal(mod.hdImg, mod.images[0]);
});

test('GIANTS media validation rejects SSRF and path escapes', () => {
  assert.equal(
    allowedGiantsUrl('https://cdn40.giants-software.com/modHub/storage/00123456/FS25_Test.zip').hostname,
    'cdn40.giants-software.com',
  );
  const rejected = [
    'http://cdn40.giants-software.com/modHub/storage/00123456/FS25_Test.zip',
    'https://cdn40.giants-software.com.evil.test/modHub/storage/00123456/FS25_Test.zip',
    'https://127.0.0.1/modHub/storage/00123456/FS25_Test.zip',
    'https://cdn40.giants-software.com/modHub/storage/00123456/%2e%2e%2fsecret.zip',
    'https://cdn40.giants-software.com/other/00123456/FS25_Test.zip',
  ];
  for (const value of rejected) {
    assert.throws(() => allowedGiantsUrl(value), /non autorisée/);
  }
});

test('official thumbnails support lazy attributes and stay bound to their mod', () => {
  const html = `<div class='mod-item'><a href='mod.php?mod_id=123456'>Details</a>${' '.repeat(2700)}
    <img src='https://cdn40.giants-software.com/modHub/storage/00999999/iconBig.jpg'>
    <img data-src='//cdn40.giants-software.com/modHub/storage/00123456/iconBig.webp?v=2&amp;q=80'>
    <h4>Correct mod</h4></div>`;
  const [mod] = parseCatalogPage(html, 'tractors');
  assert.equal(mod.img, 'https://cdn40.giants-software.com/modHub/storage/00123456/iconBig.webp?v=2&q=80');
  const detail = parseModDetails(`${html}<img src='https://cdn40.giants-software.com/modHub/storage/00999999/screenshot0.jpg'><img src='https://cdn40.giants-software.com/modHub/storage/00123456/screenshot1.jpg'>`, '123456');
  assert.equal(detail.img, mod.img);
  assert.deepEqual(detail.images, ['https://cdn40.giants-software.com/modHub/storage/00123456/screenshot1.jpg']);
});

test('public images use the cached media endpoint and preserve official provenance', () => {
  const req = new Request('https://internal.example', { headers: { 'X-Base44-App-Url': 'https://matrix.example' } });
  const official = 'https://cdn40.giants-software.com/modHub/storage/00123456/iconBig.jpg';
  const mod = farmingPublicMod(req, { id: '123456', img: official, images: [] });
  assert.equal(mod.officialImg, official);
  const image = new URL(mod.img);
  assert.equal(image.origin, 'https://matrix.example');
  assert.equal(image.pathname, '/functions/proxyImage');
  assert.equal(image.searchParams.get('url'), official);
  assert.equal(mod.downloadEndpoint, 'https://matrix.example/functions/fs25Download');
});

test('known ZIPs resolve without any archive fetch and reject cross-mod files', async () => {
  const url = 'https://cdn27.giants-software.com/modHub/storage/00123456/FS25_Test.zip';
  const file = await resolveGiantsDownload('123456', url);
  assert.equal(file.url, url);
  assert.equal(file.filename, 'FS25_Test.zip');
  await assert.rejects(resolveGiantsDownload('654321', url), /non correspondante/);
  await assert.rejects(resolveGiantsDownload('123456', 'https://evil.example/FS25_Test.zip'), /non autorisée/);
});

test('native download errors notify the calling frame without exposing HTML injection', async () => {
  const error = farmingDownloadError('</script><img src=x>', 502, '1');
  const html = await error.text();
  assert.equal(error.status, 502);
  assert.match(html, /matrix-fs25-download-error/);
  assert.ok(!html.includes('</script><img src=x>'));
  const json = farmingDownloadError('Unavailable', 502);
  assert.deepEqual(await json.json(), { error: 'Unavailable' });
});

test('shared farming links are canonical and reject invalid mod IDs', () => {
  assert.equal(isValidFarmingModId('371730'), true);
  assert.equal(isValidFarmingModId('../371730'), false);
  assert.equal(farmingModShareUrl('371730', 'https://matrix.example/path'), 'https://matrix.example/farming?mod=371730');
  assert.equal(farmingModShareUrl('not-a-mod', 'https://matrix.example'), null);
  assert.equal(farmingSearchWithMod('?source=hub', '371730'), '?source=hub&mod=371730');
  assert.equal(farmingSearchWithoutMod('?source=hub&mod=371730'), '?source=hub');
  assert.equal(farmingSearchWithoutMod('?mod=371730'), '');
});

test('catalog cache restores recent data and ignores corrupt or expired entries', () => {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };
  const catalog = { categories: [{ id: 'tractors', items: [{ id: '371730' }] }] };
  assert.equal(cacheFarmingCatalog(catalog, storage, 1_000), true);
  assert.deepEqual(readCachedFarmingCatalog(storage, 2_000), catalog);
  assert.equal(readCachedFarmingCatalog(storage, 8 * 24 * 60 * 60 * 1000), null);
  values.set('matrix.fs25.modhub.catalog.v3', '{broken');
  assert.equal(readCachedFarmingCatalog(storage, 2_000), null);
});