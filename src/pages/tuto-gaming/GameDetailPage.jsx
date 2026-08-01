import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, ArrowLeft, BookOpen } from "lucide-react";
import QuestListItem from "@/components/tuto-gaming/QuestListItem";
import { QUEST_CATEGORIES } from "@/components/tuto-gaming/tutoGamingData";

export default function GameDetailPage() {
  const { gameSlug } = useParams();
  const [game, setGame] = useState(null);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const games = await base44.entities.Game.filter({ slug: gameSlug });
      if (games.length > 0) {
        setGame(games[0]);
      }

      const allQuests = await base44.entities.Quest.filter({ game_slug: gameSlug });
      const sorted = allQuests.sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      );
      setQuests(sorted);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [gameSlug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter quests
  const filteredQuests = quests.filter((q) => {
    const matchesCategory =
      activeCategory === "all" || q.category === activeCategory;
    const matchesSearch =
      !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.description || "").toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Count quests per category
  const countByCategory = (catId) =>
    catId === "all"
      ? quests.length
      : quests.filter((q) => q.category === catId).length;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-white/40 mb-4">Jeu introuvable</p>
        <Link to="/tuto-gaming" className="text-xs font-bold" style={{ color: "#BF5AF2" }}>
          Retour aux jeux
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-5xl mx-auto pb-12">
      {/* Back */}
      <Link
        to="/tuto-gaming"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition mb-5 tap-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-bold">Tous les jeux</span>
      </Link>

      {/* Game header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          {game.name}
        </h1>
        {game.description && (
          <p className="text-sm text-white/40 mt-2 leading-relaxed max-w-2xl">
            {game.description}
          </p>
        )}
      </div>

      {/* Search bar */}
      <div className="mb-5">
        <div
          className="relative flex items-center"
          style={{
            borderRadius: "9999px",
            background: "rgba(13,5,24,0.7)",
            border: "1.5px solid rgba(191,90,242,0.25)",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="RECHERCHER UNE QUÊTE, UN GUIDE..."
            className="w-full h-11 px-5 pr-11 bg-transparent text-sm text-white placeholder:text-white/30 placeholder:uppercase placeholder:tracking-wider outline-none"
          />
          <div className="absolute right-4">
            <Search className="w-4 h-4" style={{ color: "#BF5AF2" }} />
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto no-scrollbar pb-1">
        {QUEST_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition tap-sm"
            style={
              activeCategory === cat.id
                ? {
                    background: `${cat.color}1a`,
                    color: cat.color,
                    border: `1px solid ${cat.color}40`,
                  }
                : {
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }
            }
          >
            {cat.label}
            <span
              className="text-[9px] px-1 rounded"
              style={{
                background: activeCategory === cat.id ? `${cat.color}30` : "rgba(255,255,255,0.05)",
              }}
            >
              {countByCategory(cat.id)}
            </span>
          </button>
        ))}
      </div>

      {/* Quest list */}
      {filteredQuests.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-8 h-8 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">
            {search
              ? `Aucun guide trouvé pour "${search}"`
              : "Aucun guide dans cette catégorie pour le moment"}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredQuests.map((quest, i) => (
            <QuestListItem
              key={quest.id}
              quest={quest}
              gameSlug={gameSlug}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}