import React, { useState, useEffect } from "react";
import { ArrowUp, ExternalLink, Trophy, Pencil } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CreatorVoteModal from "./CreatorVoteModal";
import { CREATOR_PLATFORMS } from "./CreatorPlatformCards";

export default function CreatorChannelCard({ creator, rank, user, onVote, onEdit }) {
  const [voteStatus, setVoteStatus] = useState({ canVote: true, remaining: null });
  const [showVoteModal, setShowVoteModal] = useState(false);

  const platform = CREATOR_PLATFORMS[creator.platform] || CREATOR_PLATFORMS.youtube;
  const PlatformIcon = platform.icon;
  const accent = platform.color;
  const canEdit = !!user && (user.email === creator.owner_email || user.role === "admin");

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
        className="relative rounded-xl overflow-hidden flex flex-col transition hover:-translate-y-0.5"
        style={{
          background: "rgba(18,9,28,0.92)",
          border: `1px solid ${accent}45`,
          boxShadow: `0 0 18px ${accent}20, inset 0 0 26px ${accent}10`,
        }}
      >
        {/* Bannière de la chaîne en arrière-plan (opacité cyberpunk) */}
        {creator.banner_url ? (
          <img
            src={creator.banner_url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.35 }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${accent}30 0%, #1a0a2e 80%)` }}
          />
        )}

        {/* Voile sombre + trame néon */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,5,15,0.72) 0%, rgba(12,6,20,0.86) 55%, rgba(10,5,15,0.96) 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `linear-gradient(${accent}22 1px, transparent 1px), linear-gradient(90deg, ${accent}22 1px, transparent 1px)`,
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative z-10 flex items-center gap-1.5 px-3 pt-2.5">
          <PlatformIcon className="w-3.5 h-3.5" style={{ color: accent, filter: `drop-shadow(0 0 4px ${accent}aa)` }} />
          <span className="text-[8px] font-black uppercase tracking-wider" style={{ color: accent }}>
            {platform.label}
          </span>
          <div className="ml-auto flex items-center gap-1">
            {rankStyle && (
              <span
                className="flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded"
                style={{ color: "#fbbf24", background: "rgba(10,5,15,0.6)", border: "1px solid rgba(251,191,36,0.35)" }}
              >
                <Trophy className="w-2.5 h-2.5" />#{rank}
              </span>
            )}
            {canEdit && (
              <button
                onClick={() => onEdit?.(creator)}
                title="Modifier ma chaîne"
                className="w-7 h-7 rounded-lg flex items-center justify-center transition hover:bg-white/10 tap-sm"
                style={{ background: "rgba(10,5,15,0.6)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Logo / avatar en avant-plan avec contour néon */}
        <div className="relative z-10 flex items-start gap-2.5 px-3 pt-2.5">
          <div
            className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center text-xl font-black text-white shrink-0"
            style={{
              background: `linear-gradient(135deg, ${accent}, #1a0a2e)`,
              border: `2px solid ${accent}`,
              boxShadow: `0 0 12px ${accent}cc, 0 0 26px ${accent}55`,
            }}
          >
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt={creator.name} className="w-full h-full object-cover" />
            ) : (
              creator.name?.[0]?.toUpperCase() || "C"
            )}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-black text-white truncate">{creator.name}</p>
            <p className="text-[9px] text-white/40 truncate">
              {creator.owner_name ? `par ${creator.owner_name}` : "Créateur MATRIX"}
            </p>
            <a
              href={creator.channel_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold transition hover:opacity-80"
              style={{ color: accent }}
            >
              <ExternalLink className="w-2.5 h-2.5" />
              Voir la chaîne
            </a>
          </div>
        </div>

        {creator.description && (
          <p className="relative z-10 px-3 pt-2 pb-2 text-[11px] leading-relaxed text-white/50 line-clamp-2">
            {creator.description}
          </p>
        )}

        <div
          className="relative z-10 mt-auto px-3 py-2.5 flex items-center gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
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