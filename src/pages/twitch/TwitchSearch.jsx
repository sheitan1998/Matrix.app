import { useSearchParams } from "react-router-dom";
import { useTwitch } from "@/hooks/useTwitch";
import TwitchSearchFilters from "@/components/twitch/TwitchSearchFilters";
import TwitchStreamCard from "@/components/twitch/TwitchStreamCard";
import TwitchChannelCard from "@/components/twitch/TwitchChannelCard";
import TwitchCategoryCard from "@/components/twitch/TwitchCategoryCard";
import { Loader2, SearchX } from "lucide-react";

export default function TwitchSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const filter = searchParams.get("filter") || "all";

  const channelsResult = useTwitch("searchChannels", { query, first: 20 }, {
    enabled: !!query && (filter === "all" || filter === "channels"),
  });
  const liveResult = useTwitch("searchStreams", { query, first: 20 }, {
    enabled: !!query && (filter === "all" || filter === "lives"),
  });
  const categoriesResult = useTwitch("searchCategories", { query, first: 12 }, {
    enabled: !!query && (filter === "all" || filter === "categories"),
  });

  const channels = channelsResult.data?.channels || [];
  const lives = liveResult.data?.streams || [];
  const categories = categoriesResult.data?.categories || [];

  const handleFilterChange = (f) => {
    setSearchParams({ q: query, filter: f });
  };

  if (!query) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-[#a0a0b0]">Saisissez une recherche dans la barre ci-dessus.</p>
      </div>
    );
  }

  const isLoading = channelsResult.isLoading || liveResult.isLoading || categoriesResult.isLoading;
  const hasResults = lives.length > 0 || channels.length > 0 || categories.length > 0;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Résultats pour « {query} »</h1>
      <p className="text-[#a0a0b0] text-sm mb-4">Recherche dans la galaxie Twitch</p>

      <TwitchSearchFilters active={filter} onChange={handleFilterChange} />

      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#a0a0b0]" />
          </div>
        ) : !hasResults ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <SearchX className="w-12 h-12 text-[#a0a0b0] mb-3" />
            <p className="text-white font-semibold">Aucun résultat</p>
            <p className="text-[#a0a0b0] text-sm mt-1">Essayez avec d'autres mots-clés</p>
          </div>
        ) : (
          <>
            {(filter === "all" || filter === "lives") && lives.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-white mb-3">Lives ({lives.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {lives.map((s) => <TwitchStreamCard key={s.id} stream={s} />)}
                </div>
              </section>
            )}

            {(filter === "all" || filter === "channels") && channels.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-white mb-3">Chaînes ({channels.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {channels.map((c) => <TwitchChannelCard key={c.id} channel={c} />)}
                </div>
              </section>
            )}

            {(filter === "all" || filter === "categories") && categories.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-white mb-3">Catégories ({categories.length})</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {categories.map((c) => <TwitchCategoryCard key={c.id} category={c} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}