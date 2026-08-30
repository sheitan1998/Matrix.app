import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { SLOT_THEMES } from "@/components/casino/slotThemes";
import { DEFAULT_GRID_CONFIG } from "@/components/casino/SlotReelGrid";
import SlotSymbolEditor from "@/components/admin/SlotSymbolEditor";
import ButtonStylesEditor from "@/components/admin/ButtonStylesEditor";
import { Save, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SlotConfigPanel() {
  const [selectedTheme, setSelectedTheme] = useState("classic");
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.SlotThemeConfig.list()
      .then(records => {
        const map = {};
        records.forEach(r => { map[r.theme_key] = r; });
        setConfigs(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Realtime: recharger quand une config change
    const unsub = base44.entities.SlotThemeConfig.subscribe(() => {
      base44.entities.SlotThemeConfig.list()
        .then(records => {
          const map = {};
          records.forEach(r => { map[r.theme_key] = r; });
          setConfigs(map);
        })
        .catch(() => {});
    });
    return () => { if (unsub) unsub(); };
  }, []);

  const currentConfig = configs[selectedTheme] || {
    ...DEFAULT_GRID_CONFIG,
    theme_key: selectedTheme,
  };

  const updateField = useCallback((field, value) => {
    setConfigs(prev => ({
      ...prev,
      [selectedTheme]: {
        ...(prev[selectedTheme] || { ...DEFAULT_GRID_CONFIG, theme_key: selectedTheme }),
        [field]: value,
      },
    }));
  }, [selectedTheme]);

  const saveConfig = async () => {
    setSaving(true);
    const config = configs[selectedTheme];
    if (!config) { setSaving(false); return; }
    try {
      if (config.id) {
        await base44.entities.SlotThemeConfig.update(config.id, {
          grid_width: config.grid_width,
          grid_height: config.grid_height,
          grid_gap: config.grid_gap,
          grid_pos_x: config.grid_pos_x,
          grid_pos_y: config.grid_pos_y,
          symbol_size: config.symbol_size,
          bg_image: config.bg_image,
          control_pos_x: config.control_pos_x,
          control_pos_y: config.control_pos_y,
          control_scale: config.control_scale,
          win_rate: config.win_rate,
          button_styles: config.button_styles,
        });
      } else {
        const created = await base44.entities.SlotThemeConfig.create({
          theme_key: selectedTheme,
          grid_width: config.grid_width,
          grid_height: config.grid_height,
          grid_gap: config.grid_gap,
          grid_pos_x: config.grid_pos_x,
          grid_pos_y: config.grid_pos_y,
          symbol_size: config.symbol_size,
          bg_image: config.bg_image,
          control_pos_x: config.control_pos_x,
          control_pos_y: config.control_pos_y,
          control_scale: config.control_scale,
          win_rate: config.win_rate,
          button_styles: config.button_styles,
        });
        setConfigs(prev => ({ ...prev, [selectedTheme]: created }));
      }
      toast.success("Configuration sauvegardée");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  const resetConfig = () => {
    setConfigs(prev => ({
      ...prev,
      [selectedTheme]: { ...DEFAULT_GRID_CONFIG, theme_key: selectedTheme },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  const theme = SLOT_THEMES[selectedTheme];
  const sliders = [
    { key: "grid_width", label: "Largeur grille", min: 20, max: 100, unit: "%" },
    { key: "grid_height", label: "Hauteur grille", min: 15, max: 90, unit: "%" },
    { key: "grid_pos_x", label: "Position X", min: 0, max: 100, unit: "%" },
    { key: "grid_pos_y", label: "Position Y", min: 0, max: 100, unit: "%" },
    { key: "grid_gap", label: "Espacement", min: 0, max: 20, unit: "px" },
    { key: "symbol_size", label: "Taille symboles", min: 12, max: 60, unit: "px" },
    { key: "control_pos_x", label: "Boutons: Position X", min: 0, max: 100, unit: "%" },
    { key: "control_pos_y", label: "Boutons: Position Y", min: 0, max: 40, unit: "%" },
    { key: "control_scale", label: "Boutons: Taille", min: 50, max: 200, unit: "%" },
    { key: "win_rate", label: "Taux de victoire (RTP)", min: 0, max: 100, unit: "%" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(15,10,25,0.6)" }}>
        <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">Configuration des Slots</h3>
        <p className="text-[10px] text-white/40">Ajustez la grille des rouleaux pour chaque thème de machine à sous.</p>
      </div>

      {/* Sélecteur de thème */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(SLOT_THEMES).map(([key, t]) => (
          <button
            key={key}
            onClick={() => setSelectedTheme(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              selectedTheme === key ? "text-white" : "text-white/40 bg-white/5"
            }`}
            style={selectedTheme === key ? {
              background: `${t.frameAccent}20`,
              border: `1px solid ${t.frameAccent}80`,
            } : { border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span>{t.emoji}</span>
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      {/* Aperçu + contrôles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Aperçu */}
        <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "rgba(15,10,25,0.6)" }}>
          <div className="px-4 py-2 border-b border-white/5">
            <p className="text-xs font-bold text-white/60">Aperçu — {theme.name}</p>
          </div>
          <div className="relative" style={{ height: "300px" }}>
            <img
              src={theme.bgImage}
              alt=""
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.3)" }} />
            {/* Grille simulée */}
            <div
              className="absolute border-2 border-dashed flex"
              style={{
                left: `${currentConfig.grid_pos_x}%`,
                top: `${currentConfig.grid_pos_y}%`,
                transform: "translate(-50%, -50%)",
                width: `${currentConfig.grid_width}%`,
                height: `${currentConfig.grid_height}%`,
                gap: `${currentConfig.grid_gap}px`,
                borderColor: `${theme.frameAccent}80`,
                background: `${theme.frameAccent}08`,
              }}
            >
              {Array.from({ length: 5 }).map((_, col) => (
                <div key={col} className="flex flex-col flex-1" style={{ gap: `${currentConfig.grid_gap}px` }}>
                  {Array.from({ length: 3 }).map((_, row) => (
                    <div
                      key={row}
                      className="flex-1 rounded flex items-center justify-center"
                      style={{ background: `${theme.frameAccent}10`, border: `1px solid ${theme.frameAccent}30` }}
                    >
                      <span style={{ fontSize: `${Math.min(currentConfig.symbol_size, 20)}px`, color: theme.frameAccent }}>
                        {theme.symbols[col % theme.symbols.length].s}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contrôles */}
        <div className="rounded-2xl border border-white/10 p-4 space-y-4" style={{ background: "rgba(15,10,25,0.6)" }}>
          {/* Image de fond */}
          <div>
            <label className="text-xs font-bold text-white/60 mb-1.5 block">Image de fond du slot</label>
            <input
              type="text"
              value={currentConfig.bg_image || ""}
              onChange={(e) => updateField("bg_image", e.target.value)}
              placeholder="URL de l'image (laisser vide pour l'image par défaut)"
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white placeholder-white/30"
            />
            {currentConfig.bg_image && (
              <img
                src={currentConfig.bg_image}
                alt=""
                className="mt-2 w-full h-20 object-cover rounded-lg"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}
          </div>
          {sliders.map(s => (
            <div key={s.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-white/60">{s.label}</label>
                <span className="text-xs font-mono font-black" style={{ color: theme.frameAccent }}>
                  {currentConfig[s.key]}{s.unit}
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                value={currentConfig[s.key]}
                onChange={(e) => updateField(s.key, parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${theme.frameAccent} ${(currentConfig[s.key] - s.min) / (s.max - s.min) * 100}%, rgba(255,255,255,0.1) ${(currentConfig[s.key] - s.min) / (s.max - s.min) * 100}%)`,
                }}
              />
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <button
              onClick={saveConfig}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white transition hover:scale-[1.02] disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${theme.frameAccent}, ${theme.frameAccent}cc)` }}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Sauvegarder
            </button>
            <button
              onClick={resetConfig}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white/60 transition hover:text-white"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Éditeur de styles de boutons */}
      <ButtonStylesEditor themeKey={selectedTheme} />

      {/* Éditeur de symboles */}
      <SlotSymbolEditor themeKey={selectedTheme} />
    </div>
  );
}