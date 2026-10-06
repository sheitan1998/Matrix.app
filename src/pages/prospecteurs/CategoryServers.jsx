import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Trophy, ArrowUp, Flame, Server as ServerIcon } from "lucide-react";
import ProspecteursHeader from "@/components/prospecteurs/ProspecteursHeader";
import ProspecteursSidebar from "@/components/prospecteurs/ProspecteursSidebar";
import ServerDirectoryCard from "@/components/prospecteurs/ServerDirectoryCard";
import ServerSearchBar from "@/components/prospecteurs/ServerSearchBar";

const RANK_STYLES = [
  { bg: "linear-gradient(135deg, #fbbf24, #f59e0b)", glow: "rgba(251,191,36,0.3)" },
  { bg: "linear-gradient(135deg, #e5e7eb, #9ca3af)", glow: "rgba(229,231,235,0.3)" },
  { bg: "linear-gradient(135deg, #d97706, #b45309)", glow: "rgba(217,119,6,0.3)" },
];

export default function CategoryServers() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [servers, setServers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("votes_month");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const me = await base44.auth.me().catch(() => null);
        setUser(me);

        const [cats, allAds] = await Promise.all([
          base44.entities.ServerCategory.list("sort_order", 200),
          base44.entities.ServerAd.list("-created_date", 500),
        ]);

        const foundCat = cats.find((c) => c.slug === slug);
        setCategory(foundCat || null);

        const filtered = (allAds || []).filter((s) => {
          if (s.category_slug === slug) return true;
          const catSlug = (s.category || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
          return catSlug === slug;
        });
        setServers(filtered);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const sortedServers = useMemo(() => {
    const arr = [...servers];
    if (sortBy === "votes_month") {
      arr.sort((a, b) => ((b.votes_month || b.votes || 0) + (b.boosts || 0) * 2) - ((a.votes_month || a.votes || 0) + (a.boosts || 0) * 2));
    } else if (sortBy === "newest") {
      arr.sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
    } else {
      arr.sort((a, b) => ((b.votes || 0) + (b.boosts || 0) * 2) - ((a.votes || 0) + (a.boosts || 0) * 2));
    }
    return arr;
  }, [servers, sortBy]);

  const searchFiltered = useMemo(() => {
    if (!search.trim()) return sortedServers;
    const q = search.trim().toLowerCase();
    return sortedServers.filter((s) =>
      (s.title || "").toLowerCase().includes(q) ||
      (s.description || "").toLowerCase().includes(q)
    );
  }, [sortedServers, search]);

  const top10 = useMemo(() => {
    return [...servers]
      .sort((a, b) => {
        const scoreA = (a.votes_month || a.votes || 0) + (a.boosts || 0) * 2;
        const scoreB = (b.votes_month || b.votes || 0) + (b.boosts || 0) * 2;
        return scoreB - scoreA;
      })
      .slice(0, 10);
  }, [servers]);

  const handleVote = (adId, newVotes) => {
    setServers((prev) => prev.map((s) => (s.id === adId ? { ...s, votes: newVotes } : s)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#12091c" }}>
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#12091c" }}>
        <ServerIcon className="w-12 h-12 text-white/20" />
        <p className="text-sm text-white/50">Catégorie introuvable</p>
        <Link to="/prospecteurs" className="h-9 px-4 rounded-lg text-xs font-bold flex items-center gap-1.5" style={{ background: "rgba(138,79,255,0.15)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}>
          <ArrowLeft className="w-4 h-4" /> Retour à l'annuaire
        </Link>
      </div>
    );
  }

  const serverType = category.type === "discord" ? "discord" : "nexus";
  const accentColor = serverType === "discord" ? "#5865F2" : "#22c55e";

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(180deg, rgba(18,9,28,0.85) 0%, rgba(26,14,46,0.82) 40%, rgba(18,9,28,0.88) 100%)" }}>
      <ProspecteursHeader user={user} trixBalance={user?.trix_balance || 0} />
      <div className="relative z-10 flex max-w-7xl mx-auto pb-12">
        <ProspecteursSidebar active="servers" />
        <div className="flex-1 px-4 sm:px-6 py-5">
          {/* Back + breadcrumb */}
          <div className="flex items-center gap-2 mb-5">
            <button onClick={() => navigate("/prospecteurs")} className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold">Annuaire</span>
            </button>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-xs font-bold text-white">{category.name}</span>
          </div>

          {/* Category banner */}
          <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden mb-5">
            {category.image_url ? (
              <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accentColor}15, rgba(18,9,28,0.8))` }} />
            )}
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(18,9,28,0.3) 0%, rgba(18,9,28,0.9) 100%)" }} />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-white">{category.name}</h1>
                <span className="text-[10px] text-white/40">{servers.length} serveur{servers.length !== 1 ? "s" : ""}</span>
              </div>
              {category.badge && (
                <span className="text-[9px] font-black px-2 py-1 rounded uppercase tracking-wider" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
                  {category.badge}
                </span>
              )}
            </div>
          </div>

          {/* Top 10 spécifique à la catégorie */}
          {top10.length > 0 && (
            <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(18,9,28,0.6)", border: `1px solid ${accentColor}30` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40` }}>
                  <Trophy className="w-4 h-4" style={{ color: accentColor }} />
                </div>
                <h3 className="text-xs font-black tracking-wider uppercase text-white">Top 10 - {category.name}</h3>
                <span className="text-[8px] text-white/30 ml-auto">Ce mois-ci</span>
              </div>
              <div className="space-y-1">
                {top10.map((server, i) => {
                  const rankStyle = i < 3 ? RANK_STYLES[i] : null;
                  const logoUrl = server.logo_url || server.profile_image || server.server_icon;
                  const initial = server.title?.[0]?.toUpperCase() || "S";
                  const score = (server.votes_month || server.votes || 0) + (server.boosts || 0) * 2;
                  const shareSlug = server.slug || server.id;
                  return (
                    <Link key={server.id} to={`/servers/${shareSlug}`} className="flex items-center gap-2 p-1.5 rounded-lg transition hover:bg-white/5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0" style={{ background: rankStyle ? rankStyle.bg : "rgba(138,79,255,0.1)", color: rankStyle ? "#fff" : "rgba(255,255,255,0.4)", boxShadow: rankStyle ? `0 0 6px ${rankStyle.glow}` : "none" }}>
                        {i + 1}
                      </div>
                      <div className="w-6 h-6 rounded overflow-hidden flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}>
                        {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-cover" /> : initial}
                      </div>
                      <span className="flex-1 text-[10px] font-bold text-white/80 truncate">{server.title}</span>
                      <span className="text-[9px] font-black flex items-center gap-0.5" style={{ color: accentColor }}>
                        <ArrowUp className="w-2.5 h-2.5" />{score}
                      </span>
                      {server.is_boosted && <Flame className="w-2.5 h-2.5" style={{ color: "#fbbf24" }} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Server list */}
          <div className="rounded-2xl p-4 sm:p-5" style={{ background: "rgba(18,9,28,0.6)", border: `1px solid ${accentColor}30` }}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-black tracking-wider uppercase text-white">Tous les serveurs</h2>
              <span className="text-[9px] text-white/40 ml-auto">{searchFiltered.length} serveur{searchFiltered.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="mb-4">
              <ServerSearchBar search={search} onSearchChange={setSearch} sortBy={sortBy} onSortChange={setSortBy} resultCount={searchFiltered.length} />
            </div>
            {searchFiltered.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ background: "rgba(18,9,28,0.4)", border: "1px dashed rgba(138,79,255,0.15)" }}>
                <ServerIcon className="w-8 h-8 mx-auto mb-2 text-white/20" />
                <p className="text-xs text-white/40">Aucun serveur dans cette catégorie</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchFiltered.map((server, i) => (
                  <ServerDirectoryCard key={server.id} server={server} rank={i + 1} onVote={handleVote} currentUser={user} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}