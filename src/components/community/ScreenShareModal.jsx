import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Maximize, Maximize2, Volume2, VolumeX, Square } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Screen-share preview modal. Revealed only AFTER a stream has been captured: the parent
 * passes the MediaStream in. Shows a live <video> preview with fullscreen, audio-toggle and
 * stop controls. Stopping or closing cleanly releases all tracks via onStop.
 */
export default function ScreenShareModal({ open, stream, onClose, onStop, accent = "#00ff41" }) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const streamRef = useRef(stream);

  useEffect(() => { streamRef.current = stream; }, [stream]);

  // Attach the stream to the <video> as soon as it arrives
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  // Reset audio toggle whenever a new stream starts
  useEffect(() => { setAudioEnabled(true); }, [stream]);

  // Fullscreen change tracking
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleStop = useCallback(() => {
    onStop?.();
    onClose?.();
  }, [onStop, onClose]);

  const toggleAudio = () => {
    if (!streamRef.current) return;
    const next = !audioEnabled;
    streamRef.current.getAudioTracks().forEach((t) => { t.enabled = next; });
    setAudioEnabled(next);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen?.();
  };

  if (!open || !stream) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        ref={containerRef}
        className={cn("relative rounded-2xl overflow-hidden bg-card border shadow-2xl", isFullscreen ? "w-full h-full rounded-none border-0" : "w-full max-w-5xl")}
        style={{ borderColor: accent + "40" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10" style={{ background: accent + "0a" }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h3 className="font-bold text-white text-sm">Partage d'écran</h3>
          </div>
          <button onClick={handleStop} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition tap-sm">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Video preview */}
        <div className={cn("relative bg-black flex items-center justify-center", isFullscreen ? "h-[calc(100%-110px)]" : "aspect-video")}>
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
          <span className="absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> En direct
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-white/10 bg-card">
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Quitter plein écran" : "Plein écran"}
            className="h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-bold text-white border border-white/20 bg-white/10 hover:bg-white/15 transition tap-sm"
          >
            {isFullscreen ? <Maximize className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? "Réduire" : "Plein écran"}
          </button>
          <button
            onClick={toggleAudio}
            title={audioEnabled ? "Couper le retour audio" : "Activer le retour audio"}
            className={cn("h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-bold border transition tap-sm",
              audioEnabled ? "border-white/20 bg-white/10 text-white hover:bg-white/15" : "border-red-500/40 bg-red-500/20 text-red-400")}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {audioEnabled ? "Audio activé" : "Audio coupé"}
          </button>
          <button
            onClick={handleStop}
            title="Arrêter le partage"
            className="h-10 px-5 rounded-xl flex items-center gap-2 text-xs font-bold text-white transition hover:opacity-90 tap-sm"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
          >
            <Square className="w-4 h-4" /> Arrêter le partage
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}