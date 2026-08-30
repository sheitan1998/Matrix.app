import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { SLOT_THEMES } from "@/components/casino/slotThemes";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const BUTTONS = [
  { key: "spin", label: "SPIN", defaultX: 85, defaultY: 85 },
  { key: "auto", label: "AUTO PLAY", defaultX: 85, defaultY: 75 },
  { key: "bet_minus", label: "Mise −", defaultX: 28, defaultY: 90 },
  { key: "bet_plus", label: "Mise +", defaultX: 44, defaultY: 90 },
  { key: "max_bet", label: "MAX MISE", defaultX: 52, defaultY: 90 },
  { key: "paytable", label: "PAYTABLE", defaultX: 72, defaultY: 90 },
];

export default function ButtonStylesEditor({ themeKey }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedBtn, setExpandedBtn] = useState(null);

  useEffect(() => {
    if (!themeKey) return;
    setLoading(true);
    const fetchConfig = () => {
      base44.entities.SlotThemeConfig.filter({ theme_key: themeKey })
        .then(records => {
          if (records.length > 0) setConfig(records[0]);
          else setConfig(null);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    fetchConfig();
    const unsub = base44.entities.SlotThemeConfig.subscribe(() => fetchConfig());
    return () => { if (unsub) unsub(); };
  }, [themeKey]);

  const buttonStyles = config?.button_styles || {};

  const ensureConfig = async () => {
    if (config?.id) return config;
    const created = await base44.entities.SlotThemeConfig.create({
      theme_key: themeKey,
      win_rate: 49,
      button_styles: {},
    });
    setConfig(created);
    return created;
  };

  const updateButton = async (btnKey, field, value) => {
    setSaving(true);
    try {
      const cfg = await ensureConfig();
      const current = buttonStyles[btnKey] || {};
      const newStyles = {
        ...buttonStyles,
        [btnKey]: { ...current, [field]: value },
      };
      setConfig(prev => prev ? { ...prev, button_styles: newStyles } : prev);
      await base44.entities.SlotThemeConfig.update(cfg.id, { button_styles: newStyles });
    } catch {
      toast.error("Erreur de sauvegarde");
    }
    setSaving(false);
  };

  const theme = SLOT_THEMES[themeKey];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(15,10,25,0.6)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-white uppercase">Style des boutons</h3>
          <p className="text-[10px] text-white/40">{theme?.name} — personnalisez chaque bouton</p>
        </div>
        {saving && <Loader2 className="w-4 h-4 animate-spin text-white/40" />}
      </div>

      <div className="space-y-2">
        {BUTTONS.map(btn => {
          const bs = buttonStyles[btn.key] || {};
          const isExpanded = expandedBtn === btn.key;
          return (
            <div key={btn.key} className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <button
                onClick={() => setExpandedBtn(isExpanded ? null : btn.key)}
                className="w-full flex items-center justify-between px-3 py-2.5 transition hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">{btn.label}</span>
                  <span className="text-[9px] text-white/30">X: {bs.pos_x ?? btn.defaultX} Y: {bs.pos_y ?? btn.defaultY}</span>
                </div>
                <span className="text-[10px] text-white/40">{isExpanded ? "▲" : "▼"}</span>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-white/5 pt-3">
                  {/* Colors */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-white/50 block mb-1">Fond</label>
                      <input
                        type="color"
                        value={bs.bg || "#333333"}
                        onChange={(e) => updateButton(btn.key, "bg", e.target.value)}
                        className="w-full h-7 rounded cursor-pointer bg-transparent border border-white/10"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-white/50 block mb-1">Texte</label>
                      <input
                        type="color"
                        value={bs.text_color || "#ffffff"}
                        onChange={(e) => updateButton(btn.key, "text_color", e.target.value)}
                        className="w-full h-7 rounded cursor-pointer bg-transparent border border-white/10"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-white/50 block mb-1">Bordure</label>
                      <input
                        type="color"
                        value={bs.border_color || "#000000"}
                        onChange={(e) => updateButton(btn.key, "border_color", e.target.value)}
                        className="w-full h-7 rounded cursor-pointer bg-transparent border border-white/10"
                      />
                    </div>
                  </div>

                  {/* Radius + Opacity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[9px] font-bold text-white/50">Arrondi</label>
                        <span className="text-[9px] font-mono" style={{ color: theme?.frameAccent }}>{bs.radius ?? 12}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={bs.radius ?? 12}
                        onChange={(e) => updateButton(btn.key, "radius", parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                        style={{ background: `linear-gradient(to right, ${theme?.frameAccent} ${(bs.radius ?? 12) / 50 * 100}%, rgba(255,255,255,0.1) ${(bs.radius ?? 12) / 50 * 100}%)` }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[9px] font-bold text-white/50">Opacité</label>
                        <span className="text-[9px] font-mono" style={{ color: theme?.frameAccent }}>{bs.opacity ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={bs.opacity ?? 100}
                        onChange={(e) => updateButton(btn.key, "opacity", parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                        style={{ background: `linear-gradient(to right, ${theme?.frameAccent} ${(bs.opacity ?? 100) / 100 * 100}%, rgba(255,255,255,0.1) ${(bs.opacity ?? 100) / 100 * 100}%)` }}
                      />
                    </div>
                  </div>

                  {/* Position X / Y */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[9px] font-bold text-white/50">Position X</label>
                        <span className="text-[9px] font-mono" style={{ color: theme?.frameAccent }}>{bs.pos_x ?? btn.defaultX}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={bs.pos_x ?? btn.defaultX}
                        onChange={(e) => updateButton(btn.key, "pos_x", parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                        style={{ background: `linear-gradient(to right, ${theme?.frameAccent} ${(bs.pos_x ?? btn.defaultX) / 100 * 100}%, rgba(255,255,255,0.1) ${(bs.pos_x ?? btn.defaultX) / 100 * 100}%)` }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[9px] font-bold text-white/50">Position Y</label>
                        <span className="text-[9px] font-mono" style={{ color: theme?.frameAccent }}>{bs.pos_y ?? btn.defaultY}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={bs.pos_y ?? btn.defaultY}
                        onChange={(e) => updateButton(btn.key, "pos_y", parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                        style={{ background: `linear-gradient(to right, ${theme?.frameAccent} ${(bs.pos_y ?? btn.defaultY) / 100 * 100}%, rgba(255,255,255,0.1) ${(bs.pos_y ?? btn.defaultY) / 100 * 100}%)` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}