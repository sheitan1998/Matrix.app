import React from "react";
import { motion } from "framer-motion";
import CasinoToken from "./CasinoToken";
import { formatBet, BET_STEPS } from "./slotThemes";

export default function SlotControlBar({
  balance, bet, lastWin, spinning, autoSpinning, autoCount,
  onSpin, onToggleAuto, onBetChange, onPaytable, theme
}) {
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
    <div
      className="flex items-center gap-2 sm:gap-3 rounded-2xl flex-wrap mx-auto pt-3"
      style={{ background: theme.controlBg, border: `1px solid ${theme.controlBorderColor}`, backdropFilter: "blur(8px)" }}>
      
      {/* Bet controls: BET − / BET + */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={decreaseBet}
          disabled={spinning || autoSpinning}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-lg transition hover:scale-105 disabled:opacity-40"
          style={{ background: theme.minusBg }}>
          
          −
        </button>
        <div className="text-center min-w-[55px] px-1">
          <p className="text-[8px] font-bold text-white/50 uppercase">Mise</p>
          <div className="flex items-center justify-center gap-0.5">
            <CasinoToken size={12} />
            <p className="text-sm font-mono font-black text-white">{formatBet(bet)}</p>
          </div>
        </div>
        <button
          onClick={increaseBet}
          disabled={spinning || autoSpinning}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-lg transition hover:scale-105 disabled:opacity-40"
          style={{ background: theme.plusBg }}>
          
          +
        </button>
      </div>

      {/* MAX BET */}
      <button
        onClick={maxBet}
        disabled={spinning || autoSpinning}
        className="px-3 h-9 rounded-xl text-xs font-black text-white transition hover:scale-105 disabled:opacity-40"
        style={{ background: "linear-gradient(135deg, #4a6c88, #243644)" }}>
        
        MAX MISE
      </button>

      {/* Win display */}
      <div className="text-center min-w-[70px] px-2">
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
        onClick={onPaytable}
        disabled={spinning}
        className="px-3 h-9 rounded-xl text-xs font-black text-white transition hover:scale-105 disabled:opacity-40"
        style={{ background: "linear-gradient(135deg, #4a3a6a, #2a1a4a)", border: `1px solid ${theme.frameAccent}40` }}>
        
        PAYTABLE
      </button>

      {/* SPIN + AUTO PLAY */}
      <div className="flex flex-col items-center gap-1.5 ml-auto">
        <motion.button
          onClick={onSpin}
          disabled={spinning || autoSpinning}
          whileTap={{ scale: 0.95 }}
          className="px-6 h-11 rounded-2xl font-black text-white text-base transition"
          style={{
            background: spinning || autoSpinning ? "linear-gradient(135deg, #333, #222)" : theme.spinBg,
            boxShadow: spinning || autoSpinning ? "none" : theme.spinShadow
          }}>
          
          {spinning ? "..." : "SPIN"}
        </motion.button>
        <motion.button
          onClick={onToggleAuto}
          whileTap={{ scale: 0.95 }}
          disabled={spinning && !autoSpinning}
          className="px-4 h-8 rounded-xl font-black text-xs flex items-center gap-1.5 transition disabled:opacity-40"
          style={{
            background: autoSpinning ?
            "linear-gradient(135deg, #ff4444, #cc2222)" :
            `linear-gradient(135deg, ${theme.frameAccent}, ${theme.frameAccent}cc)`,
            color: "#fff",
            boxShadow: autoSpinning ? "0 0 12px rgba(255,68,68,0.4)" : `0 0 12px ${theme.frameAccent}40`,
            border: autoSpinning ? "1px solid rgba(255,68,68,0.5)" : `1px solid ${theme.frameAccent}50`
          }}>
          
          {autoSpinning ? `■ STOP ×${autoCount}` : "▶ AUTO PLAY"}
        </motion.button>
      </div>
    </div>);

}