import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ImageUploadField from "@/components/admin/ImageUploadField";

const GAME_KEY = "scratch";

const DEFAULT_CONFIG = {
  title: "Tickets à Gratter",
  subtitle: "Gratte et tente de gagner le gros lot !",
  description: "Grattez et tentez de gagner des jetons Nexus !",
  description_long: "",
  info_message: "1 ticket gratuit par jour. Tickets supplémentaires : 10 000 jetons chacun.",
  rules: "1 ticket gratuit par jour (reset à 15h00 UTC). Lancers supplémentaires : 10 000 jetons par ticket.",
  banner_image: "",
  icon: "🎫",
  background_image: "",
  background_color: "#0a050f",
  ticket_price: 10000,
  win_rate: 30,
  reset_hour_utc: 15,
  rewards: [
    { id: "relance", label: "🎯 Relance !", desc: "Un nouveau ticket gratuit pour rejouer", weight: 40, amount: 0, type: "relance" },
    { id: "10000", label: "💰 10 000 jetons", desc: "Petit gain", weight: 30, amount: 10000, type: "tokens" },
    { id: "50000", label: "💰 50 000 jetons", desc: "Beau gain", weight: 20, amount: 50000, type: "tokens" },
    { id: "100000", label: "💰 100 000 jetons", desc: "Gros gain", weight: 8, amount: 100000, type: "tokens" },
    { id: "1000000", label: "💎 1 000 000 jetons", desc: "Gain exceptionnel !", weight: 2, amount: 1000000, type: "tokens" },
  ],
};

export default function ScratchCardConfigPanel() {
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

  const updateReward = useCallback((index, field, value) => {
    setConfig(prev => {
      if (!prev) return prev;
      const rewards = [...(prev.rewards || [])];
      rewards[index] = { ...rewards[index], [field]: value };
      return { ...prev, rewards };
    });
  }, []);

  const addReward = () => {
    setConfig(prev => {
      if (!prev) return prev;
      return { ...prev, rewards: [...(prev.rewards || []), { id: `custom_${Date.now()}`, label: "Nouveau gain", desc: "", weight: 1, amount: 0, type: "tokens" }] };
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
        background_image: config.background_image,
        background_color: config.background_color,
        ticket_price: Number(config.ticket_price),
        win_rate: Number(config.win_rate),
        reset_hour_utc: Number(config.reset_hour_utc),
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
        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Tickets à Gratter — Configuration</h4>
        <p className="text-[10px] text-white/40">Modifiez les assets, textes, prix, probabilités et horaires de reset.</p>
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
        <ImageUploadField label="Bannière de présentation" value={config.banner_image || ""} onChange={v => updateField("banner_image", v)} hint="Image de présentation affichée en haut de la page du jeu." />
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Prix d'un ticket (jetons)</label>
            <input type="number" value={config.ticket_price || 0} onChange={e => updateField("ticket_price", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Taux de victoire (%)</label>
            <input type="number" min="0" max="100" value={config.win_rate || 0} onChange={e => updateField("win_rate", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Heure de reset UTC (0-23)</label>
            <input type="number" min="0" max="23" value={config.reset_hour_utc ?? 15} onChange={e => updateField("reset_hour_utc", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white" />
          </div>
        </div>
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
                <input type="text" value={r.label || ""} onChange={e => updateReward(i, "label", e.target.value)} placeholder="Libellé (ex: 1M, 100T)"
                  className="flex-1 min-w-[100px] px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white" />
                <select value={r.type || "tokens"} onChange={e => updateReward(i, "type", e.target.value)}
                  className="px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white">
                  <option value="tokens">Jetons</option>
                  <option value="relance">Relance</option>
                  <option value="trix">Trix</option>
                  <option value="lose">Perdu</option>
                </select>
                <input type="number" value={r.amount || 0} onChange={e => updateReward(i, "amount", e.target.value)} placeholder="Montant"
                  className="w-20 px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white" />
                <input type="number" value={r.weight || 0} onChange={e => updateReward(i, "weight", e.target.value)} placeholder="Poids"
                  className="w-16 px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white" />
                <button onClick={() => removeReward(i)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="flex gap-2 items-center pl-5">
                <input type="text" value={r.icon || ""} onChange={e => updateReward(i, "icon", e.target.value)} placeholder="Icône (emoji ou URL)"
                  className="flex-1 px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white" />
                <input type="text" value={r.desc || ""} onChange={e => updateReward(i, "desc", e.target.value)} placeholder="Description (ex: Gros gain)"
                  className="flex-1 px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-white/30">Le poids détermine la probabilité relative de chaque récompense parmi les gagnants.</p>
      </div>

      {/* Save button */}
      <button onClick={save} disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Sauvegarder la configuration
      </button>
    </div>
  );
}