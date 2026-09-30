import React, { useRef, useEffect, useState, useCallback } from "react";
import { Maximize, Minimize, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable screen-share viewer with fullscreen support.
 * Props:
 *   stream: MediaStream | null  — the getDisplayMedia stream
 *   accent: string             — accent color
 *   onStop: () => void         — called when user clicks the stop button
 *   compact?: boolean          — smaller preview (for floating panels)
 */
export default function ScreenShareView({ stream, accent = "#00ff41", onStop, compact = false, large = false }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Attach / detach the stream to the <video> element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (stream) {
      video.muted = true;
      video.srcObject = stream;
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  // Track fullscreen state changes (also fires when user presses Esc)
  useEffect(() => {
    const handler = () => {
      const fs = document.fullscreenElement;
      setIsFullscreen(fs === containerRef.current);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Cleanup stream tracks when the component unmounts
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) video.srcObject = null;
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      /* user denied or unsupported */
    }
  }, []);

  if (!stream) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        large ? "absolute inset-0" : "relative",
        "rounded-xl overflow-hidden bg-black group",
        isFullscreen && "rounded-none"
      )}
      style={{ border: `1px solid ${accent}40` }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={(e) => e.currentTarget.play().catch(() => {})}
        className={cn(
          "w-full bg-black object-contain",
          large ? "h-full" : compact ? "max-h-32" : "max-h-[60vh]",
          isFullscreen && "max-h-none h-screen"
        )}
      />

      {/* Overlay controls — always visible in fullscreen, hover in normal mode */}
      <div
        className={cn(
          "absolute top-2 right-2 flex gap-1.5 transition",
          isFullscreen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <button
          onClick={toggleFullscreen}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition hover:bg-white/20"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>
        {onStop && (
          <button
            onClick={onStop}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 transition hover:bg-red-500/20"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            title="Arrêter le partage"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Status badge */}
      {!isFullscreen && (
        <div
          className={cn(
            "absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1",
            compact && "text-[9px]"
          )}
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", color: accent }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Partage d'écran
        </div>
      )}
    </div>
  );
}