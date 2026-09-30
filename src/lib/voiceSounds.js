/**
 * Lightweight system sound effects via Web Audio API.
 * No audio files needed — tones are synthesized on the fly.
 * Respects user settings (enabled + volume) from localStorage.
 */

const STORAGE_KEY = "matrix_audio_settings";

function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { soundEffectsEnabled: true, soundEffectsVolume: 0.5 };
    return { soundEffectsEnabled: true, soundEffectsVolume: 0.5, ...JSON.parse(raw) };
  } catch {
    return { soundEffectsEnabled: true, soundEffectsVolume: 0.5 };
  }
}

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a simple tone with the given frequency, duration, and type.
 */
function playTone(freq, duration, type = "sine", volume = 1) {
  const ctx = getCtx();
  if (!ctx) return;
  const s = getSettings();
  if (s.soundEffectsEnabled === false) return;
  const vol = (s.soundEffectsVolume ?? 0.5) * volume;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.05);
}

/**
 * Plays a sequence of tones with delays.
 */
function playSequence(notes, baseVolume = 1) {
  const ctx = getCtx();
  if (!ctx) return;
  const s = getSettings();
  if (s.soundEffectsEnabled === false) return;
  notes.forEach(({ freq, duration, delay = 0, type = "sine", volume = 1 }) => {
    setTimeout(() => playTone(freq, duration, type, volume * baseVolume), delay);
  });
}

// ─── Public API ───

/** Micro activé (unmute) — son clair ascendant */
export function playMicUnmute() {
  playSequence([
    { freq: 660, duration: 0.08, delay: 0, type: "sine", volume: 0.8 },
    { freq: 880, duration: 0.1, delay: 70, type: "sine", volume: 0.8 },
  ]);
}

/** Micro coupé (mute) — son grave descendant */
export function playMicMute() {
  playSequence([
    { freq: 880, duration: 0.08, delay: 0, type: "sine", volume: 0.8 },
    { freq: 440, duration: 0.1, delay: 70, type: "sine", volume: 0.8 },
  ]);
}

/** Casque / sortie audio réactivé */
export function playSpeakerOn() {
  playSequence([
    { freq: 523, duration: 0.08, delay: 0, type: "sine", volume: 0.7 },
    { freq: 784, duration: 0.08, delay: 60, type: "sine", volume: 0.7 },
    { freq: 1046, duration: 0.12, delay: 120, type: "sine", volume: 0.7 },
  ]);
}

/** Casque / sortie audio coupé (sourdine) */
export function playSpeakerOff() {
  playSequence([
    { freq: 1046, duration: 0.08, delay: 0, type: "sine", volume: 0.7 },
    { freq: 523, duration: 0.12, delay: 60, type: "sine", volume: 0.7 },
  ]);
}

/** Tonalité d'appel sortant (bip... bip... en boucle) */
let outgoingRingInterval = null;
export function startOutgoingRing() {
  stopOutgoingRing();
  const ring = () => {
    playSequence([
      { freq: 440, duration: 0.15, delay: 0, type: "sine", volume: 0.6 },
      { freq: 550, duration: 0.15, delay: 160, type: "sine", volume: 0.6 },
    ]);
  };
  ring();
  outgoingRingInterval = setInterval(ring, 2000);
}

export function stopOutgoingRing() {
  if (outgoingRingInterval) {
    clearInterval(outgoingRingInterval);
    outgoingRingInterval = null;
  }
}

/** Sonnerie d'appel entrant (mélodie agréable en boucle) */
let incomingRingInterval = null;
export function startIncomingRing() {
  stopIncomingRing();
  const ring = () => {
    playSequence([
      { freq: 659, duration: 0.2, delay: 0, type: "sine", volume: 0.7 },
      { freq: 784, duration: 0.2, delay: 210, type: "sine", volume: 0.7 },
      { freq: 988, duration: 0.3, delay: 420, type: "sine", volume: 0.7 },
    ]);
  };
  ring();
  incomingRingInterval = setInterval(ring, 1500);
}

export function stopIncomingRing() {
  if (incomingRingInterval) {
    clearInterval(incomingRingInterval);
    incomingRingInterval = null;
  }
}

/** Fin d'appel — court son de déconnexion */
export function playCallEnded() {
  playSequence([
    { freq: 784, duration: 0.1, delay: 0, type: "sine", volume: 0.7 },
    { freq: 523, duration: 0.15, delay: 100, type: "sine", volume: 0.7 },
  ]);
}

/** Court clic de confirmation pour boutons divers */
export function playClick() {
  playTone(800, 0.04, "sine", 0.4);
}