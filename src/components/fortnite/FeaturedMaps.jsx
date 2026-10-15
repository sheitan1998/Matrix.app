import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Flame } from "lucide-react";
import FortniteMapCard from "@/components/tuto-gaming/FortniteMapCard";

export default function FeaturedMaps({ onSelect, user }) {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("fortniteApi", { action: "getFeaturedMaps" });
      setMaps(res.data || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
    const interval = setInterval(fetchFeatured, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [fetchFeatured]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (maps.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-4 h-4" style={{ color: "#f59e0b" }} />
        <h2 className="text-sm font-black text-white uppercase tracking-tight">Cartes en Vedette</h2>
        <span className="text-[9px] text-white/30 uppercase tracking-wider ml-auto">Relevés · cache 15 min</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {maps.map((map, i) => {
          const displayMap = {
            ...map,
            title: map.api_title || map.title,
            creator_name: map.api_creator || map.creator_name,
            image_url: map.api_thumbnail || map.image_url,
            thumbnail_url: map.api_thumbnail_url || map.image_url,
          };
          return <FortniteMapCard key={map.id} map={displayMap} index={i} onClick={onSelect} user={user} featured />;
        })}
      </div>
    </div>
  );
}