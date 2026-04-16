import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import VideoGrid from "@/components/video/VideoGrid";
import { Radio } from "lucide-react";

export default function LiveHub() {
  const { data: lives, isLoading } = useQuery({
    queryKey: ["videos", "live"],
    queryFn: () => base44.entities.Video.filter({ is_live: true }, "-viewers_count", 50),
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