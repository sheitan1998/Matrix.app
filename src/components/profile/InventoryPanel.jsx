import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useProgression } from "@/context/ProgressionContext";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";
import { Zap, Coins, Award, ShoppingBag, Sparkles, Check, Trash2, AlertTriangle, X, Star, Rocket, Search, Clock } from "lucide-react";
import { BADGES, RARITIES } from "@/lib/progressionData";
import CosmeticPreview from "@/components/cosmetics/CosmeticPreview";
import TrixIcon from "@/components/TrixIcon";
import BoosterActivateModal from "@/components/profile/BoosterActivateModal";

const RARITY_COLORS = {
  common: "#9ca3af", rare: "#3b82f6", epic: "#a855f7", legendary: "#f59e0b"
};

const RARITY_GLOW = {
  common: "rgba(156,163,175,0.15)", rare: "rgba(59,130,246,0.18)", epic: "rgba(168,85,247,0.2)", legendary: "rgba(245,158,11,0.22)"
};

const CATEGORY_LABELS = {
  badge: "Badges",
  avatar_animation: "Animations",
  profile_cover: "Couvertures",
  title: "Titres",
  frame: "Cadres",
  animated_title: "Titres animés",
  animated_frame: "Cadres animés"
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
  x10_24h: { multiplier: 10, duration_hours: 24, label: "x10 XP", duration_label: "24 heures", color: "#f59e0b" }
};

const FILTER_TABS = [
{ key: "all", label: "Tout", icon: ShoppingBag },
{ key: "booster", label: "Boosters", icon: Rocket },
{ key: "cosmetic", label: "Cosmétiques", icon: Award },
{ key: "badge", label: "Badges", icon: Sparkles }];


