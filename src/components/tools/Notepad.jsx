import React, { useState, useEffect, useRef } from "react";
import { X, GripVertical } from "lucide-react";

const STORAGE_KEY = "matrix_notepad_state";
const MIN_W = 320;
const MIN_H = 240;

export default function Notepad({ onClose }) {
  const [pos, setPos] = useState({ x: 80, y: 80 });
  const [size, setSize] = useState({ w: 520, h: 420 });
  const [content, setContent] = useState("");
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.pos) setPos(s.pos);
        if (s.size) setSize(s.size);
        if (s.content !== undefined) setContent(s.content);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pos, size, content }));
  }, [pos, size, content]);

  const onDragStart = (e) => {
    setDragging(true);
    dragRef.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const dx = e.clientX - dragRef.current.mx;
      const dy = e.clientY - dragRef.current.my;
      const maxX = window.innerWidth - size.w;
      const maxY = window.innerHeight - 50;
      setPos({
        x: Math.max(0, Math.min(maxX, dragRef.current.px + dx)),
        y: Math.max(0, Math.min(maxY, dragRef.current.py + dy)),
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, size.w]);

  const onResizeStart = (e) => {
    e.stopPropagation();
    setResizing(true);
    resizeRef.current = { mx: e.clientX, my: e.clientY, w: size.w, h: size.h };
  };

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e) => {
      const dw = e.clientX - resizeRef.current.mx;
      const dh = e.clientY - resizeRef.current.my;
      const maxW = window.innerWidth - pos.x;
      const maxH = window.innerHeight - pos.y;
      setSize({
        w: Math.max(MIN_W, Math.min(maxW, resizeRef.current.w + dw)),
        h: Math.max(MIN_H, Math.min(maxH, resizeRef.current.h + dh)),
      });
    };
    const onUp = () => setResizing(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizing, pos.x, pos.y]);

  return (
    <div
      className="fixed z-50 flex flex-col rounded-2xl"
      style={{
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        background: "#13101a",
        border: "1px solid rgba(77,121,255,0.3)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(77,121,255,0.15)",
      }}
    >
      {/* Drag header */}
      <div
        onMouseDown={onDragStart}
        className="flex items-center justify-between px-4 py-2.5 cursor-move rounded-t-2xl select-none shrink-0"
        style={{ background: "rgba(77,121,255,0.08)", borderBottom: "1px solid rgba(77,121,255,0.15)" }}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-white/30" />
          <span className="text-sm font-bold text-white">Bloc-notes</span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition tap-sm"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Text area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Commence à écrire tes notes..."
        className="flex-1 w-full bg-transparent text-white placeholder-white/20 outline-none resize-none p-4 text-sm leading-relaxed font-mono scrollbar-thin"
        style={{ caretColor: "#4D79FF" }}
      />

      {/* Resize handle */}
      <div
        onMouseDown={onResizeStart}
        className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize"
        style={{
          background: "linear-gradient(135deg, transparent 50%, rgba(77,121,255,0.4) 50%)",
          borderBottomRightRadius: "1rem",
        }}
      />
    </div>
  );
}