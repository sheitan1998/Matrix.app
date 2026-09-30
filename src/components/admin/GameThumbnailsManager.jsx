import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Save, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { FEATURED_GAMES, COMING_SOON_GAMES } from "@/components/tuto-gaming/tutoGamingData";

const ASSET_KEY_PREFIX = "game_";

export default function GameThumbnailsManager() {
  const [assets, setAssets] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingSlug, setSavingSlug] = useState(null);

  const fetchAssets = useCallback(async () => {
    try {
      const page = await base44.entities.TutoGamingAsset.filter({ asset_key: { $regex: `^${ASSET_KEY_PREFIX}` } }, { sort: "sort_order", limit: 100 });
      const map = {};
      for (const item of page.items || []) {
        const slug = item.asset_key?.replace(ASSET_KEY_PREFIX, "");
        if (slug) map[slug] = item;
      }
      setAssets(map);
    } catch {
      setAssets({});
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssets();
    const unsubscribe = base44.entities.TutoGamingAsset.subscribe(() => fetchAssets());
    return () => { unsubscribe(); };
  }, [fetchAssets]);

  const allGames = [
    ...FEATURED_GAMES.map((g) => ({ ...g, status: "active" })),
    ...COMING_SOON_GAMES.map((g) => ({ ...g, status: "coming_soon" })),
  ];

  const getAsset = (slug) => assets[slug];

  const updateField = (slug, field, value) => {
    setAssets((prev) => {
      const existing = prev[slug] || { asset_key: `${ASSET_KEY_PREFIX}${slug}`, label: slug, category: "game_thumbnail", sort_order: 0, is_active: true };
      return { ...prev, [slug]: { ...existing, [field]: value } };
    });
  };

  const save = async (slug) => {
    const asset = getAsset(slug);
    if (!asset) return;
    setSavingSlug(slug);
    try {
      const payload = {
        asset_key: `${ASSET_KEY_PREFIX}${slug}`,
        label: asset.label || slug,
        category: "game_thumbnail",
        image_url: asset.image_url || "",
        title: asset.title || "",
        subtitle: asset.subtitle || "",
        sort_order: Number(asset.sort_order) || 0,
        is_active: asset.is_active !== false,
      };
      if (asset.id) {
        await base44.entities.TutoGamingAsset.update(asset.id, payload);
      } else {
        const created = await base44.entities.TutoGamingAsset.create(payload);
        setAssets((prev) => ({ ...prev, [slug]: { ...created } }));
      }
      toast.success("Vignette sauvegardée");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setSavingSlug(null);
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
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(15,10,25,0.6)" }}>
        <div className="flex items-center gap-2 mb-1">
          <GripVertical className="w-4 h-4" style={{ color: "#3b82f6" }} />
          <h4 className="text-sm font-black text-white uppercase tracking-tight">Vignettes de sélection des jeux</h4>
        </div>
        <p className="text-[10px] text-white/40">Modifiez l'image et le titre affichés sur la grille d'accueil Tuto Gaming. Les changements s'appliquent instantanément.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {allGames.map((game) => {
          const asset = getAsset(game.slug) || {};
          const currentImage = asset.image_url || game.image_url || "";
          const currentTitle = asset.title || game.name;
          const isComing = game.status === "coming_soon";
          return (
            <div key={game.slug} className="rounded-2xl border border-white/10 p-4 space-y-3" style={{ background: "rgba(15,10,25,0.6)" }}>
              {/* Live preview */}
              <div className="relative rounded-xl overflow-hidden h-32" style={{ background: game.card_gradient || "#0D0518" }}>
                {currentImage && (
                  <img src={currentImage} alt={currentTitle} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(13,5,24,0.95) 100%)" }} />
                <div className="absolute bottom-0 left-0 p-3">
                  <h3 className="text-base font-black text-white uppercase tracking-tight">{currentTitle}</h3>
                </div>
                {isComing && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase text-white/60" style={{ background: "rgba(0,0,0,0.5)" }}>Bientôt</span>
                )}
              </div>

              {/* Editable fields */}
              <div>
                <label className="text-[10px] font-bold text-white/50 mb-1 block">Nom du jeu affiché</label>
                <input
                  type="text"
                  value={asset.title || ""}
                  onChange={(e) => updateField(game.slug, "title", e.target.value)}
                  placeholder={game.name}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white"
                />
              </div>

              <ImageUploadField
                label="Image de la vignette"
                value={asset.image_url || ""}
                onChange={(v) => updateField(game.slug, "image_url", v)}
                hint="Remplace l'image par défaut de la vignette. L'aperçu ci-dessus est en temps réel."
                aspect="wide"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-white/50 mb-1 block">Ordre d'affichage</label>
                  <input
                    type="number"
                    value={asset.sort_order ?? 0}
                    onChange={(e) => updateField(game.slug, "sort_order", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={asset.is_active !== false}
                      onChange={(e) => updateField(game.slug, "is_active", e.target.checked)}
                      className="accent-blue-500"
                    />
                    <span className="text-[10px] font-bold text-white/50">Vignette active</span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => save(game.slug)}
                disabled={savingSlug === game.slug}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-black text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
              >
                {savingSlug === game.slug ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Sauvegarder la vignette
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}