import React, { useState, useEffect, useCallback } from "react";
import { X, Plus, Pencil, Trash2, Loader2, FileArchive, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import FarmingModForm from "@/components/tuto-gaming/FarmingModForm";

const CATEGORY_LABELS = {
  vehicles: "Véhicules",
  maps: "Maps",
  tools: "Outils",
  factories: "Usines",
  animals: "Animaux",
  scripts: "Scripts",
  others: "Autres",
};

export default function FarmingModCreatorPanel({ user, onClose }) {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMod, setEditMod] = useState(null);

  const fetchMods = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const data = await base44.entities.FarmingMod.filter(
        { creator_email: user.email },
        { sort: "-created_date", limit: 100 }
      );
      setMods(data?.items || data || []);
    } catch {
      setMods([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchMods(); }, [fetchMods]);

  const handleDelete = async (mod) => {
    if (!confirm(`Supprimer "${mod.title}" ?`)) return;
    try {
      await base44.entities.FarmingMod.delete(mod.id);
      toast.success("Mod supprimé");
      fetchMods();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDownload = (mod) => {
    if (mod.file_url) {
      window.open(mod.file_url, "_blank");
      base44.entities.FarmingMod.update(mod.id, { download_count: (mod.download_count || 0) + 1 }).catch(() => {});
    }
  };

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: "#1a1a1a", border: "1px solid rgba(125,166,39,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ background: "rgba(13,5,24,0.6)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <span className="block w-1 h-5 rounded-full" style={{ background: "#7DA627" }} />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Espace Créateur — Mods</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditMod(null); setShowForm(true); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition tap-sm"
              style={{ background: "#7DA627", color: "#0a0a0a" }}
            >
              <Plus className="w-3.5 h-3.5" /> Nouveau mod
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition tap-sm">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-white/30" />
            </div>
          ) : mods.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 py-12 text-center">
              <FileArchive className="w-10 h-10 text-white/20 mx-auto mb-2" />
              <p className="text-xs text-white/40">Vous n'avez pas encore publié de mods</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mods.map((mod) => (
                <div
                  key={mod.id}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: "#262626", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <FileArchive className="w-5 h-5 shrink-0" style={{ color: "#7DA627" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{mod.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-white/40">{CATEGORY_LABELS[mod.category] || "Autres"}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase"
                        style={{
                          background: mod.is_free ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                          color: mod.is_free ? "#4ade80" : "#f87171",
                        }}
                      >
                        {mod.is_free ? "Libre" : "Réservé"}
                      </span>
                      <span className="text-[10px] text-white/30">
                        {mod.download_count || 0} DL
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDownload(mod)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition tap-sm"
                      title="Télécharger"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setEditMod(mod); setShowForm(true); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition tap-sm"
                      title="Modifier"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(mod)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition tap-sm"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <FarmingModForm
          mod={editMod}
          userEmail={user?.email}
          userName={user?.pseudo || user?.full_name}
          userAvatar={user?.avatar_url}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            setEditMod(null);
            fetchMods();
          }}
        />
      )}
    </div>
  );
}