import React, { useState, useEffect, useRef } from "react";
import { Bell, X, Music, Clock, Repeat, Play, Pause, Save, Volume2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

// Design sonore futuriste / cyberpunk feutré :
// chaque preset est une séquence de notes (freq Hz, type d'onde, durée, delay)
// avec volumes doux (0.08-0.18) et fondu d'entrée progressif (fade-in 80ms)
const SOUND_PRESETS = [
  {
    id: "nebula",
    name: "Nebula",
    emoji: "🌌",
    notes: [
      { freq: 523.25, type: "sine", delay: 0, dur: 0.6, vol: 0.12 },
      { freq: 659.25, type: "sine", delay: 120, dur: 0.6, vol: 0.12 },
      { freq: 783.99, type: "sine", delay: 240, dur: 0.8, vol: 0.14 },
    ],
  },
  {
    id: "aurora",
    name: "Aurora",
    emoji: "💫",
    notes: [
      { freq: 440.0, type: "triangle", delay: 0, dur: 0.5, vol: 0.10 },
      { freq: 554.37, type: "triangle", delay: 180, dur: 0.5, vol: 0.10 },
      { freq: 659.25, type: "triangle", delay: 360, dur: 0.7, vol: 0.12 },
      { freq: 880.0, type: "sine", delay: 540, dur: 0.9, vol: 0.08 },
    ],
  },
  {
    id: "cyber",
    name: "Cyber",
    emoji: "🤖",
    notes: [
      { freq: 329.63, type: "sine", delay: 0, dur: 0.4, vol: 0.11 },
      { freq: 493.88, type: "sine", delay: 100, dur: 0.4, vol: 0.11 },
      { freq: 659.25, type: "sine", delay: 200, dur: 0.5, vol: 0.13 },
      { freq: 987.77, type: "sine", delay: 350, dur: 0.7, vol: 0.09 },
    ],
  },
  {
    id: "ethereal",
    name: "Éthéré",
    emoji: "✨",
    notes: [
      { freq: 587.33, type: "sine", delay: 0, dur: 0.8, vol: 0.08 },
      { freq: 880.0, type: "sine", delay: 200, dur: 0.8, vol: 0.08 },
      { freq: 1174.66, type: "sine", delay: 400, dur: 1.0, vol: 0.06 },
    ],
  },
  {
    id: "matrix",
    name: "Matrix",
    emoji: "🟢",
    notes: [
      { freq: 392.0, type: "triangle", delay: 0, dur: 0.3, vol: 0.10 },
      { freq: 523.25, type: "triangle", delay: 80, dur: 0.3, vol: 0.10 },
      { freq: 659.25, type: "triangle", delay: 160, dur: 0.3, vol: 0.10 },
      { freq: 783.99, type: "triangle", delay: 240, dur: 0.5, vol: 0.12 },
      { freq: 1046.5, type: "sine", delay: 400, dur: 0.8, vol: 0.08 },
    ],
  },
  {
    id: "lullaby",
    name: "Berceuse",
    emoji: "🌙",
    notes: [
      { freq: 440.0, type: "sine", delay: 0, dur: 0.5, vol: 0.10 },
      { freq: 493.88, type: "sine", delay: 200, dur: 0.5, vol: 0.10 },
      { freq: 523.25, type: "sine", delay: 400, dur: 0.7, vol: 0.11 },
    ],
  },
];

const DURATION_OPTIONS = [
  { value: 3, label: "3 secondes" },
  { value: 5, label: "5 secondes" },
  { value: 10, label: "10 secondes" },
  { value: 15, label: "15 secondes" },
  { value: 30, label: "30 secondes" },
];

const FREQUENCY_OPTIONS = [
  { value: 60, label: "1 heure" },
  { value: 120, label: "2 heures" },
  { value: 180, label: "3 heures" },
  { value: 360, label: "6 heures" },
  { value: 720, label: "12 heures" },
  { value: 1440, label: "24 heures" },
];

export default function ServerReminderModal({ user, onClose }) {
  const [sound, setSound] = useState(user?.server_reminder_sound || "chime");
  const [duration, setDuration] = useState(user?.server_reminder_duration || 5);
  const [frequency, setFrequency] = useState(user?.server_reminder_frequency || 120);
  const [enabled, setEnabled] = useState(user?.server_reminder_enabled !== false);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const audioCtxRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  const playPreview = () => {
    if (previewing) return;
    setPreviewing(true);
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const preset = SOUND_PRESETS.find((s) => s.id === sound) || SOUND_PRESETS[0];
      // Master gain doux avec léger fondu d'entrée global
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.06);
      master.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.15);
      master.connect(ctx.destination);

      let maxEnd = 0;
      preset.notes.forEach((note) => {
        const start = ctx.currentTime + note.delay / 1000;
        const end = start + note.dur;
        if (end > maxEnd) maxEnd = end;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = note.freq;
        osc.type = note.type || "sine";
        // Fondu d'entrée doux (80ms) + fondu de sortie naturel (120ms)
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(note.vol, start + 0.08);
        gain.gain.setValueAtTime(note.vol, end - 0.12);
        gain.gain.linearRampToValueAtTime(0, end);
        osc.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(end + 0.05);
      });
      timeoutRef.current = setTimeout(() => setPreviewing(false), (maxEnd - ctx.currentTime) * 1000 + 200);
    } catch {
      setPreviewing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        server_reminder_sound: sound,
        server_reminder_duration: duration,
        server_reminder_frequency: frequency,
        server_reminder_enabled: enabled,
      });
      toast.success("Rappel sonore configuré !");
      onClose();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #12091c, #1a0e2e)", border: "1px solid rgba(138,79,255,0.3)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid rgba(138,79,255,0.15)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(138,79,255,0.15)" }}>
              <Bell className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Rappel sonore</h2>
              <p className="text-[10px] text-white/40">Personnalise tes rappels de vote</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Enable toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
            <div>
              <p className="text-xs font-bold text-white">Activer le rappel</p>
              <p className="text-[10px] text-white/40">Déclenche un son selon ta fréquence</p>
            </div>
            <button
              onClick={() => setEnabled((v) => !v)}
              className="relative w-11 h-6 rounded-full transition tap-sm"
              style={{ background: enabled ? "#8a4fff" : "rgba(255,255,255,0.1)" }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: enabled ? "22px" : "2px" }}
              />
            </button>
          </div>

          {/* Sound selection */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-1">
              <Music className="w-3 h-3" /> Son de la sonnerie
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SOUND_PRESETS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSound(s.id)}
                  className="relative p-2.5 rounded-xl transition tap-sm"
                  style={
                    sound === s.id
                      ? { background: "rgba(138,79,255,0.2)", border: "1px solid rgba(138,79,255,0.5)" }
                      : { background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.1)" }
                  }
                >
                  <span className="text-lg block">{s.emoji}</span>
                  <span className="text-[9px] font-bold text-white/70">{s.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={playPreview}
              disabled={previewing}
              className="mt-2 h-8 px-3 rounded-lg flex items-center gap-1.5 text-[10px] font-bold transition tap-sm disabled:opacity-40"
              style={{ background: "rgba(138,79,255,0.12)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}
            >
              {previewing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {previewing ? "Lecture..." : "Aperçu"}
            </button>
          </div>

          {/* Duration */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Durée de l'alerte
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className="h-8 rounded-lg text-[10px] font-bold transition tap-sm"
                  style={
                    duration === d.value
                      ? { background: "rgba(138,79,255,0.2)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.5)" }
                      : { background: "rgba(18,9,28,0.6)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(138,79,255,0.1)" }
                  }
                >
                  {d.value}s
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-1">
              <Repeat className="w-3 h-3" /> Fréquence du rappel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCY_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFrequency(f.value)}
                  className="h-9 rounded-lg text-[10px] font-bold transition tap-sm"
                  style={
                    frequency === f.value
                      ? { background: "rgba(138,79,255,0.2)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.5)" }
                      : { background: "rgba(18,9,28,0.6)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(138,79,255,0.1)" }
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-white/30 mt-1.5 flex items-center gap-1">
              <Volume2 className="w-2.5 h-2.5" />
              Le rappel se déclenchera toutes les {FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label} pour penser à voter.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center gap-2" style={{ borderTop: "1px solid rgba(138,79,255,0.15)" }}>
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-xl text-xs font-bold transition tap-sm"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-9 rounded-xl text-xs font-black text-white transition flex items-center justify-center gap-1.5 tap-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)", boxShadow: "0 0 12px rgba(138,79,255,0.25)" }}
          >
            {saving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}