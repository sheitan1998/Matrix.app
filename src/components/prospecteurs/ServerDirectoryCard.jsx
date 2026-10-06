import React, { useState, useEffect } from "react";
import { ArrowUp, Flame, ExternalLink, Users, Zap, Pencil, Trash2, Share2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import BoostAdModal from "./BoostAdModal";
import VoteModal from "./VoteModal";

const BADGE_CONFIG = {
  nexus: { color: "#22c55e", label: "NEXUS" },
  discord: { color: "#5865F2", label: "DISCORD" },
};

export default function ServerDirectoryCard({ server, rank, onVote, onDelete, onEdit, currentUser }) {
  const [voteStatus, setVoteStatus] = useState({ canVote: true, remaining: null });
  const [loading, setLoading] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [flashBoosts, setFlashBoosts] = useState(currentUser?.flash_boosts || 0);
  const [trixBalance, setTrixBalance] = useState(currentUser?.trix_balance || 0);
  const [boostCount, setBoostCount] = useState(server.boosts || 0);
  const [copied, setCopied] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);

  const shareSlug = server.slug || server.id;

  const handleShare = async () => {
    if (!shareSlug) {
      toast.error("Lien de partage non disponible");
      return;
    }
    const url = `${window.location.origin}/servers/${shareSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const serverType = server.server_type || "nexus";
  const typeConfig = BADGE_CONFIG[serverType] || BADGE_CONFIG.nexus;
  const initial = server.title?.[0]?.toUpperCase() || "S";
  const hasLogo = !!server.logo_url || !!server.profile_image || !!server.server_icon;
  const hasBanner = !!server.banner_url || !!server.cover_image;
  const isOwner = currentUser?.email === server.author_email;

  const logoUrl = server.logo_url || server.profile_image || server.server_icon;
  const bannerUrl = server.banner_url || server.cover_image;

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
        toast.error(`Reviens dans ${res.data.remainingTime.h}h ${res.data.remainingTime.m}m`);
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
    setBoostCount(data.boosts ?? boostCount);
  };

  const handleDelete = async () => {
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "deleteAd",
        serverAdId: server.id,
      });
      if (res.data?.success) {
        onDelete(server.id);
        toast.success("Serveur supprimé");
      } else {
        toast.error(res.data?.error || "Erreur");
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const fmt = (n) => String(n).padStart(2, "0");
  const rankBadge = rank <= 3;
  const rankColors = [
    "linear-gradient(135deg, #fbbf24, #f59e0b)", // 1st gold
    "linear-gradient(135deg, #e5e7eb, #9ca3af)", // 2nd silver
    "linear-gradient(135deg, #d97706, #b45309)", // 3rd bronze
  ];

  return (
    <div
      className="rounded-xl overflow-hidden transition group flex flex-col"
      style={{
        background: "rgba(18,9,28,0.6)",
        border: server.is_boosted
          ? "1px solid rgba(251,191,36,0.3)"
          : "1px solid rgba(138,79,255,0.15)",
      }}
    >
      {/* Banner */}
      {hasBanner ? (
        <div className="relative h-20 w-full overflow-hidden">
          <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(18,9,28,0.2) 0%, rgba(18,9,28,0.7) 100%)" }} />
          {/* Rank badge */}
          {rank > 0 && (
            <div
              className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
              style={{
                background: rankBadge ? rankColors[rank - 1] : "linear-gradient(135deg, #8a4fff, #5b21b6)",
                color: "#fff",
                boxShadow: rankBadge ? `0 0 12px ${rankBadge ? "rgba(251,191,36,0.4)" : "rgba(138,79,255,0.3)"}` : "0 0 8px rgba(138,79,255,0.3)",
                border: "2px solid #12091c",
              }}
            >
              {rank}
            </div>
          )}
          {/* Type badge */}
          <span
            className="absolute top-1.5 right-1.5 text-[7px] font-black px-1.5 py-0.5 rounded"
            style={{ background: `${typeConfig.color}30`, color: typeConfig.color, backdropFilter: "blur(4px)" }}
          >
            {typeConfig.label}
          </span>
          {server.is_boosted && (
            <span
              className="absolute bottom-1.5 right-1.5 text-[7px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5"
              style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24", backdropFilter: "blur(4px)" }}
            >
              <Flame className="w-2 h-2" /> BOOSTÉ
            </span>
          )}
          {isOwner && (
            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
              <button
                onClick={() => onEdit?.(server)}
                className="w-6 h-6 rounded flex items-center justify-center transition tap-sm"
                style={{ background: "rgba(138,79,255,0.3)", color: "#a855f7", backdropFilter: "blur(4px)" }}
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={handleDelete}
                className="w-6 h-6 rounded flex items-center justify-center transition tap-sm"
                style={{ background: "rgba(239,68,68,0.3)", color: "#ef4444", backdropFilter: "blur(4px)" }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="px-3 pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {rank > 0 && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                style={{
                  background: rankBadge ? rankColors[rank - 1] : "linear-gradient(135deg, #8a4fff, #5b21b6)",
                  color: "#fff",
                }}
              >
                {rank}
              </div>
            )}
            <span
              className="text-[7px] font-black px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"
              style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}
            >
              {typeConfig.label}
            </span>
          </div>
          {server.is_boosted ? (
            <span
              className="text-[7px] font-black px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"
              style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}
            >
              <Flame className="w-2 h-2" /> BOOSTÉ
            </span>
          ) : isOwner ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit?.(server)}
                className="w-6 h-6 rounded flex items-center justify-center transition tap-sm"
                style={{ background: "rgba(138,79,255,0.1)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={handleDelete}
                className="w-6 h-6 rounded flex items-center justify-center transition tap-sm"
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span />
          )}
        </div>
      )}

      {/* Logo + title */}
      <div className="p-3 flex items-center gap-2.5">
        <div
          className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-sm font-black text-white shrink-0"
          style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
        >
          {hasLogo ? (
            <img src={logoUrl} alt="" className="w-full h-full object-cover" />
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
                style={{ background: "rgba(138,79,255,0.1)", color: "#8a4fff" }}
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
      </div>

      {/* Stats */}
      <div className="px-3 pb-2 flex items-center gap-2 text-[9px] text-white/40">
        <span className="flex items-center gap-0.5">
          <ArrowUp className="w-2.5 h-2.5" style={{ color: "#8a4fff" }} />
          {server.votes || 0}
        </span>
        <span className="flex items-center gap-0.5 font-bold" style={{ color: "#fbbf24" }}>
          <Flame className="w-2.5 h-2.5" style={{ color: "#fbbf24" }} />
          {boostCount} boost{boostCount !== 1 ? "s" : ""}
        </span>
        {server.max_players > 0 && (
          <span className="flex items-center gap-0.5">
            <Users className="w-2.5 h-2.5" />
            {server.players_count || 0}/{server.max_players}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 flex items-center gap-1.5">
        <button
          onClick={() => setShowVoteModal(true)}
          disabled={!voteStatus.canVote || loading}
          className="flex-1 h-7 rounded-md text-[10px] font-bold transition flex items-center justify-center gap-1 tap-sm"
          style={
            voteStatus.canVote
              ? { background: "rgba(138,79,255,0.15)", color: "#8a4fff", border: "1px solid rgba(138,79,255,0.2)" }
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
          title="Booster ce serveur"
        >
          <Zap className="w-3 h-3" />
          <span className="hidden sm:inline">Boost</span>
        </button>
        <button
          onClick={handleShare}
          className="h-7 px-2 rounded-md flex items-center justify-center gap-0.5 transition tap-sm text-[9px] font-bold"
          style={{ background: "rgba(138,79,255,0.12)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}
          title="Partager la fiche"
        >
          {copied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
        </button>
        {shareSlug && (
          <Link
            to={`/servers/${shareSlug}`}
            className="h-7 px-2 rounded-md flex items-center justify-center transition tap-sm text-[9px] font-bold"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
            title="Voir la fiche"
          >
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
        {server.discord_link && (
          <a
            href={server.discord_link}
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 px-2 rounded-md flex items-center justify-center transition tap-sm text-[9px] font-bold"
            style={{ background: `${typeConfig.color}20`, color: typeConfig.color, border: `1px solid ${typeConfig.color}30` }}
            title={server.discord_link}
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Vote modal with pseudo */}
      {showVoteModal && (
        <VoteModal
          server={server}
          voteStatus={voteStatus}
          onClose={() => setShowVoteModal(false)}
          onVoted={(data) => {
            setVoteStatus({ canVote: false, remaining: { h: 2, m: 0, s: 0 } });
            onVote(server.id, data.votes);
          }}
        />
      )}

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
    </div>
  );
}