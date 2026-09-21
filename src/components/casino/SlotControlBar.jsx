import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import CasinoToken from "./CasinoToken";
import { formatBet, BET_STEPS } from "./slotThemes";

const DEFAULT_POSITIONS = {
  counter_panel: { x: 28, y: 90 },
  spin: { x: 85, y: 88 },
  action_group: { x: 60, y: 90 },
};

/* ─── Reusable SVG button texture: brushed metal with gold beveled border ─── */
function MetalButtonSVG({ children, onClick, disabled, variant = "default", size = "md", whileTap }) {
  const variants = {
    default: { c1: "#3a3a42", c2: "#1e1e24", c3: "#0d0d11", glow: "rgba(212,175,55,0.15)" },
    gold:    { c1: "#f5d77a", c2: "#c9a227", c3: "#8b6914", glow: "rgba(255,215,0,0.3)" },
    red:     { c1: "#b8362f", c2: "#8b1a14", c3: "#5a0d09", glow: "rgba(220,38,38,0.25)" },
    green:   { c1: "#4a8c3a", c2: "#2d6b1f", c3: "#1a4d10", glow: "rgba(34,197,94,0.2)" },
    purple:  { c1: "#6b4a8c", c2: "#4a2d6b", c3: "#2d1a4d", glow: "rgba(168,85,247,0.2)" },
  };
  const v = variants[variant] || variants.default;
  const sizes = { sm: "h-7", md: "h-9", lg: "h-12", xl: "h-14" };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={whileTap ? { scale: 0.92 } : undefined}
      className={`relative ${sizes[size]} px-3 flex items-center justify-center gap-1.5 font-black text-white transition disabled:opacity-40`}
      style={{
        background: `linear-gradient(180deg, ${v.c1} 0%, ${v.c2} 45%, ${v.c3} 100%)`,
        border: "1.5px solid #d4af37",
        borderRadius: "10px",
        boxShadow: `
          inset 0 1px 1px rgba(255,255,255,0.25),
          inset 0 -2px 4px rgba(0,0,0,0.6),
          inset 0 0 8px ${v.glow},
          0 2px 4px rgba(0,0,0,0.5),
          0 0 12px ${v.glow}
        `,
        textShadow: "0 1px 2px rgba(0,0,0,0.8), 0 0 8px rgba(212,175,55,0.4)",
        clipPath: "polygon(8% 0, 92% 0, 100% 15%, 100% 85%, 92% 100%, 8% 100%, 0 85%, 0 15%)",
      }}
    >
      {/* Gold beveled top highlight */}
      <span
        className="absolute inset-x-1 top-0 h-1/3 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)",
          borderRadius: "8px 8px 0 0",
        }}
      />
      {children}
    </motion.button>
  );
}

