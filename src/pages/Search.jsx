import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchYouTube } from "@/hooks/useYouTube";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResultVideo from "@/components/search/SearchResultVideo";
import SearchResultChannel from "@/components/search/SearchResultChannel";
import SearchResultPlaylist from "@/components/search/SearchResultPlaylist";
import { Skeleton } from "@/components/ui/skeleton";

const FILTERS = [
  { id: "all", label: "Tous" },
  { id: "videos", label: "Vidéos" },
  { id: "channels", label: "Chaînes" },
  { id: "live", label: "Direct" },
  { id: "playlists", label: "Playlists" },
];

export default function Search() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || "";
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["youtube", "search", q, filter],
    queryFn: () => {
      if (filter === "videos") return fetchYouTube("search", { q, type: "video", maxResults: 25 });
      if (filter === "channels") return fetchYouTube("search", { q, type: "channel", maxResults: 25 });
      if (filter === "live") return fetchYouTube("liveStreams", { q, maxResults: 25 });
      if (filter === "playlists") return fetchYouTube("search", { q, type: "playlist", maxResults: 25 });
      return fetchYouTube("searchAll", { q, maxResults: 25 });
    },
    enabled: !!q,
  });

  const isAll = filter === "all";
  const allData = isAll ? (data || { videos: [], channels: [] }) : null;
  const listData = !isAll ? (data || []) : [];
  const isEmpty = isAll
    ? !allData.videos?.length && !allData.channels?.length
    : listData.length === 0;

  return (
    <div className="px-4 lg:px-6 py-4 max-w-5xl mx-auto">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Résultats pour</p>
        <h1 className="text-xl md:text-2xl font-black">"{q}"</h1>
      </div>

      <SearchFilters filters={FILTERS} active={filter} onChange={setFilter} />

      <div className="mt-4 space-y-1">
        {isLoading ? (
          <SearchSkeleton />
        ) : isAll ? (
          <>
            {(allData.channels || []).slice(0, 3).map((c) => (
              <SearchResultChannel key={c.id} channel={c} />
            ))}
            {(allData.videos || []).map((v) => (
              <SearchResultVideo key={v.id} video={v} />
            ))}
          </>
        ) : filter === "channels" ? (
          listData.map((c) => <SearchResultChannel key={c.id} channel={c} />)
        ) : filter === "playlists" ? (
          listData.map((p) => <SearchResultPlaylist key={p.id} playlist={p} />)
        ) : (
          listData.map((v) => <SearchResultVideo key={v.id} video={v} />)
        )}

        {!isLoading && isEmpty && (
          <p className="text-sm text-muted-foreground text-center py-12">
            Aucun résultat trouvé pour "{q}"
          </p>
        )}
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="w-40 md:w-64 h-24 md:h-36 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}