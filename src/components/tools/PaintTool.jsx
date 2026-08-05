import React, { useRef, useState, useEffect } from "react";
import { X, Brush, Eraser, Trash2, Download, Undo, Plus, Image as ImageIcon, Copy } from "lucide-react";

const COLORS = ["#ffffff", "#000000", "#ef4444", "#f97316", "#fbbf24", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#06b6d4", "#84cc16", "#f59e0b"];
const SIZES = [2, 4, 8, 16, 32];
const STORAGE_KEY = "matrix_paint_files";

function loadFiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveFiles(files) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(files)); } catch {}
}

function createNewFile(name) {
  return { id: `draw_${Date.now()}`, name: name || "Dessin 1", dataUrl: "" };
}

export default function PaintTool({ onClose }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [color, setColor] = useState("#a855f7");
  const [size, setSize] = useState(8);
  const [tool, setTool] = useState("brush");
  const [drawing, setDrawing] = useState(false);
  const [history, setHistory] = useState([]);

  const [files, setFiles] = useState(() => {
    const saved = loadFiles();
    if (saved && saved.length > 0) return saved;
    return [createNewFile("Dessin 1")];
  });
  const [activeId, setActiveId] = useState(() => files[0]?.id);

  const activeFile = files.find(f => f.id === activeId) || files[0];

  useEffect(() => { saveFiles(files); }, [files]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0a050f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
    // Load active file data
    if (activeFile?.dataUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = activeFile.dataUrl;
    }
    setHistory([]);
  }, [activeId]);

  // Resize canvas on window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const ctx = ctxRef.current;
      // Save current image
      const dataUrl = canvas.toDataURL();
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      if (ctx) {
        ctx.fillStyle = "#0a050f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.src = dataUrl;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  const stopDraw = () => {
    setDrawing(false);
    // Auto-save to file
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setFiles(prev => prev.map(f => f.id === activeFile.id ? { ...f, dataUrl } : f));
  };

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
    a.download = `${activeFile.name}.png`;
    a.click();
  };

  const addFile = () => {
    const newFile = createNewFile(`Dessin ${files.length + 1}`);
    setFiles(prev => [...prev, newFile]);
    setActiveId(newFile.id);
  };

  const duplicateFile = () => {
    const newFile = createNewFile(`${activeFile.name} (copie)`);
    newFile.dataUrl = activeFile.dataUrl;
    setFiles(prev => [...prev, newFile]);
    setActiveId(newFile.id);
  };

  const deleteFile = () => {
    if (files.length <= 1) return;
    const remaining = files.filter(f => f.id !== activeFile.id);
    setFiles(remaining);
    setActiveId(remaining[0].id);
  };

  const renameFile = (name) => {
    setFiles(prev => prev.map(f => f.id === activeFile.id ? { ...f, name } : f));
  };

  return (
    <div className="p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-black text-white">Paint Matrix</h2>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* File tabs */}
      <div className="flex items-center gap-1 mb-2 overflow-x-auto scrollbar-thin pb-1">
        {files.map(f => (
          <button key={f.id} onClick={() => setActiveId(f.id)}
            className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-[10px] font-bold whitespace-nowrap transition tap-sm"
            style={{
              background: f.id === activeFile.id ? "rgba(138,79,255,0.25)" : "rgba(255,255,255,0.03)",
              border: f.id === activeFile.id ? "1px solid rgba(138,79,255,0.4)" : "1px solid rgba(255,255,255,0.06)",
              color: f.id === activeFile.id ? "#fff" : "rgba(255,255,255,0.4)",
            }}>
            <ImageIcon className="w-3 h-3" /> {f.name}
          </button>
        ))}
        <button onClick={addFile} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white shrink-0 tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* File name + actions */}
      <div className="flex items-center gap-2 mb-2">
        <input value={activeFile.name} onChange={e => renameFile(e.target.value)}
          className="px-2 h-6 rounded text-[10px] text-white bg-transparent outline-none flex-1 max-w-[160px]"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }} />
        <button onClick={duplicateFile} className="flex items-center gap-1 px-2 h-6 rounded text-[9px] font-bold text-white/60 tap-sm" style={{ background: "rgba(255,255,255,0.04)" }}>
          <Copy className="w-2.5 h-2.5" /> Dupliquer
        </button>
        <button onClick={deleteFile} disabled={files.length <= 1} className="flex items-center gap-1 px-2 h-6 rounded text-[9px] font-bold text-red-400 disabled:opacity-30 tap-sm" style={{ background: "rgba(239,68,68,0.1)" }}>
          <Trash2 className="w-2.5 h-2.5" /> Suppr.
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button onClick={() => setTool("brush")} className="w-7 h-7 rounded-lg flex items-center justify-center transition tap-sm" style={{ background: tool === "brush" ? "rgba(138,79,255,0.3)" : "rgba(255,255,255,0.05)", color: tool === "brush" ? "#fff" : "rgba(255,255,255,0.4)" }}>
          <Brush className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setTool("eraser")} className="w-7 h-7 rounded-lg flex items-center justify-center transition tap-sm" style={{ background: tool === "eraser" ? "rgba(138,79,255,0.3)" : "rgba(255,255,255,0.05)", color: tool === "eraser" ? "#fff" : "rgba(255,255,255,0.4)" }}>
          <Eraser className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.1)" }} />
        {COLORS.map(c => (
          <button key={c} onClick={() => { setColor(c); setTool("brush"); }} className="w-5 h-5 rounded-full transition tap-sm" style={{ background: c, border: color === c && tool === "brush" ? "2px solid #a855f7" : "1px solid rgba(255,255,255,0.2)" }} />
        ))}
        <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.1)" }} />
        {SIZES.map(s => (
          <button key={s} onClick={() => setSize(s)} className="rounded-full transition flex items-center justify-center tap-sm" style={{ width: "24px", height: "24px", background: size === s ? "rgba(138,79,255,0.2)" : "transparent" }}>
            <div className="rounded-full" style={{ width: `${s}px`, height: `${s}px`, background: color }} />
          </button>
        ))}
        <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.1)" }} />
        <button onClick={undo} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button onClick={clear} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 tap-sm" style={{ background: "rgba(239,68,68,0.1)" }}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={download} className="w-7 h-7 rounded-lg flex items-center justify-center text-green-400 tap-sm" style={{ background: "rgba(34,197,94,0.1)" }}>
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Canvas - fills all available space */}
      <div className="rounded-lg overflow-hidden flex-1 relative" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          className="block w-full h-full cursor-crosshair"
          style={{ touchAction: "none" }}
        />
      </div>
    </div>
  );
}