import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Eye } from "lucide-react";

const FALLBACK_LIVE = {
  id: "mock-live",
  channel_name: "NeoGameux",
  title: "Live sur Cyberpunk 2077",
  thumbnail_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400",
  viewers_count: 1200,
  verified: true,
};

export default function LiveNowSection() {
  const nav = useNavigate();
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Video.filter({ is_live: true }, "-viewers_count", 1)
      .then(videos => { if (videos.length > 0) setLive(videos[0]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const display = live || FALLBACK_LIVE;
  const formatViewers = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <motion.div className="w-2 h-2 rounded-full"
          style={{ background: "#a855f7" }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }} />
        <p className="text-xs font-black tracking-widest text-white/60">EN DIRECT MAINTENANT</p>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        onClick={() => live && nav(`/live/${live.id}`)}
        className="w-full rounded-2xl overflow-hidden text-left group"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="relative aspect-video">
          <img src={display.thumbnail_url} alt={display.title}
            className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded bg-red-500 text-white">● LIVE</span>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70">
            <Eye className="w-3 h-3 text-white" />
            <span className="text-[10px] font-bold text-white">{formatViewers(display.viewers_count)}</span>
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-bold text-white truncate">{display.channel_name}</p>
            {display.verified && <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "#3b82f6" }} />}
          </div>
          <p className="text-xs text-white/40 truncate">{display.title}</p>
        </div>
      </motion.button>
    </div>
  );
}