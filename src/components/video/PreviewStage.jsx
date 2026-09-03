import React, { useRef, useEffect, useState, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Maximize2 } from "lucide-react";

const PX_PER_SEC = 30;

/**
 * Preview stage with:
 * - Multi-clip sequential playback (plays clips in order, synced to playhead)
 * - Real-time playhead via requestAnimationFrame
 * - Free-positionable text overlays (drag-and-drop)
 * - CSS transitions between clips (fade, slide, zoom, wipe, flash)
 */
export default function PreviewStage({
  clips = [],
  textOverlays = [],
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  playhead,
  onUpdateText,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const activeClipIdxRef = useRef(0);
  const [transitionKey, setTransitionKey] = useState(0);

  // Compute cumulative start times for each clip
  const clipStarts = [];
  let cumStart = 0;
  for (const c of clips) {
    clipStarts.push(c.start ?? cumStart);
    cumStart += c.duration || 5;
  }
  const totalDuration = cumStart || duration || 30;

  // Determine active clip based on playhead
  const activeClipIdx = clips.findIndex((c, i) => {
    const s = clipStarts[i];
    const e = s + (c.duration || 5);
    return playhead >= s && playhead < e;
  });
  const activeClip = activeClipIdx >= 0 ? clips[activeClipIdx] : clips[0];
  const activeClipStart = activeClipIdx >= 0 ? clipStarts[activeClipIdx] : 0;

  // When active clip changes, trigger transition animation
  useEffect(() => {
    if (activeClipIdxRef.current !== activeClipIdx && activeClipIdx >= 0) {
      activeClipIdxRef.current = activeClipIdx;
      setTransitionKey(k => k + 1);
    }
  }, [activeClipIdx]);

  // Sync video element to active clip
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !activeClip) return;
    const localTime = playhead - activeClipStart;
    if (Math.abs(v.currentTime - localTime) > 0.3) {
      try { v.currentTime = Math.max(0, localTime); } catch {}
    }
  }, [activeClip, activeClipStart, playhead]);

  // rAF playback loop — drives the playhead in real time
  useEffect(() => {
    if (!isPlaying) {
      lastTsRef.current = 0;
      return;
    }
    lastTsRef.current = performance.now();
    const loop = (ts) => {
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      onSeek(Math.min(totalDuration, playhead + dt));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying]);

  // Play/pause the active video element
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) v.play().catch(() => {});
    else v.pause();
  }, [isPlaying, activeClipIdx]);

  // Text overlay drag state
  const [draggingText, setDraggingText] = useState(null);

  const handleTextDragStart = useCallback((e, overlay) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = overlay.x ?? 50;
    const origY = overlay.y ?? 10;

    const onMove = (ev) => {
      const dx = ((ev.clientX - startX) / rect.width) * 100;
      const dy = ((ev.clientY - startY) / rect.height) * 100;
      const newX = Math.max(0, Math.min(95, origX + dx));
      const newY = Math.max(0, Math.min(95, origY + dy));
      onUpdateText(overlay.id, { x: newX, y: newY });
    };
    const onUp = () => {
      setDraggingText(null);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    setDraggingText(overlay.id);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [onUpdateText]);

  const transitionClass = activeClip?.transition && activeClip.transition !== "none"
    ? `transition-${activeClip.transition}` : "";

  return (
    <div className="shrink-0 flex items-center justify-center p-3" style={{ background: "#000" }}>
      <div ref={containerRef} className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden" style={{ background: "#0a0a0c" }}>
        {clips.length > 0 && activeClip ? (
          <video
            key={activeClip.id}
            ref={videoRef}
            src={activeClip.url}
            className={`w-full h-full object-contain ${transitionClass}`}
            style={{ filter: getClipFilter(activeClip), animation: transitionClass ? `tr-${activeClip.transition} 0.4s ease-out` : undefined }}
            onPlay={() => {}}
            onPause={() => {}}
            muted
            playsInline
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0a0c, #1a1a2e)" }}>
            <p className="text-sm text-white/30">Aperçu — importe un média pour commencer</p>
          </div>
        )}

        {/* Text overlays — freely positionable */}
        {(textOverlays || []).filter(t => {
          const ts = t.start || 0;
          const te = ts + (t.duration || 3);
          return playhead >= ts && playhead < te;
        }).map(t => (
          <div
            key={t.id}
            onMouseDown={(e) => handleTextDragStart(e, t)}
            className={`absolute px-4 py-2 rounded-lg select-none ${draggingText === t.id ? "cursor-grabbing" : "cursor-grab"}`}
            style={{
              left: `${t.x ?? 50}%`,
              top: `${t.y ?? 10}%`,
              background: "rgba(0,0,0,0.6)",
              color: t.color || "#ffffff",
              fontSize: `${t.fontSize || 14}px`,
            }}
          >
            <p className="text-sm font-bold">{t.text}</p>
          </div>
        ))}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}>
          <div className="flex items-center gap-3">
            <button onClick={onTogglePlay} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#7c3aed" }}>
              {isPlaying ? <Pause className="w-4 h-4 text-white fill-white" /> : <Play className="w-4 h-4 text-white fill-white ml-0.5" />}
            </button>
            <button onClick={() => onSeek(Math.max(0, playhead - 5))} className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white shrink-0"><SkipBack className="w-3.5 h-3.5" /></button>
            <div className="flex-1 relative">
              <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
                <div className="h-full rounded-full" style={{ width: `${(playhead / totalDuration) * 100}%`, background: "#7c3aed" }} />
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full" style={{ left: `${(playhead / totalDuration) * 100}%`, transform: "translate(-50%, -50%)", background: "#a855f7", boxShadow: "0 0 8px rgba(124,58,237,0.6)" }} />
            </div>
            <button onClick={() => onSeek(Math.min(totalDuration, playhead + 5))} className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white shrink-0"><SkipForward className="w-3.5 h-3.5" /></button>
            <span className="text-[10px] font-mono text-white/60 tabular-nums shrink-0">{formatTime(playhead)} / {formatTime(totalDuration)}</span>
            <button onClick={() => videoRef.current?.requestFullscreen?.()} className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white shrink-0"><Maximize2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Transition keyframe animations */}
        <style>{`
          @keyframes tr-fade { from { opacity: 0; } to { opacity: 1; } }
          @keyframes tr-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes tr-zoom { from { transform: scale(1.3); opacity: 0.5; } to { transform: scale(1); opacity: 1; } }
          @keyframes tr-wipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
          @keyframes tr-flash { 0% { opacity: 0; filter: brightness(3); } 30% { opacity: 1; filter: brightness(3); } 100% { filter: brightness(1); } }
        `}</style>
      </div>
    </div>
  );
}

function getClipFilter(clip) {
  if (!clip?.effects) return "none";
  const e = clip.effects;
  return [
    `brightness(${e.brightness ?? 100}%)`, `contrast(${e.contrast ?? 100}%)`,
    `saturate(${e.saturation ?? 100}%)`, e.blur ? `blur(${e.blur}px)` : "",
  ].filter(Boolean).join(" ") || "none";
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}