/* ─── LED-style gold digit display ─── */
function LEDDisplay({ label, value, token }) {
  return (
    <div className="flex flex-col items-center min-w-[60px]">
      <span
        className="text-[7px] font-black uppercase tracking-widest"
        style={{ color: "#d4af37", textShadow: "0 0 4px rgba(212,175,55,0.6)" }}
      >
        {label}
      </span>
      <div className="flex items-center justify-center gap-0.5 mt-0.5">
        {token && <CasinoToken size={11} />}
        <span
          className="text-sm font-mono font-black"
          style={{
            color: "#ffd700",
            textShadow: "0 0 6px rgba(255,215,0,0.7), 0 0 12px rgba(255,215,0,0.4), 0 1px 2px rgba(0,0,0,0.9)",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

/* ─── Engraved metal counter panel ─── */
function CounterPanel({ balance, bet, lastWin }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-1.5"
      style={{
        background: "linear-gradient(180deg, #1a1a20 0%, #0a0a0e 100%)",
        borderRadius: "12px",
        border: "1.5px solid #d4af37",
        boxShadow: `
          inset 0 2px 6px rgba(0,0,0,0.8),
          inset 0 -1px 2px rgba(212,175,55,0.15),
          inset 0 0 16px rgba(212,175,55,0.06),
          0 1px 3px rgba(0,0,0,0.5)
        `,
      }}
    >
      <LEDDisplay label="Crédits" value={formatBet(balance)} token />
      <span className="w-px h-7" style={{ background: "linear-gradient(180deg, transparent, #d4af3740, transparent)" }} />
      <LEDDisplay label="Mise" value={formatBet(bet)} token />
      <span className="w-px h-7" style={{ background: "linear-gradient(180deg, transparent, #d4af3740, transparent)" }} />
      <LEDDisplay
        label="Victoire"
        value={lastWin > 0 ? lastWin.toLocaleString() : "—"}
        token={lastWin > 0}
      />
    </div>
  );
}

export default function SlotControlBar({
  balance, bet, lastWin, spinning, autoSpinning, autoCount,
  onSpin, onToggleAuto, onBetChange, onPaytable, theme, buttonStyles
}) {
  const styles = buttonStyles || {};
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      setScale(Math.min(1.4, Math.max(0.55, w / 1200)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const posStyle = (key, defaults) => {
    const s = styles[key] || {};
    const pos = DEFAULT_POSITIONS[key];
    return {
      position: "absolute",
      left: `${s.pos_x ?? pos.x}%`,
      top: `${s.pos_y ?? pos.y}%`,
      transform: `translate(-50%, -50%) scale(${scale})`,
      zIndex: 20,
    };
  };

  const decreaseBet = () => {
    const idx = BET_STEPS.indexOf(bet);
    onBetChange(idx > 0 ? BET_STEPS[idx - 1] : BET_STEPS[BET_STEPS - 1]);
  };
  const increaseBet = () => {
    const idx = BET_STEPS.indexOf(bet);
    onBetChange(idx < BET_STEPS.length - 1 ? BET_STEPS[idx + 1] : BET_STEPS[0]);
  };
  const maxBet = () => onBetChange(BET_STEPS[BET_STEPS.length - 1]);

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 15 }}>

      {/* ─── Engraved counter panel (Credits | Bet | Win) ─── */}
      <div style={posStyle("counter_panel")} className="pointer-events-none">
        <CounterPanel balance={balance} bet={bet} lastWin={lastWin} />
      </div>

      {/* ─── Compact action button group ─── */}
      <div style={posStyle("action_group")} className="flex items-center gap-2">
        <MetalButtonSVG onClick={decreaseBet} disabled={spinning || autoSpinning} variant="red" size="sm" whileTap>
          <span className="text-base leading-none">−</span>
        </MetalButtonSVG>
        <MetalButtonSVG onClick={increaseBet} disabled={spinning || autoSpinning} variant="green" size="sm" whileTap>
          <span className="text-base leading-none">+</span>
        </MetalButtonSVG>
        <MetalButtonSVG onClick={maxBet} disabled={spinning || autoSpinning} variant="default" size="sm" whileTap>
          MAX
        </MetalButtonSVG>
        <MetalButtonSVG onClick={onPaytable} disabled={spinning} variant="purple" size="sm" whileTap>
          <span className="text-[10px]">☰</span>
        </MetalButtonSVG>
        <MetalButtonSVG
          onClick={onToggleAuto}
          disabled={spinning && !autoSpinning}
          variant={autoSpinning ? "red" : "default"}
          size="sm"
          whileTap
        >
          <span className="text-[10px]">{autoSpinning ? `■ ${autoCount}` : "▶ A"}</span>
        </MetalButtonSVG>
      </div>

      {/* ─── SPIN button (centerpiece) ─── */}
      <motion.button
        style={{
          ...posStyle("spin"),
          background: spinning || autoSpinning
            ? "linear-gradient(180deg, #555 0%, #333 50%, #222 100%)"
            : "linear-gradient(180deg, #f5d77a 0%, #d4af37 40%, #8b6914 100%)",
          border: "2px solid #ffd700",
          borderRadius: "14px",
          boxShadow: `
            inset 0 2px 2px rgba(255,255,255,0.4),
            inset 0 -3px 6px rgba(0,0,0,0.5),
            inset 0 0 12px rgba(255,215,0,0.2),
            0 3px 6px rgba(0,0,0,0.6),
            0 0 20px rgba(255,215,0,0.3)
          `,
          textShadow: "0 1px 3px rgba(0,0,0,0.8), 0 0 10px rgba(255,215,0,0.5)",
          clipPath: "polygon(6% 0, 94% 0, 100% 12%, 100% 88%, 94% 100%, 6% 100%, 0 88%, 0 12%)",
          color: "#fff",
        }}
        onClick={onSpin}
        disabled={spinning || autoSpinning}
        whileTap={{ scale: 0.92 }}
        className="px-6 h-12 font-black text-base flex items-center justify-center transition"
      >
        {spinning ? "···" : "SPIN"}
      </motion.button>
    </div>
  );
}