import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Video as VideoIcon } from "lucide-react";
import usePullToRefresh from "@/hooks/usePullToRefresh";
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

  const { data: videos, isLoading, refetch } = useQuery({
    queryKey: ["videos", "home"],
    queryFn: () => base44.entities.Video.list("-created_date", 60),
    initialData: [],
  });

  const { pulling, pullY } = usePullToRefresh({ onRefresh: refetch });
  const filtered = filter === "all" ? videos : videos.filter((v) => v.category === filter);

  return (
    <div className="px-4 lg:px-6 py-4 space-y-5">
      <PullToRefreshIndicator pulling={pulling} pullY={pullY} />

      {/* Filter pills */}
      <div className="sticky top-16 z-30 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 bg-background/85 backdrop-blur-xl">
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
      {filtered.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <VideoIcon className="w-12 h-12 text-white/10 mb-3" />
          <p className="text-sm text-white/40">Aucune vidéo à afficher</p>
        </div>
      ) : (
        <VideoGrid videos={filtered} isLoading={isLoading} />
      )}
    </div>
  );
}