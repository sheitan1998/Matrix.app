import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Radio, Youtube, ExternalLink, Maximize, Minimize2, Play } from "lucide-react";
import YouTubePlayer from "./YouTubePlayer";
import QualitySelector from "./QualitySelector";
import { useMiniPlayer } from "@/context/MiniPlayerContext";

export default function VideoPlayer({ video, showPreAd = false, onAdEnd }) {
  const [adSeconds, setAdSeconds] = useState(5);
  const [showingAd, setShowingAd] = useState(showPreAd);
  const [quality, setQuality] = useState("Auto");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mini = useMiniPlayer();
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  const isYouTube = video._source === "youtube" && !!video.id;
  const isEmbeddable = isYouTube && video.embeddable !== false;
  const isMinimized = mini.currentVideo?.id === video.id && mini.mode === "mini";

  useEffect(() => {
    if (!showingAd) return;
    if (adSeconds <= 0) {
      setShowingAd(false);
      onAdEnd?.();
      return;
    }
    const t = setTimeout(() => setAdSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [adSeconds, showingAd, onAdEnd]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Ensure single audio source: stop mini-player BEFORE the inline YouTubePlayer
  // creates its iframe. useLayoutEffect runs synchronously before passive effects,
  // so the mini-player is destroyed before the new player's async creation begins.
  useLayoutEffect(() => {
    if (mini.mode === "mini") {
      mini.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.id]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen?.();
    }
  };

  const handleMinimize = () => {
    const t = playerRef.current?.getCurrentTime?.() || 0;
    mini.minimize(video, t);
  };

  const handleReady = (player) => {
    playerRef.current = player;
  };

  if (showingAd) {
    return (
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
        <div className="absolute inset-0 gradient-matrix opacity-20" />
        <div className="relative text-center">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Publicité</p>
          <p className="text-2xl md:text-4xl font-black text-foreground">Passe à MATRIX PREMIUM</p>
          <p className="text-sm text-muted-foreground mt-2">Sans pub. Pour toujours.</p>
        </div>
        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur text-sm font-mono">
          Passer dans {adSeconds}s
        </div>
      </div>
    );
  }

  // If this video is currently in the floating mini-player, show a placeholder
  if (isMinimized) {
    return (
      <div
        className="relative aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center cursor-pointer group"
        onClick={mini.expand}
      >
        {video.thumbnail_url && (
          <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition">
            <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
          <p className="text-sm font-semibold text-white">Lecture en mini-lecteur</p>
          <p className="text-xs text-white/70">Cliquez pour agrandir</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative aspect-video w-full rounded-xl overflow-hidden bg-black group">
      {isEmbeddable ? (
        <YouTubePlayer videoId={video.id} autoplay onReady={handleReady} />
      ) : isYouTube && video.embeddable === false ? (
        <a
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block w-full h-full"
        >
          {video.thumbnail_url && (
            <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50">
            <div className="w-16 h-16 rounded-full bg-[#FF0000] flex items-center justify-center">
              <Youtube className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm font-semibold text-white flex items-center gap-1.5">
              Lecture non autorisée <ExternalLink className="w-3.5 h-3.5" />
            </p>
            <p className="text-xs text-white/70">Ouvrir sur YouTube</p>
          </div>
        </a>
      ) : video.video_url ? (
        <video src={video.video_url} poster={video.thumbnail_url} controls autoPlay className="w-full h-full" />
      ) : video.thumbnail_url ? (
        <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full grid-bg" />
      )}

      {/* Live badge */}
      {video.is_live && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-live text-white rounded-md text-xs font-bold z-10">
          <Radio className="w-3 h-3 animate-live-pulse" /> LIVE
        </div>
      )}

      {/* Player controls — YouTube embeddable only */}
      {isEmbeddable && (
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleMinimize}
            className="w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center tap-sm transition"
            aria-label="Réduire en mini-lecteur"
            title="Mini-lecteur"
          >
            <Minimize2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center tap-sm transition"
            aria-label="Plein écran"
            title={isFullscreen ? "Quitter plein écran" : "Plein écran"}
          >
            <Maximize className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Quality selector — local videos only */}
      {!isYouTube && (
        <>
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition">
            <QualitySelector current={quality} onSelect={setQuality} />
          </div>
          {quality !== "Auto" && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 text-white text-xs font-mono font-bold group-hover:opacity-0 transition">
              {quality}
            </div>
          )}
        </>
      )}
    </div>
  );
}