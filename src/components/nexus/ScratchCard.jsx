import React, { useRef, useState, useEffect, useCallback } from "react";

const SCRATCH_RADIUS = 28;
const REVEAL_THRESHOLD = 55; // % of scratched area to auto-reveal

/**
 * Composant de carte à gratter interactif (canvas).
 * Le résultat est déterminé côté backend et passé via `result`.
 * L'utilisateur gratte avec la souris pour révéler le résultat.
 */
export default function ScratchCard({ result, onRevealed, disabled, onScratchStart }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize scratch overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Set canvas size to match displayed size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw scratch overlay
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#2a1a3e");
    gradient.addColorStop(0.5, "#1a1a2e");
    gradient.addColorStop(1, "#2a1a3e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add texture pattern
    ctx.fillStyle = "rgba(168, 85, 247, 0.08)";
    for (let i = 0; i < canvas.width; i += 20) {
      for (let j = 0; j < canvas.height; j += 20) {
        ctx.fillRect(i, j, 2, 2);
      }
    }

    // Add text
    ctx.fillStyle = "rgba(168, 85, 247, 0.5)";
    ctx.font = "bold 18px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦ GRATTEZ ICI ✦", canvas.width / 2, canvas.height / 2);

    setRevealed(false);
    setProgress(0);
  }, [result]);

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

  const handleStart = (e) => {
    if (revealed || disabled) return;
    e.preventDefault();
    if (onScratchStart) onScratchStart();
    setIsDrawing(true);
    const coords = getCoords(e);
    if (coords) scratch(coords.x, coords.y);
  };

  const handleMove = (e) => {
    if (!isDrawing || revealed || disabled) return;
    e.preventDefault();
    const coords = getCoords(e);
    if (coords) {
      scratch(coords.x, coords.y);
      const pct = getScratchPercent();
      setProgress(pct);
      if (pct > REVEAL_THRESHOLD) {
        setRevealed(true);
        setIsDrawing(false);
        if (onRevealed) onRevealed();
      }
    }
  };

  const handleEnd = () => {
    setIsDrawing(false);
    if (revealed) return;
    const pct = getScratchPercent();
    if (pct > REVEAL_THRESHOLD) {
      setRevealed(true);
      if (onRevealed) onRevealed();
    }
  };

  const handleRevealNow = () => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setRevealed(true);
    setIsDrawing(false);
    if (onRevealed) onRevealed();
  };

  if (!result) return null;

  const isWin = result.type !== "lose";
  const resultColor = isWin
    ? (result.amount >= 1000000 ? "#fbbf24" : result.amount >= 50000 ? "#a855f7" : "#22c55e")
    : "#ef4444";

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      {/* Result underneath */}
      <div
        className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: isWin
            ? `linear-gradient(135deg, ${resultColor}15, ${resultColor}05)`
            : "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))",
          border: `2px solid ${resultColor}40`,
        }}
      >
        <div className="text-4xl mb-2">{isWin ? (result.amount >= 1000000 ? "💎" : "💰") : "😢"}</div>
        <p className="text-lg font-black text-center px-4" style={{ color: resultColor }}>
          {result.label}
        </p>
        {result.desc && (
          <p className="text-xs text-white/50 text-center px-4 mt-1">{result.desc}</p>
        )}
        {isWin && result.amount > 0 && (
          <p className="text-2xl font-black mt-2 font-mono" style={{ color: resultColor }}>
            +{result.amount.toLocaleString("fr-FR")}
          </p>
        )}
      </div>

      {/* Scratch canvas overlay */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ aspectRatio: "3 / 2", touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          style={{ opacity: revealed ? 0 : 1, transition: "opacity 0.3s" }}
        />
        {revealed && (
          <button
            onClick={handleRevealNow}
            className="absolute inset-0 pointer-events-none"
          />
        )}
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