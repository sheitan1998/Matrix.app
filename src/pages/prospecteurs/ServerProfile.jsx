import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowUp, Flame, Share2, ExternalLink, Zap, Globe, Plus,
  Server as ServerIcon, MessageCircle, Copy, Check, Loader2, Pencil, Trash2,
} from "lucide-react";
import BoostAdModal from "@/components/prospecteurs/BoostAdModal";
import VoteModal from "@/components/prospecteurs/VoteModal";
import ServerApiPanel from "@/components/prospecteurs/ServerApiPanel";
import { serverTags, TAG_CHIP_CLASS, tagChipStyle } from "@/lib/serverTags";
import LiveStatusBadge from "@/components/prospecteurs/LiveStatusBadge";
import ServerGallery from "@/components/prospecteurs/ServerGallery";
import ReviewsSection from "@/components/prospecteurs/ReviewsSection";
import { slugify } from "@/lib/serverDirectory";
import usePageSEO from "@/hooks/usePageSEO";
import SeoBreadcrumbs from "@/components/seo/SeoBreadcrumbs";
import { buildServerSeo } from "@/lib/serverSeo";
import ServerSeoContent from "@/components/prospecteurs/ServerSeoContent";

export default function ServerProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voteStatus, setVoteStatus] = useState({ canVote: true, remaining: null });
  const [voting, setVoting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [user, setUser] = useState(null);

  // SEO : title, description, canonical, Open Graph et JSON-LD uniques,
  // construits uniquement à partir des informations réelles du serveur.
  const seo = useMemo(() => (server ? buildServerSeo(server) : {}), [server]);
  usePageSEO(seo);

  useEffect(() => {
    const fetchServer = async () => {
      try {
        const me = await base44.auth.me().catch(() => null);
        setUser(me);

        const res = await base44.functions.invoke("serverSearch", {
          action: "getServerBySlug",
          slug,
        });
        if (res.data?.id) {
          setServer(res.data);
          base44.functions.invoke("serverSearch", { action: "trackClick", serverAdId: res.data.id }).catch(() => {});
        } else {
          setError("Serveur introuvable");
        }
      } catch {
        setError("Serveur introuvable");
      } finally {
        setLoading(false);
      }
    };
    fetchServer();
  }, [slug]);

  // Check vote status
  useEffect(() => {
    if (!server?.id) return;
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
  }, [server?.id]);

  // Countdown timer
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

  const handleVote = () => {
    if (!voteStatus.canVote) return;
    setShowVoteModal(true);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/servers/${server?.slug || server?.id || ""}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer ce serveur ?")) return;
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "deleteAd",
        serverAdId: server.id,
      });
      if (res.data?.success) {
        toast.success("Serveur supprimé");
        navigate("/best-serveurs");
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#12091c" }}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#12091c" }}>
        <ServerIcon className="w-12 h-12 text-white/20" />
        <p className="text-sm text-white/50">{error || "Serveur introuvable"}</p>
        <Link
          to="/best-serveurs"
          className="h-9 px-4 rounded-lg text-xs font-bold flex items-center gap-1.5 tap-sm"
          style={{ background: "rgba(138,79,255,0.15)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'annuaire
        </Link>
      </div>
    );
  }

  const serverType = server.server_type || "nexus";
  const typeConfig = {
    nexus: { color: "#22c55e", label: "NEXUS", icon: ServerIcon },
    discord: { color: "#5865F2", label: "DISCORD", icon: MessageCircle },
  };
  const config = typeConfig[serverType] || typeConfig.nexus;
  const TypeIcon = config.icon;

  const logoUrl = server.logo_url || server.profile_image;
  const bannerUrl = server.banner_url || server.cover_image;
  const initial = server.title?.[0]?.toUpperCase() || "S";
  const isOwner = !!server.is_owner;
  const score = (server.votes_month || server.votes || 0) + (server.boosts || 0) * 2;
  const fmt = (n) => String(n).padStart(2, "0");
  const shareSlug = server.slug || server.id;

  return (
    <div className="min-h-screen" style={{ background: "#12091c" }}>
      <div className="relative">
      {/* Publier son serveur — haut à droite de la bannière */}
      <Link
        to="/best-serveurs?publish=1"
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 h-9 px-3 rounded-lg text-xs font-black flex items-center gap-1.5 tap-sm"
        style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)", color: "#fff", boxShadow: "0 0 14px rgba(138,79,255,0.45)" }}
      >
        <Plus className="w-4 h-4" /> Publier son serveur
      </Link>
      {/* Banner */}
      {bannerUrl ? (
        <div className="relative h-40 sm:h-56 w-full overflow-hidden">
          <img
            src={bannerUrl}
            alt={`Bannière du serveur ${server.title} sur Matrix Hub`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(18,9,28,0.3) 0%, rgba(18,9,28,0.9) 100%)" }} />
        </div>
      ) : (
        <div
          className="h-32 w-full"
          style={{ background: `linear-gradient(135deg, ${config.color}15, rgba(18,9,28,0.8))` }}
        />
      )}
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-12 relative pb-12">
        {/* Logo + title */}
        <div className="flex items-end gap-3 mb-4">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-black text-white shrink-0"
            style={{
              background: "linear-gradient(135deg, #8a4fff, #5b21b6)",
              border: "4px solid #12091c",
            }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`Logo du serveur ${server.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black text-white">{server.title}</h1>
              <LiveStatusBadge server={server} className="!text-[10px] !px-2 !py-1" />
              <span
                className="text-[8px] font-black px-2 py-0.5 rounded inline-flex items-center gap-1"
                style={{ background: `${config.color}20`, color: config.color }}
              >
                <TypeIcon className="w-2.5 h-2.5" /> {config.label}
              </span>
              {server.is_boosted && (
                <span
                  className="text-[8px] font-black px-2 py-0.5 rounded inline-flex items-center gap-1"
                  style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}
                >
                  <Flame className="w-2.5 h-2.5" /> BOOSTÉ
                </span>
              )}
            </div>
            {server.game && (
              <p className="text-xs text-white/40 mt-0.5">{server.game}</p>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            to="/best-serveurs"
            className="h-9 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 tap-sm"
            style={{ background: "rgba(138,79,255,0.1)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Annuaire
          </Link>

          <button
            onClick={handleVote}
            disabled={!voteStatus.canVote}
            className="flex-1 h-9 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 tap-sm"
            style={
              voteStatus.canVote
                ? { background: "linear-gradient(135deg, #8a4fff, #5b21b6)", color: "#fff", boxShadow: "0 0 12px rgba(138,79,255,0.25)" }
                : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)" }
            }
          >
            {voting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : voteStatus.canVote ? (
              <><ArrowUp className="w-4 h-4" /> Voter pour ce serveur</>
            ) : (
              <><Flame className="w-4 h-4" /> {fmt(voteStatus.remaining.h)}:{fmt(voteStatus.remaining.m)}:{fmt(voteStatus.remaining.s)}</>
            )}
          </button>

          <button
            onClick={handleShare}
            className="h-9 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition tap-sm"
            style={{ background: "rgba(138,79,255,0.1)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copié" : "Partager"}</span>
          </button>

          <button
            onClick={() => setShowBoost(true)}
            className="h-9 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition tap-sm"
            style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Boost</span>
          </button>

          {server.discord_link && (
            <a
              href={server.discord_link}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition tap-sm"
              style={{ background: `${config.color}20`, color: config.color, border: `1px solid ${config.color}30` }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rejoindre le serveur</span>
            </a>
          )}
          {server.website_url && (
            <a
              href={server.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition tap-sm"
              style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voir le site</span>
            </a>
          )}
        </div>

        <SeoBreadcrumbs
          className="mt-1"
          items={[
            { label: "Accueil", href: "/" },
            { label: "Best Serveur", href: "/best-serveurs" },
            { label: server.title },
          ]}
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
            <ArrowUp className="w-4 h-4 mx-auto mb-1" style={{ color: "#8a4fff" }} />
            <p className="text-lg font-black text-white">{server.votes || 0}</p>
            <p className="text-[8px] text-white/40 uppercase tracking-wider">Votes totaux</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
            <Flame className="w-4 h-4 mx-auto mb-1" style={{ color: "#fbbf24" }} />
            <p className="text-lg font-black text-white">{server.votes_month || 0}</p>
            <p className="text-[8px] text-white/40 uppercase tracking-wider">Votes ce mois</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
            <Zap className="w-4 h-4 mx-auto mb-1" style={{ color: "#f59e0b" }} />
            <p className="text-lg font-black text-white">{server.boosts || 0}</p>
            <p className="text-[8px] text-white/40 uppercase tracking-wider">Boosts</p>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
          <h2 className="text-xs font-black uppercase tracking-wider text-white mb-2">Description</h2>
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{server.description}</p>
        </div>

        <ServerGallery images={server.gallery_images} title={server.title} />

        <ReviewsSection targetType="server" targetId={server.id} isOwner={isOwner} user={user} />

        {/* Server info */}
        {(server.ip || server.category || server.website_url || serverTags(server).length > 0) && (
          <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
            <h2 className="text-xs font-black uppercase tracking-wider text-white mb-2">Informations</h2>
            <div className="space-y-1.5">
              {server.category && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40">Catégorie</span>
                  <Link
                    to={`/best-serveurs/category/${server.category_slug || slugify(server.category)}`}
                    className="text-[10px] font-bold text-white hover:text-purple-300 transition tap-sm"
                  >
                    {server.category}
                  </Link>
                </div>
              )}
              {serverTags(server).length > 0 && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] text-white/40 shrink-0">Étiquettes</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {serverTags(server).map((tag) => (
                      <Link
                        key={tag}
                        to={`/best-serveurs?view=list&tag=${encodeURIComponent(tag)}`}
                        className={TAG_CHIP_CLASS}
                        style={tagChipStyle(tag)}
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {server.ip && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40">Adresse IP</span>
                  <span className="text-[10px] font-bold text-white font-mono">{server.ip}{server.port ? `:${server.port}` : ""}</span>
                </div>
              )}
              {server.website_url && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40">Site web</span>
                  <a
                    href={server.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold flex items-center gap-1 transition"
                    style={{ color: "#22c55e" }}
                  >
                    <Globe className="w-3 h-3" />
                    {server.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "").slice(0, 30)}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <ServerSeoContent server={server} />

        {/* Owner actions */}
        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              to="/best-serveurs"
              className="h-8 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1 tap-sm"
              style={{ background: "rgba(138,79,255,0.1)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}
            >
              <Pencil className="w-3 h-3" /> Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="h-8 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1 tap-sm"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <Trash2 className="w-3 h-3" /> Supprimer
            </button>
          </div>
        )}

        {/* Share URL */}
        <div className="mt-4 rounded-xl p-3 flex items-center gap-2" style={{ background: "rgba(18,9,28,0.4)", border: "1px dashed rgba(138,79,255,0.15)" }}>
          <Copy className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <input
            readOnly
            value={`${window.location.origin}/servers/${shareSlug}`}
            className="flex-1 bg-transparent text-[10px] text-white/40 outline-none"
            onClick={(e) => e.target.select()}
          />
          <button
            onClick={handleShare}
            className="text-[9px] font-bold text-purple-400 hover:text-purple-300 transition tap-sm"
          >
            Copier
          </button>
        </div>

        {isOwner && <ServerApiPanel server={server} />}
      </div>

      {showVoteModal && (
        <VoteModal
          server={server}
          voteStatus={voteStatus}
          onClose={() => setShowVoteModal(false)}
          onVoted={(data) => {
            setVoteStatus({ canVote: false, remaining: { h: 2, m: 0, s: 0 } });
            setServer((prev) => ({
              ...prev,
              votes: data.votes,
              votes_month: data.votes_month,
              clicks: data.clicks,
              clicks_month: data.clicks_month,
            }));
          }}
        />
      )}

      {showBoost && (
        <BoostAdModal
          adId={server.id}
          adTitle={server.title}
          flashBoosts={user?.flash_boosts || 0}
          trixBalance={user?.trix_balance || 0}
          onBoosted={(data) => {
            setServer((prev) => ({
              ...prev,
              boosts: data.boosts,
              votes: data.votes ?? prev.votes,
              votes_month: data.votes_month ?? prev.votes_month,
              clicks: data.clicks ?? prev.clicks,
              clicks_month: data.clicks_month ?? prev.clicks_month,
            }));
          }}
          onClose={() => setShowBoost(false)}
        />
      )}
    </div>
  );
}