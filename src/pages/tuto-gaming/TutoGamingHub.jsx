import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, ArrowLeft, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import GameCard from "@/components/tuto-gaming/GameCard";
import { COMING_SOON_GAMES, FEATURED_GAMES } from "@/components/tuto-gaming/tutoGamingData";
import { useTutoGamingAssets, getAssetUrl, getAssetField } from "@/hooks/useTutoGamingAssets";

export default function TutoGamingHub() {
  const [games, setGames] = useState([]);
  const [questCounts, setQuestCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { assets } = useTutoGamingAssets();

  const fetchData = useCallback(async () => {
    try {
      const allGames = await base44.entities.Game.list("sort_order", 50);
      const activeGames = allGames.filter((g) => g.is_active !== false);

      // Fetch quest counts for each game
      const counts = {};
      for (const game of activeGames) {
        try {
          const quests = await base44.entities.Quest.filter({ game_slug: game.slug });
          counts[game.slug] = quests.length;
        } catch {
          counts[game.slug] = 0;
        }
      }

      setGames(activeGames);
      setQuestCounts(counts);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter by search — merge DB-managed thumbnails into featured games
  const featuredWithAssets = FEATURED_GAMES.map((g) => {
    const assetKey = `game_${g.slug}`;
    return {
      ...g,
      image_url: getAssetUrl(assets, assetKey, g.image_url),
      name: getAssetField(assets, assetKey, "title", g.name),
    };
  });
  const allDisplayGames = [
    ...games,
    ...featuredWithAssets,
    ...COMING_SOON_GAMES.map((g) => ({ ...g, is_active: false })),
  ];
  const filteredGames = allDisplayGames.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-6xl mx-auto pb-12">
      {/* Back to Hub */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition mb-6 tap-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-bold">Retour au Hub</span>
      </Link>

      {/* Title */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gamepad2 className="w-6 h-6" style={{ color: "#BF5AF2" }} />
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Guides & Entraide
          </h1>
        </div>
        <p className="text-sm text-white/40">
          Trouvez des guides, des astuces et de l'aide pour vos jeux préférés
        </p>
      </div>

      {/* Search bar */}
      <div className="max-w-xl mx-auto mb-8">
        <div
          className="relative flex items-center"
          style={{
            borderRadius: "9999px",
            background: "rgba(13,5,24,0.7)",
            border: "1.5px solid rgba(191,90,242,0.3)",
            boxShadow: "0 0 20px rgba(191,90,242,0.1)",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="RECHERCHER UN JEU..."
            className="w-full h-12 px-6 pr-12 bg-transparent text-sm text-white placeholder:text-white/30 placeholder:uppercase placeholder:tracking-wider outline-none"
          />
          <div className="absolute right-4 flex items-center">
            <Search className="w-4 h-4" style={{ color: "#BF5AF2" }} />
          </div>
        </div>
      </div>

      {/* Game grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredGames.map((game, i) => (
            <GameCard
              key={game.slug || game.id}
              game={game}
              guideCount={questCounts[game.slug] || 0}
              index={i}
            />
          ))}
        </div>
      )}

      {!loading && filteredGames.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-white/30">Aucun jeu trouvé pour "{search}"</p>
        </div>
      )}
    </div>
  );
}