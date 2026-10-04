import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Eye, ThumbsUp, ThumbsDown, Pencil, Trash2, Package, Map as MapIcon, Download, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import FarmingModForm from "@/components/tuto-gaming/FarmingModForm";
import SubmitMapModal from "@/components/tuto-gaming/SubmitMapModal";

const MOD_CATEGORY_LABELS = {
  vehicles: "Véhicules",
  maps: "Maps",
  tools: "Outils",
  factories: "Usines",
  animals: "Animaux",
  scripts: "Scripts",
  others: "Autres",
};

export default function CreatorDashboard({ user }) {
  const [mods, setMods] = useState([]);
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModForm, setShowModForm] = useState(false);
  const [editMod, setEditMod] = useState(null);
  const [showMapForm, setShowMapForm] = useState(false);
  const [editMap, setEditMap] = useState(null);

  const fetchMods = useCallback(async () => {
    if (!user?.email) return;
    try {
      const data = await base44.entities.FarmingMod.filter(
        { creator_email: user.email },
        { sort: "-created_date", limit: 100 }
      );
      setMods(data?.items || data || []);
    } catch { setMods([]); }
  }, [user]);

  const fetchMaps = useCallback(async () => {
    if (!user?.email) return;
    try {
      const data = await base44.entities.FortniteMap.filter(
        { user_email: user.email },
        { sort: "-created_date", limit: 100 }
      );
      setMaps(data?.items || data || []);
    } catch { setMaps([]); }
  }, [user]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchMods(), fetchMaps()]);
      setLoading(false);
    })();
  }, [fetchMods, fetchMaps]);

  const handleDeleteMod = async (mod) => {
    if (!confirm(`Supprimer "${mod.title}" ?`)) return;
    try {
      await base44.entities.FarmingMod.delete(mod.id);
      toast.success("Mod supprimé");
      fetchMods();
    } catch { toast.error("Erreur lors de la suppression"); }
  };

  const handleDeleteMap = async (map) => {
    if (!confirm(`Supprimer "${map.title}" ?`)) return;
    try {
      await base44.entities.FortniteMap.delete(map.id);
      toast.success("Map supprimée");
      fetchMaps();
    } catch { toast.error("Erreur lors de la suppression"); }
  };

  const handleDownloadMod = (mod) => {
    if (mod.file_url) {
      window.open(mod.file_url, "_blank");
      base44.entities.FarmingMod.update(mod.id, { download_count: (mod.download_count || 0) + 1 }).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  const totalViews = [...mods, ...maps].reduce((s, p) => s + (p.views || 0), 0);
  const totalLikes = [...mods, ...maps].reduce((s, p) => s + (p.likes || 0), 0);
  const totalDislikes = [...mods, ...maps].reduce((s, p) => s + (p.dislikes || 0), 0);

  return (
    <div className="space-y-4">
      <Link to="/affiliate" className="flex items-center justify-between p-4 rounded-2xl transition hover:opacity-90" style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.12), rgba(168,85,247,0.08))", border: "1px solid rgba(255,215,0,0.2)" }}>
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-sm font-bold text-white">Programme Affiliés & Partenaires</p>
            <p className="text-[11px] text-white/50">Suivez votre progression et débloquez des avantages exclusifs</p>
          </div>
        </div>
        <span className="text-xs font-bold text-yellow-400">Ouvrir →</span>
      </Link>
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <Eye className="w-5 h-5 mb-2" style={{ color: "#3b82f6" }} />
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Vues</p>
          <p className="text-lg font-black text-white mt-0.5">{totalViews}</p>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <ThumbsUp className="w-5 h-5 mb-2" style={{ color: "#22C55E" }} />
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Likes</p>
          <p className="text-lg font-black text-white mt-0.5">{totalLikes}</p>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <ThumbsDown className="w-5 h-5 mb-2" style={{ color: "#ef4444" }} />
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Dislikes</p>
          <p className="text-lg font-black text-white mt-0.5">{totalDislikes}</p>
        </div>
      </div>

      {/* Farming Mods section */}
      <div className="p-5 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(125,166,39,0.15)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" style={{ color: "#7DA627" }} />
            <h3 className="text-sm font-bold text-white">Mods Farming Simulator ({mods.length})</h3>
          </div>
          <button
            onClick={() => { setEditMod(null); setShowModForm(true); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition tap-sm"
            style={{ background: "#7DA627", color: "#0a0a0a" }}
          >
            + Nouveau mod
          </button>
        </div>
        {mods.length === 0 ? (
          <p className="text-xs text-white/40 py-4 text-center">Aucun mod publié</p>
        ) : (
          <div className="space-y-2">
            {mods.map((mod) => (
              <div key={mod.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(38,38,38,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <Package className="w-5 h-5 shrink-0" style={{ color: "#7DA627" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{mod.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-white/40">{MOD_CATEGORY_LABELS[mod.category] || "Autres"}</span>
                    <span className="text-[10px] text-white/30 flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {mod.views || 0}</span>
                    <span className="text-[10px] text-green-400 flex items-center gap-0.5"><ThumbsUp className="w-2.5 h-2.5" /> {mod.likes || 0}</span>
                    <span className="text-[10px] text-red-400 flex items-center gap-0.5"><ThumbsDown className="w-2.5 h-2.5" /> {mod.dislikes || 0}</span>
                    <span className="text-[10px] text-white/30">{mod.download_count || 0} DL</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleDownloadMod(mod)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition tap-sm" title="Télécharger">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => { setEditMod(mod); setShowModForm(true); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition tap-sm" title="Modifier">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteMod(mod)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition tap-sm" title="Supprimer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fortnite Maps section */}
      <div className="p-5 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(191,90,242,0.15)" }}>
        <div className="flex items-center gap-2 mb-3">
          <MapIcon className="w-4 h-4" style={{ color: "#BF5AF2" }} />
          <h3 className="text-sm font-bold text-white">Maps Fortnite ({maps.length})</h3>
        </div>
        {maps.length === 0 ? (
          <p className="text-xs text-white/40 py-4 text-center">Aucune map publiée</p>
        ) : (
          <div className="space-y-2">
            {maps.map((map) => (
              <div key={map.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(38,38,38,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <MapIcon className="w-5 h-5 shrink-0" style={{ color: "#BF5AF2" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{map.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-white/40 font-mono">{map.map_code}</span>
                    <span className="text-[10px] text-white/30 flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {map.views || 0}</span>
                    <span className="text-[10px] text-green-400 flex items-center gap-0.5"><ThumbsUp className="w-2.5 h-2.5" /> {map.likes || 0}</span>
                    <span className="text-[10px] text-red-400 flex items-center gap-0.5"><ThumbsDown className="w-2.5 h-2.5" /> {map.dislikes || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { setEditMap(map); setShowMapForm(true); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition tap-sm"
                    title="Modifier"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteMap(map)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition tap-sm" title="Supprimer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModForm && (
        <FarmingModForm
          mod={editMod}
          userEmail={user?.email}
          userName={user?.pseudo || user?.full_name}
          userAvatar={user?.avatar_url}
          onClose={() => { setShowModForm(false); setEditMod(null); }}
          onSaved={() => { setShowModForm(false); setEditMod(null); fetchMods(); }}
        />
      )}

      {showMapForm && (
        <SubmitMapModal
          open={showMapForm}
          editMap={editMap}
          userEmail={user?.email}
          onClose={() => { setShowMapForm(false); setEditMap(null); }}
          onSuccess={fetchMaps}
        />
      )}
    </div>
  );
}