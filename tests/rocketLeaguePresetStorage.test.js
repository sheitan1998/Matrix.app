import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_ROCKET_SELECTION,
  ROCKET_PRESET_STORAGE_KEY,
  loadRocketGarage,
  normalizeRocketSelection,
  safeRocketFilename,
  serializeRocketPreset,
  saveRocketGarage,
} from '../src/components/tuto-gaming/rocketLeaguePresetStorage.js';

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

test('exports valid JSON with a filesystem-safe deterministic filename', () => {
  const preset = {
    id: '12345678',
    name: 'Preset été / "bleu"',
    selection: { ...EMPTY_ROCKET_SELECTION, body: 'body-octane' },
    savedAt: '2026-10-15T12:00:00.000Z',
  };
  assert.deepEqual(JSON.parse(serializeRocketPreset(preset)), { version: 1, ...preset });
  assert.equal(safeRocketFilename(preset.name, 'JSON'), 'Preset-ete-bleu.json');
});

test('normalizes unsupported values and preserves valid selections', () => {
  assert.deepEqual(normalizeRocketSelection({
    body: 'body-octane',
    decal: 42,
    wheels: 'wheels-zomba',
    paint: 'crimson',
    finish: 'finish-anodized-pearl',
    goalExplosion: null,
  }), {
    body: 'body-octane',
    decal: null,
    wheels: 'wheels-zomba',
    paint: 'paint-crimson',
    finish: 'finish-anodized-pearl',
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
      finish: 'finish-anodized-pearl',
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
        finish: 'finish-anodized-pearl',
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
