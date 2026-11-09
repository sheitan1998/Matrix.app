import React, { useState, useEffect } from "react";
import { ArrowUp, ExternalLink, Trophy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CreatorVoteModal from "./CreatorVoteModal";
import { CREATOR_PLATFORMS } from "./CreatorPlatformCards";

export default function CreatorChannelCard({ creator, rank, onVote }) {
  const [voteStatus, setVoteStatus] = useState({ canVote: true, remaining: null });
  const [showVoteModal, setShowVoteModal] = useState(false);

  const platform = CREATOR_PLATFORMS[creator.platform] || CREATOR_PLATFORMS.youtube;
  const PlatformIcon = platform.icon;
  const accent = platform.color;

  useEffect(() => {
    let active = true;
    base44.functions
      .invoke("creatorSearch", { action: "getVoteStatus", creatorId: creator.id })
      .then((res) => {
        if (active && res.data) {
          setVoteStatus({ canVote: res.data.canVote, remaining: res.data.remainingTime });
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [creator.id]);

  useEffect(() => {
    if (voteStatus.canVote) return;
    const timer = setInterval(() => {
      setVoteStatus((prev) => {
        if (prev.canVote || !prev.remaining) return prev;
        let { h, m, s } = prev.remaining;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) return { canVote: true, remaining: null };
        return { canVote: false, remaining: { h, m, s } };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [voteStatus.canVote]);

  const fmt = (n) => String(n).padStart(2, "0");
  const rankStyle = rank && rank <= 3;

  return (
    <>
      <div
        className="rounded-xl overflow-hidden flex flex-col transition hover:-translate-y-0.5"
        style={{
          background: "rgba(18,9,28,0.75)",
          border: `1px solid ${accent}35`,
          boxShadow: `0 0 16px ${accent}18`,
        }}
      >
        <div className="p-3 flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center text-base font-black text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${accent}, #1a0a2e)`, boxShadow: `0 0 12px ${accent}40` }}
          >
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt={creator.name} className="w-full h-full object-cover" />
            ) : (
              creator.name?.[0]?.toUpperCase() || "C"
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <PlatformIcon className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
              <span className="text-[8px] font-black uppercase tracking-wider" style={{ color: accent }}>
                {platform.label}
              </span>
              {rankStyle && (
                <span className="ml-auto flex items-center gap-0.5 text-[9px] font-black" style={{ color: "#fbbf24" }}>
                  <Trophy className="w-2.5 h-2.5" />#{rank}
                </span>
              )}
            </div>
            <p className="text-sm font-black text-white truncate mt-0.5">{creator.name}</p>
            <p className="text-[9px] text-white/35 truncate">
              {creator.owner_name ? `par ${creator.owner_name}` : "Créateur MATRIX"}
            </p>
          </div>

          <a
            href={creator.channel_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition hover:bg-white/10 tap-sm"
            style={{ color: accent }}
            title={`Ouvrir sur ${platform.label}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {creator.description && (
          <p className="px-3 pb-2 text-[11px] leading-relaxed text-white/45 line-clamp-2">{creator.description}</p>
        )}

        <div
          className="mt-auto px-3 py-2.5 flex items-center gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-1 text-[10px] font-black" style={{ color: accent }}>
            <ArrowUp className="w-3 h-3" />
            {creator.votes_month || 0}
            <span className="font-medium text-white/30">/ mois</span>
          </div>
          <span className="text-[9px] text-white/30">{creator.votes || 0} total</span>

          <button
            onClick={() => voteStatus.canVote && setShowVoteModal(true)}
            disabled={!voteStatus.canVote}
            className="ml-auto h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition tap-sm"
            style={{
              background: voteStatus.canVote ? `linear-gradient(135deg, ${accent}, ${accent}99)` : "rgba(255,255,255,0.05)",
              color: voteStatus.canVote ? "#fff" : "rgba(255,255,255,0.35)",
              border: `1px solid ${voteStatus.canVote ? `${accent}88` : "rgba(255,255,255,0.08)"}`,
              boxShadow: voteStatus.canVote ? `0 0 12px ${accent}40` : "none",
            }}
          >
            {voteStatus.canVote
              ? "Voter"
              : `${fmt(voteStatus.remaining?.h || 0)}:${fmt(voteStatus.remaining?.m || 0)}`}
          </button>
        </div>
      </div>

      {showVoteModal && (
        <CreatorVoteModal
          creator={creator}
          voteStatus={voteStatus}
          onClose={() => setShowVoteModal(false)}
          onVoted={(data) => {
            setVoteStatus({
              canVote: false,
              remaining: { h: data.effective_cooldown_hours || 2, m: 0, s: 0 },
            });
            onVote?.(creator.id, data);
          }}
        />
      )}
    </>
  );
}