import React, { useRef, useEffect, useState, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Maximize2 } from "lucide-react";

const TRANSITION_DURATIONS = {
  fade: 500, slide: 600, zoom: 500, wipe: 500, flash: 300,
  rotate: 600, bounce: 600, dissolve: 500, blur: 500,
};

/**
 * Preview stage with:
 * - Robust multi-clip sequential playback (resets player state on clip change)
 * - Real-time playhead via requestAnimationFrame (drives everything from absolute time)
 * - Free-positionable text overlays with new styles (drag-and-drop)
 * - CSS transition animations between clips (9 transitions)
 * - New visual effects: grayscale, sepia, invert, hue-rotate
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
  const playheadRef = useRef(playhead);
  const [currentClipId, setCurrentClipId] = useState(null);

  // Keep playhead ref in sync
  playheadRef.current = playhead;

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

  // When active clip changes, reset player + trigger transition animation
  useEffect(() => {
    if (activeClip?.id && currentClipId !== activeClip.id) {
      setCurrentClipId(activeClip.id);
      // Reset video element for new clip
      const v = videoRef.current;
      if (v) {
        try { v.pause(); } catch {}
        v.removeAttribute("src");
        v.load();
      }
    }
  }, [activeClip?.id]);

  // Set video src + seek when clip changes or when seeking
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !activeClip) return;
    // Set src if changed
    if (v.src !== activeClip.url) {
      v.src = activeClip.url;
      v.load();
    }
    const localTime = playhead - activeClipStart;
    if (Math.abs(v.currentTime - localTime) > 0.3) {
      try { v.currentTime = Math.max(0, localTime); } catch {}
    }
  }, [activeClip, activeClipStart, playhead]);

  // Play/pause the active video element
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      // Ensure video is ready before playing
      const attemptPlay = () => {
        v.play().catch(() => {
          // Retry after a short delay if blocked
          setTimeout(() => { if (isPlaying) v.play().catch(() => {}); }, 200);
        });
      };
      if (v.readyState >= 2) attemptPlay();
      else { v.oncanplay = attemptPlay; }
    } else {
      v.pause();
    }
    return () => { if (v) v.oncanplay = null; };
  }, [isPlaying, activeClipIdx]);

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
      const newTime = playheadRef.current + dt;
      if (newTime >= totalDuration) {
        onSeek(totalDuration);
        // Stop playback at end
        return;
      }
      onSeek(newTime);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying, totalDuration]);

  // Text overlay drag state
  const [draggingText, setDraggingText] = useState(null);

  const handleTextDragStart = useCallback((e, overlay) => {
    e.stopPropagation();
    e.preventDefault();
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

  const transitionName = activeClip?.transition && activeClip.transition !== "none"
    ? activeClip.transition : null;
  const transitionDur = transitionName ? (TRANSITION_DURATIONS[transitionName] || 500) : 0;

  return (
    <div className="shrink-0 flex items-center justify-center p-3" style={{ background: "#000" }}>
      <div ref={containerRef} className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden" style={{ background: "#0a0a0c" }}>
        {clips.length > 0 && activeClip ? (
          <video
            key={activeClip.id}
            ref={videoRef}
            className="w-full h-full object-contain"
            style={{
              filter: getClipFilter(activeClip),
              animation: transitionName ? `tr-${transitionName} ${transitionDur}ms ease-out` : undefined,
            }}
            muted
            playsInline
            preload="auto"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0a0c, #1a1a2e)" }}>
            <p className="text-sm text-white/30">Aperçu — importe un média pour commencer</p>
          </div>
        )}

        {/* Text overlays — freely positionable with new styles */}
        {(textOverlays || []).filter(t => {
          const ts = t.start || 0;
          const te = ts + (t.duration || 3);
          return playhead >= ts && playhead < te;
        }).map(t => {
          const style = getTextStyle(t);
          return (
            <div
              key={t.id}
              onMouseDown={(e) => handleTextDragStart(e, t)}
              className={`absolute select-none ${draggingText === t.id ? "cursor-grabbing" : "cursor-grab"} ${style.className}`}
              style={{
                left: `${t.x ?? 50}%`,
                top: `${t.y ?? 10}%`,
                color: t.color || "#ffffff",
                fontSize: `${t.fontSize || 18}px`,
                ...style.css,
              }}
            >
              <span>{t.text}</span>
            </div>
          );
        })}

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

        {/* Transition keyframe animations — all 9 transitions */}
        <style>{`
          @keyframes tr-fade { from { opacity: 0; } to { opacity: 1; } }
          @keyframes tr-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes tr-zoom { from { transform: scale(1.4); opacity: 0.3; } to { transform: scale(1); opacity: 1; } }
          @keyframes tr-wipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
          @keyframes tr-flash { 0% { opacity: 0; filter: brightness(4); } 30% { opacity: 1; filter: brightness(4); } 100% { filter: brightness(1); } }
          @keyframes tr-rotate { from { transform: rotate(-15deg) scale(0.8); opacity: 0; } to { transform: rotate(0deg) scale(1); opacity: 1; } }
          @keyframes tr-bounce { 0% { transform: translateY(-100%); } 60% { transform: translateY(10%); } 80% { transform: translateY(-5%); } 100% { transform: translateY(0); } }
          @keyframes tr-dissolve { from { opacity: 0; filter: blur(10px); } to { opacity: 1; filter: blur(0px); } }
          @keyframes tr-blur { from { filter: blur(20px) brightness(0.5); } to { filter: blur(0px) brightness(1); } }
        `}</style>
      </div>
    </div>
  );
}

function getClipFilter(clip) {
  if (!clip?.effects) return "none";
  const e = clip.effects;
  const parts = [
    `brightness(${e.brightness ?? 100}%)`, `contrast(${e.contrast ?? 100}%)`,
    `saturate(${e.saturation ?? 100}%)`, e.blur ? `blur(${e.blur}px)` : "",
  ];
  if (e.grayscale) parts.push(`grayscale(${e.grayscale}%)`);
  if (e.sepia) parts.push(`sepia(${e.sepia}%)`);
  if (e.invert) parts.push(`invert(${e.invert}%)`);
  if (e.hueRotate) parts.push(`hue-rotate(${e.hueRotate}deg)`);
  return parts.filter(Boolean).join(" ") || "none";
}

const TEXT_STYLES = {
  default: { className: "px-4 py-2 rounded-lg font-bold", css: { background: "rgba(0,0,0,0.6)" } },
  outline: { className: "px-4 py-2 font-black", css: { textShadow: "0 0 3px #000, 0 0 3px #000, 0 0 3px #000, 0 0 6px #000" } },
  glow: { className: "px-4 py-2 font-bold", css: { textShadow: "0 0 10px currentColor, 0 0 20px currentColor" } },
  neon: { className: "px-4 py-2 font-black tracking-wider uppercase", css: { textShadow: "0 0 5px #ff00de, 0 0 10px #ff00de, 0 0 20px #ff00de, 0 0 40px #ff00de" } },
  cinematic: { className: "px-6 py-2 font-light italic tracking-wide", css: { background: "rgba(0,0,0,0.4)", letterSpacing: "0.15em" } },
  threeD: { className: "px-4 py-2 font-black", css: { textShadow: "1px 1px 0 #ccc, 2px 2px 0 #aaa, 3px 3px 0 #888, 4px 4px 6px rgba(0,0,0,0.5)" } },
  box: { className: "px-4 py-2 font-bold uppercase", css: { background: "rgba(124,58,237,0.8)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.3)" } },
};

function getTextStyle(t) {
  return TEXT_STYLES[t.style] || TEXT_STYLES.default;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}