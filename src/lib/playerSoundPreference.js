const KEY = "matrix_player_sound_enabled";

export function isPlayerSoundEnabled() {
  try {
    return localStorage.getItem(KEY) !== "false";
  } catch {
    return true;
  }
}

export function setPlayerSoundEnabled(enabled) {
  try {
    localStorage.setItem(KEY, enabled ? "true" : "false");
  } catch {
    /* storage unavailable */
  }
}