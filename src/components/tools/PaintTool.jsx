import React, { useRef, useState, useEffect } from "react";
import { X, Brush, Eraser, Trash2, Download, Undo } from "lucide-react";

const COLORS = ["#ffffff", "#000000", "#ef4444", "#f97316", "#fbbf24", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#06b6d4", "#84cc16", "#f59e0b"];
const SIZES = [2, 4, 8, 16, 32];

export default function PaintTool({ onClose }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [color, setColor] = useState("#a855f7");
  const [size, setSize] = useState(8);
  const [tool, setTool] = useState("brush");
  const [drawing, setDrawing] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0a050f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setHistory(prev => [...prev.slice(-20), canvas.toDataURL()]);
  };

  const startDraw = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = ctxRef.current;
    if (!ctx) return;
    saveState();
    setDrawing(true);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.strokeStyle = tool === "eraser" ? "#0a050f" : color;
    ctx.lineWidth = tool === "eraser" ? size * 2 : size;
  };

  const draw = (e) => {
    if (!drawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    const img = new Image();
    img.onload = () => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = last;
    setHistory(prev => prev.slice(0, -1));
  };

  const clear = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    saveState();
    ctx.fillStyle = "#0a050f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL();
    a.download = "dessin-matrix.png";
    a.click();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-black text-white">Paint Matrix</h2>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white" style={{ background: "rgba(255,255,255,0.05)" }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {/* Tools */}
        <button onClick={() => setTool("brush")} className="w-7 h-7 rounded-lg flex items-center justify-center transition" style={{ background: tool === "brush" ? "rgba(138,79,255,0.3)" : "rgba(255,255,255,0.05)", color: tool === "brush" ? "#fff" : "rgba(255,255,255,0.4)" }}>
          <Brush className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setTool("eraser")} className="w-7 h-7 rounded-lg flex items-center justify-center transition" style={{ background: tool === "eraser" ? "rgba(138,79,255,0.3)" : "rgba(255,255,255,0.05)", color: tool === "eraser" ? "#fff" : "rgba(255,255,255,0.4)" }}>
          <Eraser className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.1)" }} />

        {/* Colors */}
        {COLORS.map(c => (
          <button key={c} onClick={() => { setColor(c); setTool("brush"); }} className="w-5 h-5 rounded-full transition" style={{ background: c, border: color === c && tool === "brush" ? "2px solid #a855f7" : "1px solid rgba(255,255,255,0.2)" }} />
        ))}
        <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.1)" }} />

        {/* Sizes */}
        {SIZES.map(s => (
          <button key={s} onClick={() => setSize(s)} className="rounded-full transition flex items-center justify-center" style={{ width: "24px", height: "24px", background: size === s ? "rgba(138,79,255,0.2)" : "transparent" }}>
            <div className="rounded-full" style={{ width: `${s}px`, height: `${s}px`, background: color }} />
          </button>
        ))}
        <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.1)" }} />

        {/* Actions */}
        <button onClick={undo} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60" style={{ background: "rgba(255,255,255,0.05)" }}>
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button onClick={clear} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400" style={{ background: "rgba(239,68,68,0.1)" }}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={download} className="w-7 h-7 rounded-lg flex items-center justify-center text-green-400" style={{ background: "rgba(34,197,94,0.1)" }}>
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Canvas */}
      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          className="block w-full cursor-crosshair"
          style={{ height: "400px", touchAction: "none" }}
        />
      </div>
    </div>
  );
}