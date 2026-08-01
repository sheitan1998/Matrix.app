import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { useTwitch } from "@/hooks/useTwitch";
import TwitchStreamCard from "@/components/twitch/TwitchStreamCard";
import TwitchCategoryCard from "@/components/twitch/TwitchCategoryCard";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function TwitchCategoryPage() {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const gameName = searchParams.get("name") || "";
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  // Fetch game details to get the box art (in case name wasn't passed)
  const gameDetails = useTwitch("getGameDetails", { gameId }, { enabled: !!gameId });
  const game = gameDetails.data;
  const displayName = gameName || game?.name || "Catégorie";

  // Fetch streams for this game
  const streamsResult = useTwitch("getStreams", { gameId, first: 30 }, { enabled: !!gameId });
  const streams = streamsResult.data?.streams || [];

  // Fetch top categories for the sidebar
  const topCategories = useTwitch("getTopGames", { first: 12 });
  const categories = (topCategories.data?.categories || []).filter((c) => c.id !== gameId);

  const visibleStreams = showMore ? streams : streams.slice(0, 12);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/twitch?tab=parcourir")}
        className="flex items-center gap-1.5 text-[#a0a0b0] hover:text-white text-sm mb-4 transition-colors tap-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      {/* Category header */}
      <div className="flex items-center gap-4 mb-6">
        {game?.box_art_url ? (
          <img
            src={game.box_art_url}
            alt={displayName}
            className="w-16 h-20 md:w-20 md:h-28 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-16 h-20 md:w-20 md:h-28 rounded-lg bg-[#161321] shrink-0" />
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{displayName}</h1>
          <p className="text-[#a0a0b0] text-sm mt-1">
            {streamsResult.isLoading ? "Chargement des streams..." : `${streams.length} stream${streams.length > 1 ? "s" : ""} en direct`}
          </p>
        </div>
      </div>

      {/* Streams grid */}
      {streamsResult.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#a0a0b0]" />
        </div>
      ) : streamsResult.error ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-[#161321] border border-[#2a2a3e] text-[#a0a0b0] text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Impossible de charger les streams. Vérifiez la configuration Twitch.</span>
        </div>
      ) : streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-white font-semibold">Aucun stream en direct</p>
          <p className="text-[#a0a0b0] text-sm mt-1">Aucun stream n'est actuellement en direct pour cette catégorie.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
            {visibleStreams.map((s) => <TwitchStreamCard key={s.id} stream={s} />)}
          </div>
          {streams.length > 12 && !showMore && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowMore(true)}
                className="px-6 py-2 rounded-full bg-[#1f1f2e] hover:bg-[#2a2a3e] text-white text-sm font-semibold transition-colors tap-sm"
              >
                Afficher plus ({streams.length - 12})
              </button>
            </div>
          )}
        </>
      )}

      {/* Other categories */}
      {categories.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-white mb-3">Autres catégories</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {categories.slice(0, 16).map((c) => <TwitchCategoryCard key={c.id} category={c} square />)}
          </div>
        </section>
      )}
    </div>
  );
}