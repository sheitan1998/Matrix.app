import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useProgression } from "@/context/ProgressionContext";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";
import { Zap, Coins, Award, ShoppingBag, Sparkles, Check, Trash2, AlertTriangle, X, Star, Rocket } from "lucide-react";
import { BADGES, RARITIES } from "@/lib/progressionData";
import CosmeticPreview from "@/components/cosmetics/CosmeticPreview";
import TrixIcon from "@/components/TrixIcon";

const RARITY_COLORS = {
  common: "#9ca3af", rare: "#3b82f6", epic: "#a855f7", legendary: "#f59e0b",
};

const CATEGORY_LABELS = {
  badge: "Badges",
  avatar_animation: "Animations",
  profile_cover: "Couvertures de profil",
  title: "Titres",
  frame: "Cadres",
  animated_title: "Titres animés",
  animated_frame: "Cadres animés",
};

const BOOSTER_META = {
  x2_1h: { multiplier: 2, duration_hours: 1, label: "x2 XP", duration_label: "1 heure", color: "#3b82f6" },
  x2_4h: { multiplier: 2, duration_hours: 4, label: "x2 XP", duration_label: "4 heures", color: "#3b82f6" },
  x2_24h: { multiplier: 2, duration_hours: 24, label: "x2 XP", duration_label: "24 heures", color: "#3b82f6" },
  x5_1h: { multiplier: 5, duration_hours: 1, label: "x5 XP", duration_label: "1 heure", color: "#a855f7" },
  x5_4h: { multiplier: 5, duration_hours: 4, label: "x5 XP", duration_label: "4 heures", color: "#a855f7" },
  x5_24h: { multiplier: 5, duration_hours: 24, label: "x5 XP", duration_label: "24 heures", color: "#a855f7" },
  x10_1h: { multiplier: 10, duration_hours: 1, label: "x10 XP", duration_label: "1 heure", color: "#f59e0b" },
  x10_4h: { multiplier: 10, duration_hours: 4, label: "x10 XP", duration_label: "4 heures", color: "#f59e0b" },
  x10_24h: { multiplier: 10, duration_hours: 24, label: "x10 XP", duration_label: "24 heures", color: "#f59e0b" },
};

