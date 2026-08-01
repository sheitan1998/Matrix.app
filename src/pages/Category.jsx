import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { fetchYouTube, mergeYouTubeLocal } from "@/hooks/useYouTube";
import VideoGrid from "@/components/video/VideoGrid";

const LABELS = {
  music: "Musique", gaming: "Gaming", education: "Éducation",
  news: "Actualités", tech: "Tech", sports: "Sports",
  entertainment: "Divertissement", comedy: "Humour", lifestyle: "Lifestyle", other: "Autre"
};

export default function Category() {
  const { slug } = useParams();
  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos", "cat", slug],
    queryFn: async () => {
      const [local, yt] = await Promise.all([
        base44.entities.Video.filter({ category: slug }, "-views", 60),
        fetchYouTube("search", { q: LABELS[slug] || slug, maxResults: 50 }),
      ]);
      return mergeYouTubeLocal(yt, local);
    },
    initialData: [],
  });

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <h1 className="text-3xl font-black tracking-tight">{LABELS[slug] || slug}</h1>
      <VideoGrid videos={videos} isLoading={isLoading} />
    </div>
  );
}