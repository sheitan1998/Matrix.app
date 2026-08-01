import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Play, Pause, X, Maximize2 } from "lucide-react";
import YouTubePlayer from "@/components/video/YouTubePlayer";

const MiniPlayerContext = createContext({
  playVideo: () => {},
  registerSlot: () => {},
  togglePlay: () => {},
  close: () => {},
  expand: () => {},
  mode: "hidden",
  currentVideo: null,
  isPlaying: false,
});

export const useMiniPlayer = () => useContext(MiniPlayerContext);

const MINI_W = 360;
const MINI_H = 202;
const MINI_GAP = 20;
const MINI_BOTTOM = 84;

export function MiniPlayerProvider({ children }) {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [mode, setMode] = useState("hidden"); // "hidden" | "mini" | "expanded"
  const [isPlaying, setIsPlaying] = useState(false);
  const [slotEl, setSlotEl] = useState(null);
  const [slotRect, setSlotRect] = useState(null);
  const [viewport, setViewport] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1280,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  const playerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Track viewport size for mini-player positioning
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Track the Watch-page slot rect so the persistent player can overlay it
  useEffect(() => {
    if (mode !== "expanded" || !slotEl) return;
    const update = () => setSlotRect(slotEl.getBoundingClientRect());
    update();
    const ro = new ResizeObserver(update);
    ro.observe(slotEl);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [mode, slotEl]);

  // Collapse to mini-player when navigating away from /watch/
  useEffect(() => {
    if (mode === "expanded" && !location.pathname.startsWith("/watch/")) {
      setMode("mini");
    }
  }, [location.pathname, mode]);

  const registerSlot = useCallback((el) => {
    setSlotEl(el);
    if (el) setSlotRect(el.getBoundingClientRect());
  }, []);

  const playVideo = useCallback((video) => {
    setCurrentVideo(video);
    setMode(location.pathname.startsWith("/watch/") ? "expanded" : "mini");
  }, [location.pathname]);

  const handleReady = useCallback((player) => {
    playerRef.current = player;
  }, []);

  const handleStateChange = useCallback((state) => {
    setIsPlaying(state === 1); // 1 = YT.PlayerState.PLAYING
  }, []);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    const state = p.getPlayerState?.();
    if (state === 1) p.pauseVideo?.();
    else p.playVideo?.();
  }, []);

  const close = useCallback(() => {
    const p = playerRef.current;
    if (p) p.stopVideo?.();
    setCurrentVideo(null);
    setMode("hidden");
    setIsPlaying(false);
    playerRef.current = null;
  }, []);

  const expand = useCallback(() => {
    if (currentVideo) navigate(`/watch/${currentVideo.id}`);
    setMode("expanded");
  }, [currentVideo, navigate]);

  // If expanded but the slot disappeared (e.g. mid-navigation), fall back to mini
  const effectiveMode = mode === "expanded" && !slotEl ? "mini" : mode;

  const containerStyle =
    effectiveMode === "expanded" && slotRect
      ? {
          top: slotRect.top,
          left: slotRect.left,
          width: slotRect.width,
          height: slotRect.height,
          borderRadius: 0,
        }
      : {
          top: viewport.h - MINI_H - MINI_BOTTOM,
          left: viewport.w - MINI_W - MINI_GAP,
          width: MINI_W,
          height: MINI_H,
          borderRadius: 12,
        };

  const value = {
    currentVideo,
    mode: effectiveMode,
    isPlaying,
    playVideo,
    registerSlot,
    togglePlay,
    close,
    expand,
  };

  return (
    <MiniPlayerContext.Provider value={value}>
      {children}
      {currentVideo && effectiveMode !== "hidden" && (
        <div
          className="fixed z-[200] overflow-hidden bg-black shadow-2xl shadow-black/60 transition-all duration-300 ease-out group"
          style={containerStyle}
        >
          <YouTubePlayer
            videoId={currentVideo.id}
            autoplay
            onReady={handleReady}
            onStateChange={handleStateChange}
          />

          {/* Mini-player controls */}
          {effectiveMode === "mini" && (
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex items-start justify-between gap-2 px-2.5 py-2 bg-gradient-to-b from-black/85 to-transparent pointer-events-auto">
                <span className="text-xs text-white font-medium truncate flex-1 pt-0.5">
                  {currentVideo.title}
                </span>
                <button
                  onClick={close}
                  className="shrink-0 w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center tap-sm transition-colors"
                  aria-label="Fermer le lecteur"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div className="flex items-center justify-between px-2.5 py-2 bg-gradient-to-t from-black/85 to-transparent pointer-events-auto">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center tap-sm transition-colors"
                  aria-label="Lecture / Pause"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={expand}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center tap-sm transition-colors"
                  aria-label="Retour au lecteur plein écran"
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </MiniPlayerContext.Provider>
  );
}