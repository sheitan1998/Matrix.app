import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { fetchYouTube, mergeYouTubeLocal } from "@/hooks/useYouTube";
import VideoGrid from "@/components/video/VideoGrid";
import { Radio } from "lucide-react";

export default function LiveHub() {
  const { data: lives, isLoading } = useQuery({
    queryKey: ["videos", "live"],
    queryFn: async () => {
      // Local lives (may throw if none — must not block YouTube results)
      let local = [];
      try {
        local = await base44.entities.Video.filter({ is_live: true }, "-viewers_count", 50);
      } catch (e) {
        console.warn("[LiveHub] local Video.filter failed:", e?.message);
      }
      const yt = await fetchYouTube("liveStreams", { maxResults: 50 });
      const merged = mergeYouTubeLocal(yt, local);
      console.log(`[LiveHub] local=${local.length} yt=${yt.length} merged=${merged.length}`);
      return merged;
    },
    initialData: [],
  });

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-live flex items-center justify-center">
          <Radio className="w-6 h-6 text-white animate-live-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-black">En direct</h1>
          <p className="text-sm text-muted-foreground">Chaînes en live maintenant</p>
        </div>
      </div>
      <VideoGrid videos={lives} isLoading={isLoading} emptyMessage="Aucun live pour le moment" />
    </div>
  );
}