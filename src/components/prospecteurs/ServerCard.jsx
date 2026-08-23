import React, { useState, useEffect } from "react";
import { ArrowUp, Flame, ExternalLink, Users, Trash2, Pencil, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import AdMessages from "./AdMessages";
import BoostAdModal from "./BoostAdModal";

export default function ServerCard({ server, onVote, onDelete, onEdit, currentUser }) {
  const [voteStatus, setVoteStatus] = useState({ canVote: true, remaining: null });
  const [loading, setLoading] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [flashBoosts, setFlashBoosts] = useState(currentUser?.flash_boosts || 0);
  const [trixBalance, setTrixBalance] = useState(currentUser?.trix_balance || 0);

  const isDiscord = server.server_type === "discord";
  const typeColor = isDiscord ? "#5865F2" : "#22c55e";
  const typeLabel = isDiscord ? "Discord" : "Nexus";

  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        const res = await base44.functions.invoke("serverSearch", {
          action: "getVoteStatus",
          serverAdId: server.id,
        });
        if (active && res.data) {
          setVoteStatus({
            canVote: res.data.canVote,
            remaining: res.data.remainingTime,
          });
        }
      } catch {
        /* silent */
      }
    };
    checkStatus();
    return () => { active = false; };
  }, [server.id]);

  useEffect(() => {
    if (voteStatus.canVote) return;
    const timer = setInterval(() => {
      setVoteStatus((prev) => {
        if (prev.canVote) return prev;
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

  const handleVote = async () => {
    if (!voteStatus.canVote) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "vote",
        serverAdId: server.id,
      });
      if (res.data?.success) {
        setVoteStatus({ canVote: false, remaining: { h: 2, m: 0, s: 0 } });
        onVote(server.id, res.data.votes);
        toast.success("Vote enregistré !");
      } else if (res.data?.error === "cooldown") {
        setVoteStatus({ canVote: false, remaining: res.data.remainingTime });
        toast.error(`Encore ${res.data.remainingTime.h}h ${res.data.remainingTime.m}m`);
      }
    } catch {
      toast.error("Erreur lors du vote");
    } finally {
      setLoading(false);
    }
  };

  const handleBoosted = (data) => {
    setFlashBoosts(data.newFlashBoosts ?? flashBoosts);
    setTrixBalance(data.newBalance ?? trixBalance);
  };

  const handleDelete = async () => {
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "deleteAd",
        serverAdId: server.id,
      });
      if (res.data?.success) {
        onDelete(server.id);
        toast.success("Annonce supprimée");
      } else {
        toast.error(res.data?.error || "Erreur");
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const fmt = (n) => String(n).padStart(2, "0");
  const initial = server.title?.[0]?.toUpperCase() || "S";
  const hasCover = !!server.cover_image;
  const hasProfile = !!server.profile_image || !!server.server_icon;
  const isOwner = currentUser?.email === server.author_email;

  return (
    <div
      className="rounded-xl overflow-hidden transition group flex flex-col"
      style={{
        background: "rgba(18, 9, 28, 0.6)",
        border: server.is_boosted
          ? "1px solid rgba(251, 191, 36, 0.3)"
          : "1px solid rgba(138, 79, 255, 0.15)",
      }}
    >
      {/* Cover image */}
      {hasCover ? (
        <div className="relative h-16 w-full overflow-hidden">
          <img src={server.cover_image} alt="" className="w-full h-full object-cover" />
          {/* Server type badge */}
          <span
            className="absolute top-1.5 left-1.5 text-[7px] font-black px-1.5 py-0.5 rounded"
            style={{ background: `${typeColor}30`, color: typeColor, backdropFilter: "blur(4px)" }}
          >
            {typeLabel}
          </span>
          {server.is_boosted && (
            <span
              className="absolute top-1.5 right-1.5 text-[7px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5"
              style={{ background: "rgba(251, 191, 36, 0.2)", color: "#fbbf24", backdropFilter: "blur(4px)" }}
            >
              <Flame className="w-2 h-2" />
              BOOSTÉ
            </span>
          )}
          {isOwner && (
            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1">
              <button
                onClick={() => onEdit?.(server)}
                className="w-6 h-6 rounded flex items-center justify-center transition tap-sm"
                style={{ background: "rgba(138, 79, 255, 0.3)", color: "#a855f7", backdropFilter: "blur(4px)" }}
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={handleDelete}
                className="w-6 h-6 rounded flex items-center justify-center transition tap-sm"
                style={{ background: "rgba(239, 68, 68, 0.3)", color: "#ef4444", backdropFilter: "blur(4px)" }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="px-3 pt-2 flex items-center justify-between">
          <span
            className="text-[7px] font-black px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"
            style={{ background: `${typeColor}20`, color: typeColor }}
          >
            {typeLabel}
          </span>
          {server.is_boosted ? (
            <span
              className="text-[7px] font-black px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"
              style={{ background: "rgba(251, 191, 36, 0.15)", color: "#fbbf24" }}
            >
              <Flame className="w-2 h-2" />
              BOOSTÉ
            </span>
          ) : isOwner ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit?.(server)}
                className="w-6 h-6 rounded flex items-center justify-center transition tap-sm"
                style={{ background: "rgba(138, 79, 255, 0.1)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={handleDelete}
                className="w-6 h-6 rounded flex items-center justify-center transition tap-sm"
                style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span />
          )}
        </div>
      )}

      {/* Profile + title */}
      <div className="p-3 flex items-center gap-2.5">
        <div
          className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-sm font-black text-white shrink-0"
          style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
        >
          {hasProfile ? (
            <img src={server.profile_image || server.server_icon} alt="" className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{server.title}</p>
          <div className="flex items-center gap-1 flex-wrap">
            {server.game && (
              <span className="text-[9px] text-white/40 truncate">{server.game}</span>
            )}
            {server.category && (
              <span
                className="text-[7px] font-bold px-1 py-0.5 rounded"
                style={{ background: "rgba(138, 79, 255, 0.1)", color: "#8a4fff" }}
              >
                {server.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-3 pb-2 flex-1">
        <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2">{server.description}</p>
        {server.additional_info && (
          <p className="text-[9px] text-white/30 leading-relaxed line-clamp-1 mt-1">{server.additional_info}</p>
        )}
      </div>

      {/* Stats */}
      <div className="px-3 pb-2 flex items-center gap-2 text-[9px] text-white/40">
        <span className="flex items-center gap-0.5">
          <ArrowUp className="w-2.5 h-2.5" style={{ color: "#8a4fff" }} />
          {server.votes || 0}
        </span>
        <span className="flex items-center gap-0.5">
          <Flame className="w-2.5 h-2.5" style={{ color: "#fbbf24" }} />
          {server.boosts || 0}
        </span>
        {server.max_players > 0 && (
          <span className="flex items-center gap-0.5">
            <Users className="w-2.5 h-2.5" />
            {server.players_count || 0}/{server.max_players}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 pb-2 flex items-center gap-1.5">
        <button
          onClick={handleVote}
          disabled={!voteStatus.canVote || loading}
          className="flex-1 h-7 rounded-md text-[10px] font-bold transition flex items-center justify-center gap-1 tap-sm"
          style={
            voteStatus.canVote
              ? { background: "rgba(138, 79, 255, 0.15)", color: "#8a4fff", border: "1px solid rgba(138, 79, 255, 0.2)" }
              : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.05)" }
          }
        >
          {voteStatus.canVote ? (
            <>
              <ArrowUp className="w-3 h-3" /> Voter
            </>
          ) : (
            <>
              <Flame className="w-3 h-3" />
              {fmt(voteStatus.remaining.h)}:{fmt(voteStatus.remaining.m)}:{fmt(voteStatus.remaining.s)}
            </>
          )}
        </button>
        <button
          onClick={() => setShowBoost(true)}
          className="h-7 px-2 rounded-md flex items-center justify-center gap-0.5 transition tap-sm text-[9px] font-bold"
          style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}
          title="Booster cette annonce"
        >
          <Zap className="w-3 h-3" />
          <span className="hidden sm:inline">Boost</span>
        </button>
        {server.discord_link && (
          <a
            href={server.discord_link}
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 px-2 rounded-md flex items-center justify-center transition tap-sm text-[9px] font-bold"
            style={{ background: `${typeColor}20`, color: typeColor, border: `1px solid ${typeColor}30` }}
            title={server.discord_link}
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Boost modal */}
      {showBoost && (
        <BoostAdModal
          adId={server.id}
          adTitle={server.title}
          flashBoosts={flashBoosts}
          trixBalance={trixBalance}
          onBoosted={handleBoosted}
          onClose={() => setShowBoost(false)}
        />
      )}

      {/* Messages */}
      <div className="px-3 pb-3">
        <AdMessages adId={server.id} currentUser={currentUser} />
      </div>
    </div>
  );
}