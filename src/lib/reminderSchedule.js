// Planification du rappel sonore : fréquence normalisée + prochain déclenchement absolu persistant.

export const FREQUENCY_VALUES = [60, 120, 180, 360, 720, 1440];
export const DEFAULT_FREQUENCY_MIN = 120;
export const DURATION_VALUES = [3, 5, 10, 15, 30];
export const DEFAULT_DURATION_SEC = 5;

// Retard maximum toléré (onglet en veille, timer throttlé) avant de considérer le rappel manqué.
export const LATE_GRACE_MS = 5 * 60 * 1000;
// Plafond de setTimeout (~24,8 jours) ; 24 h reste largement en dessous.
export const MAX_TIMEOUT_MS = 2 ** 31 - 1;

export function normalizeFrequency(value) {
  const n = Number(value);
  return FREQUENCY_VALUES.includes(n) ? n : DEFAULT_FREQUENCY_MIN;
}

export function normalizeDuration(value) {
  const n = Number(value);
  return DURATION_VALUES.includes(n) ? n : DEFAULT_DURATION_SEC;
}

export const reminderStorageKey = (email) => `matrix_vote_reminder_v2_${String(email).toLowerCase()}`;

export function readSchedule(email) {
  try {
    const raw = JSON.parse(localStorage.getItem(reminderStorageKey(email)) || "null");
    if (raw && Number.isFinite(raw.nextAt) && Number.isFinite(raw.frequency)) return raw;
  } catch { /* état corrompu : ignoré */ }
  return null;
}

export function writeSchedule(email, schedule) {
  try { localStorage.setItem(reminderStorageKey(email), JSON.stringify(schedule)); } catch { /* stockage indisponible */ }
}

export function clearSchedule(email) {
  try { localStorage.removeItem(reminderStorageKey(email)); } catch { /* stockage indisponible */ }
}

/** Planning valide pour cette fréquence : conserve l'existant, sinon repart de maintenant. */
export function resolveSchedule(email, frequency, now = Date.now()) {
  const stored = readSchedule(email);
  if (stored && stored.frequency === frequency && stored.nextAt > now - LATE_GRACE_MS) return stored;
  const fresh = { nextAt: now + frequency * 60 * 1000, frequency };
  writeSchedule(email, fresh);
  return fresh;
}