function formatRemaining(expiresAt) {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expiré";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms % 3600000 / 60000);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

export default function InventoryPanel({ user }) {
  const qc = useQueryClient();
  const { progress, activateXPBooster, activeBoost, trackActivity } = useProgression();
  const { balance } = useWallet();
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activating, setActivating] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [boosterModal, setBoosterModal] = useState(null); // { stack, meta }

  const { data: cosmetics = [] } = useQuery({
    queryKey: ["user-cosmetics", user?.email],
    queryFn: () => base44.entities.UserCosmetic.filter({ user_email: user.email }, "-created_date", 200),
    enabled: !!user?.email
  });

  const equippedBadges = (progress?.badges || []).map((id) => BADGES.find((b) => b.id === id)).filter(Boolean);
  const xpBoosters = progress?.xp_boosters || [];

  // Normalize all items into a unified card format
  const allItems = useMemo(() => {
    const items = [];

    // Boosters — grouped by type into stacks
    const boosterGroups = {};
    for (const b of xpBoosters) {
      const key = `${b.id}`;
      if (!boosterGroups[key]) boosterGroups[key] = { booster: b, count: 0 };
      boosterGroups[key].count++;
    }
    for (const key of Object.keys(boosterGroups)) {
      const { booster: b, count } = boosterGroups[key];
      const meta = BOOSTER_META[b.id] || { color: "#6c47ff", label: `x${b.multiplier}`, duration_label: `${b.duration_hours}h` };
      const isActive = activeBoost?.booster_id === b.id;
      items.push({
        id: `booster_${b.id}`,
        type: "booster",
        name: meta.label,
        subtitle: meta.duration_label,
        rarity: "epic",
        quantity: count,
        color: meta.color,
        icon: "booster",
        isActive,
        activeBoost,
        action: { type: "activate", item: b, label: "Activer" }
      });
    }

    // Cosmetics
    for (const c of cosmetics) {
      items.push({
        id: c.id,
        type: "cosmetic",
        name: c.item_name || "Cosmétique",
        subtitle: CATEGORY_LABELS[c.category] || c.category,
        rarity: c.rarity || "common",
        quantity: c.quantity || 1,
        color: RARITY_COLORS[c.rarity] || RARITY_COLORS.common,
        icon: "cosmetic",
        cosmetic: c,
        isEquipped: c.is_equipped,
        action: { type: c.is_equipped ? "unequip" : "equip", item: c, label: c.is_equipped ? "Équipé" : "Équiper" }
      });
    }

    // Badges
    for (const b of equippedBadges) {
      const rarity = RARITIES[b.rarity] || RARITIES.common;
      items.push({
        id: `badge_${b.id}`,
        type: "badge",
        name: b.name,
        subtitle: "Badge",
        rarity: b.rarity || "common",
        quantity: 1,
        color: rarity.color,
        icon: "badge",
        badgeData: b,
        isEquipped: true,
        action: null
      });
    }

    return items;
  }, [cosmetics, xpBoosters, equippedBadges, activeBoost]);

  const filteredItems = useMemo(() => {
    let result = allItems;
    if (filter !== "all") result = result.filter((i) => i.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q) || i.subtitle.toLowerCase().includes(q));
    }
    return result;
  }, [allItems, filter, search]);

  const totalItems = cosmetics.length + (progress?.badges?.length || 0) + xpBoosters.length;

  const equip = async (cosmetic) => {
    try {
      const sameCat = cosmetics.filter((c) => c.category === cosmetic.category && c.is_equipped);
      for (const c of sameCat) {
        await base44.entities.UserCosmetic.update(c.id, { is_equipped: false });
      }
      await base44.entities.UserCosmetic.update(cosmetic.id, { is_equipped: true });
      qc.invalidateQueries({ queryKey: ["user-cosmetics"] });
      trackActivity("cosmetics_equipped");
      toast.success(`${cosmetic.item_name} équipé !`);
    } catch {toast.error("Erreur");}
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

  const handleActivateBooster = async (booster, quantity) => {
    setActivating(booster.id);
    try {
      await activateXPBooster(booster, quantity);
      toast.success(`${quantity} booster${quantity > 1 ? "s" : ""} activé${quantity > 1 ? "s" : ""} !`);
      setBoosterModal(null);
    } catch (e) {
      toast.error(e.message || "Erreur lors de l'activation");
    }
    setActivating(null);
  };

  return (
    <div className="space-y-4 select-none" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()}>
      {/* Summary header */}
      <div className="rounded-2xl p-4 flex items-center gap-4 flex-wrap" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" style={{ color: "#a855f7" }} />
          <span className="text-sm font-black text-white">Inventaire</span>
        </div>
        <div className="flex items-center gap-4 ml-auto flex-wrap">
          



          
          <div className="flex items-center gap-1.5 text-xs">
            <TrixIcon size={16} />
            
            
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Star className="w-4 h-4" style={{ color: "#fbbf24" }} />
            <span className="font-bold text-white">{totalItems}</span>
            <span className="text-white/40">objets</span>
          </div>
        </div>
      </div>

      {/* Filter tabs + search */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
          {FILTER_TABS.map((tab) => {
            const count = tab.key === "all" ? allItems.length : allItems.filter((i) => i.type === tab.key).length;
            return (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition tap-sm"
              style={filter === tab.key ? { background: "rgba(168,85,247,0.2)", color: "#a855f7" } : { color: "rgba(255,255,255,0.4)" }}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                <span className="text-[9px] px-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>{count}</span>
              </button>);

          })}
        </div>
        <div className="relative flex-1 min-w-[140px] max-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..."
          className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-white placeholder:text-white/30 outline-none"
          style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.05)" }} />
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length > 0 ?
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredItems.map((item) =>
        <InventoryCard
          key={item.id}
          item={item}
          onEquip={() => equip(item.cosmetic)}
          onUnequip={() => unequip(item.cosmetic)}
          onActivate={() => {
            if (item.type === "booster") {
              setBoosterModal({ booster: item.action.item, stack: item });
            }
          }}
          onDelete={() => setConfirmDelete(item.cosmetic)}
          activating={activating === item.action?.item?.id}
          hasActiveBoost={!!activeBoost} />

        )}
        </div> :
      totalItems === 0 ?
      <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
          <p className="text-white/40 text-sm mb-4">Votre inventaire est vide pour le moment.</p>
          <a href="/boutique-matrix" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
            <Sparkles className="w-4 h-4" /> Visiter la Boutique Matrix
          </a>
        </div> :

      <div className="text-center py-12">
          <p className="text-white/30 text-sm">Aucun objet ne correspond à votre recherche.</p>
        </div>
      }

      {/* Booster quantity selector */}
      {boosterModal &&
      <BoosterActivateModal
        stack={boosterModal.stack}
        booster={boosterModal.booster}
        activeBoost={activeBoost}
        activating={activating === boosterModal.booster.id}
        onConfirm={(qty) => handleActivateBooster(boosterModal.booster, qty)}
        onClose={() => setBoosterModal(null)} />

      }

      {/* Delete confirmation */}
      {confirmDelete &&
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ background: "#0f0a19", border: "1px solid rgba(239,68,68,0.3)" }} onClick={(e) => e.stopPropagation()}>
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
                {deleting !== null ? "Suppression..." : <><Trash2 className="w-3.5 h-3.5" /> Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

}

