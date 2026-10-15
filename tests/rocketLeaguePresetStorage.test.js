import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createRocketPresetConfig,
  decodeRocketPresetConfig,
  EMPTY_ROCKET_SELECTION,
  encodeRocketPresetConfig,
  MAX_SHARED_PRESET_LENGTH,
  parseRocketPresetConfig,
  ROCKET_PRESET_STORAGE_KEY,
  loadRocketGarage,
  normalizeRocketSelection,
  safeRocketFilename,
  saveRocketGarage,
} from '../src/components/tuto-gaming/rocketLeaguePresetStorage.js';
import {
  captureRocketLeaguePreview,
  findRocketLeaguePreviewElement,
  PRESET_PREVIEW_ID,
  PRESET_PREVIEW_SELECTOR,
} from '../src/components/tuto-gaming/rocketLeaguePreviewCapture.js';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

test('returns an empty garage when persisted JSON is malformed', () => {
  const storage = memoryStorage({ [ROCKET_PRESET_STORAGE_KEY]: '{broken' });
  assert.deepEqual(loadRocketGarage(storage), {
    draft: { ...EMPTY_ROCKET_SELECTION },
    presets: [],
  });
});

test('creates a filesystem-safe deterministic image filename', () => {
  assert.equal(safeRocketFilename('Preset été / "bleu"'), 'Preset-ete-bleu.png');
});

test('captures only the supplied preset preview container', async () => {
  const preview = { id: PRESET_PREVIEW_ID };
  const outsidePage = { id: 'page-root' };
  let capturedElement;
  const blob = new Blob(['png'], { type: 'image/png' });
  const result = await captureRocketLeaguePreview(preview, async (element, options) => {
    capturedElement = element;
    assert.notEqual(element, outsidePage);
    assert.equal(options.useCORS, false);
    assert.equal(options.allowTaint, false);
    assert.equal(options.imageTimeout, 5_000);
    return { toBlob: callback => callback(blob) };
  });
  assert.equal(capturedElement, preview);
  assert.equal(result, blob);
  await assert.rejects(
    captureRocketLeaguePreview(outsidePage, async () => assert.fail('capture should not run')),
    /indisponible/,
  );
  let selector;
  assert.equal(findRocketLeaguePreviewElement({
    querySelector(value) {
      selector = value;
      return preview;
    },
  }), preview);
  assert.equal(selector, PRESET_PREVIEW_SELECTOR);
});

test('round-trips an exact, bounded URL-safe shared configuration', () => {
  const config = createRocketPresetConfig({
    body: 'body-octane',
    paint: 'paint-cobalt',
    wheels: 'wheels-zomba',
    decal: 'decal-mainframe',
    goalExplosion: 'goal-dueling-dragons',
  }, 'preset-12345678');
  const encoded = encodeRocketPresetConfig(config);
  assert.match(encoded, /^[a-zA-Z0-9_-]+$/);
  assert.ok(encoded.length <= MAX_SHARED_PRESET_LENGTH);
  assert.deepEqual(decodeRocketPresetConfig(encoded), {
    config,
    selection: {
      body: 'body-octane',
      paint: 'paint-cobalt',
      wheels: 'wheels-zomba',
      decal: 'decal-mainframe',
      goalExplosion: 'goal-dueling-dragons',
    },
  });
  assert.equal(decodeRocketPresetConfig(`${encoded}!`), null);
  assert.equal(decodeRocketPresetConfig('a'.repeat(MAX_SHARED_PRESET_LENGTH + 1)), null);
});

test('rejects shared configs with missing or extra fields', () => {
  assert.equal(parseRocketPresetConfig({
    id: 'preset-12345678',
    carrosserie: null,
    couleur: 'paint-original',
    roues: null,
    sticker: null,
  }), null);
  assert.equal(parseRocketPresetConfig({
    id: 'preset-12345678',
    carrosserie: null,
    couleur: 'paint-original',
    roues: null,
    sticker: null,
    explosion: null,
    name: 'unexpected',
  }), null);
});

test('normalizes unsupported values and preserves valid selections', () => {
  assert.deepEqual(normalizeRocketSelection({
    body: 'body-octane',
    decal: 42,
    wheels: 'wheels-zomba',
    paint: 'crimson',
    goalExplosion: null,
  }), {
    body: 'body-octane',
    decal: null,
    wheels: 'wheels-zomba',
    paint: 'paint-crimson',
    goalExplosion: null,
  });
});

test('round-trips a versioned draft and named preset', () => {
  const storage = memoryStorage();
  const state = {
    draft: {
      ...EMPTY_ROCKET_SELECTION,
      body: 'body-fennec',
      decal: 'decal-mainframe',
      wheels: 'wheels-zomba',
      paint: 'paint-cobalt',
      goalExplosion: 'goal-dueling-dragons',
    },
    presets: [{
      id: 'preset-1',
      name: 'Bleu',
      selection: {
        ...EMPTY_ROCKET_SELECTION,
        body: 'body-fennec',
        decal: 'decal-mainframe',
        wheels: 'wheels-zomba',
        paint: 'paint-cobalt',
        goalExplosion: 'goal-dueling-dragons',
      },
      savedAt: '2026-10-15T12:00:00.000Z',
    }],
  };

  assert.equal(saveRocketGarage(storage, state), true);
  assert.deepEqual(loadRocketGarage(storage), state);
});

test('reports storage write failures without throwing', () => {
  const storage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error('quota');
    },
  };
  assert.equal(saveRocketGarage(storage, { draft: EMPTY_ROCKET_SELECTION, presets: [] }), false);
});

test('remains usable when browser storage is unavailable', () => {
  assert.deepEqual(loadRocketGarage(null), {
    draft: { ...EMPTY_ROCKET_SELECTION },
    presets: [],
  });
  assert.equal(saveRocketGarage(null, { draft: EMPTY_ROCKET_SELECTION, presets: [] }), false);
});
