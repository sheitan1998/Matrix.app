import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Users, Flame, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturedMaps() {
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
        <span className="text-[9px] text-white/30 uppercase tracking-wider ml-auto">Live</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {maps.map((map, i) => (
          <FeaturedMapCard key={map.id} map={map} index={i} />
        ))}
      </div>
    </div>
  );
}

function FeaturedMapCard({ map, index = 0 }) {
  const [copied, setCopied] = useState(false);
  const thumb = map.api_thumbnail || map.image_url;
  const title = map.api_title || map.title;
  const creator = map.api_creator || map.creator_name;

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(map.map_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group rounded-xl overflow-hidden flex flex-col cursor-pointer transition hover:border-purple-500/40"
      style={{ background: "#0D0518", border: "1px solid rgba(191,90,242,0.15)" }}
    >
      <div className="relative h-36 sm:h-40 overflow-hidden" style={{ background: "#1a0a2e" }}>
        {thumb ? (
          <img src={thumb} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl opacity-30">🗺️</span>
          </div>
        )}
        {/* Live players badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold text-white" style={{ background: "rgba(0,0,0,0.7)" }}>
          <Users className="w-2.5 h-2.5" style={{ color: "#22c55e" }} />
          {map.live_players || 0}
        </div>
        {/* Featured badge */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider" style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.4)" }}>
          ★ Vedette
        </span>
      </div>

      <div className="flex flex-col flex-1 p-3">
        <h3 className="text-sm font-black text-white truncate mb-1">{title}</h3>
        <p className="text-[11px] text-white/50 truncate mb-3">{creator}</p>
        <div className="mt-auto flex items-center gap-2">
          <code className="flex-1 px-2 py-1.5 rounded-md text-[11px] font-mono font-bold tracking-wider text-center" style={{ background: "rgba(191,90,242,0.08)", border: "1px solid rgba(191,90,242,0.15)", color: "#BF5AF2" }}>
            {map.map_code}
          </code>
          <button onClick={handleCopy} className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition tap-sm" style={{ background: "rgba(191,90,242,0.1)", border: "1px solid rgba(191,90,242,0.2)" }}>
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" style={{ color: "#BF5AF2" }} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}