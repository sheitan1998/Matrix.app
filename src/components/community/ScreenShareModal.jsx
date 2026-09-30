import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Maximize, Maximize2, Volume2, VolumeX, Square } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Custom screen-share modal: opens the browser's native source picker, then shows a live
 * preview of the captured stream with fullscreen / audio-toggle / stop controls. Tracks are
 * stopped cleanly whenever the user closes the modal or stops sharing.
 */
export default function ScreenShareModal({ open, onClose, onStreamStart, onStreamStop, accent = "#00ff41" }) {
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const containerRef = useRef(null);

  // Start capture as soon as the modal opens
  const captureSource = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError("Le partage d'écran n'est pas supporté par ce navigateur.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true });
      streamRef.current = s;
      setStream(s);
      setAudioEnabled(true);
      onStreamStart?.(s);
      // React to the browser's native "stop sharing" button
      const videoTrack = s.getVideoTracks()[0];
      if (videoTrack) videoTrack.onended = handleStop;
    } catch (e) {
      if (e?.name !== "NotAllowedError" && e?.name !== "AbortError") setError("Erreur lors de la capture.");
      onClose?.();
    } finally {
      setLoading(false);
    }
  }, [onStreamStart, onClose]);

  useEffect(() => {
    if (open) captureSource();
    return () => {};
  }, [open, captureSource]);

  // Attach the stream to the <video> element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  // Fullscreen change tracking
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleStop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;
    setStream(null);
    onStreamStop?.();
    onClose?.();
  }, [onStreamStop, onClose]);

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

  if (!open) return null;

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
          {loading && (
            <div className="flex flex-col items-center gap-3 text-white/60">
              <div className="w-10 h-10 border-4 border-white/10 rounded-full animate-spin" style={{ borderTopColor: accent }} />
              <p className="text-sm">Sélectionnez une source…</p>
            </div>
          )}
          {error && <p className="text-sm text-red-400 px-6 text-center">{error}</p>}
          {stream && (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          )}
          {stream && (
            <span className="absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> En direct
            </span>
          )}
        </div>

        {/* Controls */}
        {stream && (
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
        )}
      </div>
    </div>,
    document.body
  );
}