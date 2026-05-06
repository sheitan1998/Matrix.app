import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import VideoGrid from "@/components/video/VideoGrid";
import { Flame } from "lucide-react";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/ui/PullToRefreshIndicator";

export default function Trending() {
  const { data: videos, isLoading, refetch } = useQuery({
    queryKey: ["videos", "trending"],
    queryFn: () => base44.entities.Video.list("-views", 50),
    initialData: [],
  });

  const { pulling, pullY } = usePullToRefresh({ onRefresh: refetch });

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <PullToRefreshIndicator pulling={pulling} pullY={pullY} />
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl gradient-matrix flex items-center justify-center shadow-glow">
          <Flame className="w-6 h-6 text-background" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Tendances</h1>
          <p className="text-sm text-muted-foreground">Les vidéos les plus vues sur MATRIX</p>
        </div>
      </div>
      <VideoGrid videos={videos} isLoading={isLoading} />
    </div>
  );
}