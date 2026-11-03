import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Upload, Download, Wand2, RotateCw, FlipHorizontal2, Crop as CropIcon,
  Loader2, Lock, Image as ImageIcon, Undo2,
} from "lucide-react";
import { PHOTO_PRESETS, PHOTO_ASPECTS, DEFAULT_ADJUSTMENTS, cssFilter } from "./photoPresets";

const SLIDERS = [
  { key: "brightness", label: "Luminosité", min: 20, max: 200, unit: "%" },
  { key: "contrast", label: "Contraste", min: 20, max: 200, unit: "%" },
  { key: "saturation", label: "Saturation", min: 0, max: 250, unit: "%" },
  { key: "hue", label: "Teinte", min: 0, max: 360, unit: "°" },
  { key: "blur", label: "Flou", min: 0, max: 12, unit: "px" },
  { key: "grayscale", label: "Noir & Blanc", min: 0, max: 100, unit: "%" },
  { key: "sepia", label: "Sépia", min: 0, max: 100, unit: "%" },
];

export default function PhotoEditor({ isPro, onNeedPro }) {
  const [source, setSource] = useState("");
  const [image, setImage] = useState(null);
  const [adj, setAdj] = useState(DEFAULT_ADJUSTMENTS);
  const [preset, setPreset] = useState("original");
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [aspect, setAspect] = useState("original");
  const [tolerance, setTolerance] = useState(40);
  const [removing, setRemoving] = useState(false);
  const [hasCutout, setHasCutout] = useState(false);

  useEffect(() => {
    if (!source) { setImage(null); return; }
    const el = new Image();
    el.decoding = "async";
    el.onload = () => setImage(el);
    el.src = source;
  }, [source]);

  const filter = useMemo(() => cssFilter(adj), [adj]);
  const activeAspect = PHOTO_ASPECTS.find((a) => a.value === aspect);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Choisis un fichier image."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setSource(reader.result);
      setAdj(DEFAULT_ADJUSTMENTS);
      setPreset("original");
      setRotation(0);
      setFlipped(false);
      setAspect("original");
      setHasCutout(false);
    };
    reader.readAsDataURL(file);
  };

  const applyPreset = (p) => {
    setPreset(p.key);
    setAdj({ ...DEFAULT_ADJUSTMENTS, ...p.adj });
  };

  const reset = () => {
    setAdj(DEFAULT_ADJUSTMENTS);
    setPreset("original");
    setRotation(0);
    setFlipped(false);
    setAspect("original");
  };

  const removeBackground = async () => {
    if (!isPro) { onNeedPro?.(); return; }
    if (!image) { toast.error("Importe une image d'abord."); return; }
    setRemoving(true);
    try {
      const maxSide = 1600;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const w = Math.max(1, Math.round(image.width * scale));
      const h = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, w, h);
      const frame = ctx.getImageData(0, 0, w, h);
      const px = frame.data;

      // Couleur dominante sur les bords = arrière-plan supposé
      const step = Math.max(1, Math.floor(Math.min(w, h) / 60));
      const samples = [];
      for (let x = 0; x < w; x += step) samples.push([x, 0], [x, h - 1]);
      for (let y = 0; y < h; y += step) samples.push([0, y], [w - 1, y]);
      let r = 0, g = 0, b = 0;
      samples.forEach(([x, y]) => {
        const i = (y * w + x) * 4;
        r += px[i]; g += px[i + 1]; b += px[i + 2];
      });
      r /= samples.length; g /= samples.length; b /= samples.length;

      const limit = Math.pow(tolerance * 2.6, 2);
      for (let i = 0; i < px.length; i += 4) {
        const dr = px[i] - r, dg = px[i + 1] - g, db = px[i + 2] - b;
        if (dr * dr + dg * dg + db * db < limit) px[i + 3] = 0;
      }
      ctx.putImageData(frame, 0, 0);
      setSource(canvas.toDataURL("image/png"));
      setHasCutout(true);
      toast.success("Arrière-plan supprimé.");
    } catch {
      toast.error("Détourage impossible sur cette image.");
    } finally {
      setRemoving(false);
    }
  };

  const exportImage = () => {
    if (!image) return;
    const ratio = activeAspect?.ratio || null;
    let cw = image.width, ch = image.height;
    if (ratio) {
      if (cw / ch > ratio) cw = ch * ratio;
      else ch = cw / ratio;
    }
    const maxOut = 2400;
    const outScale = Math.min(1, maxOut / Math.max(cw, ch));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(cw * outScale);
    canvas.height = Math.round(ch * outScale);
    const ctx = canvas.getContext("2d");
    ctx.filter = filter;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (rotation) ctx.rotate((rotation * Math.PI) / 180);
    if (flipped) ctx.scale(-1, 1);
    ctx.drawImage(
      image,
      (image.width - cw) / 2, (image.height - ch) / 2, cw, ch,
      -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height
    );
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `matrix-photo-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Image exportée.");
    }, "image/png");
  };

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(18,18,22,0.7)", border: "1px solid rgba(139,92,246,0.2)" }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)" }}>
            <ImageIcon className="w-4 h-4 text-purple-300" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Éditeur photo</h3>
            <p className="text-[10px] text-white/40">Retouche, filtres, recadrage et détourage</p>
          </div>
        </div>
        {isPro && (
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full text-amber-300" style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)" }}>
            Pro
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 p-4">
        {/* Aperçu */}
        <div className="space-y-3">
          <div
            className="rounded-2xl flex items-center justify-center overflow-hidden"
            style={{
              minHeight: 300,
              border: "1px dashed rgba(255,255,255,0.1)",
              backgroundColor: "#111114",
              backgroundImage:
                "linear-gradient(45deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 75%), linear-gradient(45deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
            }}
          >
            {!source ? (
              <label className="flex flex-col items-center justify-center gap-2 cursor-pointer px-6 py-14 text-center">
                <Upload className="w-7 h-7 text-purple-300/70" />
                <span className="text-sm font-bold text-white">Importer une photo</span>
                <span className="text-[11px] text-white/40">PNG, JPG, WEBP · traitement dans ton navigateur</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              </label>
            ) : activeAspect?.ratio ? (
              <div className="w-full max-w-[520px] overflow-hidden rounded-xl" style={{ aspectRatio: activeAspect.ratio }}>
                <img src={source} alt="Aperçu" className="w-full h-full object-cover" style={{ filter, transform: `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})` }} />
              </div>
            ) : (
              <img src={source} alt="Aperçu" className="max-h-[420px] max-w-full object-contain" style={{ filter, transform: `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})` }} />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold text-white cursor-pointer" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Upload className="w-3.5 h-3.5" /> {source ? "Changer" : "Importer"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </label>
            <button onClick={() => setRotation((r) => (r + 90) % 360)} disabled={!source} className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold text-white/80 disabled:opacity-30" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <RotateCw className="w-3.5 h-3.5" /> Pivoter
            </button>
            <button onClick={() => setFlipped((f) => !f)} disabled={!source} className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold text-white/80 disabled:opacity-30" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <FlipHorizontal2 className="w-3.5 h-3.5" /> Miroir
            </button>
            <button onClick={reset} disabled={!source} className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold text-white/60 disabled:opacity-30" style={{ background: "rgba(255,255,255,0.04)" }}>
              <Undo2 className="w-3.5 h-3.5" /> Réinitialiser
            </button>
            <button onClick={exportImage} disabled={!source} className="ml-auto flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold text-white disabled:opacity-30" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
              <Download className="w-3.5 h-3.5" /> Exporter PNG
            </button>
          </div>
        </div>

        {/* Réglages */}
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Filtres</p>
            <div className="grid grid-cols-4 gap-1.5">
              {PHOTO_PRESETS.map((p) => (
                <button key={p.key} onClick={() => applyPreset(p)} disabled={!source}
                  className="aspect-square rounded-lg text-[9px] font-bold transition disabled:opacity-30"
                  style={preset === p.key
                    ? { background: "rgba(139,92,246,0.25)", border: "1px solid rgba(168,85,247,0.8)", color: "#e9d5ff" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1">
              <CropIcon className="w-3 h-3" /> Recadrage
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PHOTO_ASPECTS.map((a) => (
                <button key={a.value} onClick={() => setAspect(a.value)} disabled={!source}
                  className="h-8 px-3 rounded-lg text-[10px] font-bold transition disabled:opacity-30"
                  style={aspect === a.value
                    ? { background: "rgba(139,92,246,0.25)", border: "1px solid rgba(168,85,247,0.8)", color: "#e9d5ff" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Réglages</p>
            {SLIDERS.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-white/50">{s.label}</span>
                  <span className="text-[10px] font-mono text-white/40">{adj[s.key]}{s.unit}</span>
                </div>
                <input type="range" min={s.min} max={s.max} value={adj[s.key]} disabled={!source}
                  onChange={(e) => { setAdj((prev) => ({ ...prev, [s.key]: Number(e.target.value) })); setPreset("custom"); }}
                  className="w-full accent-purple-500 disabled:opacity-30" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-3 space-y-2" style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.2)" }}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-purple-300" /> Détourage auto
                {!isPro && <Lock className="w-3 h-3 text-amber-400" />}
              </p>
              {hasCutout && <span className="text-[9px] text-purple-300">Actif</span>}
            </div>
            <p className="text-[10px] text-white/40">Supprime l'arrière-plan uni ou clair de la photo.</p>
            {isPro && (
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-white/50">Tolérance</span>
                  <span className="text-[10px] font-mono text-white/40">{tolerance}</span>
                </div>
                <input type="range" min={5} max={90} value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} className="w-full accent-purple-500" />
              </div>
            )}
            <button onClick={removeBackground} disabled={removing || !source}
              className="w-full h-9 rounded-xl text-[11px] font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-40"
              style={{ background: isPro ? "linear-gradient(135deg, #a855f7, #7c3aed)" : "rgba(251,191,36,0.15)", border: isPro ? "none" : "1px solid rgba(251,191,36,0.4)", color: isPro ? "#fff" : "#fcd34d" }}>
              {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : !isPro ? <Lock className="w-3.5 h-3.5" /> : <Wand2 className="w-3.5 h-3.5" />}
              {removing ? "Détourage..." : isPro ? "Supprimer l'arrière-plan" : "Débloquer avec Pro — 4,99 €/mois"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}