import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";

export default function LiveNowSection() {
  const nav = useNavigate();
  const [live, setLive] = useState(null);

  useEffect(() => {
    base44.entities.Video.filter({ is_live: true }, "-viewers_count", 1)
      .then(videos => { if (videos.length > 0) setLive(videos[0]); })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <motion.div className="w-2 h-2 rounded-full bg-red-500"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }} />
        <p className="text-xs font-black tracking-widest text-white/60">EN DIRECT MAINTENANT</p>
      </div>

      {live ? (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          onClick={() => nav(`/live/${live.id}`)}
          className="w-full rounded-2xl overflow-hidden text-left group"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="relative aspect-video">
            <img src={live.thumbnail_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400"}
              alt={live.title} className="w-full h-full object-cover" />
            <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded bg-red-500 text-white">● LIVE</span>
          </div>
          <div className="p-3">
            <p className="text-sm font-bold text-white truncate">{live.channel_name || live.title}</p>
            <p className="text-xs text-white/40">{live.viewers_count || 0} spectateurs</p>
          </div>
        </motion.button>
      ) : (
        <div className="rounded-2xl p-5 text-center"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs text-white/30">Aucun live en cours</p>
        </div>
      )}
    </div>
  );
}