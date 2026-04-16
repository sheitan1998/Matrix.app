import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import VideoGrid from "@/components/video/VideoGrid";

export default function Search() {
  const params = new URLSearchParams(window.location.search);
  const q = (params.get("q") || "").toLowerCase();

  const { data: videos, isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: () => base44.entities.Video.list("-created_date", 200),
    initialData: [],
  });

  const filtered = videos.filter((v) =>
    v.title?.toLowerCase().includes(q) ||
    v.description?.toLowerCase().includes(q) ||
    v.channel_name?.toLowerCase().includes(q)
  );

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6 max-w-5xl">
      <div>
        <p className="text-sm text-muted-foreground">Résultats pour</p>
        <h1 className="text-2xl font-black">"{q}"</h1>
      </div>
      <VideoGrid videos={filtered} isLoading={isLoading} emptyMessage="Aucune vidéo trouvée" />
    </div>
  );
}