export default function InventoryPanel({ user }) {
  const qc = useQueryClient();
  const { progress, activateXPBooster, activeBoost } = useProgression();
  const { balance } = useWallet();
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activating, setActivating] = useState(null);

  const { data: cosmetics = [] } = useQuery({
    queryKey: ["user-cosmetics", user?.email],
    queryFn: () => base44.entities.UserCosmetic.filter({ user_email: user.email }, "-created_date", 200),
    enabled: !!user?.email,
  });

  const equippedBadges = (progress?.badges || []).map(id => BADGES.find(b => b.id === id)).filter(Boolean);

  const cosmeticsByCategory = useMemo(() => {
    const groups = {};
    for (const c of cosmetics) {
      const cat = c.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    }
    return groups;
  }, [cosmetics]);

  const xpBoosters = progress?.xp_boosters || [];

  const equip = async (cosmetic) => {
    try {
      const sameCat = cosmetics.filter(c => c.category === cosmetic.category && c.is_equipped);
      for (const c of sameCat) {
        await base44.entities.UserCosmetic.update(c.id, { is_equipped: false });
      }
      await base44.entities.UserCosmetic.update(cosmetic.id, { is_equipped: true });
      qc.invalidateQueries({ queryKey: ["user-cosmetics"] });
      toast.success(`${cosmetic.item_name} équipé !`);
    } catch { toast.error("Erreur"); }
  };

  const unequip = async (cosmetic) => {
    await base44.entities.UserCosmetic.update(cosmetic.id, { is_equipped: false });
    qc.invalidateQueries({ queryKey: ["user-cosmetics"] });
    toast.success("Retiré");
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.id);
    try {
      await base44.entities.UserCosmetic.delete(confirmDelete.id);
      qc.invalidateQueries({ queryKey: ["user-cosmetics"] });
      toast.success(`${confirmDelete.item_name} supprimé.`);
      setConfirmDelete(null);
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
    setDeleting(null);
  };

  const handleActivateBooster = async (item) => {
    setActivating(item.id);
    try {
      await activateXPBooster(item);
      toast.success("Booster activé !");
    } catch (e) {
      toast.error(e.message || "Erreur lors de l'activation");
    }
    setActivating(null);
  };

  const totalItems = cosmetics.length + (progress?.badges?.length || 0) + xpBoosters.length;

  return (
    <div className="space-y-6 select-none" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()}>
      {/* Summary header */}
      <div className="rounded-2xl p-4 flex items-center gap-4 flex-wrap" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" style={{ color: "#a855f7" }} />
          <span className="text-sm font-black text-white">Inventaire global</span>
        </div>
        <div className="flex items-center gap-4 ml-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <Coins className="w-4 h-4" style={{ color: "#fbbf24" }} />
            <span className="font-bold text-white">{(progress?.coins || 0).toLocaleString()}</span>
            <span className="text-white/40">XP Coins</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <TrixIcon size={16} />
            <span className="font-bold text-white">{balance || 0}</span>
            <span className="text-white/40">Trix</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Star className="w-4 h-4" style={{ color: "#fbbf24" }} />
            <span className="font-bold text-white">{totalItems}</span>
            <span className="text-white/40">objets</span>
          </div>
        </div>
      </div>

      {/* XP Boosters */}
      {xpBoosters.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Rocket className="w-4 h-4" style={{ color: "#fbbf24" }} />
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Boosters XP ({xpBoosters.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {xpBoosters.map((item, idx) => {
              const meta = BOOSTER_META[item.id] || { color: "#6c47ff", label: `x${item.multiplier}`, duration_label: `${item.duration_hours}h` };
              const isActive = activeBoost?.booster_id === item.id;
              return (
                <div key={idx} className="p-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(15,10,25,0.6)", border: `1px solid ${meta.color}30` }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${meta.color}20` }}>
                    <Zap className="w-4 h-4" style={{ color: meta.color }} fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{meta.label}</p>
                    <p className="text-[9px] text-white/40">{meta.duration_label}</p>
                  </div>
                  {isActive ? (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: "#22c55e20", color: "#22c55e" }}>En cours</span>
                  ) : activeBoost ? (
                    <span className="text-[10px] text-white/30">En attente</span>
                  ) : (
                    <button onClick={() => handleActivateBooster(item)} disabled={activating === item.id}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white transition disabled:opacity-30 tap-sm"
                      style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}dd)` }}>
                      {activating === item.id ? "..." : "Activer"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cosmetics by category */}
      {Object.keys(cosmeticsByCategory).length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4" style={{ color: "#a855f7" }} />
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Cosmétiques ({cosmetics.length})</h3>
          </div>
          {Object.entries(cosmeticsByCategory).map(([cat, items]) => (
            <div key={cat} className="mb-4">
              <p className="text-[10px] font-bold text-white/30 mb-2">{CATEGORY_LABELS[cat] || cat}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map(c => {
                  const rarityColor = RARITY_COLORS[c.rarity] || RARITY_COLORS.common;
                  const qty = c.quantity || 1;
                  const aspect = c.category === "profile_cover" ? "video" : "square";
                  return (
                    <div key={c.id} className="rounded-2xl p-4 text-center transition group relative" style={{
                      background: c.is_equipped ? `${rarityColor}15` : "rgba(15,10,25,0.6)",
                      border: `1.5px solid ${c.is_equipped ? rarityColor : "rgba(255,255,255,0.06)"}`,
                    }}>
                      {qty > 1 && (
                        <span className="absolute top-2 right-2 text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: `${rarityColor}30`, color: rarityColor }}>
                          x{qty}
                        </span>
                      )}
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
          ))}
        </div>
      )}

      {/* Badges from progression */}
      {equippedBadges.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: "#22c55e" }} />
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Badges ({equippedBadges.length})</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {equippedBadges.map(b => {
              const rarity = RARITIES[b.rarity] || RARITIES.common;
              return (
                <div key={b.id} className="rounded-xl p-3 text-center" style={{ background: `${rarity.color}08`, border: `1px solid ${rarity.color}20` }}>
                  <span className="text-2xl block mb-1" style={rarity.glow ? { filter: `drop-shadow(0 0 4px ${rarity.color})` } : {}}>{b.icon}</span>
                  <p className="text-[9px] font-bold text-white truncate">{b.name}</p>
                  <span className="text-[8px]" style={{ color: rarity.color }}>{rarity.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalItems === 0 && (
        <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
          <p className="text-white/40 text-sm mb-4">Votre inventaire est vide pour le moment.</p>
          <a href="/boutique-matrix" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
            <Sparkles className="w-4 h-4" /> Visiter la Boutique Matrix
          </a>
        </div>
      )}

      {/* Delete confirmation */}
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
              Vous êtes sur le point de supprimer définitivement <span className="font-bold text-white">"{confirmDelete.item_name}"</span> de votre inventaire. Cette action est irréversible.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 h-10 rounded-lg text-xs font-bold text-white/60" style={{ background: "rgba(255,255,255,0.05)" }}>
                Annuler
              </button>
              <button onClick={handleDelete} disabled={deleting !== null}
                className="flex-1 h-10 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                {deleting !== null ? "Suppression..." : (<><Trash2 className="w-3.5 h-3.5" /> Supprimer</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}