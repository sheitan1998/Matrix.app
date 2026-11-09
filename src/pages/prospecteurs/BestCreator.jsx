import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Sparkles, Trophy, Youtube, Twitch, Zap } from "lucide-react";
import { toast } from "sonner";
import usePageSEO from "@/hooks/usePageSEO";
import ProspecteursHeader from "@/components/prospecteurs/ProspecteursHeader";
import ProspecteursSidebar from "@/components/prospecteurs/ProspecteursSidebar";
import CreatorPlatformCards from "@/components/prospecteurs/CreatorPlatformCards";
import CreatorRankingBlock from "@/components/prospecteurs/CreatorRankingBlock";
import CreatorSearchBar from "@/components/prospecteurs/CreatorSearchBar";
import CreatorChannelCard from "@/components/prospecteurs/CreatorChannelCard";
import CreateCreatorModal from "@/components/prospecteurs/CreateCreatorModal";
import CreatorAutoVoteModal from "@/components/prospecteurs/CreatorAutoVoteModal";

const score = (c) => (c.votes_month || 0) + (c.boosts || 0) * 2;

export default function BestCreator() {
  usePageSEO({
    title: "Best Creator - Classement des chaînes YouTube & Twitch | MATRIX",
    description: "Découvrez, publiez et votez pour les meilleures chaînes YouTube et Twitch de la communauté MATRIX. Classement général et par plateforme.",
    path: "/best-creator",
  });

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("votes_month");
  const [showForm, setShowForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [showAutoVote, setShowAutoVote] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    let active = true;
    setLoading(true);
    base44.entities.CreatorChannel
      .list("-votes_month", 200)
      .then((res) => {
        if (active) setCreators(res?.items || res || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const counts = useMemo(() => ({
    all: creators.length,
    youtube: creators.filter((c) => c.platform === "youtube").length,
    twitch: creators.filter((c) => c.platform === "twitch").length,
  }), [creators]);

  const generalTop = useMemo(() => [...creators].sort((a, b) => score(b) - score(a)).slice(0, 5), [creators]);
  const youtubeTop = useMemo(
    () => creators.filter((c) => c.platform === "youtube").sort((a, b) => score(b) - score(a)).slice(0, 5),
    [creators]
  );
  const twitchTop = useMemo(
    () => creators.filter((c) => c.platform === "twitch").sort((a, b) => score(b) - score(a)).slice(0, 5),
    [creators]
  );

  const visible = useMemo(() => {
    let arr = platform ? creators.filter((c) => c.platform === platform) : creators;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter((c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q) ||
        (c.owner_name || "").toLowerCase().includes(q)
      );
    }
    const copy = [...arr];
    if (sortBy === "newest") {
      copy.sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
    } else if (sortBy === "general") {
      copy.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    } else {
      copy.sort((a, b) => score(b) - score(a));
    }
    return copy;
  }, [creators, platform, search, sortBy]);

  const handleVote = (creatorId, data) => {
    setCreators((prev) => prev.map((c) => (c.id === creatorId
      ? { ...c, votes: data.votes ?? c.votes, votes_month: data.votes_month ?? c.votes_month }
      : c)));
  };

  const openCreate = () => {
    if (!user) {
      toast.info("Connecte-toi pour publier ta chaîne");
      navigate("/login?returnTo=" + encodeURIComponent(window.location.pathname));
      return;
    }
    setEditingChannel(null);
    setShowForm(true);
  };

  const openEdit = (creator) => {
    setEditingChannel(creator);
    setShowForm(true);
  };

  const handleSaved = (channel) => {
    if (!channel) return;
    setCreators((prev) => {
      const exists = prev.some((c) => c.id === channel.id);
      return exists
        ? prev.map((c) => (c.id === channel.id ? { ...c, ...channel } : c))
        : [channel, ...prev];
    });
    setShowForm(false);
    toast.success(editingChannel ? "Chaîne mise à jour !" : "Chaîne publiée !");
  };

  // Quota : 3 chaînes maximum par plateforme et par utilisateur.
  const ownedCounts = useMemo(() => {
    const mine = user ? creators.filter((c) => c.owner_email === user.email) : [];
    return {
      youtube: mine.filter((c) => c.platform === "youtube").length,
      twitch: mine.filter((c) => c.platform === "twitch").length,
    };
  }, [creators, user]);

  const hasVoteAuto = !!user?.has_vote_auto &&
    (!user?.vote_auto_until || new Date(user.vote_auto_until).getTime() > Date.now());

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: "linear-gradient(180deg, rgba(18,9,28,0.85) 0%, rgba(26,14,46,0.82) 40%, rgba(18,9,28,0.88) 100%)",
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/media/tuto-gaming/3215bd138_Gemini_Generated_Image_fjt2ptfjt2ptfjt2.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          zIndex: 0,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(18,9,28,0.55) 0%, rgba(18,9,28,0.4) 50%, rgba(18,9,28,0.7) 100%)",
          zIndex: 1,
        }}
      />

      <ProspecteursHeader user={user} trixBalance={user?.trix_balance || 0} />

      <div className="relative z-10 flex max-w-7xl mx-auto pb-12">
        <ProspecteursSidebar
          active="creators"
          user={user}
          onConfigureVoteAuto={() => setShowAutoVote(true)}
        />

        <div className="flex-1 px-4 sm:px-6 py-5 min-w-0">
          {/* Retour + Publier */}
          <div className="flex items-center justify-between mb-5 gap-2">
            <Link to="/" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold">Retour au Hub</span>
            </Link>
            <div className="flex items-center gap-2">
              {hasVoteAuto && (
                <button
                  onClick={() => setShowAutoVote(true)}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition hover:opacity-90 tap-sm"
                  style={{ background: "rgba(191,0,255,0.12)", color: "#d946ef", border: "1px solid rgba(191,0,255,0.25)" }}
                >
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Vote Auto</span>
                </button>
              )}
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold text-white transition hover:opacity-90 tap-sm"
                style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)", boxShadow: "0 0 12px rgba(168,85,247,0.25)" }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Publier ma chaîne</span>
                <span className="sm:hidden">Publier</span>
              </button>
            </div>
          </div>

          {/* Titre */}
          <div className="flex items-center gap-2 mb-5">
            <div
              className="flex-1 h-10 px-5 rounded-xl flex items-center gap-2"
              style={{ background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.25)" }}
            >
              <Sparkles className="w-4 h-4" style={{ color: "#a855f7", filter: "drop-shadow(0 0 6px rgba(168,85,247,0.8))" }} />
              <span className="text-xs font-black tracking-wider uppercase text-white">Best Creator</span>
              <span className="text-[9px] text-white/40 ml-1">· YouTube &amp; Twitch réunis</span>
            </div>
            <div
              className="h-10 px-3 rounded-xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-1.5"
              style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Classement</span>
            </div>
          </div>

          {/* Catégories : Toutes / YouTube / Twitch */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-black tracking-wider uppercase text-white">Catégories</h2>
              <span className="text-[9px] text-white/40 ml-auto">2 plateformes</span>
            </div>
            <CreatorPlatformCards
              selected={platform}
              onSelect={setPlatform}
              counts={counts}
              loading={loading}
            />
          </div>

          {/* Classements : général + par plateforme */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            <CreatorRankingBlock
              title="Classement général"
              creators={generalTop}
              accentColor="#a855f7"
              loading={loading}
              emptyText="Aucune chaîne classée"
            />
            <CreatorRankingBlock
              title="Top YouTube"
              creators={youtubeTop}
              accentColor="#FF0000"
              loading={loading}
              emptyText="Aucune chaîne YouTube"
            />
            <CreatorRankingBlock
              title="Top Twitch"
              creators={twitchTop}
              accentColor="#9146FF"
              loading={loading}
              emptyText="Aucune chaîne Twitch"
            />
          </div>

          {/* Liste des chaînes */}
          <div className="rounded-2xl p-4 sm:p-5" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(168,85,247,0.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-black tracking-wider uppercase text-white">
                {platform === "youtube" ? "Chaînes YouTube" : platform === "twitch" ? "Chaînes Twitch" : "Toutes les chaînes"}
              </h2>
              <span className="text-[9px] text-white/40 ml-auto">
                {visible.length} chaîne{visible.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="mb-4">
              <CreatorSearchBar
                search={search}
                onSearchChange={setSearch}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ background: "rgba(18,9,28,0.4)", border: "1px dashed rgba(138,79,255,0.15)" }}>
                <Youtube className="w-8 h-8 mx-auto mb-2 text-white/15" />
                <Twitch className="w-8 h-8 mx-auto mb-2 text-white/15" />
                <p className="text-xs text-white/40 mb-3">Aucune chaîne pour le moment</p>
                <button
                  onClick={openCreate}
                  className="h-9 px-4 rounded-lg text-xs font-bold text-white tap-sm"
                  style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
                >
                  Publier la première chaîne
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visible.map((creator, i) => (
                  <CreatorChannelCard
                    key={creator.id}
                    creator={creator}
                    rank={i + 1}
                    user={user}
                    onVote={handleVote}
                    onEdit={openEdit}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <CreateCreatorModal
          channel={editingChannel}
          ownedCounts={ownedCounts}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}

      {showAutoVote && user && (
        <CreatorAutoVoteModal user={user} creators={creators} onClose={() => setShowAutoVote(false)} />
      )}
    </div>
  );
}