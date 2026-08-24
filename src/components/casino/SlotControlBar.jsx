import React from "react";
import { motion } from "framer-motion";
import CasinoToken from "./CasinoToken";
import { formatBet } from "./slotThemes";

const BETS = [100, 500, 1000, 5000, 10000];

export default function SlotControlBar({
  balance,
  bet,
  lastWin,
  spinning,
  autoSpinning,
  autoCount,
  onSpin,
  onToggleAuto,
  onBetChange,
  theme
}) {
  const decreaseBet = () => {
    const idx = BETS.indexOf(bet);
    onBetChange(idx > 0 ? BETS[idx - 1] : BETS[BETS.length - 1]);
  };
  const increaseBet = () => {
    const idx = BETS.indexOf(bet);
    onBetChange(idx < BETS.length - 1 ? BETS[idx + 1] : BETS[0]);
  };
  const maxBet = () => onBetChange(BETS[BETS.length - 1]);

  return (
    <div
      className="flex items-center gap-2 sm:gap-3 p-2.5 rounded-2xl flex-wrap"
      style={{ background: theme.controlBg, border: `1px solid ${theme.controlBorderColor}` }}>
      
      {/* Social icons — hidden on mobile */}
      <div className="hidden sm:flex items-center gap-1.5">
        




        
        




        
      </div>

      {/* Bet controls: − MISE + */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={decreaseBet}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-lg"
          style={{ background: theme.minusBg }}>
          
          −
        </button>
        <div className="text-center min-w-[50px] px-1">
          <p className="text-[8px] font-bold text-white/50">MISE</p>
          <div className="flex items-center justify-center gap-0.5">
            <CasinoToken size={12} />
            <p className="text-sm font-mono font-black text-white">{formatBet(bet)}</p>
          </div>
        </div>
        <button
          onClick={increaseBet}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-lg"
          style={{ background: theme.plusBg }}>
          
          +
        </button>
      </div>

      {/* Win display: VICTOIRE */}
      <div className="text-center min-w-[70px] px-2">
        <p className="text-[8px] font-bold text-white/50">VICTOIRE</p>
        <div className="flex items-center justify-center gap-0.5">
          <CasinoToken size={12} />
          <p className="text-sm font-mono font-black" style={{ color: lastWin > 0 ? "#4caf50" : "rgba(255,255,255,0.3)" }}>
            {lastWin.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Max bet + Spin */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={maxBet}
          className="px-3 h-10 rounded-xl text-xs font-black text-white"
          style={{ background: "linear-gradient(135deg, #4a6c88, #243644)" }}>
          
          MAX MISE
        </button>
        <div className="flex flex-col items-center gap-1.5">
          <motion.button
            onClick={onSpin}
            disabled={spinning || autoSpinning}
            whileTap={{ scale: 0.95 }}
            className="px-6 h-11 rounded-2xl font-black text-white text-base"
            style={{
              background: spinning || autoSpinning ?
              "linear-gradient(135deg, #333, #222)" :
              theme.spinBg,
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
              background: autoSpinning
                ? "linear-gradient(135deg, #ff4444, #cc2222)"
                : `linear-gradient(135deg, ${theme.frameAccent}, ${theme.frameAccent}cc)`,
              color: "#fff",
              boxShadow: autoSpinning ? "0 0 12px rgba(255,68,68,0.4)" : `0 0 12px ${theme.frameAccent}40`,
              border: autoSpinning ? "1px solid rgba(255,68,68,0.5)" : `1px solid ${theme.frameAccent}50`,
            }}>
            {autoSpinning ? `■ STOP ×${autoCount}` : "▶ AUTOSPIN"}
          </motion.button>
        </div>
      </div>
    </div>);

}