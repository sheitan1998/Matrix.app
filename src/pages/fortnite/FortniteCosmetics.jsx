import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Shirt, Loader2, ArrowLeft, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { getRarityStyle } from "@/components/fortnite/rarityUtils";
import CosmeticDetailModal from "@/components/fortnite/CosmeticDetailModal";
import usePageSEO from "@/hooks/usePageSEO";

const TYPE_LABELS = {
  all: "Tous",
  outfit: "Skins",
  backbling: "Sacs",
  pickaxe: "Pioches",
  emote: "Emotes",
  glider: "Deltaplanes",
  wrap: "Habillages",
  music: "Musiques",
  spray: "Tags",
  toy: "Jouets",
  dance: "Danses",
  loadingscreen: "Écrans",
  skydive: "Trails",
  contrail: "Trails",
  emoji: "Emojis",
  pet: "Animaux",
};

export default function FortniteCosmetics() {
  usePageSEO({
    title: "Cosmétiques Fortnite | MATRIX",
    description: "Recherchez et votez pour vos cosmétiques Fortnite préférés. Skins, pioches, sacs, emotes et plus encore.",
    path: "/fortnite-cosmetics",
  });

  const [tab, setTab] = useState("search");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const handleSearch = useCallback(async (searchQuery, searchType) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await base44.functions.invoke("fortniteApi", {
        action: "searchCosmetics",
        query: searchQuery.trim(),
        type: searchType,
      });
      setResults(res.data || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const res = await base44.functions.invoke("fortniteApi", { action: "getCosmeticLeaderboard" });
      setLeaderboard(res.data || []);
    } catch {
      /* silent */
    }
    setLeaderboardLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    base44.auth.me().then(setUser).catch(() => {});
  }, [fetchLeaderboard]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query, type);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto pb-12">
      {/* Back */}
      <Link to="/fortnite-maps" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition mb-5 tap-sm">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-bold">Cartes Fortnite</span>
      </Link>

      {/* Title */}
      <div className="flex items-center gap-2 mb-1">
        <Shirt className="w-5 h-5" style={{ color: "#22c55e" }} />
        <h1 className="text-2xl font-black text-white">Cosmétiques Fortnite</h1>
      </div>
      <p className="text-xs text-white/40 mb-4">Recherchez et votez pour vos cosmétiques préférés</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-white/10">
        <button
          onClick={() => setTab("search")}
          className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition tap-sm ${
            tab === "search" ? "text-white border-[#22c55e]" : "text-white/40 border-transparent hover:text-white/60"
          }`}
        >
          Recherche
        </button>
        <button
          onClick={() => {
            setTab("leaderboard");
            fetchLeaderboard();
          }}
          className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition tap-sm ${
            tab === "leaderboard" ? "text-white border-[#22c55e]" : "text-white/40 border-transparent hover:text-white/60"
          }`}
        >
          Classement
        </button>
      </div>

      {/* Search tab */}
      {tab === "search" && (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un cosmétique (ex: Galaxy, Renegade, Floss)..."
                className="w-full h-11 px-4 pr-10 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
                style={{ background: "rgba(13,5,24,0.7)", border: "1.5px solid rgba(34,197,94,0.25)" }}
              />
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#22c55e" }} />
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-11 px-3 rounded-lg text-sm text-white outline-none"
              style={{ background: "rgba(13,5,24,0.7)", border: "1.5px solid rgba(34,197,94,0.25)", colorScheme: "dark" }}
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 h-11 rounded-lg text-xs font-black text-white transition hover:opacity-90 disabled:opacity-50 tap-sm whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Rechercher"}
            </button>
          </form>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-white/30" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-white/40">Aucun cosmétique trouvé pour "{query}"</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <p className="text-[10px] text-white/30 mb-3">
                {results.length} résultat{results.length > 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                {results.map((item, i) => (
                  <CosmeticCard key={item.id || i} item={item} index={i} onClick={() => setSelectedItem(item)} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Leaderboard tab */}
      {tab === "leaderboard" && (
        leaderboardLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-white/30" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-sm text-white/40">Aucun vote pour le moment.</p>
            <p className="text-xs text-white/30 mt-1">Votez pour vos cosmétiques préférés dans l'onglet Recherche !</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((item, i) => {
              const style = getRarityStyle(item.cosmetic_rarity);
              return (
                <motion.div
                  key={item.cosmetic_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition hover:scale-[1.01]"
                  style={{ background: style.bg, border: `1px solid ${style.border}` }}
                  onClick={() =>
                    setSelectedItem({
                      id: item.cosmetic_id,
                      name: item.cosmetic_name,
                      type: item.cosmetic_type,
                      image: item.cosmetic_image,
                      rarity: item.cosmetic_rarity,
                    })
                  }
                >
                  <span
                    className="text-lg font-black w-8 text-center"
                    style={{ color: i < 3 ? "#fbbf24" : "rgba(255,255,255,0.3)" }}
                  >
                    #{i + 1}
                  </span>
                  {item.cosmetic_image && (
                    <img src={item.cosmetic_image} alt={item.cosmetic_name} className="w-10 h-10 object-contain rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{item.cosmetic_name}</p>
                    <p className="text-[10px] text-white/40 uppercase">
                      {item.cosmetic_type} · {item.votes} vote{item.votes > 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-sm font-black" style={{ color: item.score > 0 ? "#22c55e" : "#ef4444" }}>
                    {item.score > 0 ? "+" : ""}
                    {item.score}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )
      )}

      <CosmeticDetailModal cosmetic={selectedItem} onClose={() => setSelectedItem(null)} user={user} />
    </div>
  );
}

function CosmeticCard({ item, index, onClick }) {
  const style = getRarityStyle(item.rarity);
  const images = item.images || {};
  const mainImage = images.featured || images.icon || images.smallIcon || item.image;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      onClick={onClick}
      className="rounded-lg overflow-hidden flex flex-col cursor-pointer transition hover:scale-105"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      <div className="relative aspect-square overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
        {mainImage ? (
          <img src={mainImage} alt={item.name} className="w-full h-full object-contain p-2" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl opacity-20">🎨</span>
          </div>
        )}
      </div>
      <div className="p-1.5 sm:p-2">
        <p className="text-[9px] sm:text-[10px] font-bold text-white truncate">{item.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[8px] sm:text-[9px] uppercase" style={{ color: style.text }}>
            {item.type}
          </span>
          {item.series && (
            <span className="text-[8px] sm:text-[9px] font-bold" style={{ color: style.text }}>
              {item.series}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}