function InventoryCard({ item, onEquip, onUnequip, onActivate, onDelete, activating, hasActiveBoost }) {
  const rarityColor = item.color;
  const isEquipped = item.isEquipped;
  const isActive = item.isActive;
  const qty = item.quantity || 1;
  const showAction = item.action && item.type !== "badge";

  return (
    <div
      className="group relative rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: isEquipped ? `${rarityColor}12` : "rgba(15,10,25,0.6)",
        border: `1.5px solid ${isEquipped ? rarityColor : "rgba(255,255,255,0.06)"}`,
        boxShadow: isEquipped ? `0 0 12px ${RARITY_GLOW[item.rarity] || "rgba(168,85,247,0.2)"}` : "none"
      }}>
      
      {/* Top accent bar by rarity */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${rarityColor}, transparent)` }} />

      {/* Quantity badge */}
      {qty > 1 &&
      <span className="absolute top-2 right-2 z-10 text-[10px] font-black px-1.5 py-0.5 rounded-md" style={{ background: `${rarityColor}40`, color: rarityColor, backdropFilter: "blur(4px)" }}>
          x{qty}
        </span>
      }

      {/* Equipped indicator */}
      {isEquipped &&
      <span className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: rarityColor }}>
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </span>
      }

      {/* Icon / preview area */}
      <div className="aspect-square flex items-center justify-center p-3 relative" style={{ background: `${rarityColor}08` }}>
        {item.icon === "cosmetic" && item.cosmetic ?
        <div className="w-full h-full flex items-center justify-center">
            <CosmeticPreview
            item={item.cosmetic}
            forcePlay={isEquipped}
            aspect={item.cosmetic.category === "profile_cover" ? "video" : "square"} />
          
          </div> :
        item.icon === "booster" ?
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${rarityColor}20`, boxShadow: `0 0 16px ${rarityColor}30` }}>
            <Zap className="w-6 h-6" style={{ color: rarityColor }} fill="currentColor" />
          </div> :
        item.icon === "badge" && item.badgeData ?
        <span className="text-4xl" style={RARITIES[item.rarity]?.glow ? { filter: `drop-shadow(0 0 6px ${rarityColor})` } : {}}>
            {item.badgeData.icon}
          </span> :
        null}

        {/* Active booster pulse */}
        {isActive &&
        <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: `inset 0 0 20px ${rarityColor}40`, animation: "pulse-glow 2s ease-in-out infinite" }} />
        }
      </div>

      {/* Info section */}
      <div className="px-2.5 py-2 text-center">
        <p className="text-[11px] font-bold text-white truncate leading-tight">{item.name}</p>
        <p className="text-[9px] text-white/40 truncate mb-1.5">{item.subtitle}</p>
        <span className="inline-block text-[8px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: `${rarityColor}20`, color: rarityColor }}>
          {item.rarity}
        </span>
      </div>

      {/* Action bar — appears on hover (desktop) or always (mobile) */}
      {showAction &&
      <div className="px-2 pb-2 flex gap-1">
          {item.action.type === "activate" ?
        isActive ?
        <span className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1" style={{ background: "#22c55e20", color: "#22c55e" }}>
                <Clock className="w-3 h-3" />
                {item.activeBoost ? formatRemaining(item.activeBoost.expires_at) : "En cours"}
              </span> :

        <button onClick={onActivate} disabled={activating}
        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-white transition disabled:opacity-30 tap-sm"
        style={{ background: `linear-gradient(135deg, ${rarityColor}, ${rarityColor}dd)` }}>
                {activating ? "..." : "Activer"}
              </button> :

        item.action.type === "unequip" ?
        <button onClick={onUnequip} className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-white flex items-center justify-center gap-1 tap-sm"
        style={{ background: `${rarityColor}30`, border: `1px solid ${rarityColor}50` }}>
              <Check className="w-3 h-3" /> Équipé
            </button> :

        <button onClick={onEquip} className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-white/70 hover:text-white transition tap-sm"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Équiper
            </button>
        }
          {item.type === "cosmetic" &&
        <button onClick={onDelete}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100 tap-sm"
        title="Supprimer">
              <Trash2 className="w-3 h-3" />
            </button>
        }
        </div>
      }

      <style>{`@keyframes pulse-glow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }`}</style>
    </div>);

}