import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Save, Loader2, Plus, Trash2, Gamepad2 } from "lucide-react";
import { toast } from "sonner";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { FEATURED_GAMES, COMING_SOON_GAMES } from "@/components/tuto-gaming/tutoGamingData";

const ASSET_KEY_PREFIX = "game_";

export default function GameThumbnailsManager() {
  const [dbGames, setDbGames] = useState([]);
  const [assets, setAssets] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingSlug, setSavingSlug] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newGame, setNewGame] = useState({ name: "", slug: "", image_url: "", is_active: true });

  const fetchData = useCallback(async () => {
    try {
      const [gamePage, assetPage] = await Promise.all([
        base44.entities.Game.filter({}, { sort: "sort_order", limit: 100 }),
        base44.entities.TutoGamingAsset.filter({ asset_key: { $regex: `^${ASSET_KEY_PREFIX}` } }, { sort: "sort_order", limit: 100 }),
      ]);
      setDbGames(gamePage.items || []);
      const map = {};
      for (const item of assetPage.items || []) {
        const slug = item.asset_key?.replace(ASSET_KEY_PREFIX, "");
        if (slug) map[slug] = item;
      }
      setAssets(map);
    } catch {
      setDbGames([]);
      setAssets({});
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const unsubGames = base44.entities.Game.subscribe(() => fetchData());
    const unsubAssets = base44.entities.TutoGamingAsset.subscribe(() => fetchData());
    return () => { unsubGames(); unsubAssets(); };
  }, [fetchData]);

  // Build the full list: DB games + featured + coming soon (deduped by slug)
  const allGames = (() => {
    const seen = new Set();
    const result = [];
    for (const g of dbGames) {
      if (!seen.has(g.slug)) { seen.add(g.slug); result.push({ ...g, source: "db", status: g.is_active === false ? "inactive" : "active" }); }
    }
    for (const g of FEATURED_GAMES) {
      if (!seen.has(g.slug)) { seen.add(g.slug); result.push({ ...g, source: "featured", status: "active" }); }
    }
    for (const g of COMING_SOON_GAMES) {
      if (!seen.has(g.slug)) { seen.add(g.slug); result.push({ ...g, source: "coming_soon", status: "coming_soon" }); }
    }
    return result;
  })();

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

  const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const addGame = async () => {
    if (!newGame.name.trim()) { toast.error("Le nom du jeu est requis"); return; }
    const slug = newGame.slug.trim() || slugify(newGame.name);
    if (!slug) { toast.error("Impossible de générer le slug"); return; }
    setAdding(true);
    try {
      await base44.entities.Game.create({
        name: newGame.name.trim(),
        slug,
        image_url: newGame.image_url || "",
        is_active: newGame.is_active !== false,
        sort_order: 0,
      });
      toast.success("Jeu ajouté");
      setNewGame({ name: "", slug: "", image_url: "", is_active: true });
    } catch {
      toast.error("Erreur lors de l'ajout du jeu");
    }
    setAdding(false);
  };

  const deleteGame = async (game) => {
    if (!confirm(`Supprimer le jeu "${game.name}" de la base ?`)) return;
    try {
      await base44.entities.Game.delete(game.id);
      toast.success("Jeu supprimé");
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
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(15,10,25,0.6)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Gamepad2 className="w-4 h-4" style={{ color: "#3b82f6" }} />
          <h4 className="text-sm font-black text-white uppercase tracking-tight">Vignettes de sélection des jeux</h4>
        </div>
        <p className="text-[10px] text-white/40">Modifiez l'image et le titre affichés sur la grille d'accueil Tuto Gaming. Les changements s'appliquent instantanément.</p>
      </div>

      {/* Add new game */}
      <div className="rounded-2xl border border-white/10 p-4 space-y-3" style={{ background: "rgba(15,10,25,0.6)" }}>
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4" style={{ color: "#22c55e" }} />
          <h5 className="text-xs font-black text-white uppercase">Ajouter un nouveau jeu</h5>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] font-bold text-white/40 mb-0.5 block">Nom du jeu</label>
            <input type="text" value={newGame.name} onChange={(e) => setNewGame((p) => ({ ...p, name: e.target.value }))} placeholder="ex: Rocket League"
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white" />
          </div>
          <div>
            <label className="text-[9px] font-bold text-white/40 mb-0.5 block">Slug (URL, auto si vide)</label>
            <input type="text" value={newGame.slug} onChange={(e) => setNewGame((p) => ({ ...p, slug: e.target.value }))} placeholder="rocket-league"
              className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white font-mono" />
          </div>
        </div>
        <ImageUploadField label="Image de la vignette" value={newGame.image_url} onChange={(v) => setNewGame((p) => ({ ...p, image_url: v }))} aspect="wide" />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={newGame.is_active} onChange={(e) => setNewGame((p) => ({ ...p, is_active: e.target.checked }))} className="accent-green-500" />
            <span className="text-[10px] font-bold text-white/50">Jeu actif (visible)</span>
          </label>
          <button onClick={addGame} disabled={adding}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black text-white transition hover:opacity-90 disabled:opacity-50 tap-sm"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Ajouter le jeu
          </button>
        </div>
      </div>

      {/* Game cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {allGames.map((game) => {
          const asset = getAsset(game.slug) || {};
          const currentImage = asset.image_url || game.image_url || "";
          const currentTitle = asset.title || game.name;
          const isComing = game.status === "coming_soon";
          const isDb = game.source === "db";
          return (
            <div key={game.slug} className="rounded-2xl border border-white/10 p-4 space-y-3" style={{ background: "rgba(15,10,25,0.6)" }}>
              {/* Live preview */}
              <div className="relative rounded-xl overflow-hidden h-32" style={{ background: game.card_gradient || "#0D0518" }}>
                {currentImage && <img src={currentImage} alt={currentTitle} className="absolute inset-0 w-full h-full object-cover" />}
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(13,5,24,0.95) 100%)" }} />
                <div className="absolute bottom-0 left-0 p-3">
                  <h3 className="text-base font-black text-white uppercase tracking-tight">{currentTitle}</h3>
                </div>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase" style={{ background: isComing ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)", color: isComing ? "#fbbf24" : "#4ade80" }}>
                  {isComing ? "Bientôt" : isDb ? "DB" : "Actif"}
                </span>
              </div>

              {/* Editable fields */}
              <div>
                <label className="text-[10px] font-bold text-white/50 mb-1 block">Nom du jeu affiché</label>
                <input type="text" value={asset.title || ""} onChange={(e) => updateField(game.slug, "title", e.target.value)} placeholder={game.name}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white" />
              </div>

              <ImageUploadField label="Image de la vignette" value={asset.image_url || ""} onChange={(v) => updateField(game.slug, "image_url", v)}
                hint="Remplace l'image par défaut. L'aperçu ci-dessus est en temps réel." aspect="wide" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-white/50 mb-1 block">Ordre d'affichage</label>
                  <input type="number" value={asset.sort_order ?? 0} onChange={(e) => updateField(game.slug, "sort_order", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white" />
                </div>
                <div className="flex items-end justify-between pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={asset.is_active !== false} onChange={(e) => updateField(game.slug, "is_active", e.target.checked)} className="accent-blue-500" />
                    <span className="text-[10px] font-bold text-white/50">Vignette active</span>
                  </label>
                  {isDb && (
                    <button onClick={() => deleteGame(game)} className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-red-500 border border-white/10" title="Supprimer le jeu">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <button onClick={() => save(game.slug)} disabled={savingSlug === game.slug}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-black text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
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