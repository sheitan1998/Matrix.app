import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
const REQUEST_TIMEOUT_MS = 20000;
const RETRY_DELAY_MS = 800;
const STORAGE_KEY = "nexus-game-catalog:v1";

function readStoredCatalog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.games) || !parsed.games.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function storeCatalog(games, updatedAt) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ games, updatedAt }));
  } catch (err) {
    console.warn("[useGameCatalog] cache local indisponible:", err?.message || err);
  }
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Délai dépassé (${ms} ms)`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function fetchCatalog(force) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await withTimeout(
        base44.functions.invoke("gameCatalog", { action: "catalog", refresh: force }),
        REQUEST_TIMEOUT_MS
      );
      const data = res?.data || {};
      if (data.error || !Array.isArray(data.games) || !data.games.length) {
        throw new Error(data.error || "Réponse catalogue invalide");
      }
      return data;
    } catch (err) {
      lastError = err;
      console.warn(`[useGameCatalog] tentative ${attempt}/2 échouée:`, err?.message || err);
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
  throw lastError;
}

export default function useGameCatalog() {
  const [initial] = useState(readStoredCatalog);
  const [games, setGames] = useState(initial?.games || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stale, setStale] = useState(Boolean(initial));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState("popular");
  const [format, setFormat] = useState("all");
  const [compatibility, setCompatibility] = useState("all");
  const [duration, setDuration] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [updatedAt, setUpdatedAt] = useState(initial?.updatedAt || null);
  const gamesRef = useRef(games);
  const mountedRef = useRef(true);

  useEffect(() => {
    gamesRef.current = games;
  }, [games]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async ({ silent = false, force = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const data = await fetchCatalog(force);
      if (!mountedRef.current) return;
      setError("");
      setGames(data.games);
      setStale(Boolean(data.stale));
      setUpdatedAt(data.updated_at || null);
      if (!data.stale) storeCatalog(data.games, data.updated_at || null);
    } catch (err) {
      console.error("[useGameCatalog] catalogue live indisponible:", err?.message || err);
      if (!mountedRef.current) return;
      if (gamesRef.current.length) {
        setStale(true);
      } else if (!silent) {
        setError("Impossible de joindre le catalogue. Réessaie dans un instant.");
      }
    } finally {
      if (mountedRef.current && !silent) setLoading(false);
    }
  }, []);

  // Chargement initial puis vérification périodique : le nombre de jeux suit le flux.
  useEffect(() => {
    load();
    const timer = setInterval(() => load({ silent: true }), REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
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
    refresh: () => load({ silent: true, force: true }),
    reload: () => load({ force: true }),
    stale,
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