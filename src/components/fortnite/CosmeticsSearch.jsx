import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Search, Shirt } from "lucide-react";
import { motion } from "framer-motion";

const RARITY_COLORS = {
  common: { bg: "rgba(158,158,158,0.15)", border: "rgba(158,158,158,0.4)", text: "#9e9e9e" },
  uncommon: { bg: "rgba(76,175,80,0.15)", border: "rgba(76,175,80,0.4)", text: "#4caf50" },
  rare: { bg: "rgba(33,150,243,0.15)", border: "rgba(33,150,243,0.4)", text: "#2196f3" },
  epic: { bg: "rgba(156,39,176,0.15)", border: "rgba(156,39,176,0.4)", text: "#9c27b0" },
  legendary: { bg: "rgba(255,152,0,0.15)", border: "rgba(255,152,0,0.4)", text: "#ff9800" },
  mythic: { bg: "rgba(244,67,54,0.15)", border: "rgba(244,67,54,0.4)", text: "#f44336" },
  marvel: { bg: "rgba(233,30,99,0.15)", border: "rgba(233,30,99,0.4)", text: "#e91e63" },
  dc: { bg: "rgba(63,81,181,0.15)", border: "rgba(63,81,181,0.4)", text: "#3f51b5" },
  icon: { bg: "rgba(0,188,212,0.15)", border: "rgba(0,188,212,0.4)", text: "#00bcd4" },
  starwars: { bg: "rgba(255,235,59,0.15)", border: "rgba(255,235,59,0.4)", text: "#ffeb3b" },
  gaminglegends: { bg: "rgba(139,195,74,0.15)", border: "rgba(139,195,74,0.4)", text: "#8bc34a" },
};

function getRarityStyle(rarity) {
  const key = (rarity || "common").toLowerCase().replace(/\s/g, "");
  return RARITY_COLORS[key] || RARITY_COLORS.common;
}

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

export default function CosmeticsSearch() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (searchQuery, searchType) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await base44.functions.invoke("fortniteApi", {
        action: "searchCosmetics",
        query: searchQuery.trim(),
        type: searchType,
        page: 1,
        limit: 24,
      });
      setResults(res.data?.items || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query, type);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Shirt className="w-4 h-4" style={{ color: "#22c55e" }} />
        <h2 className="text-sm font-black text-white uppercase tracking-tight">Cosmétiques</h2>
        <span className="text-[9px] text-white/30 uppercase tracking-wider ml-auto">Skins, Pioches, Emotes...</span>
      </div>

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
            <option key={value} value={value}>{label}</option>
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
          <p className="text-[10px] text-white/30 mb-3">{results.length} résultat{results.length > 1 ? "s" : ""}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
            {results.map((item, i) => (
              <CosmeticCard key={item.id || i} item={item} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CosmeticCard({ item, index = 0 }) {
  const style = getRarityStyle(item.rarity);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      className="rounded-lg overflow-hidden flex flex-col"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      <div className="relative aspect-square overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl opacity-20">🎨</span>
          </div>
        )}
      </div>
      <div className="p-1.5 sm:p-2">
        <p className="text-[9px] sm:text-[10px] font-bold text-white truncate">{item.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[8px] sm:text-[9px] uppercase" style={{ color: style.text }}>{item.type}</span>
          {item.series && (
            <span className="text-[8px] sm:text-[9px] font-bold" style={{ color: style.text }}>{item.series}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}