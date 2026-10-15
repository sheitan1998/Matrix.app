import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCatalogPage } from '../base44/shared/farmingCatalog.ts';
import { parseModDetails } from '../base44/shared/farmingModDetails.ts';
import { allowedGiantsUrl } from '../base44/shared/giantsMedia.ts';

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
