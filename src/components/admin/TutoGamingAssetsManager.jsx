import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Save, Loader2, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import ImageUploadField from "@/components/admin/ImageUploadField";

const CATEGORY_LABELS = {
  banner: "Bannière",
  game_thumbnail: "Vignette de jeu",
  poster: "Poster",
  illustration: "Illustration",
};

const CATEGORY_COLORS = {
  banner: "#ec4899",
  game_thumbnail: "#3b82f6",
  poster: "#f59e0b",
  illustration: "#a855f7",
};

export default function TutoGamingAssetsManager() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [adding, setAdding] = useState(false);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const items = await base44.entities.TutoGamingAsset.filter({}, { sort: "sort_order", limit: 100 });
      setAssets(items);
    } catch {
      setAssets([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssets();
    const unsubscribe = base44.entities.TutoGamingAsset.subscribe(() => fetchAssets());
    return () => { unsubscribe(); };
  }, [fetchAssets]);

  const updateAsset = useCallback((id, field, value) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }, []);

  const saveAsset = async (asset) => {
    setSavingKey(asset.id);
    try {
      await base44.entities.TutoGamingAsset.update(asset.id, {
        asset_key: asset.asset_key,
        label: asset.label,
        category: asset.category,
        image_url: asset.image_url,
        title: asset.title,
        subtitle: asset.subtitle,
        description: asset.description,
        sort_order: Number(asset.sort_order) || 0,
        is_active: asset.is_active !== false,
      });
      toast.success("Asset sauvegardé");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setSavingKey(null);
  };

  const addAsset = async () => {
    setAdding(true);
    try {
      const created = await base44.entities.TutoGamingAsset.create({
        asset_key: `asset_${Date.now()}`,
        label: "Nouvel asset",
        category: "illustration",
        image_url: "",
        sort_order: 0,
        is_active: true,
      });
      setAssets((prev) => [...prev, created]);
      toast.success("Asset créé");
    } catch {
      toast.error("Erreur lors de la création");
    }
    setAdding(false);
  };

  const deleteAsset = async (asset) => {
    if (!confirm(`Supprimer "${asset.label}" ?`)) return;
    try {
      await base44.entities.TutoGamingAsset.delete(asset.id);
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
      toast.success("Asset supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 p-4 flex items-center justify-between" style={{ background: "rgba(15,10,25,0.6)" }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon className="w-4 h-4" style={{ color: "#ec4899" }} />
            <h4 className="text-sm font-black text-white uppercase tracking-tight">Vignettes & Bannières</h4>
          </div>
          <p className="text-[10px] text-white/40">Gérez les visuels de la section Tuto Gaming. Les modifications s'appliquent instantanément sur le site public.</p>
        </div>
        <button
          onClick={addAsset}
          disabled={adding}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold text-white transition hover:opacity-90 disabled:opacity-50 tap-sm"
          style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
        >
          {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          Ajouter
        </button>
      </div>

      {assets.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-dashed border-white/10">
          <ImageIcon className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-xs text-white/40">Aucun visuel configuré. Cliquez sur "Ajouter" pour en créer un.</p>
        </div>
      )}

      {assets.map((asset) => {
        const catColor = CATEGORY_COLORS[asset.category] || "#a855f7";
        return (
          <div key={asset.id} className="rounded-2xl border border-white/10 p-4 space-y-3" style={{ background: "rgba(15,10,25,0.6)" }}>
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40` }}>
                {CATEGORY_LABELS[asset.category] || asset.category}
              </span>
              <input
                type="text"
                value={asset.label || ""}
                onChange={(e) => updateAsset(asset.id, "label", e.target.value)}
                placeholder="Libellé"
                className="flex-1 min-w-[120px] px-2 py-1.5 rounded text-xs bg-white/5 border border-white/10 text-white font-bold"
              />
              <button
                onClick={() => deleteAsset(asset)}
                className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-red-500 border border-white/10"
                title="Supprimer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Asset key + category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold text-white/40 mb-0.5 block">Clé unique</label>
                <input
                  type="text"
                  value={asset.asset_key || ""}
                  onChange={(e) => updateAsset(asset.id, "asset_key", e.target.value)}
                  placeholder="ex: fortnite_banner"
                  className="w-full px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-white/40 mb-0.5 block">Catégorie</label>
                <select
                  value={asset.category || "illustration"}
                  onChange={(e) => updateAsset(asset.id, "category", e.target.value)}
                  className="w-full px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white"
                >
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image upload with live preview */}
            <ImageUploadField
              label="Image"
              value={asset.image_url || ""}
              onChange={(v) => updateAsset(asset.id, "image_url", v)}
              hint="Uploadez une nouvelle image pour remplacer le visuel existant. L'aperçu est en temps réel."
              aspect="wide"
            />

            {/* Dynamic texts */}
            <div className="space-y-2 pt-1">
              <p className="text-[9px] font-bold text-white/40 uppercase">Textes dynamiques associés</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-white/40 mb-0.5 block">Titre</label>
                  <input
                    type="text"
                    value={asset.title || ""}
                    onChange={(e) => updateAsset(asset.id, "title", e.target.value)}
                    placeholder="Titre dynamique"
                    className="w-full px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-white/40 mb-0.5 block">Sous-titre</label>
                  <input
                    type="text"
                    value={asset.subtitle || ""}
                    onChange={(e) => updateAsset(asset.id, "subtitle", e.target.value)}
                    placeholder="Sous-titre dynamique"
                    className="w-full px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-white/40 mb-0.5 block">Description</label>
                <textarea
                  value={asset.description || ""}
                  onChange={(e) => updateAsset(asset.id, "description", e.target.value)}
                  placeholder="Description dynamique"
                  rows={2}
                  className="w-full px-2 py-1.5 rounded text-[10px] bg-white/5 border border-white/10 text-white resize-none"
                />
              </div>
            </div>

            {/* Sort order + active toggle */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-2">
                <label className="text-[9px] font-bold text-white/40">Ordre</label>
                <input
                  type="number"
                  value={asset.sort_order ?? 0}
                  onChange={(e) => updateAsset(asset.id, "sort_order", e.target.value)}
                  className="w-16 px-2 py-1 rounded text-[10px] bg-white/5 border border-white/10 text-white"
                />
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={asset.is_active !== false}
                  onChange={(e) => updateAsset(asset.id, "is_active", e.target.checked)}
                  className="accent-pink-500"
                />
                <span className="text-[9px] font-bold text-white/40">Actif</span>
              </label>
            </div>

            {/* Save */}
            <button
              onClick={() => saveAsset(asset)}
              disabled={savingKey === asset.id}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
            >
              {savingKey === asset.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Sauvegarder
            </button>
          </div>
        );
      })}
    </div>
  );
}