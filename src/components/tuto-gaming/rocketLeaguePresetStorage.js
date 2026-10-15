export const ROCKET_PRESET_STORAGE_KEY = 'matrix:rocket-league:garage:v2';
export const ROCKET_PRESET_ID_PATTERN = /^[a-zA-Z0-9_-]{8,80}$/;
export const MAX_SHARED_PRESET_LENGTH = 2048;

export const EMPTY_ROCKET_SELECTION = Object.freeze({
  body: null,
  decal: null,
  wheels: null,
  paint: 'paint-original',
  goalExplosion: null,
});

const LEGACY_STORAGE_KEY = 'matrix:rocket-league:garage:v1';
const CONFIG_KEYS = Object.freeze([
  'id',
  'carrosserie',
  'couleur',
  'roues',
  'sticker',
  'explosion',
]);
const LEGACY_PAINT_IDS = new Set([
  'original',
  'titanium-white',
  'crimson',
  'cobalt',
  'forest-green',
  'saffron',
]);

function stringOrNull(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 200 ? value : null;
}

export function normalizeRocketSelection(value) {
  const source = value && typeof value === 'object' ? value : {};
  const paint = stringOrNull(source.paint);
  return {
    body: stringOrNull(source.body),
    decal: stringOrNull(source.decal),
    wheels: stringOrNull(source.wheels),
    paint: paint && LEGACY_PAINT_IDS.has(paint)
      ? `paint-${paint}`
      : paint || EMPTY_ROCKET_SELECTION.paint,
    goalExplosion: stringOrNull(source.goalExplosion),
  };
}

export function isValidRocketPresetId(value) {
  return typeof value === 'string' && ROCKET_PRESET_ID_PATTERN.test(value);
}

export function createRocketPresetConfig(selection, id) {
  if (!isValidRocketPresetId(id)) throw new TypeError('Identifiant de preset Rocket League invalide.');
  const normalized = normalizeRocketSelection(selection);
  return {
    id,
    carrosserie: normalized.body,
    couleur: normalized.paint,
    roues: normalized.wheels,
    sticker: normalized.decal,
    explosion: normalized.goalExplosion,
  };
}

export function parseRocketPresetConfig(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (Object.keys(value).length !== CONFIG_KEYS.length || !CONFIG_KEYS.every(key => key in value)) return null;
  if (!isValidRocketPresetId(value.id)) return null;
  for (const key of CONFIG_KEYS.slice(1)) {
    if (value[key] !== null && !stringOrNull(value[key])) return null;
  }
  if (!value.couleur) return null;
  return {
    config: createRocketPresetConfig({
      body: value.carrosserie,
      paint: value.couleur,
      wheels: value.roues,
      decal: value.sticker,
      goalExplosion: value.explosion,
    }, value.id),
    selection: normalizeRocketSelection({
      body: value.carrosserie,
      paint: value.couleur,
      wheels: value.roues,
      decal: value.sticker,
      goalExplosion: value.explosion,
    }),
  };
}

function toBase64Url(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + padding);
  return new TextDecoder().decode(Uint8Array.from(binary, character => character.charCodeAt(0)));
}

export function encodeRocketPresetConfig(config) {
  const parsed = parseRocketPresetConfig(config);
  if (!parsed) throw new TypeError('Configuration Rocket League invalide.');
  const encoded = toBase64Url(JSON.stringify(parsed.config));
  if (encoded.length > MAX_SHARED_PRESET_LENGTH) throw new TypeError('Configuration Rocket League trop longue.');
  return encoded;
}

export function decodeRocketPresetConfig(value) {
  if (
    typeof value !== 'string'
    || value.length < 1
    || value.length > MAX_SHARED_PRESET_LENGTH
    || !/^[a-zA-Z0-9_-]+$/.test(value)
  ) {
    return null;
  }
  try {
    return parseRocketPresetConfig(JSON.parse(fromBase64Url(value)));
  } catch {
    return null;
  }
}

export function normalizePreset(value) {
  if (!value || typeof value !== 'object') return null;
  const id = stringOrNull(value.id);
  const name = typeof value.name === 'string' ? value.name.trim().slice(0, 80) : '';
  if (!id || !isValidRocketPresetId(id) || !name) return null;
  return {
    id,
    name,
    selection: normalizeRocketSelection(value.selection),
    savedAt: typeof value.savedAt === 'string' ? value.savedAt : '',
  };
}

export function safeRocketFilename(value, extension = 'json') {
  const base = String(value || 'preset-rocket-league')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'preset-rocket-league';
  const safeExtension = String(extension).replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'json';
  return `${base}.${safeExtension}`;
}

export function serializeRocketPreset(config) {
  const parsed = parseRocketPresetConfig(config);
  if (!parsed) throw new TypeError('Configuration Rocket League invalide.');
  return JSON.stringify(parsed.config, null, 2);
}

export function loadRocketGarage(storage) {
  const empty = { draft: { ...EMPTY_ROCKET_SELECTION }, presets: [] };
  try {
    const raw = storage.getItem(ROCKET_PRESET_STORAGE_KEY) || storage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    if (!parsed || ![1, 2].includes(parsed.version)) return empty;
    return {
      draft: normalizeRocketSelection(parsed.draft),
      presets: Array.isArray(parsed.presets)
        ? parsed.presets.map(normalizePreset).filter(Boolean).slice(0, 50)
        : [],
    };
  } catch {
    return empty;
  }
}

export function saveRocketGarage(storage, state) {
  try {
    const payload = {
      version: 2,
      draft: normalizeRocketSelection(state.draft),
      presets: Array.isArray(state.presets)
        ? state.presets.map(normalizePreset).filter(Boolean).slice(0, 50)
        : [],
    };
    storage.setItem(ROCKET_PRESET_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}
