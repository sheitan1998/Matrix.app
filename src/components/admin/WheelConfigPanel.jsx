import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ImageUploadField from "@/components/admin/ImageUploadField";

const GAME_KEY = "wheel";

const TITLE_FONTS = [
  { value: "Inter", label: "Inter (Moderne)", css: "'Inter', sans-serif" },
  { value: "Titan One", label: "Titan One (Gaming)", css: "'Titan One', cursive" },
  { value: "JetBrains Mono", label: "JetBrains Mono (Mono)", css: "'JetBrains Mono', monospace" },
  { value: "Impact", label: "Impact (Bold)", css: "Impact, sans-serif" },
  { value: "Georgia", label: "Georgia (Serif)", css: "Georgia, serif" },
  { value: "Courier New", label: "Courier New (Rétro)", css: "'Courier New', monospace" },
];

export function getFontCss(fontName) {
  return TITLE_FONTS.find(f => f.value === fontName)?.css || "'Inter', sans-serif";
}

const DEFAULT_CONFIG = {
  title: "Roue de la Fortune",
  title_style: { font: "Inter", size: 18, color_style: "gradient", color: "#00ffff", color2: "#ff00ff" },
  subtitle: "Tente ta chance une fois par jour gratuitement !",
  description: "Lancez la roue et tentez de gagner gros !",
  description_long: "",
  info_message: "Le lancer gratuit est disponible une fois par jour. Les lancers supplémentaires coûtent 20 000 jetons.",
  rules: "1 lancer gratuit par jour (reset à 12h00 UTC, non cumulable). Lancers supplémentaires : 20 000 jetons par tour.",
  banner_image: "",
  icon: "🎡",
  center_icon: "🎡",
  background_image: "",
  background_color: "#0a050f",
  background_scale: 100,
  background_pos_x: 50,
  background_pos_y: 50,
  spin_cost: 20000,
  reset_hour_utc: 12,
  wheel_border: { width: 4, style: "solid", color: "#a855f7", color2: "#00ffff", image: "" },
  rewards: [
    { id: "perdu", label: "Perdu", desc: "Réessayez !", icon: "💀", amount: 0, weight: 65, type: "lose", bg_color: "#3a3a3a", bg_image: "" },
    { id: "1000", label: "1 000 jetons", desc: "Petit gain", amount: 1000, weight: 55, type: "tokens", bg_color: "#00bfff", bg_image: "" },
    { id: "20000", label: "20 000 jetons", desc: "Beau gain", amount: 20000, weight: 35, type: "tokens", bg_color: "#ff00ff", bg_image: "" },
    { id: "50000", label: "50 000 jetons", desc: "Gros gain", amount: 50000, weight: 30, type: "tokens", bg_color: "#8b5cf6", bg_image: "" },
    { id: "100000", label: "100 000 jetons", desc: "Très gros gain", amount: 100000, weight: 20, type: "tokens", bg_color: "#ffd700", bg_image: "" },
    { id: "1000000", label: "1 000 000 jetons", desc: "Gain exceptionnel !", amount: 1000000, weight: 1, type: "tokens", bg_color: "#ff1493", bg_image: "" },
    { id: "trix100", label: "100 Trix", desc: "Gain ultra rare !", amount: 100, weight: 0.001, type: "trix", bg_color: "#00ff7f", bg_image: "" },
  ],
};

