import React, { useRef, useCallback, useState } from "react";
import { Trash2, GripVertical } from "lucide-react";

const PX_PER_SEC = 30;
const MIN_DURATION = 0.5;

/**
 * A timeline clip with:
 * - Drag-to-reorder (via @hello-pangea/dnd handle)
 * - Left/right resize handles to adjust duration / start offset
 * - Width proportional to clip.duration
 */
export default function TimelineClip({
  clip,
  index,
  zoom,
  isSelected,
  offsetSec = 0,
  onSelect,
  onRemove,
  onResize,
  provided,
}) {
  const [resizing, setResizing] = useState(null); // "left" | "right" | null
  const startXRef = useRef(0);
  const startDurRef = useRef(0);
  const startOffsetRef = useRef(0);

  const width = Math.max(40, (clip.duration || 5) * PX_PER_SEC * zoom);

  const handleResizeStart = useCallback((e, side) => {
    e.stopPropagation();
    e.preventDefault();
    setResizing(side);
    startXRef.current = e.clientX;
    startDurRef.current = clip.duration || 5;
    startOffsetRef.current = clip.start || offsetSec || 0;

    const onMove = (ev) => {
      const deltaPx = ev.clientX - startXRef.current;
      const deltaSec = deltaPx / (PX_PER_SEC * zoom);
      if (side === "right") {
        const newDur = Math.max(MIN_DURATION, startDurRef.current + deltaSec);
        onResize(clip.id, { duration: newDur });
      } else {
        // Left edge: change both start and duration so the end stays fixed
        const newDur = Math.max(MIN_DURATION, startDurRef.current - deltaSec);
        const newStart = Math.max(0, startOffsetRef.current + (startDurRef.current - newDur));
        onResize(clip.id, { duration: newDur, start: newStart });
      }
    };
    const onUp = () => {
      setResizing(null);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [clip, zoom, onResize, offsetSec]);

  return (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      onClick={() => onSelect(clip)}
      className={`relative rounded-lg overflow-hidden shrink-0 cursor-grab active:cursor-grabbing transition ${isSelected ? "ring-2 ring-purple-500" : ""}`}
      style={{ width, height: 44, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", ...(provided?.draggableProps?.style || {}) }}
    >
      {clip.type === "video" ? <video src={clip.url} className="w-full h-full object-cover pointer-events-none" muted /> : <img src={clip.url} className="w-full h-full object-cover pointer-events-none" alt="" />}
      <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 flex items-center justify-between pointer-events-none" style={{ background: "rgba(0,0,0,0.6)" }}>
        <p className="text-[8px] text-white truncate">{clip.type === "video" ? "🎬" : "🖼"} {(clip.name || "Clip").slice(0, 12)}</p>
        <span className="text-[7px] text-white/50 font-mono">{(clip.duration || 5).toFixed(1)}s</span>
      </div>
      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(clip.id); }}
        className="absolute top-0.5 right-0.5 w-4 h-4 rounded flex items-center justify-center text-white/40 hover:text-red-400 transition"
      >
        <Trash2 className="w-2.5 h-2.5" />
      </button>
      {/* Left resize handle */}
      <div
        onMouseDown={(e) => handleResizeStart(e, "left")}
        className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize hover:bg-white/20 flex items-center justify-center"
      >
        <GripVertical className="w-2 h-3 text-white/30" />
      </div>
      {/* Right resize handle */}
      <div
        onMouseDown={(e) => handleResizeStart(e, "right")}
        className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-white/20 flex items-center justify-center"
      >
        <GripVertical className="w-2 h-3 text-white/30" />
      </div>
      {/* Transition badge */}
      {clip.transition && clip.transition !== "none" && (
        <div className="absolute top-0.5 left-3 px-1 rounded text-[7px] font-bold text-white/80" style={{ background: "rgba(168,85,247,0.5)" }}>
          {clip.transition}
        </div>
      )}
    </div>
  );
}