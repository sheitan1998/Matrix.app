import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Trophy, Server as ServerIcon, MessageCircle } from "lucide-react";
import ProspecteursHeader from "@/components/prospecteurs/ProspecteursHeader";
import ProspecteursSidebar from "@/components/prospecteurs/ProspecteursSidebar";
import ServerDirectoryCard from "@/components/prospecteurs/ServerDirectoryCard";
import ServerSearchBar from "@/components/prospecteurs/ServerSearchBar";
import ServerRankingBlock from "@/components/prospecteurs/ServerRankingBlock";
import { fetchUniverseServers, sortByScore } from "@/lib/serverDirectory";

const UNIVERSES = {
  nexus: { label: "Serveurs Nexus", color: "#22c55e", icon: ServerIcon },
  discord: { label: "Serveurs Discord", color: "#5865F2", icon: MessageCircle },
};

export default function CategoryServers() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [universe, setUniverse] = useState("nexus");
  const [servers, setServers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("votes_month");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      base44.auth.me().then(setUser).catch(() => setUser(null));

      const cats = await base44.entities.ServerCategory.filter({ slug }, "sort_order", 1);
      const cat = cats[0] || null;
      setCategory(cat);
      if (!cat) { setLoading(false); return; }

      // A category belongs to one universe; "both" categories follow the tab the user came from
      const requested = searchParams.get("type") === "discord" ? "discord" : "nexus";
      const uni = cat.type === "both" ? requested : cat.type;
      setUniverse(uni);

      const list = await fetchUniverseServers(uni, { $or: [{ category_slug: slug }, { category: cat.name }] });
      setServers(list || []);
      setLoading(false);
    };
    fetchData();
  }, [slug, searchParams]);

  const top5 = useMemo(() => sortByScore(servers).slice(0, 5), [servers]);

  const visibleServers = useMemo(() => {
    let arr = servers;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter((s) => (s.title || "").toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q));
    }
    if (sortBy === "newest") return [...arr].sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
    if (sortBy === "votes_month") return sortByScore(arr);
    return [...arr].sort((a, b) => ((b.votes || 0) + (b.boosts || 0) * 2) - ((a.votes || 0) + (a.boosts || 0) * 2));
  }, [servers, search, sortBy]);

  const handleVote = (adId, data) => {
    setServers((prev) => prev.map((s) => (s.id === adId ? {
      ...s,
      votes: data.votes ?? s.votes,
      votes_month: data.votes_month ?? s.votes_month,
      clicks: data.clicks ?? s.clicks,
      clicks_month: data.clicks_month ?? s.clicks_month,
    } : s)));
  };

  if (!loading && !category) {
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

  const uniConfig = UNIVERSES[universe];
  const UniIcon = uniConfig.icon;
  const accentColor = uniConfig.color;

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(180deg, rgba(18,9,28,0.85) 0%, rgba(26,14,46,0.82) 40%, rgba(18,9,28,0.88) 100%)" }}>
      <ProspecteursHeader user={user} trixBalance={user?.trix_balance || 0} />
      <div className="relative z-10 flex max-w-7xl mx-auto pb-12">
        <ProspecteursSidebar active="servers" />
        <div className="flex-1 px-4 sm:px-6 py-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5">
            <button onClick={() => navigate("/prospecteurs")} className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold">Annuaire</span>
            </button>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-xs font-bold" style={{ color: accentColor }}>{uniConfig.label}</span>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-xs font-bold text-white">{category?.name || "..."}</span>
          </div>

          {/* Category banner */}
          <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden mb-5">
            {category?.image_url ? (
              <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accentColor}15, rgba(18,9,28,0.8))` }} />
            )}
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(18,9,28,0.3) 0%, rgba(18,9,28,0.9) 100%)" }} />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded uppercase mb-1" style={{ background: `${accentColor}25`, color: accentColor }}>
                  <UniIcon className="w-2.5 h-2.5" /> {uniConfig.label}
                </span>
                <h1 className="text-lg sm:text-2xl font-black text-white">{category?.name}</h1>
                <span className="text-[10px] text-white/40">{servers.length} serveur{servers.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>

          {/* Top 5 of this category (same universe only) */}
          <div className="mb-5">
            <ServerRankingBlock
              title={`Top 5 ${category?.name || ""}`}
              icon={Trophy}
              servers={top5}
              accentColor={accentColor}
              loading={loading}
              emptyText="Aucun serveur classé dans cette catégorie pour le moment"
            />
          </div>

          {/* Full list */}
          <div className="rounded-2xl p-4 sm:p-5" style={{ background: "rgba(18,9,28,0.6)", border: `1px solid ${accentColor}30` }}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-black tracking-wider uppercase text-white">Tous les serveurs {category?.name}</h2>
              <span className="text-[9px] text-white/40 ml-auto">{visibleServers.length} serveur{visibleServers.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="mb-4">
              <ServerSearchBar search={search} onSearchChange={setSearch} sortBy={sortBy} onSortChange={setSortBy} resultCount={visibleServers.length} />
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: "rgba(138,79,255,0.05)" }} />
                ))}
              </div>
            ) : visibleServers.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ background: "rgba(18,9,28,0.4)", border: "1px dashed rgba(138,79,255,0.15)" }}>
                <ServerIcon className="w-8 h-8 mx-auto mb-2 text-white/20" />
                <p className="text-xs text-white/40">Aucun serveur dans cette catégorie</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleServers.map((server, i) => (
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