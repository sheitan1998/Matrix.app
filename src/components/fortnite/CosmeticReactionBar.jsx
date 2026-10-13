import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query';

const REACTIONS = [
  { type: "fire",  emoji: "🔥", label: "Feu",     color: "#f97316" },
  { type: "love",  emoji: "😍", label: "J'adore", color: "#ec4899" },
  { type: "meh",   emoji: "😐", label: "Bof",      color: "#6b7280" },
  { type: "trash", emoji: "💩", label: "Nul",      color: "#84cc16" },
];

export default function CosmeticReactionBar({ cosmetic, user, counts, compact }) {
  const queryClient = useQueryClient();
  const [userVote, setUserVote] = useState(null);
  const [localCounts, setLocalCounts] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (counts) setLocalCounts(counts);
  }, [counts]);

  useEffect(() => {
    if (!user || !cosmetic?.id) { setUserVote(null); return; }
    if (counts && Object.prototype.hasOwnProperty.call(counts, 'user_vote')) { setUserVote(counts.user_vote); return; }
    if (compact) return;
    base44.functions
      .invoke("fortniteApi", { action: "getUserCosmeticVote", cosmetic_id: cosmetic.id })
      .then((res) => setUserVote(res.data?.vote_type || null))
      .catch(() => {});
  }, [user, cosmetic?.id, counts?.user_vote, compact]);

  const handleVote = async (voteType) => {
    if (!user) {
      toast.error("Connexion requise pour voter");
      return;
    }
    if (loading) return;
    setLoading(true);
    const prevVote = userVote;
    const prevCounts = localCounts;
    setUserVote(voteType);
    // Optimistic count update
    if (localCounts) {
      const next = { ...localCounts };
      if (prevVote && next[prevVote]) next[prevVote] = Math.max(0, next[prevVote] - 1);
      next[voteType] = (next[voteType] || 0) + 1;
      next.total = (next.total || 0) + (prevVote ? 0 : 1);
      setLocalCounts(next);
    }
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
        queryClient.invalidateQueries({ queryKey: ['fortniteVotes'] });
      } else if (res.data?.error) {
        toast.error(res.data.error);
        setUserVote(prevVote);
        setLocalCounts(prevCounts);
      }
    } catch {
      toast.error("Erreur lors du vote");
      setUserVote(prevVote);
      setLocalCounts(prevCounts);
    }
    setLoading(false);
  };

  return (
    <div className={`flex items-center ${compact ? "gap-0.5" : "gap-1"}`}>
      {REACTIONS.map((r) => {
        const active = userVote === r.type;
        const count = localCounts?.[r.type] || 0;
        return (
          <button
            key={r.type}
            onClick={(e) => { e.stopPropagation(); handleVote(r.type); }}
            disabled={loading}
            className={`flex items-center gap-0.5 rounded-md font-bold transition tap-sm ${compact ? "px-1 py-0.5 text-[8px]" : "px-1.5 py-1 text-[10px]"}`}
            style={{
              background: active ? `${r.color}30` : "rgba(0,0,0,0.25)",
              border: `1px solid ${active ? `${r.color}80` : "rgba(255,255,255,0.08)"}`,
              color: active ? r.color : "rgba(255,255,255,0.5)",
            }}
            title={r.label}
          >
            <span className={compact ? "text-[10px]" : "text-xs"}>{r.emoji}</span>
            {count > 0 && <span>{count > 999 ? `${Math.floor(count / 1000)}k` : count}</span>}
          </button>
        );
      })}
    </div>
  );
}