export default function WheelConfigPanel() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const records = await base44.entities.CasinoGameConfig.filter({ game_key: GAME_KEY });
      if (records.length > 0) {
        setConfig({ ...DEFAULT_CONFIG, ...records[0], rewards: records[0].rewards?.length ? records[0].rewards : DEFAULT_CONFIG.rewards });
      } else {
        setConfig({ ...DEFAULT_CONFIG });
      }
    } catch {
      setConfig({ ...DEFAULT_CONFIG });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const updateField = useCallback((field, value) => {
    setConfig(prev => prev ? { ...prev, [field]: value } : prev);
  }, []);

  const updateTitleStyle = useCallback((field, value) => {
    setConfig(prev => prev ? { ...prev, title_style: { ...(prev.title_style || {}), [field]: value } } : prev);
  }, []);

  const updateReward = useCallback((index, field, value) => {
    setConfig(prev => {
      if (!prev) return prev;
      const rewards = [...(prev.rewards || [])];
      rewards[index] = { ...rewards[index], [field]: value };
      return { ...prev, rewards };
    });
  }, []);

  const updateWheelBorder = useCallback((field, value) => {
    setConfig(prev => prev ? { ...prev, wheel_border: { ...(prev.wheel_border || {}), [field]: value } } : prev);
  }, []);

  const addReward = () => {
    setConfig(prev => {
      if (!prev) return prev;
      return { ...prev, rewards: [...(prev.rewards || []), { id: `custom_${Date.now()}`, label: "Nouveau gain", desc: "", weight: 1, amount: 0, type: "tokens", bg_color: "#8b5cf6", bg_image: "" }] };
    });
  };

  const removeReward = (index) => {
    setConfig(prev => {
      if (!prev) return prev;
      const rewards = [...(prev.rewards || [])];
      rewards.splice(index, 1);
      return { ...prev, rewards };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        game_key: GAME_KEY,
        title: config.title,
        subtitle: config.subtitle,
        description: config.description,
        description_long: config.description_long,
        info_message: config.info_message,
        rules: config.rules,
        banner_image: config.banner_image,
        icon: config.icon,
        center_icon: config.center_icon,
        background_image: config.background_image,
        background_color: config.background_color,
        background_scale: Number(config.background_scale),
        background_pos_x: Number(config.background_pos_x),
        background_pos_y: Number(config.background_pos_y),
        wheel_border: config.wheel_border,
        spin_cost: Number(config.spin_cost),
        reset_hour_utc: Number(config.reset_hour_utc),
        title_style: config.title_style,
        rewards: config.rewards,
      };
      if (config.id) {
        await base44.entities.CasinoGameConfig.update(config.id, payload);
      } else {
        const created = await base44.entities.CasinoGameConfig.create(payload);
        setConfig(prev => prev ? { ...prev, id: created.id } : prev);
      }
      toast.success("Configuration sauvegardée");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(15,10,25,0.6)" }}>
        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Roue de la Fortune — Configuration</h4>
        <p className="text-[10px] text-white/40">Modifiez les assets, textes, coûts, probabilités et horaires de reset.</p>
      </div>

      {/* Visual assets */}
      <div className="rounded-2xl border border-white/10 p-4 space-y-3" style={{ background: "rgba(15,10,25,0.6)" }}>
        <p className="text-xs font-bold text-white/60 uppercase">Icônes & visuels</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Titre affiché</label>
            <input type="text" value={config.title || ""} onChange={e => updateField("title", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Sous-titre affiché</label>
            <input type="text" value={config.subtitle || ""} onChange={e => updateField("subtitle", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white" />
          </div>
        </div>
        <ImageUploadField label="Icône du jeu (emoji ou URL)" value={config.icon || ""} onChange={v => updateField("icon", v)} hint="Affichée à côté du titre et dans les cartes de jeu." />
        <ImageUploadField label="Icône centrale de la roue (emoji ou URL)" value={config.center_icon || ""} onChange={v => updateField("center_icon", v)} hint="Logo affiché au centre de la roue de la Fortune." aspect="square" />
        <ImageUploadField label="Bannière de présentation" value={config.banner_image || ""} onChange={v => updateField("banner_image", v)} hint="Image de présentation affichée en haut de la page du jeu." />
      </div>

      {/* Title typography */}
      <div className="rounded-2xl border border-white/10 p-4 space-y-3" style={{ background: "rgba(15,10,25,0.6)" }}>
        <p className="text-xs font-bold text-white/60 uppercase">Style du titre</p>
        {/* Live preview */}
        <div className="rounded-xl p-4 text-center" style={{ background: "rgba(0,0,0,0.3)" }}>
          <span
            style={{
              fontFamily: getFontCss(config.title_style?.font),
              fontSize: `${config.title_style?.size || 18}px`,
              fontWeight: config.title_style?.font === "Titan One" ? 400 : 900,
              letterSpacing: "0.05em",
              ...(config.title_style?.color_style === "gradient" ? {
                background: `linear-gradient(135deg, ${config.title_style?.color || "#00ffff"}, ${config.title_style?.color2 || "#ff00ff"})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "none",
              } : config.title_style?.color_style === "neon" ? {
                color: config.title_style?.color || "#00ffff",
                textShadow: `0 0 6px ${config.title_style?.color || "#00ffff"}, 0 0 14px ${config.title_style?.color || "#00ffff"}, 0 0 28px ${config.title_style?.color2 || "#ff00ff"}`,
              } : {
                color: config.title_style?.color || "#00ffff",
                textShadow: "none",
              }),
            }}
          >
            {config.title || "Roue de la Fortune"}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Police</label>
            <select value={config.title_style?.font || "Inter"} onChange={e => updateTitleStyle("font", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white">
              {TITLE_FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Taille ({config.title_style?.size || 18}px)</label>
            <input type="range" min="10" max="48" value={config.title_style?.size || 18} onChange={e => updateTitleStyle("size", Number(e.target.value))}
              className="w-full accent-cyan-400" />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-white/50 mb-1 block">Effet de style</label>
          <div className="flex gap-2 flex-wrap">
            {[
              { v: "gradient", label: "Dégradé" },
              { v: "solid", label: "Couleur unie" },
              { v: "neon", label: "Néon" },
            ].map(opt => (
              <button key={opt.v} onClick={() => updateTitleStyle("color_style", opt.v)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${(config.title_style?.color_style || "gradient") === opt.v ? "text-white" : "text-white/40 border border-white/10"}`}
                style={(config.title_style?.color_style || "gradient") === opt.v ? { background: "linear-gradient(135deg, #00ffff, #ff00ff)" } : {}}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Couleur principale</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={config.title_style?.color || "#00ffff"} onChange={e => updateTitleStyle("color", e.target.value)}
                className="w-10 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
              <input type="text" value={config.title_style?.color || "#00ffff"} onChange={e => updateTitleStyle("color", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white font-mono" />
            </div>
          </div>
          {config.title_style?.color_style !== "solid" && (
            <div>
              <label className="text-[10px] font-bold text-white/50 mb-1 block">Couleur secondaire {config.title_style?.color_style === "neon" ? "(halo)" : "(dégradé)"}</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={config.title_style?.color2 || "#ff00ff"} onChange={e => updateTitleStyle("color2", e.target.value)}
                  className="w-10 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                <input type="text" value={config.title_style?.color2 || "#ff00ff"} onChange={e => updateTitleStyle("color2", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white font-mono" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backgrounds */}
      <div className="rounded-2xl border border-white/10 p-4 space-y-3" style={{ background: "rgba(15,10,25,0.6)" }}>
        <p className="text-xs font-bold text-white/60 uppercase">Fonds & arrière-plans</p>
        <ImageUploadField label="Image de fond de la page" value={config.background_image || ""} onChange={v => updateField("background_image", v)} hint="Image de fond de l'écran de jeu. Si vide, la couleur de fond est utilisée." />
        <div>
          <label className="text-[10px] font-bold text-white/50 mb-1 block">Couleur de fond (si pas d'image)</label>
          <div className="flex gap-2 items-center">
            <input type="color" value={config.background_color || "#0a050f"} onChange={e => updateField("background_color", e.target.value)}
              className="w-10 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
            <input type="text" value={config.background_color || "#0a050f"} onChange={e => updateField("background_color", e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white font-mono" />
          </div>
        </div>
        {/* Background calibration */}
        <div className="pt-2 border-t border-white/5">
          <p className="text-[10px] font-bold text-white/40 mb-2">Calibration du fond (fixe, sans zoom pendant la rotation)</p>
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Échelle ({config.background_scale ?? 100}%) — 0 = cover</label>
            <input type="range" min="0" max="200" value={config.background_scale ?? 100} onChange={e => updateField("background_scale", Number(e.target.value))}
              className="w-full accent-cyan-400" />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-[10px] font-bold text-white/50 mb-1 block">Position X ({config.background_pos_x ?? 50}%)</label>
              <input type="range" min="0" max="100" value={config.background_pos_x ?? 50} onChange={e => updateField("background_pos_x", Number(e.target.value))}
                className="w-full accent-fuchsia-400" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/50 mb-1 block">Position Y ({config.background_pos_y ?? 50}%)</label>
              <input type="range" min="0" max="100" value={config.background_pos_y ?? 50} onChange={e => updateField("background_pos_y", Number(e.target.value))}
                className="w-full accent-fuchsia-400" />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => { updateField("background_scale", 100); updateField("background_pos_x", 50); updateField("background_pos_y", 50); }}
              className="px-2 py-1 rounded-lg text-[10px] font-bold text-white/60 border border-white/10 hover:bg-white/5">
              Centrer / Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Text content */}
      <div className="rounded-2xl border border-white/10 p-4 space-y-3" style={{ background: "rgba(15,10,25,0.6)" }}>
        <p className="text-xs font-bold text-white/60 uppercase">Textes & descriptions</p>
        <div>
          <label className="text-[10px] font-bold text-white/50 mb-1 block">Description courte</label>
          <textarea value={config.description || ""} onChange={e => updateField("description", e.target.value)} rows={2}
            className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white resize-none" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-white/50 mb-1 block">Description longue / bannière de présentation</label>
          <textarea value={config.description_long || ""} onChange={e => updateField("description_long", e.target.value)} rows={3}
            className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white resize-none" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-white/50 mb-1 block">Message d'information</label>
          <textarea value={config.info_message || ""} onChange={e => updateField("info_message", e.target.value)} rows={2}
            className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white resize-none" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-white/50 mb-1 block">Règles affichées aux joueurs</label>
          <textarea value={config.rules || ""} onChange={e => updateField("rules", e.target.value)} rows={3}
            className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white resize-none" />
        </div>
      </div>

      {/* Economic params */}
      <div className="rounded-2xl border border-white/10 p-4 space-y-3" style={{ background: "rgba(15,10,25,0.6)" }}>
        <p className="text-xs font-bold text-white/60 uppercase">Paramètres économiques</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Coût d'un lancer supplémentaire (jetons)</label>
            <input type="number" value={config.spin_cost || 0} onChange={e => updateField("spin_cost", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Heure de reset UTC (0-23)</label>
            <input type="number" min="0" max="23" value={config.reset_hour_utc ?? 12} onChange={e => updateField("reset_hour_utc", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white" />
          </div>
        </div>
      </div>

      {/* Wheel border config */}
      <div className="rounded-2xl border border-white/10 p-4 space-y-3" style={{ background: "rgba(15,10,25,0.6)" }}>
        <p className="text-xs font-bold text-white/60 uppercase">Contour de la roue</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Épaisseur ({config.wheel_border?.width ?? 4}px)</label>
            <input type="range" min="0" max="20" value={config.wheel_border?.width ?? 4} onChange={e => updateWheelBorder("width", Number(e.target.value))}
              className="w-full accent-cyan-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Style du contour</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { v: "solid", label: "Uni" },
                { v: "neon", label: "Néon" },
                { v: "gradient", label: "Dégradé" },
              ].map(opt => (
                <button key={opt.v} onClick={() => updateWheelBorder("style", opt.v)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${(config.wheel_border?.style || "solid") === opt.v ? "text-white" : "text-white/40 border border-white/10"}`}
                  style={(config.wheel_border?.style || "solid") === opt.v ? { background: "linear-gradient(135deg, #a855f7, #00ffff)" } : {}}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Couleur principale</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={config.wheel_border?.color || "#a855f7"} onChange={e => updateWheelBorder("color", e.target.value)}
                className="w-10 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
              <input type="text" value={config.wheel_border?.color || "#a855f7"} onChange={e => updateWheelBorder("color", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white font-mono" />
            </div>
          </div>
          {(config.wheel_border?.style || "solid") !== "solid" && (
            <div>
              <label className="text-[10px] font-bold text-white/50 mb-1 block">Couleur secondaire {config.wheel_border?.style === "neon" ? "(halo)" : "(dégradé)"}</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={config.wheel_border?.color2 || "#00ffff"} onChange={e => updateWheelBorder("color2", e.target.value)}
                  className="w-10 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                <input type="text" value={config.wheel_border?.color2 || "#00ffff"} onChange={e => updateWheelBorder("color2", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white font-mono" />
              </div>
            </div>
          )}
        </div>
        <ImageUploadField label="Image de contour (optionnel)" value={config.wheel_border?.image || ""} onChange={v => updateWheelBorder("image", v)} hint="Image de contour de la roue. Surcharge la couleur si définie." aspect="square" />
      </div>

      {/* Rewards config */}
      <div className="rounded-2xl border border-white/10 p-4 space-y-3" style={{ background: "rgba(15,10,25,0.6)" }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-white/60 uppercase">Récompenses & probabilités</p>
          <button onClick={addReward} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-white/60 border border-white/10 hover:bg-white/5">
            <Plus className="w-3 h-3" /> Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {(config.rewards || []).map((r, i) => (
            <div key={i} className="p-2 rounded-lg space-y-2" style={{ background: "rgba(0,0,0,0.2)" }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-white/30 font-mono">#{i}</span>
                <input type="text" value={r.label || ""} onChange={e => updateReward(i, "label", e.target.value)} placeholder="Libellé (ex: 1M, 100T)"
                  className="flex-1 min-w-[100px] px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white" />
                <select value={r.type || "tokens"} onChange={e => updateReward(i, "type", e.target.value)}
                  className="px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white">
                  <option value="tokens">Jetons</option>
                  <option value="trix">Trix</option>
                  <option value="lose">Perdu</option>
                </select>
                <input type="number" value={r.amount || 0} onChange={e => updateReward(i, "amount", e.target.value)} placeholder="Montant"
                  className="w-20 px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white" />
                <input type="number" step="0.001" value={r.weight || 0} onChange={e => updateReward(i, "weight", e.target.value)} placeholder="Poids"
                  className="w-16 px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white" />
                <button onClick={() => removeReward(i)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="flex gap-2 items-center pl-5">
                <div className="flex-1 min-w-0"><ImageUploadField label={`Image / icône de la case ${i + 1}`} value={r.icon || ""} onChange={v => updateReward(i, "icon", v)} hint="Emoji, URL ou image importée. Position identique sur la roue." aspect="square" /></div>
                <input type="text" value={r.desc || ""} onChange={e => updateReward(i, "desc", e.target.value)} placeholder="Description (ex: Gros gain)"
                  className="flex-1 px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2 pl-5">
                <div>
                  <label className="text-[9px] font-bold text-white/40 mb-0.5 block">Taille icône ({r.icon_size ?? 36}px)</label>
                  <input type="range" min="16" max="200" value={r.icon_size ?? 36} onChange={e => updateReward(i, "icon_size", Number(e.target.value))}
                    className="w-full accent-cyan-400" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-white/40 mb-0.5 block">Rotation icône ({r.icon_rotation ?? 0}°)</label>
                  <input type="range" min="-180" max="180" value={r.icon_rotation ?? 0} onChange={e => updateReward(i, "icon_rotation", Number(e.target.value))}
                    className="w-full accent-fuchsia-400" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5">
                <div>
                  <label className="text-[9px] font-bold text-white/40 mb-0.5 block">Couleur de fond du segment</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={r.bg_color || "#3a3a3a"} onChange={e => updateReward(i, "bg_color", e.target.value)}
                      className="w-10 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                    <input type="text" value={r.bg_color || ""} onChange={e => updateReward(i, "bg_color", e.target.value)} placeholder="#3a3a3a"
                      className="flex-1 px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white font-mono" />
                  </div>
                </div>
                <div>
                  <ImageUploadField label="Image de fond du segment" value={r.bg_image || ""} onChange={v => updateReward(i, "bg_image", v)} hint="Image de fond dédiée pour ce segment (surcharge la couleur)." aspect="square" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-white/30">L'ordre des récompenses correspond à leur position sur la roue (sens horaire). Le poids détermine la probabilité relative.</p>
      </div>

      {/* Save button */}
      <button onClick={save} disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #00ffff, #0099cc)" }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Sauvegarder la configuration
      </button>
    </div>
  );
}