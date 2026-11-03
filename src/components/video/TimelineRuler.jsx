import React, { useCallback, useRef } from "react";

function formatTime(sec) {
  const s = Math.max(0, sec);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/**
 * Règle temporelle interactive : clic ou glisser libre pour déplacer la tête de lecture.
 */
export default function TimelineRuler({ duration, playhead, onSeek }) {
  const trackRef = useRef(null);
  const dragRef = useRef(false);

  const seekFromClientX = useCallback(
    (clientX) => {
      const el = trackRef.current;
      if (!el || !duration) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    },
    [duration, onSeek]
  );

  const handlePointerDown = (e) => {
    e.preventDefault();
    dragRef.current = true;
    seekFromClientX(e.clientX);

    const onMove = (ev) => {
      if (dragRef.current) seekFromClientX(ev.clientX);
    };
    const onUp = () => {
      dragRef.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const steps = Math.max(4, Math.min(24, Math.ceil(duration / 5)));
  const progress = duration ? Math.min(100, Math.max(0, (playhead / duration) * 100)) : 0;

  return (
    <div className="flex items-center px-1 py-0.5 select-none" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
      <div className="w-16 shrink-0" />
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        className="flex-1 relative h-6 cursor-ew-resize touch-none"
        title="Clique ou glisse pour positionner la tête de lecture"
      >
        {Array.from({ length: steps + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 flex flex-col items-center pointer-events-none"
            style={{ left: `${(i / steps) * 100}%`, transform: "translateX(-50%)" }}
          >
            <div className="w-px h-2" style={{ background: "rgba(255,255,255,0.12)" }} />
            <span className="text-[8px] text-white/30 font-mono">{formatTime((i / steps) * duration)}</span>
          </div>
        ))}
        <div
          className="absolute top-0 bottom-0 w-px pointer-events-none"
          style={{ left: `${progress}%`, background: "#ec4899", zIndex: 5 }}
        />
        <div
          className="absolute -bottom-0.5 w-2.5 h-2.5 rounded-full pointer-events-none -translate-x-1/2"
          style={{ left: `${progress}%`, background: "#ec4899", boxShadow: "0 0 8px rgba(236,72,153,0.8)", zIndex: 6 }}
        />
      </div>
    </div>
  );
}