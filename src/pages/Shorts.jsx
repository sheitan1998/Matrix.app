import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { fetchYouTube, mergeYouTubeLocal } from "@/hooks/useYouTube";
import { Heart, MessageCircle, Share2, ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { formatViews } from "@/lib/format";
import YouTubePlayer from "@/components/video/YouTubePlayer";

function ShortItem({ short, isActive, isNearby }) {
  const videoRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const isActiveRef = useRef(isActive);
  const [liked, setLiked] = useState(false);
  const [muted, setMuted] = useState(true);

  const isYouTube = short._source === "youtube" || (!short.video_url && !!short.id);
  const shouldRenderPlayer = isNearby || isActive;

  isActiveRef.current = isActive;

  // Native <video> play/pause
  useEffect(() => {
    if (isYouTube || !videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive, isYouTube]);

  // YouTube IFrame API play/pause
  useEffect(() => {
    const p = ytPlayerRef.current;
    if (!p) return;
    if (isActive) p.playVideo?.();
    else { p.pauseVideo?.(); p.seekTo?.(0); }
  }, [isActive]);

  // YouTube mute/unmute
  useEffect(() => {
    const p = ytPlayerRef.current;
    if (!p) return;
    if (muted) p.mute?.(); else p.unMute?.();
  }, [muted]);

  // Stable onReady — keeps YouTubePlayer from recreating the iframe
  const handleYTReady = useCallback((player) => {
    ytPlayerRef.current = player;
    player.mute?.();
    if (isActiveRef.current) player.playVideo?.();
  }, []);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {isYouTube ? (
        shouldRenderPlayer ? (
          <YouTubePlayer videoId={short.id} autoplay={false} onReady={handleYTReady} />
        ) : short.thumbnail_url ? (
          <img src={short.thumbnail_url} alt={short.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid-bg" />
        )
      ) : short.video_url ? (
        <video
          ref={videoRef}
          src={short.video_url}
          loop
          muted={muted}
          playsInline
          className="h-full w-full object-cover"
        />
      ) : short.thumbnail_url ? (
        <img src={short.thumbnail_url} alt={short.title} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full grid-bg" />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Side actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5">
        <button
          onClick={() => setLiked((l) => !l)}
          className="flex flex-col items-center gap-1"
        >
          <Heart className={`w-7 h-7 transition ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
          <span className="text-white text-xs font-bold">{formatViews((short.likes || 0) + (liked ? 1 : 0))}</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-white text-xs font-bold">0</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Share2 className="w-7 h-7 text-white" />
          <span className="text-white text-xs font-bold">Partager</span>
        </button>
        <button onClick={() => setMuted((m) => !m)}>
          {muted ? <VolumeX className="w-6 h-6 text-white/70" /> : <Volume2 className="w-6 h-6 text-white" />}
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-4 right-20 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs overflow-hidden border-2 border-white/30">
            {short.channel_avatar ? <img src={short.channel_avatar} alt="" className="w-full h-full object-cover" /> : (short.channel_name?.[0] || "M")}
          </div>
          <span className="text-white font-semibold text-sm">{short.channel_name || "MATRIX"}</span>
        </div>
        <p className="text-white text-sm font-medium line-clamp-2">{short.title}</p>
      </div>
    </div>
  );
}

export default function Shorts() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const { data: shorts = [], isLoading } = useQuery({
    queryKey: ["shorts"],
    queryFn: async () => {
      const [local, yt] = await Promise.all([
        base44.entities.Short.list("-created_date", 20),
        fetchYouTube("shorts", { maxResults: 20 }),
      ]);
      return mergeYouTubeLocal(yt, local);
    },
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = () => {
      const idx = Math.round(container.scrollTop / container.clientHeight);
      setActiveIndex(idx);
    };
    container.addEventListener("scroll", handler, { passive: true });
    return () => container.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-4 pt-4 pb-2 bg-gradient-to-b from-black/60 to-transparent">
        <Link to="/" className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <span className="text-white font-black text-lg tracking-tight"><span className="text-primary">M</span>ATRIX Shorts</span>
      </div>

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {isLoading && (
          <div className="h-screen flex items-center justify-center text-muted-foreground">Chargement...</div>
        )}
        {!isLoading && shorts.length === 0 && (
          <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-8">
            <span className="text-5xl">🎬</span>
            <p className="text-white font-bold text-xl">Aucun Short</p>
            <p className="text-white/50 text-sm">Les Shorts apparaîtront ici dès qu'ils seront publiés.</p>
          </div>
        )}
        {shorts.map((short, i) => (
          <div key={short.id} className="h-screen snap-start snap-always overflow-hidden">
            <ShortItem short={short} isActive={activeIndex === i} isNearby={Math.abs(activeIndex - i) <= 1} />
          </div>
        ))}
      </div>
    </div>
  );
}