import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export const GAME_CATEGORIES = [
  "Action",
  "Aventure",
  "Course",
  "Sport",
  "Puzzle",
  "Arcade",
  "Stratégie",
  "Simulation",
  "Casual",
  "Réflexion",
  "Multijoueur",
];

const INITIAL_VISIBLE = 24;
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export default function useGameCatalog() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState("popular");
  const [format, setFormat] = useState("all");
  const [compatibility, setCompatibility] = useState("all");
  const [duration, setDuration] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback((silent = false, force = false) => {
    let active = true;
    base44.functions
      .invoke("gameCatalog", { action: "catalog", refresh: force })
      .then((res) => {
        if (!active) return;
        const data = res?.data || {};
        if (data.error || !Array.isArray(data.games)) {
          if (!silent) setError("Catalogue momentanément indisponible.");
          return;
        }
        setError("");
        setGames(data.games);
        setUpdatedAt(data.updated_at || null);
      })
      .catch(() => {
        if (active && !silent) setError("Impossible de joindre le catalogue. Réessaie dans un instant.");
      })
      .finally(() => {
        if (active && !silent) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Chargement initial puis vérification périodique : le nombre de jeux suit le flux.
  useEffect(() => {
    const cancel = load();
    const timer = setInterval(() => load(true), REFRESH_INTERVAL_MS);
    return () => {
      cancel();
      clearInterval(timer);
    };
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = games.filter((game) => {
      if (query) {
        const haystack = `${game.title} ${game.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (category !== "Tous" && !game.categories.includes(category)) return false;
      if (format !== "all" && game.format !== format) return false;
      if (compatibility !== "all" && game.compatibility !== compatibility) return false;
      if (duration !== "all" && game.duration !== duration) return false;
      if (difficulty !== "all" && game.difficulty !== difficulty) return false;
      return true;
    });

    if (sortBy === "alpha") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, "fr"));
    } else if (sortBy === "newest") {
      list = [...list].sort((a, b) => Number(b.id) - Number(a.id));
    }

    return list;
  }, [games, search, category, sortBy, format, compatibility, duration, difficulty]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [search, category, sortBy, format, compatibility, duration, difficulty]);

  const activeFilterCount = [
    category !== "Tous",
    format !== "all",
    compatibility !== "all",
    duration !== "all",
    difficulty !== "all",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setCategory("Tous");
    setSortBy("popular");
    setFormat("all");
    setCompatibility("all");
    setDuration("all");
    setDifficulty("all");
    setSearch("");
  };

  return {
    games,
    total: games.length,
    updatedAt,
    refresh: () => load(true, true),
    filtered,
    visibleGames: filtered.slice(0, visibleCount),
    hasMore: filtered.length > visibleCount,
    loadMore: () => setVisibleCount((count) => count + INITIAL_VISIBLE),
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    sortBy,
    setSortBy,
    format,
    setFormat,
    compatibility,
    setCompatibility,
    duration,
    setDuration,
    difficulty,
    setDifficulty,
    activeFilterCount,
    resetFilters,
  };
}