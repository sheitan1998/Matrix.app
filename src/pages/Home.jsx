import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import VideoGrid from "@/components/video/VideoGrid";
import CategoryChips from "@/components/video/CategoryChips";

export default function Home() {
  const [category, setCategory] = useState("all");

  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos", "home"],
    queryFn: () => base44.entities.Video.list("-created_date", 60),
    initialData: [],
  });

  const filtered = category === "all" ? videos : videos.filter((v) => v.category === category);

  return (
    <div className="px-4 lg:px-6 py-4 space-y-5">
      <div className="sticky top-16 z-30 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 bg-background/85 backdrop-blur-xl">
        <CategoryChips active={category} onChange={setCategory} />
      </div>
      <VideoGrid videos={filtered} isLoading={isLoading} />
    </div>
  );
}