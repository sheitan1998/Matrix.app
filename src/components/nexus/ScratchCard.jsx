import React, { useRef, useState, useEffect, useCallback } from "react";

const SCRATCH_RADIUS = 42;
const REVEAL_THRESHOLD = 90;
const COIN_IMAGE =
  "https://media.base44.com/images/public/69e14a987a927963a9924d5a/aca8e7da3_ChatGPT_Image_3_aot_2026__16_22_42-removebg-preview.png";

/**
 * Carte à gratter (canvas) — texture métallisée, brosse texturée à bords irréguliers,
 * curseur en pièce de monnaie et particules de résidu.
 */
export default function ScratchCard({ grid, result, onRevealed, disabled, onScratchStart, cardBackgroundImage }) {
  const canvasRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const revealedRef = useRef(false);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const lastParticleSpawnRef = useRef(0);
  const lastCheckRef = useRef(0);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [coinPos, setCoinPos] = useState({ x: -200, y: -200, visible: false });

  // --- Init scratch overlay: metallic gray texture with noise + striations ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const pCanvas = particleCanvasRef.current;
    if (!canvas || !grid) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    if (pCanvas) {
      pCanvas.width = rect.width;
      pCanvas.height = rect.height;
    }

    // Base metallic silver gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#4a4a4a");
    gradient.addColorStop(0.3, "#707070");
    gradient.addColorStop(0.5, "#8a8a8a");
    gradient.addColorStop(0.7, "#707070");
    gradient.addColorStop(1, "#4a4a4a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Granular noise texture
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 45;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    // Diagonal striations (brushed metal)
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = -canvas.height; i < canvas.width; i += 3) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();
    }

    // Hint text
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.font = "bold 13px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦ GRATTEZ ICI ✦", canvas.width / 2, canvas.height / 2);

    revealedRef.current = false;
    setRevealed(false);
    setProgress(0);
  }, [grid]);

  // --- Particle animation loop (separate canvas) ---
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const now = Date.now();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const age = now - p.createdAt;
        if (age > 700) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.98;
        const alpha = 1 - age / 700;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // --- Spawn scratch particles at (x, y) ---
  const spawnParticles = useCallback((x, y) => {
    const now = Date.now();
    if (now - lastParticleSpawnRef.current < 30) return;
    lastParticleSpawnRef.current = now;

    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * SCRATCH_RADIUS,
        y: y + (Math.random() - 0.5) * SCRATCH_RADIUS,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 1.5 - 0.3,
        size: 1.5 + Math.random() * 2,
        color: Math.random() > 0.5 ? "#b0b0b0" : "#d4af37",
        createdAt: now,
      });
    }
    // Cap particle count
    if (particlesRef.current.length > 60) {
      particlesRef.current.splice(0, particlesRef.current.length - 60);
    }
  }, []);

  // --- Textured scratch brush: main circle + irregular edge strokes ---
  const scratch = useCallback(
    (x, y) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.globalCompositeOperation = "destination-out";

      // Main circle
      ctx.beginPath();
      ctx.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Irregular, striated edge strokes (coin rubbing effect)
      const strokes = 8;
      for (let i = 0; i < strokes; i++) {
        const angle = (Math.PI * 2 / strokes) * i + Math.random() * 0.4;
        const dist = SCRATCH_RADIUS * (0.55 + Math.random() * 0.35);
        const r = SCRATCH_RADIUS * (0.25 + Math.random() * 0.25);
        const ox = x + Math.cos(angle) * dist;
        const oy = y + Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    []
  );

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
      setCoinPos((prev) => ({ ...prev, visible: false }));
      doReveal();
    };
    window.addEventListener("mouseup", handleGlobalEnd);
    window.addEventListener("touchend", handleGlobalEnd);
    return () => {
      window.removeEventListener("mouseup", handleGlobalEnd);
      window.removeEventListener("touchend", handleGlobalEnd);
    };
  }, [doReveal]);

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
      rectX: clientX - rect.left,
      rectY: clientY - rect.top,
    };
  };

  const handleStart = (e) => {
    if (revealedRef.current || disabled) return;
    e.preventDefault();
    if (onScratchStart) onScratchStart();
    isDrawingRef.current = true;
    const coords = getCoords(e);
    if (coords) {
      scratch(coords.x, coords.y);
      spawnParticles(coords.x, coords.y);
      setCoinPos({ x: coords.rectX, y: coords.rectY, visible: true });
    }
  };

  const handleMove = (e) => {
    if (!isDrawingRef.current || revealedRef.current || disabled) return;
    e.preventDefault();
    const coords = getCoords(e);
    if (coords) {
      scratch(coords.x, coords.y);
      spawnParticles(coords.x, coords.y);
      setCoinPos({ x: coords.rectX, y: coords.rectY, visible: true });
      // Throttle the expensive pixel-count check to avoid freezing
      const now = Date.now();
      if (now - lastCheckRef.current > 250) {
        lastCheckRef.current = now;
        const pct = getScratchPercent();
        setProgress(pct);
        if (pct > REVEAL_THRESHOLD) {
          revealedRef.current = true;
          setRevealed(true);
          isDrawingRef.current = false;
          setCoinPos((prev) => ({ ...prev, visible: false }));
          if (onRevealed) onRevealed();
        }
      }
    }
  };

  const handleLeave = () => {
    setCoinPos((prev) => ({ ...prev, visible: false }));
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
    setCoinPos((prev) => ({ ...prev, visible: false }));
    if (onRevealed) onRevealed();
  };

  if (!grid) return null;

  const isWin = result?.type !== "lose" && result?.type !== undefined;
  const resultColor = isWin
    ? result?.amount >= 1000000
      ? "#fbbf24"
      : result?.amount >= 50000
      ? "#a855f7"
      : "#22c55e"
    : "#ef4444";

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      {/* Symbol grid + canvas */}
      <div
        className="relative rounded-2xl overflow-hidden grid grid-cols-3"
        style={{
          aspectRatio: "3 / 2",
          touchAction: "none",
          background: cardBackgroundImage ? "transparent" : "rgba(10,5,15,0.8)",
          backgroundImage: cardBackgroundImage ? `url(${cardBackgroundImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {grid.map((sym, i) => (
          <div
            key={i}
            className="flex items-center justify-center"
            style={{
              background:
                isWin && revealed ? `linear-gradient(135deg, ${resultColor}10, transparent)` : "transparent",
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

        {/* Particle canvas (above scratch overlay, below coin cursor) */}
        <canvas
          ref={particleCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5 }}
        />

        {/* Scratch canvas overlay */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          className="absolute inset-0 w-full h-full"
          style={{
            opacity: revealed ? 0 : 1,
            transition: "opacity 0.3s",
            cursor: "none",
            zIndex: 10,
          }}
        />

        {/* Custom coin cursor */}
        {coinPos.visible && !revealed && (
          <img
            src={COIN_IMAGE}
            alt=""
            className="absolute pointer-events-none"
            style={{
              left: coinPos.x - 24,
              top: coinPos.y - 24,
              width: 48,
              height: 48,
              zIndex: 20,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
            }}
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