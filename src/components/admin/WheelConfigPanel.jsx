import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Save, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { normalizeAppAssetUrl } from "@/lib/urlUtils";

const GAME_KEY = "wheel";

const DEFAULT_CONFIG = {
  title: "Roue de la Fortune",
  description: "Lancez la roue et tentez de gagner gros !",
  rules: "1 lancer gratuit par jour (reset à 12h00 UTC, non cumulable). Lancers supplémentaires : 20 000 jetons par tour.",
  banner_image: "",
  icon: "🎡",
  spin_cost: 20000,
  reset_hour_utc: 12,
  rewards: [
    { id: "perdu", label: "Perdu", desc: "Réessayez !", amount: 0, weight: 65, type: "lose" },
    { id: "1000", label: "1 000 jetons", desc: "Petit gain", amount: 1000, weight: 55, type: "tokens" },
    { id: "20000", label: "20 000 jetons", desc: "Beau gain", amount: 20000, weight: 35, type: "tokens" },
    { id: "50000", label: "50 000 jetons", desc: "Gros gain", amount: 50000, weight: 30, type: "tokens" },
    { id: "100000", label: "100 000 jetons", desc: "Très gros gain", amount: 100000, weight: 20, type: "tokens" },
    { id: "1000000", label: "1 000 000 jetons", desc: "Gain exceptionnel !", amount: 1000000, weight: 1, type: "tokens" },
    { id: "trix100", label: "100 Trix", desc: "Gain ultra rare !", amount: 100, weight: 0.001, type: "trix" },
  ],
};

export default function WheelConfigPanel() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleUploadBanner = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      updateField("banner_image", normalizeAppAssetUrl(file_url));
      toast.success("Bannière uploadée");
    } catch {
      toast.error("Erreur lors de l'upload");
    }
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        game_key: GAME_KEY,
        title: config.title,
        description: config.description,
        rules: config.rules,
        banner_image: config.banner_image,
        icon: config.icon,
        spin_cost: Number(config.spin_cost),
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
        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Roue de la Fortune — Configuration</h4>
        <p className="text-[10px] text-white/40">Modifiez les assets, textes, coûts, probabilités et horaires de reset.</p>
      </div>

      {/* Visual assets */}
      <div className="rounded-2xl border border-white/10 p-4 space-y-3" style={{ background: "rgba(15,10,25,0.6)" }}>
        <p className="text-xs font-bold text-white/60 uppercase">Assets visuels</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Titre affiché</label>
            <input type="text" value={config.title || ""} onChange={e => updateField("title", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/50 mb-1 block">Icône (emoji ou URL)</label>
            <input type="text" value={config.icon || ""} onChange={e => updateField("icon", e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white" />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-white/50 mb-1 block">Bannière</label>
          <div className="flex gap-2 items-center!">
            <input type="text" value={config.banner_image || ""} onChange={e => updateField("banner_image", e.target.value)}
              placeholder="URL de l'image" className="flex-1 px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white" />
            <label className="cursor-pointer flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-bold text-white/60 border border-white/10 hover:bg-white/5">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Upload
              <input type="file" accept="image/*" className="hidden" onChange={e => handleUploadBanner(e.target.files?.[0])} />
            </label>
          </div>
          {config.banner_image && <img src={config.banner_image} alt="" className="mt-2 w-full h-24 object-cover rounded-lg" />}
        </div>
      </div>

      {/* Text content */}
      <div className="rounded-2xl border border-white/10 p-4 space-y-3" style={{ background: "rgba(15,10,25,0.6)" }}>
        <p className="text-xs font-bold text-white/60 uppercase">Textes affichés</p>
        <div>
          <label className="text-[10px] font-bold text-white/50 mb-1 block">Description</label>
          <textarea value={config.description || ""} onChange={e => updateField("description", e.target.value)} rows={2}
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
            <div key={i} className="flex flex-wrap items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(0,0,0,0.2)" }}>
              <span className="text-[10px] text-white/30 font-mono">#{i}</span>
              <input type="text" value={r.label || ""} onChange={e => updateReward(i, "label", e.target.value)} placeholder="Libellé"
                className="flex-1 min-w-[120px] px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white" />
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