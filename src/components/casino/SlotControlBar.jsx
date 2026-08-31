import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import CasinoToken from "./CasinoToken";
import { formatBet, BET_STEPS } from "./slotThemes";

const DEFAULT_POSITIONS = {
  credits_display: { x: 12, y: 90 },
  spin: { x: 85, y: 85 },
  auto: { x: 85, y: 75 },
  bet_minus: { x: 28, y: 90 },
  bet_display: { x: 36, y: 90 },
  bet_plus: { x: 44, y: 90 },
  max_bet: { x: 52, y: 90 },
  win_display: { x: 62, y: 90 },
  paytable: { x: 72, y: 90 },
};

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
      setScale(Math.min(1.3, Math.max(0.5, w / 1200)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const btnStyle = (key, defaults, isMotion = false) => {
    const s = styles[key] || {};
    const pos = DEFAULT_POSITIONS[key];
    const base = {
      position: "absolute",
      left: `${s.pos_x ?? pos.x}%`,
      top: `${s.pos_y ?? pos.y}%`,
      background: s.bg || defaults.bg,
      color: s.text_color || defaults.text,
      border: s.border_color ? `1px solid ${s.border_color}` : defaults.border,
      borderRadius: `${s.radius ?? defaults.radius}px`,
      opacity: (s.opacity ?? 100) / 100,
      zIndex: 20,
      transition: "all 0.15s ease",
    };
    if (isMotion) {
      return { ...base, x: "-50%", y: "-50%", scale };
    }
    return { ...base, transform: `translate(-50%, -50%) scale(${scale})` };
  };

  const decreaseBet = () => {
    const idx = BET_STEPS.indexOf(bet);
    onBetChange(idx > 0 ? BET_STEPS[idx - 1] : BET_STEPS[BET_STEPS.length - 1]);
  };
  const increaseBet = () => {
    const idx = BET_STEPS.indexOf(bet);
    onBetChange(idx < BET_STEPS.length - 1 ? BET_STEPS[idx + 1] : BET_STEPS[0]);
  };
  const maxBet = () => onBetChange(BET_STEPS[BET_STEPS.length - 1]);

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 15 }}>
      {/* Credits display — masks the painted "CREDITS" label in the bg image */}
      <div
        style={btnStyle("credits_display", { bg: theme.controlBg, text: "#fff", border: `1px solid ${theme.controlBorderColor}`, radius: 8 })}
        className="text-center min-w-[70px] pointer-events-none px-2 py-0.5"
      >
        <p className="text-[8px] font-bold text-white/50 uppercase">Crédits</p>
        <div className="flex items-center justify-center gap-0.5">
          <CasinoToken size={12} />
          <p className="text-sm font-mono font-black text-white">{formatBet(balance)}</p>
        </div>
      </div>

      {/* Bet minus */}
      <button
        style={btnStyle("bet_minus", { bg: theme.minusBg, text: "#fff", border: "none", radius: 50 })}
        onClick={decreaseBet}
        disabled={spinning || autoSpinning}
        className="w-9 h-9 flex items-center justify-center font-black text-lg transition hover:scale-105 disabled:opacity-40"
      >
        −
      </button>

      {/* Bet display — masks the painted "BET" label in the bg image */}
      <div
        style={btnStyle("bet_display", { bg: theme.controlBg, text: "#fff", border: `1px solid ${theme.controlBorderColor}`, radius: 8 })}
        className="text-center min-w-[55px] pointer-events-none px-2 py-0.5"
      >
        <p className="text-[8px] font-bold text-white/50 uppercase">Mise</p>
        <div className="flex items-center justify-center gap-0.5">
          <CasinoToken size={12} />
          <p className="text-sm font-mono font-black text-white">{formatBet(bet)}</p>
        </div>
      </div>

      {/* Bet plus */}
      <button
        style={btnStyle("bet_plus", { bg: theme.plusBg, text: "#fff", border: "none", radius: 50 })}
        onClick={increaseBet}
        disabled={spinning || autoSpinning}
        className="w-9 h-9 flex items-center justify-center font-black text-lg transition hover:scale-105 disabled:opacity-40"
      >
        +
      </button>

      {/* MAX BET */}
      <button
        style={btnStyle("max_bet", { bg: "linear-gradient(135deg, #4a6c88, #243644)", text: "#fff", border: "none", radius: 12 })}
        onClick={maxBet}
        disabled={spinning || autoSpinning}
        className="px-3 h-9 text-xs font-black transition hover:scale-105 disabled:opacity-40"
      >
        MAX MISE
      </button>

      {/* Win display */}
      <div
        style={btnStyle("win_display", { bg: "transparent", text: "#fff", border: "none", radius: 0 })}
        className="text-center min-w-[70px] pointer-events-none"
      >
        <p className="text-[8px] font-bold text-white/50 uppercase">Victoire</p>
        <div className="flex items-center justify-center gap-0.5">
          <CasinoToken size={12} />
          <p className="text-sm font-mono font-black" style={{ color: lastWin > 0 ? "#4caf50" : "rgba(255,255,255,0.3)" }}>
            {lastWin.toLocaleString()}
          </p>
        </div>
      </div>

      {/* PAYTABLE */}
      <button
        style={btnStyle("paytable", { bg: "linear-gradient(135deg, #4a3a6a, #2a1a4a)", text: "#fff", border: `1px solid ${theme.frameAccent}40`, radius: 12 })}
        onClick={onPaytable}
        disabled={spinning}
        className="px-3 h-9 text-xs font-black transition hover:scale-105 disabled:opacity-40"
      >
        PAYTABLE
      </button>

      {/* SPIN */}
      <motion.button
        style={btnStyle("spin", {
          bg: spinning || autoSpinning ? "linear-gradient(135deg, #333, #222)" : theme.spinBg,
          text: "#fff", border: "none", radius: 16,
        }, true)}
        onClick={onSpin}
        disabled={spinning || autoSpinning}
        whileTap={{ scale: 0.92 }}
        className="px-6 h-11 font-black text-base transition"
      >
        {spinning ? "..." : "SPIN"}
      </motion.button>

      {/* AUTO PLAY */}
      <motion.button
        style={btnStyle("auto", {
          bg: autoSpinning ? "linear-gradient(135deg, #ff4444, #cc2222)" : `linear-gradient(135deg, ${theme.frameAccent}, ${theme.frameAccent}cc)`,
          text: "#fff", border: `1px solid ${theme.frameAccent}50`, radius: 12,
        }, true)}
        onClick={onToggleAuto}
        whileTap={{ scale: 0.92 }}
        disabled={spinning && !autoSpinning}
        className="px-4 h-8 text-xs font-black flex items-center gap-1.5 transition disabled:opacity-40"
      >
        {autoSpinning ? `■ STOP ×${autoCount}` : "▶ AUTO PLAY"}
      </motion.button>
    </div>
  );
}