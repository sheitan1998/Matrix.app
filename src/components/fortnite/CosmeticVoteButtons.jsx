import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ThumbsUp, Heart, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

export default function CosmeticVoteButtons({ cosmetic, user }) {
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !cosmetic?.id) return;
    base44.functions
      .invoke("fortniteApi", { action: "getUserCosmeticVote", cosmetic_id: cosmetic.id })
      .then((res) => setUserVote(res.data?.vote_type || null))
      .catch(() => {});
  }, [user, cosmetic?.id]);

  const handleVote = async (voteType) => {
    if (!user) {
      toast.error("Connexion requise pour voter");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("fortniteApi", {
        action: "voteCosmetic",
        cosmetic_id: cosmetic.id,
        cosmetic_name: cosmetic.name,
        cosmetic_type: cosmetic.type,
        cosmetic_image: cosmetic.image,
        cosmetic_rarity: cosmetic.rarity,
        vote_type: voteType,
      });
      if (res.data?.ok) {
        setUserVote(voteType);
        toast.success("Vote enregistré !");
      } else if (res.data?.error) {
        toast.error(res.data.error);
      }
    } catch {
      toast.error("Erreur lors du vote");
    }
    setLoading(false);
  };

  const buttons = [
    { type: "top", icon: ThumbsUp, label: "Top", color: "#22c55e" },
    { type: "love", icon: Heart, label: "J'adore", color: "#ec4899" },
    { type: "meh", icon: ThumbsDown, label: "Bof", color: "#6b7280" },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {buttons.map((btn) => {
        const active = userVote === btn.type;
        const Icon = btn.icon;
        return (
          <button
            key={btn.type}
            onClick={() => handleVote(btn.type)}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition tap-sm"
            style={{
              background: active ? `${btn.color}20` : "rgba(255,255,255,0.03)",
              border: `1px solid ${active ? `${btn.color}50` : "rgba(255,255,255,0.06)"}`,
              color: active ? btn.color : "rgba(255,255,255,0.4)",
            }}
          >
            <Icon className="w-3 h-3" fill={active ? "currentColor" : "none"} />
            {btn.label}
          </button>
        );
      })}
    </div>
  );
}