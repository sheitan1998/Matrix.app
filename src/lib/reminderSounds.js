// Sonneries du rappel de vote (Best Serveur / Best Creator), synthétisées avec Web Audio.
// Chaque note : freq (Hz), type d'onde, delay (ms), dur (s), vol (0-1).

export const SOUND_PRESETS = [
  { id: "nebula", name: "Nebula", emoji: "🌌", notes: [
    { freq: 523.25, type: "sine", delay: 0, dur: 0.6, vol: 0.12 },
    { freq: 659.25, type: "sine", delay: 120, dur: 0.6, vol: 0.12 },
    { freq: 783.99, type: "sine", delay: 240, dur: 0.8, vol: 0.14 },
  ] },
  { id: "aurora", name: "Aurora", emoji: "💫", notes: [
    { freq: 440.0, type: "triangle", delay: 0, dur: 0.5, vol: 0.10 },
    { freq: 554.37, type: "triangle", delay: 180, dur: 0.5, vol: 0.10 },
    { freq: 659.25, type: "triangle", delay: 360, dur: 0.7, vol: 0.12 },
    { freq: 880.0, type: "sine", delay: 540, dur: 0.9, vol: 0.08 },
  ] },
  { id: "cyber", name: "Cyber", emoji: "🤖", notes: [
    { freq: 329.63, type: "sine", delay: 0, dur: 0.4, vol: 0.11 },
    { freq: 493.88, type: "sine", delay: 100, dur: 0.4, vol: 0.11 },
    { freq: 659.25, type: "sine", delay: 200, dur: 0.5, vol: 0.13 },
    { freq: 987.77, type: "sine", delay: 350, dur: 0.7, vol: 0.09 },
  ] },
  { id: "ethereal", name: "Éthéré", emoji: "✨", notes: [
    { freq: 587.33, type: "sine", delay: 0, dur: 0.8, vol: 0.08 },
    { freq: 880.0, type: "sine", delay: 200, dur: 0.8, vol: 0.08 },
    { freq: 1174.66, type: "sine", delay: 400, dur: 1.0, vol: 0.06 },
  ] },
  { id: "matrix", name: "Matrix", emoji: "🟢", notes: [
    { freq: 392.0, type: "triangle", delay: 0, dur: 0.3, vol: 0.10 },
    { freq: 523.25, type: "triangle", delay: 80, dur: 0.3, vol: 0.10 },
    { freq: 659.25, type: "triangle", delay: 160, dur: 0.3, vol: 0.10 },
    { freq: 783.99, type: "triangle", delay: 240, dur: 0.5, vol: 0.12 },
    { freq: 1046.5, type: "sine", delay: 400, dur: 0.8, vol: 0.08 },
  ] },
  { id: "lullaby", name: "Berceuse", emoji: "🌙", notes: [
    { freq: 440.0, type: "sine", delay: 0, dur: 0.5, vol: 0.10 },
    { freq: 493.88, type: "sine", delay: 200, dur: 0.5, vol: 0.10 },
    { freq: 523.25, type: "sine", delay: 400, dur: 0.7, vol: 0.11 },
  ] },
  { id: "pulse", name: "Pulse", emoji: "💜", notes: [
    { freq: 220.0, type: "square", delay: 0, dur: 0.18, vol: 0.05 },
    { freq: 440.0, type: "square", delay: 160, dur: 0.18, vol: 0.05 },
    { freq: 220.0, type: "square", delay: 320, dur: 0.18, vol: 0.05 },
    { freq: 660.0, type: "triangle", delay: 480, dur: 0.6, vol: 0.10 },
  ] },
  { id: "crystal", name: "Cristal", emoji: "💎", notes: [
    { freq: 1318.51, type: "sine", delay: 0, dur: 0.5, vol: 0.07 },
    { freq: 1567.98, type: "sine", delay: 140, dur: 0.5, vol: 0.07 },
    { freq: 2093.0, type: "sine", delay: 280, dur: 0.9, vol: 0.06 },
  ] },
  { id: "arcade", name: "Arcade", emoji: "🕹️", notes: [
    { freq: 392.0, type: "square", delay: 0, dur: 0.12, vol: 0.05 },
    { freq: 523.25, type: "square", delay: 110, dur: 0.12, vol: 0.05 },
    { freq: 659.25, type: "square", delay: 220, dur: 0.12, vol: 0.05 },
    { freq: 1046.5, type: "square", delay: 330, dur: 0.3, vol: 0.06 },
  ] },
  { id: "bell", name: "Cloche", emoji: "🔔", notes: [
    { freq: 880.0, type: "sine", delay: 0, dur: 1.2, vol: 0.12 },
    { freq: 1760.0, type: "sine", delay: 0, dur: 0.8, vol: 0.05 },
    { freq: 880.0, type: "sine", delay: 600, dur: 1.2, vol: 0.10 },
  ] },
  { id: "warp", name: "Warp", emoji: "🚀", notes: [
    { freq: 262.0, type: "sawtooth", delay: 0, dur: 0.25, vol: 0.04 },
    { freq: 392.0, type: "sawtooth", delay: 120, dur: 0.25, vol: 0.04 },
    { freq: 587.33, type: "sawtooth", delay: 240, dur: 0.25, vol: 0.05 },
    { freq: 880.0, type: "sine", delay: 360, dur: 0.8, vol: 0.09 },
  ] },
  { id: "chime", name: "Carillon", emoji: "🎐", notes: [
    { freq: 784.0, type: "sine", delay: 0, dur: 0.7, vol: 0.10 },
    { freq: 987.77, type: "sine", delay: 250, dur: 0.7, vol: 0.10 },
    { freq: 1318.51, type: "sine", delay: 500, dur: 1.0, vol: 0.09 },
  ] },
];

