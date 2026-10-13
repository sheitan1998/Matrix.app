import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Map as MapIcon, Users, Copy, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ApiFeaturedMaps() {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApiMaps = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("fortniteApi", { action: "getApiFeaturedMaps" });
      setMaps(res.data || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiMaps();
  }, [fetchApiMaps]);

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
        <Sparkles className="w-4 h-4" style={{ color: "#3b82f6" }} />
        <h2 className="text-sm font-black text-white uppercase tracking-tight">Cartes Créatives Populaires</h2>
        <span className="text-[9px] text-white/30 uppercase tracking-wider ml-auto">Via Fortnite API</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {maps.map((map, i) => (
          <ApiMapCard key={map.id || i} map={map} index={i} />
        ))}
      </div>
    </div>
  );
}

function ApiMapCard({ map, index = 0 }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!map.map_code) return;
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
      className="group rounded-xl overflow-hidden flex flex-col cursor-pointer transition hover:border-blue-500/40"
      style={{ background: "#0D0518", border: "1px solid rgba(59,130,246,0.15)" }}
    >
      <div className="relative h-36 sm:h-40 overflow-hidden" style={{ background: "#1a0a2e" }}>
        {map.image_url ? (
          <img src={map.image_url} alt={map.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapIcon className="w-8 h-8 text-white/10" />
          </div>
        )}
        {map.live_players > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold text-white" style={{ background: "rgba(0,0,0,0.7)" }}>
            <Users className="w-2.5 h-2.5" style={{ color: "#22c55e" }} />
            {map.live_players}
          </div>
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider" style={{ background: "rgba(59,130,246,0.2)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.4)" }}>
          API
        </span>
      </div>

      <div className="flex flex-col flex-1 p-3">
        <h3 className="text-sm font-black text-white truncate mb-1">{map.title}</h3>
        <p className="text-[11px] text-white/50 truncate mb-3">{map.creator_name}</p>
        {map.map_code && (
          <div className="mt-auto flex items-center gap-2">
            <code className="flex-1 px-2 py-1.5 rounded-md text-[11px] font-mono font-bold tracking-wider text-center" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)", color: "#60a5fa" }}>
              {map.map_code}
            </code>
            <button onClick={handleCopy} className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition tap-sm" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" style={{ color: "#60a5fa" }} />}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}