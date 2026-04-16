import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
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
    queryFn: () => base44.entities.Video.filter({ category: slug }, "-views", 60),
    initialData: [],
  });

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      <h1 className="text-3xl font-black tracking-tight">{LABELS[slug] || slug}</h1>
      <VideoGrid videos={videos} isLoading={isLoading} />
    </div>
  );
}