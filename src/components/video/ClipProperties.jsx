import React from "react";
import { Scissors, Merge, Gauge, Sparkles, Wand2, Sun, Contrast, Droplet, Aperture as Blur, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

const TRANSITIONS = [
  { key: "none", label: "Aucune", icon: "⬜" },
  { key: "fade", label: "Fondu", icon: "🌅" },
  { key: "slide", label: "Glisser", icon: "➡️" },
  { key: "zoom", label: "Zoom", icon: "🔍" },
  { key: "wipe", label: "Balayage", icon: "👋" },
  { key: "flash", label: "Flash", icon: "⚡" },
];

const EFFECTS = [
  { key: "brightness", label: "Luminosité", icon: Sun, min: 0, max: 200, default: 100, unit: "%" },
  { key: "contrast", label: "Contraste", icon: Contrast, min: 0, max: 200, default: 100, unit: "%" },
  { key: "saturation", label: "Saturation", icon: Droplet, min: 0, max: 200, default: 100, unit: "%" },
  { key: "blur", label: "Flou", icon: Blur, min: 0, max: 20, default: 0, unit: "px" },
];

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export default function ClipProperties({ clip, onUpdate, onSplit, onMerge, onMoveLeft, onMoveRight, onDelete, hasNext, hasPrev }) {
  if (!clip) return null;

  const effects = clip.effects || {};
  const filterStr = [
    `brightness(${effects.brightness ?? 100}%)`,
    `contrast(${effects.contrast ?? 100}%)`,
    `saturate(${effects.saturation ?? 100}%)`,
    effects.blur ? `blur(${effects.blur}px)` : "",
  ].filter(Boolean).join(" ");

  const updateEffect = (key, value) => {
    onUpdate({ effects: { ...effects, [key]: value } });
  };

  return (
    <div className="mt-2 p-3 rounded-xl space-y-3" style={{ background: "rgba(18,18,20,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-[10px] font-bold text-white/60 flex items-center gap-1"><Wand2 className="w-3 h-3" /> Clip sélectionné</p>
        <button onClick={onMoveLeft} disabled={!hasPrev} className="w-7 h-7 rounded-lg bg-secondary text-white/60 hover:text-white flex items-center justify-center text-xs disabled:opacity-30">
          <ChevronLeft className="w-3 h-3" />
        </button>
        <button onClick={onMoveRight} disabled={!hasNext} className="w-7 h-7 rounded-lg bg-secondary text-white/60 hover:text-white flex items-center justify-center text-xs disabled:opacity-30">
          <ChevronRight className="w-3 h-3" />
        </button>
        <button onClick={onSplit} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-purple-300 hover:bg-purple-500/10 transition">
          <Scissors className="w-3 h-3" /> Couper
        </button>
        <button onClick={onMerge} disabled={!hasNext} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-blue-300 hover:bg-blue-500/10 transition disabled:opacity-30">
          <Merge className="w-3 h-3" /> Fusionner
        </button>
        <button onClick={onDelete} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-500/10 transition ml-auto">
          <Trash2 className="w-3 h-3" /> Supprimer
        </button>
      </div>

      {/* Speed */}
      <div>
        <p className="text-[10px] font-bold text-white/50 flex items-center gap-1 mb-1.5"><Gauge className="w-3 h-3" /> Vitesse</p>
        <div className="flex gap-1 flex-wrap">
          {SPEEDS.map(s => (
            <button key={s} onClick={() => onUpdate({ speed: s })}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${(clip.speed || 1) === s ? "bg-purple-600 text-white" : "bg-secondary text-white/50"}`}>
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Transitions */}
      <div>
        <p className="text-[10px] font-bold text-white/50 flex items-center gap-1 mb-1.5"><Sparkles className="w-3 h-3" /> Transition (vers le clip suivant)</p>
        <div className="flex gap-1 flex-wrap">
          {TRANSITIONS.map(t => (
            <button key={t.key} onClick={() => onUpdate({ transition: t.key })}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition ${(clip.transition || "none") === t.key ? "bg-purple-600 text-white" : "bg-secondary text-white/50"}`}
              title={t.label}>
              <span>{t.icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Effects */}
      <div>
        <p className="text-[10px] font-bold text-white/50 mb-1.5">Effets</p>
        <div className="space-y-1.5">
          {EFFECTS.map(eff => (
            <div key={eff.key} className="flex items-center gap-2">
              <eff.icon className="w-3 h-3 text-white/40 shrink-0" />
              <span className="text-[10px] text-white/50 w-20 shrink-0">{eff.label}</span>
              <input
                type="range"
                min={eff.min}
                max={eff.max}
                value={effects[eff.key] ?? eff.default}
                onChange={(ev) => updateEffect(eff.key, parseInt(ev.target.value))}
                className="flex-1 h-1 accent-purple-500"
              />
              <span className="text-[10px] text-white/40 font-mono w-10 text-right">{effects[eff.key] ?? eff.default}{eff.unit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}