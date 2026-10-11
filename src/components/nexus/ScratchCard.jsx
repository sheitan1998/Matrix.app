import React, { useRef, useState, useEffect, useCallback } from "react";

const SCRATCH_RADIUS = 40;
const REVEAL_THRESHOLD = 50; // % of scratched area to auto-reveal

/**
 * Composant de carte à gratter interactif (canvas).
 * Affiche une grille 3x3 de symboles sous l'overlay à gratter.
 * Le résultat et la grille sont déterminés côté backend.
 */
export default function ScratchCard({ grid, result, onRevealed, disabled, onScratchStart }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const revealedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize scratch overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#2a1a3e");
    gradient.addColorStop(0.5, "#1a1a2e");
    gradient.addColorStop(1, "#2a1a3e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(168, 85, 247, 0.08)";
    for (let i = 0; i < canvas.width; i += 20) {
      for (let j = 0; j < canvas.height; j += 20) {
        ctx.fillRect(i, j, 2, 2);
      }
    }

    ctx.fillStyle = "rgba(168, 85, 247, 0.5)";
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦ GRATTEZ ICI ✦", canvas.width / 2, canvas.height / 2);

    revealedRef.current = false;
    setRevealed(false);
    setProgress(0);
  }, [grid]);

  const getScratchPercent = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d");
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparent = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparent++;
      }
      return (transparent / (pixels.length / 4)) * 100;
    } catch {
      return 0;
    }
  }, []);

  const scratch = useCallback((x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return null;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const doReveal = useCallback(() => {
    if (revealedRef.current) return;
    const pct = getScratchPercent();
    if (pct > REVEAL_THRESHOLD) {
      revealedRef.current = true;
      setRevealed(true);
      isDrawingRef.current = false;
      if (onRevealed) onRevealed();
    }
  }, [getScratchPercent, onRevealed]);

  // Global mouseup/touchend — stop drawing even if cursor left the canvas
  useEffect(() => {
    const handleGlobalEnd = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      doReveal();
    };
    window.addEventListener("mouseup", handleGlobalEnd);
    window.addEventListener("touchend", handleGlobalEnd);
    return () => {
      window.removeEventListener("mouseup", handleGlobalEnd);
      window.removeEventListener("touchend", handleGlobalEnd);
    };
  }, [doReveal]);

  const handleStart = (e) => {
    if (revealedRef.current || disabled) return;
    e.preventDefault();
    if (onScratchStart) onScratchStart();
    isDrawingRef.current = true;
    const coords = getCoords(e);
    if (coords) scratch(coords.x, coords.y);
  };

  const handleMove = (e) => {
    if (!isDrawingRef.current || revealedRef.current || disabled) return;
    e.preventDefault();
    const coords = getCoords(e);
    if (coords) {
      scratch(coords.x, coords.y);
      const pct = getScratchPercent();
      setProgress(pct);
      if (pct > REVEAL_THRESHOLD) {
        revealedRef.current = true;
        setRevealed(true);
        isDrawingRef.current = false;
        if (onRevealed) onRevealed();
      }
    }
  };

  const handleRevealNow = () => {
    if (revealedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    revealedRef.current = true;
    setRevealed(true);
    isDrawingRef.current = false;
    if (onRevealed) onRevealed();
  };

  if (!grid) return null;

  const isWin = result?.type !== "lose" && result?.type !== undefined;
  const resultColor = isWin
    ? (result?.amount >= 1000000 ? "#fbbf24" : result?.amount >= 50000 ? "#a855f7" : "#22c55e")
    : "#ef4444";

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      {/* Symbol grid + canvas */}
      <div
        className="relative rounded-2xl overflow-hidden grid grid-cols-3"
        style={{ aspectRatio: "3 / 2", touchAction: "none", background: "rgba(10,5,15,0.8)" }}
      >
        {grid.map((sym, i) => (
          <div
            key={i}
            className="flex items-center justify-center"
            style={{
              background: isWin && revealed ? `linear-gradient(135deg, ${resultColor}10, transparent)` : "transparent",
            }}
          >
            {sym?.icon && /^https?:\/\//i.test(sym.icon) ? (
              <img src={sym.icon} alt={sym?.label || ""} className="w-8 h-8 object-contain" />
            ) : (
              <span className="text-3xl">{sym?.icon || "❓"}</span>
            )}
          </div>
        ))}

        {/* Result overlay (after reveal) */}
        {revealed && result && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(4px)" }}
          >
            <div className="text-3xl mb-1">{isWin ? (result.amount >= 1000000 ? "💎" : "💰") : "😢"}</div>
            <p className="text-sm font-black text-center px-4" style={{ color: resultColor }}>
              {result.label}
            </p>
            {result.desc && (
              <p className="text-[10px] text-white/50 text-center px-4 mt-0.5">{result.desc}</p>
            )}
            {isWin && result.amount > 0 && (
              <p className="text-xl font-black mt-1 font-mono" style={{ color: resultColor }}>
                +{result.amount.toLocaleString("fr-FR")}
              </p>
            )}
          </div>
        )}

        {/* Scratch canvas overlay */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          style={{ opacity: revealed ? 0 : 1, transition: "opacity 0.3s" }}
        />
      </div>

      {/* Progress bar */}
      {!revealed && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full transition-all duration-150"
              style={{ width: `${Math.min(progress, 100)}%`, background: "linear-gradient(90deg, #a855f7, #6d28d9)" }}
            />
          </div>
          {progress > 10 && progress < REVEAL_THRESHOLD && (
            <button onClick={handleRevealNow} className="text-[10px] text-white/40 hover:text-white/70 shrink-0 tap-sm">
              Révéler
            </button>
          )}
        </div>
      )}
    </div>
  );
}