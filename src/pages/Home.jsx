import React, { useEffect, useRef, useState } from "react";
import { Video as VideoIcon, Loader2 } from "lucide-react";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import useStreamFeed from "@/hooks/useStreamFeed";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";
import VideoGrid from "@/components/video/VideoGrid";

const FILTERS = [
  { id: "all", label: "Tout" },
  { id: "music", label: "Musique" },
  { id: "gaming", label: "Gaming" },
  { id: "education", label: "Éducation" },
  { id: "entertainment", label: "Divertissement" },
  { id: "sports", label: "Sports" },
  { id: "news", label: "Actualités" },
  { id: "tech", label: "Tech" },
  { id: "comedy", label: "Humour" },
  { id: "lifestyle", label: "Lifestyle" },
];

export default function Home() {
  const [filter, setFilter] = useState("all");
  const { videos, isLoading, isLoadingMore, hasMore, loadMore, refetch } = useStreamFeed(filter);
  const sentinelRef = useRef(null);

  const { pulling, pullY } = usePullToRefresh({ onRefresh: refetch });

  // Infinite scroll — each page appends more videos, with no fixed cap.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "800px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="px-4 lg:px-6 py-4 space-y-5">
      <PullToRefreshIndicator pulling={pulling} pullY={pullY} />

      {/* Filter pills */}
      <div className="sticky top-[7rem] z-30 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 bg-background/85 backdrop-blur-xl">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shrink-0"
              style={filter === f.id
                ? { background: "#ffffff", color: "#000000" }
                : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {videos.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <VideoIcon className="w-12 h-12 text-white/10 mb-3" />
          <p className="text-sm text-white/40">Aucune vidéo à afficher</p>
        </div>
      ) : (
        <VideoGrid videos={videos} isLoading={isLoading} />
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-10 flex items-center justify-center">
        {isLoadingMore && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
      </div>
    </div>
  );
}