export const DEFAULT_SOUND_ID = "nebula";

export function getPreset(id) {
  return SOUND_PRESETS.find((preset) => preset.id === id) || SOUND_PRESETS[0];
}

let sharedCtx = null;

// Un seul AudioContext partagé ; repris (resume) si le navigateur l'a suspendu.
async function getContext() {
  const Ctor = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
  if (!Ctor) return null;
  if (!sharedCtx || sharedCtx.state === "closed") sharedCtx = new Ctor();
  if (sharedCtx.state === "suspended") {
    try { await sharedCtx.resume(); } catch { return null; }
  }
  return sharedCtx.state === "running" ? sharedCtx : null;
}

/** Joue une fois la sonnerie. Retourne sa durée en ms (0 si le son n'a pas pu être lu). */
export async function playPreset(id) {
  try {
    const ctx = await getContext();
    if (!ctx) return 0;
    const preset = getPreset(id);
    const base = ctx.currentTime + 0.02;
    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
    let maxEnd = 0;
    preset.notes.forEach((note) => {
      const start = base + note.delay / 1000;
      const end = start + note.dur;
      maxEnd = Math.max(maxEnd, end);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = note.type || "sine";
      osc.frequency.value = note.freq;
      const attack = Math.min(0.08, note.dur / 3);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(note.vol, start + attack);
      gain.gain.setValueAtTime(note.vol, Math.max(start + attack, end - 0.15));
      gain.gain.linearRampToValueAtTime(0.0001, end);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(end + 0.05);
    });
    return Math.ceil((maxEnd - ctx.currentTime) * 1000);
  } catch {
    return 0;
  }
}

let loopTimer = null;
let loopStop = null;

export function stopReminderLoop() {
  if (loopTimer) clearTimeout(loopTimer);
  if (loopStop) clearTimeout(loopStop);
  loopTimer = null;
  loopStop = null;
}

/** Répète la sonnerie pendant `durationSec` secondes ; relancer remplace la boucle en cours. */
export function playReminderLoop(id, durationSec) {
  stopReminderLoop();
  const total = Math.max(1, Number(durationSec) || 5) * 1000;
  const tick = async () => {
    const length = await playPreset(id);
    if (!length) return stopReminderLoop();
    loopTimer = setTimeout(tick, length + 400);
  };
  tick();
  loopStop = setTimeout(stopReminderLoop, total);
}
