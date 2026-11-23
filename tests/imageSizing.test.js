import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeTargetSize,
  getUsagePreset,
  isCloudflareUrl,
  optimizedFileName,
  shouldKeepOriginal,
  shouldSkipOptimization,
} from '../src/lib/imageSizing.js';

test('keeps ratio and fits the longest edge', () => {
  assert.deepEqual(computeTargetSize(4000, 2000, 1600), { width: 1600, height: 800, resized: true });
  assert.deepEqual(computeTargetSize(1000, 3000, 400), { width: 133, height: 400, resized: true });
});

test('never enlarges and handles invalid sizes', () => {
  assert.deepEqual(computeTargetSize(800, 600, 1600), { width: 800, height: 600, resized: false });
  assert.equal(computeTargetSize(0, 100, 400).width, 0);
  assert.equal(computeTargetSize(10000, 1, 100).height, 1);
});

test('usage presets match the expected sizes', () => {
  assert.equal(getUsagePreset('gallery').maxEdge, 1600);
  assert.equal(getUsagePreset('thumbnail').maxEdge, 400);
  assert.equal(getUsagePreset('icon').maxEdge, 256);
  assert.equal(getUsagePreset('listing').maxEdge, 1600);
  assert.equal(getUsagePreset('unknown').maxEdge, 1600);
});

test('skips gif, svg, video and animated images', () => {
  assert.ok(shouldSkipOptimization({ type: 'image/gif' }));
  assert.ok(shouldSkipOptimization({ name: 'logo.SVG' }));
  assert.ok(shouldSkipOptimization({ name: 'clip.mp4' }));
  assert.ok(shouldSkipOptimization({ type: 'image/webp', animated: true }));
  assert.ok(!shouldSkipOptimization({ type: 'image/png', name: 'a.png' }));
});

test('keeps the original only when re-encoding does not help', () => {
  assert.ok(shouldKeepOriginal({ originalSize: 100, optimizedSize: 120, resized: false }));
  assert.ok(!shouldKeepOriginal({ originalSize: 100, optimizedSize: 120, resized: true }));
  assert.ok(!shouldKeepOriginal({ originalSize: 100, optimizedSize: 50, resized: false }));
});

test('builds safe file names and detects R2 urls', () => {
  assert.equal(optimizedFileName('Ma photo (1).PNG'), 'Ma-photo-1-.webp');
  assert.ok(isCloudflareUrl('https://cdn.x.com/a/b.webp', 'https://cdn.x.com/'));
  assert.ok(!isCloudflareUrl('https://other.com/a.webp', 'https://cdn.x.com'));
});
