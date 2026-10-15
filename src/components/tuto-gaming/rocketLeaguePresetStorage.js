export const ROCKET_PRESET_STORAGE_KEY = 'matrix:rocket-league:garage:v1';

export const EMPTY_ROCKET_SELECTION = Object.freeze({
  body: null,
  decal: null,
  wheels: null,
  paint: 'original',
  goalExplosion: null,
});

const SELECTION_KEYS = ['body', 'decal', 'wheels', 'goalExplosion'];

function stringOrNull(value) {
  return typeof value === 'string' && value.length <= 200 ? value : null;
}

export function normalizeRocketSelection(value) {
  const source = value && typeof value === 'object' ? value : {};
  const selection = { ...EMPTY_ROCKET_SELECTION };
  for (const key of SELECTION_KEYS) selection[key] = stringOrNull(source[key]);
  selection.paint = typeof source.paint === 'string' && source.paint.length <= 40
    ? source.paint
    : EMPTY_ROCKET_SELECTION.paint;
  return selection;
}

function normalizePreset(value) {
  if (!value || typeof value !== 'object') return null;
  const id = stringOrNull(value.id);
  const name = typeof value.name === 'string' ? value.name.trim().slice(0, 80) : '';
  if (!id || !name) return null;
  return {
    id,
    name,
    selection: normalizeRocketSelection(value.selection),
    savedAt: typeof value.savedAt === 'string' ? value.savedAt : '',
  };
}

export function loadRocketGarage(storage) {
  const empty = { draft: { ...EMPTY_ROCKET_SELECTION }, presets: [] };
  try {
    const raw = storage.getItem(ROCKET_PRESET_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return empty;
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
      version: 1,
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
