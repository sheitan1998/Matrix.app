import React from "react";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const THEME_OPTIONS = [
  { key: "default", label: "Défaut" },
  { key: "ruby", label: "Ruby" },
  { key: "galaxy", label: "Galaxy" },
  { key: "ocean", label: "Ocean" },
  { key: "forest", label: "Forest" },
  { key: "neon", label: "Neon" },
  { key: "gold", label: "Gold" },
  { key: "midnight", label: "Midnight" },
];

export default function ServerAppearanceConfig({ config, onUpdate, accent }) {
  const cfg = config?.appearance_config || {};
  const allowedThemes = cfg.allowed_themes || [];

  const toggleTheme = (key) => {
    const has = allowedThemes.includes(key);
    const updated = has
      ? allowedThemes.filter((t) => t !== key)
      : [...allowedThemes, key];
    onUpdate({ appearance_config: { ...cfg, allowed_themes: updated } });
  };

  const updateNum = (key, val) => {
    onUpdate({ appearance_config: { ...cfg, [key]: val } });
  };

  const toggleBool = (key) => {
    onUpdate({ appearance_config: { ...cfg, [key]: !cfg[key] } });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-black text-white mb-1">Structure des Serveurs & Apparence</h3>
        <p className="text-xs text-white/40 mb-3">Règles structurelles, thèmes autorisés et exigences visuelles des serveurs Nexus.</p>
      </div>

      {/* Allowed themes */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Thèmes visuels autorisés</p>
        <div className="grid grid-cols-4 gap-2">
          {THEME_OPTIONS.map((t) => {
            const active = allowedThemes.includes(t.key);
            return (
              <button
                key={t.key}
                onClick={() => toggleTheme(t.key)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  active ? "text-white" : "text-white/40 hover:text-white/60"
                }`}
                style={active ? { background: accent + "20", borderColor: accent } : { borderColor: "rgba(255,255,255,0.08)" }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex-1 pr-3">
            <p className="text-sm font-bold text-white">Image de fond obligatoire (thèmes personnalisés)</p>
            <p className="text-xs text-white/40">Chaque thème personnalisé doit avoir une image de fond persistante</p>
          </div>
          <button
            onClick={() => toggleBool("custom_theme_bg_required")}
            className={`w-10 h-5 rounded-full transition shrink-0 ${cfg.custom_theme_bg_required !== false ? "bg-green-500" : "bg-white/20"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${cfg.custom_theme_bg_required !== false ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Numeric settings */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "max_custom_themes", label: "Max thèmes personnalisés", default: 10, min: 0, max: 50 },
          { key: "min_boost_for_themes", label: "Boost min. (thèmes)", default: 1, min: 0, max: 10 },
          { key: "min_boost_for_banner", label: "Boost min. (bannière)", default: 2, min: 0, max: 10 },
          { key: "min_boost_for_animated_icon", label: "Boost min. (icône animée)", default: 1, min: 0, max: 10 },
          { key: "min_boost_for_custom_emojis", label: "Boost min. (emojis)", default: 1, min: 0, max: 10 },
        ].map((s) => (
          <div key={s.key} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-xs text-white/40 mb-1">{s.label}</p>
            <input
              type="number"
              min={s.min}
              max={s.max}
              value={cfg[s.key] ?? s.default}
              onChange={(e) => updateNum(s.key, parseInt(e.target.value) || 0)}
              className="w-full bg-transparent text-sm font-bold text-white outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}