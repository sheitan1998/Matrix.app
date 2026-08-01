import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, X, Maximize2 } from "lucide-react";
import YouTubePlayer from "@/components/video/YouTubePlayer";

const MiniPlayerContext = createContext({
  minimize: () => {},
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
  const [mode, setMode] = useState("hidden"); // "hidden" | "mini"
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const seekToTimeRef = useRef(0);
  const navigate = useNavigate();

  const minimize = useCallback((video, seekTo = 0) => {
    seekToTimeRef.current = seekTo;
    setCurrentVideo(video);
    setMode("mini");
  }, []);

  const handleReady = useCallback((player) => {
    playerRef.current = player;
    if (seekToTimeRef.current > 0) {
      player.seekTo?.(seekToTimeRef.current, true);
      seekToTimeRef.current = 0;
    }
  }, []);

  const handleStateChange = useCallback((state) => {
    setIsPlaying(state === 1);
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
    if (currentVideo) {
      navigate(currentVideo.is_live ? `/live/${currentVideo.id}` : `/watch/${currentVideo.id}`);
    }
    setMode("hidden");
  }, [currentVideo, navigate]);

  const value = {
    currentVideo,
    mode,
    isPlaying,
    minimize,
    togglePlay,
    close,
    expand,
  };

  return (
    <MiniPlayerContext.Provider value={value}>
      {children}
      {currentVideo && mode === "mini" && (
        <div
          className="fixed z-[200] overflow-hidden bg-black shadow-2xl shadow-black/60 transition-all duration-300 ease-out group"
          style={{
            bottom: MINI_BOTTOM,
            right: MINI_GAP,
            width: MINI_W,
            height: MINI_H,
            borderRadius: 12,
          }}
        >
          <YouTubePlayer
            videoId={currentVideo.id}
            autoplay
            onReady={handleReady}
            onStateChange={handleStateChange}
          />

          {/* Mini-player controls */}
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
                {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
              </button>
              <button
                onClick={expand}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center tap-sm transition-colors"
                aria-label="Agrandir le lecteur"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </MiniPlayerContext.Provider>
  );
}