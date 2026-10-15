import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCatalogPage } from '../base44/shared/farmingCatalog.ts';
import { parseModDetails } from '../base44/shared/farmingModDetails.ts';
import { allowedGiantsUrl } from '../base44/shared/giantsMedia.ts';
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
  values.set('matrix.fs25.modhub.catalog.v1', '{broken');
  assert.equal(readCachedFarmingCatalog(storage, 2_000), null);
});
