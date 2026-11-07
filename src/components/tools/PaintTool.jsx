import React, { useEffect, useRef, useState } from "react";
import {
  X, Brush, Eraser, PenTool, Sparkles, Highlighter, SprayCan, Trash2, Download, Undo,
  Plus, Image as ImageIcon, Copy, Layers, Eye, EyeOff, ChevronUp, ChevronDown, Sliders,
} from "lucide-react";

const COLORS = ["#ffffff", "#000000", "#ef4444", "#f97316", "#fbbf24", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#06b6d4", "#84cc16", "#f59e0b"];
const SIZES = [2, 6, 12, 24, 40];
const BRUSHES = [
  { id: "brush", label: "Pinceau", icon: Brush },
  { id: "marker", label: "Feutre", icon: Highlighter },
  { id: "soft", label: "Aérographe", icon: Sparkles },
  { id: "neon", label: "Néon", icon: Sparkles },
  { id: "spray", label: "Bombe", icon: SprayCan },
  { id: "pencil", label: "Crayon", icon: PenTool },
];

const fileKey = (email) => `matrix_paint_files_${email || "guest"}`;
const loadFiles = (email) => {
  try {
    const raw = localStorage.getItem(fileKey(email));
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};
const saveFiles = (files, email) => {
  try { localStorage.setItem(fileKey(email), JSON.stringify(files)); } catch {}
};
const newFile = (name) => ({ id: `draw_${Date.now()}`, name: name || "Dessin 1", dataUrl: "" });

export default function PaintTool({ onClose, user }) {
  const displayRef = useRef(null);
  const areaRef = useRef(null);
  const layerCanvases = useRef({});
  const layersRef = useRef([]);
  const lastPoint = useRef(null);
  const drawingRef = useRef(false);
  const historyRef = useRef([]);

  const [layers, setLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [tool, setTool] = useState("brush");
  const [brush, setBrush] = useState("brush");
  const [color, setColor] = useState("#a855f7");
  const [size, setSize] = useState(12);
  const [retouchOpen, setRetouchOpen] = useState(false);
  const [adjust, setAdjust] = useState({ brightness: 100, contrast: 100, saturate: 100, blur: 0, gray: false });

  const [files, setFiles] = useState(() => {
    const saved = loadFiles(user?.email);
    if (saved?.length) return saved;
    return [newFile("Dessin 1")];
  });
  const [activeId, setActiveId] = useState(() => (loadFiles(user?.email)?.[0]?.id) || files[0]?.id);
  const activeFile = files.find((f) => f.id === activeId) || files[0];

  useEffect(() => { saveFiles(files, user?.email); }, [files, user?.email]);

  const applyLayers = (next) => { layersRef.current = next; setLayers(next); };

  const composite = () => {
    const display = displayRef.current;
    if (!display) return;
    const ctx = display.getContext("2d");
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#0a050f";
    ctx.fillRect(0, 0, display.width, display.height);
    layersRef.current.forEach((layer) => {
      if (!layer.visible) return;
      const lc = layerCanvases.current[layer.id];
      if (!lc) return;
      ctx.globalAlpha = layer.opacity ?? 1;
      ctx.drawImage(lc, 0, 0);
    });
    ctx.globalAlpha = 1;
  };

  const persist = () => {
    const display = displayRef.current;
    if (!display || !activeFile) return;
    const dataUrl = display.toDataURL();
    setFiles((prev) => prev.map((f) => (f.id === activeFile.id ? { ...f, dataUrl } : f)));
  };

  const buildScene = () => {
    const display = displayRef.current;
    const parent = display?.parentElement;
    if (!display || !parent) return;
    const w = Math.max(320, parent.clientWidth);
    const h = Math.max(240, parent.clientHeight);
    display.width = w;
    display.height = h;
    layerCanvases.current = {};
    const id = `l_${Date.now()}`;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    layerCanvases.current[id] = canvas;
    applyLayers([{ id, name: "Calque 1", visible: true, opacity: 1 }]);
    setActiveLayerId(id);
    historyRef.current = [];
    if (activeFile?.dataUrl) {
      const img = new Image();
      img.onload = () => {
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        composite();
      };
      img.src = activeFile.dataUrl;
    } else {
      requestAnimationFrame(composite);
    }
  };

  useEffect(() => { buildScene(); }, [activeId]);

  useEffect(() => {
    layersRef.current = layers;
    composite();
  }, [layers]);

  useEffect(() => {
    const onResize = () => {
      const display = displayRef.current;
      if (!display) return;
      const parent = display.parentElement;
      if (!parent) return;
      const w = Math.max(320, parent.clientWidth);
      const h = Math.max(240, parent.clientHeight);
      if (w === display.width && h === display.height) return;
      const snapshot = display.toDataURL();
      display.width = w;
      display.height = h;
      Object.keys(layerCanvases.current).forEach((key) => {
        const old = layerCanvases.current[key];
        const fresh = document.createElement("canvas");
        fresh.width = w;
        fresh.height = h;
        fresh.getContext("2d").drawImage(old, 0, 0, w, h);
        layerCanvases.current[key] = fresh;
      });
      const img = new Image();
      img.onload = () => composite();
      img.src = snapshot;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0];

  const snapshot = () => {
    const lc = layerCanvases.current[activeLayerId];
    if (!lc) return;
    historyRef.current = [...historyRef.current.slice(-24), { layerId: activeLayerId, dataUrl: lc.toDataURL() }];
  };

  const undo = () => {
    const last = historyRef.current.pop();
    if (!last) return;
    const lc = layerCanvases.current[last.layerId];
    if (!lc) return;
    const img = new Image();
    img.onload = () => {
      const ctx = lc.getContext("2d");
      ctx.clearRect(0, 0, lc.width, lc.height);
      ctx.drawImage(img, 0, 0);
      composite();
      persist();
    };
    img.src = last.dataUrl;
  };

  const point = (e) => {
    const display = displayRef.current;
    const rect = display.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * display.width,
      y: ((e.clientY - rect.top) / rect.height) * display.height,
    };
  };

  const paint = (x, y) => {
    const lc = layerCanvases.current[activeLayerId];
    if (!lc) return;
    const ctx = lc.getContext("2d");
    const isEraser = tool === "eraser";
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineCap = brush === "marker" ? "square" : "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brush === "pencil" ? Math.max(1, size / 3) : size;
    ctx.globalAlpha = brush === "marker" || brush === "soft" ? 0.4 : 1;
    ctx.shadowBlur = 0;
    if (!isEraser && brush === "neon") { ctx.shadowColor = color; ctx.shadowBlur = size * 1.8; }
    if (!isEraser && brush === "soft") { ctx.shadowColor = color; ctx.shadowBlur = size * 1.2; }

    if (brush === "spray" && !isEraser) {
      for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * size;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, Math.max(0.6, size * 0.07), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (lastPoint.current) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    lastPoint.current = { x, y };
    composite();
  };

  const start = (e) => {
    e.preventDefault();
    if (!activeLayerId) return;
    snapshot();
    drawingRef.current = true;
    lastPoint.current = null;
    const p = point(e);
    paint(p.x, p.y);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const move = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const p = point(e);
    paint(p.x, p.y);
  };

  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPoint.current = null;
    persist();
  };

  const addLayer = () => {
    const display = displayRef.current;
    if (!display) return;
    const id = `l_${Date.now()}`;
    const canvas = document.createElement("canvas");
    canvas.width = display.width;
    canvas.height = display.height;
    layerCanvases.current[id] = canvas;
    applyLayers([...layersRef.current, { id, name: `Calque ${layersRef.current.length + 1}`, visible: true, opacity: 1 }]);
    setActiveLayerId(id);
  };

  const deleteLayer = () => {
    if (layers.length <= 1) return;
    const remaining = layers.filter((l) => l.id !== activeLayerId);
    delete layerCanvases.current[activeLayerId];
    applyLayers(remaining);
    setActiveLayerId(remaining[remaining.length - 1].id);
    persist();
  };

  const updateLayer = (id, patch) => {
    applyLayers(layersRef.current.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const moveLayer = (dir) => {
    const index = layers.findIndex((l) => l.id === activeLayerId);
    const target = index + dir;
    if (index < 0 || target < 0 || target >= layers.length) return;
    const next = [...layers];
    [next[index], next[target]] = [next[target], next[index]];
    applyLayers(next);
    persist();
  };

  const clearLayer = () => {
    const lc = layerCanvases.current[activeLayerId];
    if (!lc) return;
    snapshot();
    lc.getContext("2d").clearRect(0, 0, lc.width, lc.height);
    composite();
    persist();
  };

  const importPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const display = displayRef.current;
        const id = `l_${Date.now()}`;
        const canvas = document.createElement("canvas");
        canvas.width = display.width;
        canvas.height = display.height;
        const ratio = Math.min(display.width / img.width, display.height / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        canvas.getContext("2d").drawImage(img, (display.width - w) / 2, (display.height - h) / 2, w, h);
        layerCanvases.current[id] = canvas;
        applyLayers([...layersRef.current, { id, name: file.name.slice(0, 18), visible: true, opacity: 1 }]);
        setActiveLayerId(id);
        setRetouchOpen(true);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const applyAdjustments = () => {
    const lc = layerCanvases.current[activeLayerId];
    if (!lc) return;
    snapshot();
    const tmp = document.createElement("canvas");
    tmp.width = lc.width;
    tmp.height = lc.height;
    const tctx = tmp.getContext("2d");
    tctx.filter = `brightness(${adjust.brightness}%) contrast(${adjust.contrast}%) saturate(${adjust.saturate}%) blur(${adjust.blur}px)${adjust.gray ? " grayscale(1)" : ""}`;
    tctx.drawImage(lc, 0, 0);
    const ctx = lc.getContext("2d");
    ctx.clearRect(0, 0, lc.width, lc.height);
    ctx.drawImage(tmp, 0, 0);
    composite();
    persist();
  };

  const download = () => {
    const display = displayRef.current;
    if (!display) return;
    const a = document.createElement("a");
    a.href = display.toDataURL("image/png");
    a.download = `${activeFile?.name || "dessin"}.png`;
    a.click();
  };

  const addFile = () => {
    const created = newFile(`Dessin ${files.length + 1}`);
    setFiles((prev) => [...prev, created]);
    setActiveId(created.id);
  };

  const duplicateFile = () => {
    const created = newFile(`${activeFile.name} (copie)`);
    created.dataUrl = activeFile.dataUrl;
    setFiles((prev) => [...prev, created]);
    setActiveId(created.id);
  };

  const deleteFile = () => {
    if (files.length <= 1) return;
    const remaining = files.filter((f) => f.id !== activeFile.id);
    setFiles(remaining);
    setActiveId(remaining[0].id);
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(236,72,153,0.14)", border: "1px solid rgba(236,72,153,0.45)", boxShadow: "0 0 12px rgba(236,72,153,0.35)" }}>
            <Brush className="h-4 w-4 text-[#ec4899]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Paint Matrix Avancé</h2>
            <p className="text-[10px] text-white/40">Calques · brosses · retouche photo</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={undo} title="Annuler" className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <Undo className="h-3.5 w-3.5" />
          </button>
          <button onClick={download} title="Exporter PNG" className="flex h-7 w-7 items-center justify-center rounded-lg text-green-400 tap-sm" style={{ background: "rgba(34,197,94,0.1)" }}>
            <Download className="h-3.5 w-3.5" />
          </button>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
        {files.map((f) => (
          <button key={f.id} onClick={() => setActiveId(f.id)} className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold" style={{
            background: f.id === activeFile.id ? "rgba(236,72,153,0.2)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${f.id === activeFile.id ? "rgba(236,72,153,0.5)" : "rgba(255,255,255,0.06)"}`,
            color: f.id === activeFile.id ? "#fff" : "rgba(255,255,255,0.4)",
          }}>
            <ImageIcon className="h-3 w-3" /> {f.name}
          </button>
        ))}
        <button onClick={addFile} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/50 hover:text-white" style={{ background: "rgba(255,255,255,0.05)" }}>
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button onClick={duplicateFile} className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[9px] font-bold text-white/50" style={{ background: "rgba(255,255,255,0.04)" }}>
          <Copy className="h-2.5 w-2.5" /> Dupliquer
        </button>
        <button onClick={deleteFile} disabled={files.length <= 1} className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[9px] font-bold text-red-400 disabled:opacity-30" style={{ background: "rgba(239,68,68,0.1)" }}>
          <Trash2 className="h-2.5 w-2.5" /> Suppr.
        </button>
      </div>

      <div className="flex flex-1 gap-2 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <button onClick={() => setTool("brush")} className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: tool === "brush" ? "rgba(236,72,153,0.25)" : "rgba(255,255,255,0.05)", color: tool === "brush" ? "#f9a8d4" : "rgba(255,255,255,0.4)" }}>
              <Brush className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setTool("eraser")} className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: tool === "eraser" ? "rgba(236,72,153,0.25)" : "rgba(255,255,255,0.05)", color: tool === "eraser" ? "#f9a8d4" : "rgba(255,255,255,0.4)" }}>
              <Eraser className="h-3.5 w-3.5" />
            </button>

            <div className="mx-0.5 h-5 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />

            {BRUSHES.map((b) => (
              <button key={b.id} onClick={() => { setBrush(b.id); setTool("brush"); }} title={b.label} className="flex h-7 w-7 items-center justify-center rounded-lg" style={{
                background: brush === b.id && tool === "brush" ? "rgba(236,72,153,0.22)" : "rgba(255,255,255,0.05)",
                color: brush === b.id && tool === "brush" ? "#f9a8d4" : "rgba(255,255,255,0.4)",
              }}>
                <b.icon className="h-3.5 w-3.5" />
              </button>
            ))}

            <div className="mx-0.5 h-5 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />

            {COLORS.map((c) => (
              <button key={c} onClick={() => { setColor(c); setTool("brush"); }} className="h-5 w-5 rounded-full transition" style={{ background: c, border: color === c && tool === "brush" ? "2px solid #ec4899" : "1px solid rgba(255,255,255,0.2)" }} />
            ))}
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-6 w-6 cursor-pointer rounded-md border-0 bg-transparent" title="Couleur personnalisée" />

            <div className="mx-0.5 h-5 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />

            {SIZES.map((s) => (
              <button key={s} onClick={() => setSize(s)} className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: size === s ? "rgba(236,72,153,0.2)" : "transparent" }}>
                <span className="rounded-full" style={{ width: `${Math.min(18, s)}px`, height: `${Math.min(18, s)}px`, background: color }} />
              </button>
            ))}
            <button onClick={clearLayer} title="Effacer le calque" className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-red-400" style={{ background: "rgba(239,68,68,0.1)" }}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div ref={areaRef} className="relative min-h-[240px] flex-1 overflow-hidden rounded-xl" style={{ border: "1px solid rgba(236,72,153,0.3)", boxShadow: "inset 0 0 30px rgba(236,72,153,0.08)" }}>
            <canvas
              ref={displayRef}
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerLeave={end}
              onPointerCancel={end}
              className="block h-full w-full cursor-crosshair"
              style={{ touchAction: "none" }}
            />
          </div>
        </div>

        <div className="flex w-40 shrink-0 flex-col gap-2 overflow-y-auto scrollbar-thin">
          <div className="rounded-xl p-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(236,72,153,0.18)" }}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white/40"><Layers className="h-3 w-3" /> Calques</span>
              <div className="flex items-center gap-0.5">
                <button onClick={addLayer} title="Ajouter" className="flex h-5 w-5 items-center justify-center rounded text-[#f9a8d4] hover:bg-white/10"><Plus className="h-3 w-3" /></button>
                <button onClick={deleteLayer} disabled={layers.length <= 1} title="Supprimer" className="flex h-5 w-5 items-center justify-center rounded text-red-400 disabled:opacity-30"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>

            <div className="space-y-1">
              {[...layers].reverse().map((layer) => (
                <div key={layer.id} className="flex items-center gap-1 rounded-lg px-1.5 py-1" style={{
                  background: layer.id === activeLayerId ? "rgba(236,72,153,0.18)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${layer.id === activeLayerId ? "rgba(236,72,153,0.45)" : "rgba(255,255,255,0.05)"}`,
                }}>
                  <button onClick={() => updateLayer(layer.id, { visible: !layer.visible })} className="text-white/50 hover:text-white">
                    {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </button>
                  <button onClick={() => setActiveLayerId(layer.id)} className="min-w-0 flex-1 truncate text-left text-[10px]" style={{ color: layer.id === activeLayerId ? "#fff" : "rgba(255,255,255,0.45)" }}>
                    {layer.name}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-1.5 flex items-center gap-1">
              <button onClick={() => moveLayer(1)} title="Monter" className="flex h-5 flex-1 items-center justify-center rounded bg-white/5 text-white/50 hover:text-white"><ChevronUp className="h-3 w-3" /></button>
              <button onClick={() => moveLayer(-1)} title="Descendre" className="flex h-5 flex-1 items-center justify-center rounded bg-white/5 text-white/50 hover:text-white"><ChevronDown className="h-3 w-3" /></button>
            </div>

            {activeLayer && (
              <div className="mt-2">
                <div className="mb-0.5 flex items-center justify-between text-[9px] text-white/35">
                  <span>Opacité</span><span>{Math.round((activeLayer.opacity ?? 1) * 100)}%</span>
                </div>
                <input type="range" min="0" max="100" value={Math.round((activeLayer.opacity ?? 1) * 100)} onChange={(e) => updateLayer(activeLayer.id, { opacity: Number(e.target.value) / 100 })} className="w-full accent-[#ec4899]" />
              </div>
            )}
          </div>

          <div className="rounded-xl p-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(236,72,153,0.18)" }}>
            <button onClick={() => setRetouchOpen((v) => !v)} className="flex w-full items-center justify-between text-[9px] font-bold uppercase tracking-wider text-white/40">
              <span className="flex items-center gap-1"><Sliders className="h-3 w-3" /> Retouche</span>
              <ChevronDown className={`h-3 w-3 transition ${retouchOpen ? "rotate-180" : ""}`} />
            </button>

            {retouchOpen && (
              <div className="mt-2 space-y-2">
                <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg py-1.5 text-[9px] font-bold text-[#f9a8d4]" style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.35)" }}>
                  <ImageIcon className="h-3 w-3" /> Importer une photo
                  <input type="file" accept="image/*" className="hidden" onChange={importPhoto} />
                </label>

                {[
                  ["brightness", "Luminosité", 30, 180],
                  ["contrast", "Contraste", 30, 180],
                  ["saturate", "Saturation", 0, 200],
                  ["blur", "Flou", 0, 12],
                ].map(([key, label, min, max]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between text-[9px] text-white/35">
                      <span>{label}</span><span>{adjust[key]}</span>
                    </div>
                    <input type="range" min={min} max={max} value={adjust[key]} onChange={(e) => setAdjust({ ...adjust, [key]: Number(e.target.value) })} className="w-full accent-[#ec4899]" />
                  </div>
                ))}

                <button onClick={() => setAdjust({ ...adjust, gray: !adjust.gray })} className="w-full rounded-lg py-1 text-[9px] font-bold" style={{
                  background: adjust.gray ? "rgba(236,72,153,0.18)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${adjust.gray ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: adjust.gray ? "#f9a8d4" : "rgba(255,255,255,0.45)",
                }}>Noir & blanc</button>

                <button onClick={applyAdjustments} className="w-full rounded-lg py-1.5 text-[9px] font-black text-black" style={{ background: "linear-gradient(135deg,#ec4899,#f472b6)" }}>
                  Appliquer au calque
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}