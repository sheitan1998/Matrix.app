import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Sparkles, Trash2, AlertTriangle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CosmeticPreview from "@/components/cosmetics/CosmeticPreview";

const CATEGORY_LABELS = {
  badge: "Badges",
  avatar_animation: "Animations",
  profile_cover: "Couvertures de profil",
};

const RARITY_COLORS = {
  common: "#9ca3af", rare: "#3b82f6", epic: "#a855f7", legendary: "#f59e0b",
};

export default function CosmeticsPanel({ user }) {
  const qc = useQueryClient();
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data: cosmetics = [] } = useQuery({
    queryKey: ["user-cosmetics", user?.email],
    queryFn: () => base44.entities.UserCosmetic.filter({ user_email: user.email }, "-created_date", 200),
    enabled: !!user?.email,
  });

  const equip = async (cosmetic) => {
    try {
      await base44.functions.invoke("cosmeticAction", {
        cosmetic_id: cosmetic.id,
        action: "equip"
      });
      await qc.invalidateQueries({ queryKey: ["user-cosmetics"] });
      toast.success(`${cosmetic.item_name} équipé !`);
    } catch (e) {
      console.error("[equip] error:", e);
      toast.error(e?.message || "Erreur lors de l'équipement");
    }
  };

  const unequip = async (cosmetic) => {
    try {
      await base44.functions.invoke("cosmeticAction", {
        cosmetic_id: cosmetic.id,
        action: "unequip"
      });
      await qc.invalidateQueries({ queryKey: ["user-cosmetics"] });
      toast.success("Retiré");
    } catch (e) {
      console.error("[unequip] error:", e);
      toast.error(e?.message || "Erreur lors du retrait");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.id);
    try {
      await base44.entities.UserCosmetic.delete(confirmDelete.id);
      qc.invalidateQueries({ queryKey: ["user-cosmetics"] });
      toast.success(`${confirmDelete.item_name} supprimé définitivement.`);
      setConfirmDelete(null);
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
    setDeleting(null);
  };

  const byCategory = Object.keys(CATEGORY_LABELS).reduce((acc, cat) => {
    acc[cat] = cosmetics.filter(c => c.category === cat);
    return acc;
  }, {});

  const hasAny = cosmetics.length > 0;

  if (!hasAny) {
    return (
      <div className="text-center py-16">
        <Sparkles className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
        <p className="text-white/40 text-sm mb-4">Aucun cosmétique pour le moment.</p>
        <Link to="/boutique-matrix" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
          <Sparkles className="w-4 h-4" /> Visiter la Boutique Matrix
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()}>
      {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
        const items = byCategory[cat];
        if (!items || items.length === 0) return null;
        return (
          <div key={cat}>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">{label}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map(c => {
                const rarityColor = RARITY_COLORS[c.rarity] || RARITY_COLORS.common;
                const aspect = c.category === "profile_cover" ? "video" : "square";
                return (
                  <div key={c.id} className="rounded-2xl p-4 text-center transition group relative" style={{
                    background: c.is_equipped ? `${rarityColor}15` : "rgba(15,10,25,0.6)",
                    border: `1.5px solid ${c.is_equipped ? rarityColor : "rgba(255,255,255,0.06)"}`,
                  }}>
                    <CosmeticPreview item={c} forcePlay={c.is_equipped} aspect={aspect} />

                    <p className="text-xs font-bold text-white truncate mb-1 mt-2">{c.item_name}</p>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: `${rarityColor}20`, color: rarityColor }}>{c.rarity}</span>

                    <div className="mt-3 flex gap-1.5">
                      {c.is_equipped ? (
                        <button onClick={() => unequip(c)} className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1" style={{ background: `${rarityColor}30`, border: `1px solid ${rarityColor}50` }}>
                          <Check className="w-3 h-3" /> Équipé
                        </button>
                      ) : (
                        <button onClick={() => equip(c)} className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white/70 hover:text-white transition" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          Équiper
                        </button>
                      )}
                      <button onClick={() => setConfirmDelete(c)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Supprimer définitivement">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Confirmation de suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ background: "#0f0a19", border: "1px solid rgba(239,68,68,0.3)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="text-sm font-black text-white">Supprimer le cosmétique</h3>
              </div>
              <button onClick={() => setConfirmDelete(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 tap-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/60 leading-relaxed mb-4">
              Vous êtes sur le point de supprimer définitivement <span className="font-bold text-white">"{confirmDelete.item_name}"</span> de votre inventaire. Cette action est irréversible et le cosmétique ne sera plus disponible.
            </p>

            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 h-10 rounded-lg text-xs font-bold text-white/60" style={{ background: "rgba(255,255,255,0.05)" }}>
                Annuler
              </button>
              <button onClick={handleDelete} disabled={deleting !== null}
                className="flex-1 h-10 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                {deleting !== null ? "Suppression..." : (<><Trash2 className="w-3.5 h-3.5" /> Supprimer définitivement</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}