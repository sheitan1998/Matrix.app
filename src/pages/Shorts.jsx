import React, { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { fetchYouTubeRaw } from "@/hooks/useYouTube";
import { Heart, MessageCircle, Share2, ArrowLeft, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatViews } from "@/lib/format";
import YouTubePlayer from "@/components/video/YouTubePlayer";

// Random search terms to avoid always seeing the same shorts when starting fresh
const SHORT_QUERIES = [
  "#shorts", "#short", "#ytshorts", "#viral", "#trending",
  "#funny", "#dance", "#gaming", "#cooking", "#music",
  "#challenge", "#life", "#tech", "#sport", "#art",
];

function pickRandomQuery(exclude = []) {
  const available = SHORT_QUERIES.filter(q => !exclude.includes(q));
  if (available.length === 0) return SHORT_QUERIES[Math.floor(Math.random() * SHORT_QUERIES.length)];
  return available[Math.floor(Math.random() * available.length)];
}

function ShortItem({ short, isActive }) {
  const videoRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const isActiveRef = useRef(isActive);
  const [liked, setLiked] = useState(false);
  const [muted, setMuted] = useState(true);

  const isYouTube = short._source === "youtube" || (!short.video_url && !!short.id);

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
    try {
      if (isActive) p.playVideo?.();
      else { p.pauseVideo?.(); p.seekTo?.(0); }
    } catch { ytPlayerRef.current = null; }
  }, [isActive]);

  // YouTube mute/unmute
  useEffect(() => {
    const p = ytPlayerRef.current;
    if (!p) return;
    try {
      if (muted) p.mute?.(); else p.unMute?.();
    } catch { ytPlayerRef.current = null; }
  }, [muted]);

  // When this item becomes inactive, drop the player reference
  useEffect(() => {
    if (!isActive) ytPlayerRef.current = null;
  }, [isActive]);

  // Clean up YouTube player on unmount
  useEffect(() => {
    return () => {
      const p = ytPlayerRef.current;
      if (p) {
        try { p.stopVideo?.(); } catch {}
        try { p.destroy?.(); } catch {}
        ytPlayerRef.current = null;
      }
    };
  }, []);

  // Stable onReady — keeps YouTubePlayer from recreating the iframe
  const handleYTReady = useCallback((player) => {
    ytPlayerRef.current = player;
    player.mute?.();
    if (isActiveRef.current) player.playVideo?.();
  }, []);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {isYouTube ? (
        isActive ? (
          <YouTubePlayer videoId={short.id} autoplay onReady={handleYTReady} />
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
  const [shorts, setShorts] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [usedQueries, setUsedQueries] = useState([]);
  const containerRef = useRef(null);
  const seenIdsRef = useRef(new Set());
  const tokenRef = useRef(null);
  const loadingMoreRef = useRef(false);

  // Initial load — local shorts + first YouTube page
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const local = await base44.entities.Short.list("-created_date", 20);
        const query = pickRandomQuery();
        setUsedQueries([query]);
        const ytRes = await fetchYouTubeRaw("shorts", { q: query, maxResults: 20 });
        const ytVideos = ytRes?.videos || [];
        const token = ytRes?.nextPageToken || null;
        tokenRef.current = token;
        setNextPageToken(token);

        const merged = [...ytVideos, ...local].filter(v => {
          if (!v?.id || seenIdsRef.current.has(v.id)) return false;
          seenIdsRef.current.add(v.id);
          return true;
        });
        if (!cancelled) setShorts(merged);
      } catch (e) {
        console.error("[Shorts] initial load failed:", e);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Load more shorts when approaching the end
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      // If we have a page token, paginate; otherwise pick a new random query
      if (tokenRef.current) {
        const res = await fetchYouTubeRaw("shorts", { q: usedQueries[usedQueries.length - 1] || "#shorts", maxResults: 20, pageToken: tokenRef.current });
        const videos = res?.videos || [];
        const token = res?.nextPageToken || null;
        tokenRef.current = token;
        setNextPageToken(token);
        const newVideos = videos.filter(v => {
          if (!v?.id || seenIdsRef.current.has(v.id)) return false;
          seenIdsRef.current.add(v.id);
          return true;
        });
        if (newVideos.length > 0) {
          setShorts(prev => [...prev, ...newVideos]);
        } else if (token) {
          // Token returned but no new unique videos — retry with the same token
        } else {
          // No more pages for this query — switch to a new random query
          tokenRef.current = null;
          setNextPageToken(null);
        }
      } else {
        // No token — pick a new random query
        const query = pickRandomQuery(usedQueries);
        setUsedQueries(prev => [...prev, query]);
        const res = await fetchYouTubeRaw("shorts", { q: query, maxResults: 20 });
        const videos = res?.videos || [];
        const token = res?.nextPageToken || null;
        tokenRef.current = token;
        setNextPageToken(token);
        const newVideos = videos.filter(v => {
          if (!v?.id || seenIdsRef.current.has(v.id)) return false;
          seenIdsRef.current.add(v.id);
          return true;
        });
        if (newVideos.length > 0) {
          setShorts(prev => [...prev, ...newVideos]);
        }
      }
    } catch (e) {
      console.error("[Shorts] loadMore failed:", e);
    }
    loadingMoreRef.current = false;
    setLoadingMore(false);
  }, [usedQueries]);

  // Scroll handler — track active index + trigger load more near the end
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let scrollTimer = null;
    const handler = () => {
      if (scrollTimer) cancelAnimationFrame(scrollTimer);
      scrollTimer = requestAnimationFrame(() => {
        const idx = Math.round(container.scrollTop / container.clientHeight);
        setActiveIndex((prev) => (prev !== idx ? idx : prev));
        // Load more when within 2 items of the end
        if (idx >= shorts.length - 2 && !loadingMoreRef.current) {
          loadMore();
        }
      });
    };
    container.addEventListener("scroll", handler, { passive: true });
    return () => {
      container.removeEventListener("scroll", handler);
      if (scrollTimer) cancelAnimationFrame(scrollTimer);
    };
  }, [shorts.length, loadMore]);

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
        {loading && (
          <div className="h-screen flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
        {!loading && shorts.length === 0 && (
          <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-8">
            <span className="text-5xl">🎬</span>
            <p className="text-white font-bold text-xl">Aucun Short</p>
            <p className="text-white/50 text-sm">Les Shorts apparaîtront ici dès qu'ils seront publiés.</p>
          </div>
        )}
        {shorts.map((short, i) => {
          const inWindow = Math.abs(activeIndex - i) <= 1;
          return (
            <div key={short.id} className="h-screen snap-start snap-always overflow-hidden">
              {inWindow ? (
                <ShortItem short={short} isActive={activeIndex === i} />
              ) : null}
            </div>
          );
        })}
        {/* Loading more indicator */}
        {loadingMore && (
          <div className="h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white/50" />
          </div>
        )}
      </div>
    </div>
  );
}