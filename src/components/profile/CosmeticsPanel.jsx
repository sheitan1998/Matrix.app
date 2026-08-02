import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

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

  const { data: cosmetics = [] } = useQuery({
    queryKey: ["user-cosmetics", user?.email],
    queryFn: () => base44.entities.UserCosmetic.filter({ user_email: user.email }, "-created_date", 200),
    enabled: !!user?.email,
  });

  const equip = async (cosmetic) => {
    try {
      // Unequip all in same category
      const sameCat = cosmetics.filter(c => c.category === cosmetic.category && c.is_equipped);
      for (const c of sameCat) {
        await base44.entities.UserCosmetic.update(c.id, { is_equipped: false });
      }
      // Equip selected
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
        <a href="/boutique-matrix" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
          <Sparkles className="w-4 h-4" /> Visiter la Boutique Matrix
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
        const items = byCategory[cat];
        if (!items || items.length === 0) return null;
        return (
          <div key={cat}>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">{label}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map(c => {
                const rarityColor = RARITY_COLORS[c.rarity] || RARITY_COLORS.common;
                return (
                  <div key={c.id} className="rounded-2xl p-4 text-center transition" style={{
                    background: c.is_equipped ? `${rarityColor}15` : "rgba(15,10,25,0.6)",
                    border: `1.5px solid ${c.is_equipped ? rarityColor : "rgba(255,255,255,0.06)"}`,
                  }}>
                    {c.category === "avatar_animation" && c.video_url ? (
                      <div className="w-full aspect-square rounded-xl mb-2 overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
                        <video src={c.video_url} autoPlay loop muted playsInline className="w-full h-full object-cover" style={{ mixBlendMode: "screen" }} />
                      </div>
                    ) : c.category === "profile_cover" && c.video_url ? (
                      <div className="w-full aspect-video rounded-xl mb-2 overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
                        <video src={c.video_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                      </div>
                    ) : c.category === "profile_cover" && c.preview_image ? (
                      <div className="w-full aspect-video rounded-xl mb-2 overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
                        <img src={c.preview_image} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="text-3xl mb-2">{c.icon || "✨"}</div>
                    )}
                    <p className="text-xs font-bold text-white truncate mb-1">{c.item_name}</p>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: `${rarityColor}20`, color: rarityColor }}>{c.rarity}</span>
                    {c.is_equipped ? (
                      <button onClick={() => unequip(c)} className="mt-3 w-full py-1.5 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1" style={{ background: `${rarityColor}30`, border: `1px solid ${rarityColor}50` }}>
                        <Check className="w-3 h-3" /> Équipé
                      </button>
                    ) : (
                      <button onClick={() => equip(c)} className="mt-3 w-full py-1.5 rounded-lg text-xs font-bold text-white/70 hover:text-white transition" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        Équiper
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}