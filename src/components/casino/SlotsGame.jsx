import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import WinEffect from "./WinEffect";
import CasinoWinEffect from "./CasinoWinEffect";
import { casinoPlaceBet } from "@/hooks/useCasinoJackpot";
import { SLOT_THEMES, DEFAULT_THEME } from "./slotThemes";

// ---- SINGLE REEL ----
function Reel({ spinning, finalSymbol, stopDelay, showResult, symbols, reelBg, reelBorder, reelFadeColor }) {
  const pickSymbol = () => {
    const pool = [];
    symbols.forEach(s => { for (let i = 0; i < s.rare; i++) pool.push(s); });
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const [syms, setSyms] = useState([pickSymbol(), finalSymbol, pickSymbol()]);
  const [stopped, setStopped] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (spinning) {
      setStopped(false);
      intervalRef.current = setInterval(() => {
        setSyms([pickSymbol(), pickSymbol(), pickSymbol()]);
      }, 70);
    } else {
      clearInterval(intervalRef.current);
      timeoutRef.current = setTimeout(() => {
        setSyms([pickSymbol(), finalSymbol, pickSymbol()]);
        setStopped(true);
      }, stopDelay);
    }
    return () => { clearInterval(intervalRef.current); clearTimeout(timeoutRef.current); };
  }, [spinning, finalSymbol, stopDelay]);

  const mid = syms[1];
  const isWinning = stopped && showResult;

  return (
    <motion.div
      animate={isWinning ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: isWinning ? Infinity : 0 }}
      className="relative overflow-hidden rounded-2xl flex flex-col"
      style={{
        width: "96px", height: "228px",
        background: reelBg,
        border: `2px solid ${isWinning ? mid.glow + "aa" : reelBorder}`,
        boxShadow: isWinning
          ? `0 0 25px ${mid.glow}70, inset 0 0 20px ${mid.glow}18`
          : "inset 0 0 15px rgba(0,0,0,0.7)",
      }}>
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, ${reelFadeColor} 0%, transparent 100%)` }} />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${reelFadeColor} 0%, transparent 100%)` }} />
      {/* Win payline */}
      <div className="absolute inset-x-0 z-10 pointer-events-none"
        style={{
          top: "50%", transform: "translateY(-50%)", height: "76px",
          border: `1px solid ${isWinning ? mid.glow + "80" : "rgba(255,255,255,0.05)"}`,
          background: isWinning ? `${mid.glow}08` : "transparent",
        }} />

      {syms.map((sym, i) => (
        <div key={i} className="flex items-center justify-center"
          style={{ width: "96px", height: "76px", flexShrink: 0 }}>
          {sym.isText ? (
            <span className="font-black select-none leading-none"
              style={{
                fontSize: i === 1 ? (sym.s.length > 3 ? "22px" : "34px") : "18px",
                color: sym.color,
                textShadow: i === 1 && isWinning
                  ? `0 0 8px ${sym.glow}, 0 0 20px ${sym.glow}, 0 0 40px ${sym.glow}`
                  : `0 0 4px ${sym.glow}`,
                fontFamily: "'Arial Black', sans-serif",
                opacity: i !== 1 ? 0.35 : 1,
              }}>
              {sym.s}
            </span>
          ) : (
            <span className="select-none"
              style={{
                fontSize: i === 1 ? "42px" : "22px",
                filter: i === 1 && isWinning ? `drop-shadow(0 0 10px ${sym.glow}) drop-shadow(0 0 20px ${sym.glow})` : "none",
                opacity: i !== 1 ? 0.35 : 1,
              }}>
              {sym.s}
            </span>
          )}
        </div>
      ))}
    </motion.div>
  );
}

function getMultiplier(reels) {
  if (reels[0].s === reels[1].s && reels[1].s === reels[2].s) return reels[0].mult;
  const wildCount = reels.filter(r => r.isText && r.s.length > 2 && !["BAR"].includes(r.s)).length;
  if (wildCount === 2) return 4;
  if (wildCount === 1) {
    const others = reels.filter(r => !(r.isText && r.s.length > 2 && !["BAR"].includes(r.s)));
    if (others[0].s === others[1].s) return others[0].mult;
    return 2;
  }
  if (reels[0].s === reels[1].s || reels[1].s === reels[2].s || reels[0].s === reels[2].s) return 1.5;
  return 0;
}

// ---- MAIN COMPONENT ----
export default function SlotsGame({ balance, setBalance, accentColor, addTransaction, jackpot: globalJackpot = 0, winJackpot, themeId }) {
  const theme = SLOT_THEMES[themeId] || SLOT_THEMES[DEFAULT_THEME];
  const SYMBOLS = theme.symbols;

  const pickSymbol = () => {
    const pool = [];
    SYMBOLS.forEach(s => { for (let i = 0; i < s.rare; i++) pool.push(s); });
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const [spinning, setSpinning] = useState(false);
  const [autoSpinning, setAutoSpinning] = useState(false);
  const [autoCount, setAutoCount] = useState(0);
  const autoRef = useRef(null);
  const balanceRef = useRef(balance);
  const autoSpinningRef = useRef(false);
  const [finalReels, setFinalReels] = useState([SYMBOLS[4], SYMBOLS[5], SYMBOLS[6]]);

  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { autoSpinningRef.current = autoSpinning; }, [autoSpinning]);
  const [result, setResult] = useState(null);
  const [bet, setBet] = useState(100);
  const [lastWin, setLastWin] = useState(0);
  const [lightPhase, setLightPhase] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [winData, setWinData] = useState(null);

  useEffect(() => {
    const t1 = setInterval(() => setLightPhase(p => (p + 1) % 10), 180);
    return () => clearInterval(t1);
  }, []);

  const BETS = [50, 100, 250, 500, 1000];

  useEffect(() => {
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
  }, []);

  const doSpin = async () => {
    const currentBalance = balanceRef.current;
    if (bet > currentBalance || bet <= 0) { stopAutoSpin(); return; }
    setSpinning(true);
    setResult(null);
    setBalance(b => b - bet);

    let serverResult;
    try {
      serverResult = await casinoPlaceBet("slots", bet);
    } catch {
      setSpinning(false);
      setBalance(b => b + bet);
      toast.error("Erreur de connexion");
      stopAutoSpin();
      return;
    }
    if (serverResult.error) {
      setSpinning(false);
      setBalance(b => b + bet);
      toast.error(serverResult.error);
      stopAutoSpin();
      return;
    }

    // Generate symbols matching the server-determined outcome
    let selected;
    if (serverResult.win && serverResult.slotsSymbol) {
      const winSym = SYMBOLS.find(s => s.s === serverResult.slotsSymbol) || SYMBOLS[4];
      selected = [winSym, winSym, winSym];
    } else {
      selected = [pickSymbol(), pickSymbol(), pickSymbol()];
      let attempts = 0;
      while (getMultiplier(selected) > 0 && attempts < 20) {
        selected = [pickSymbol(), pickSymbol(), pickSymbol()];
        attempts++;
      }
    }
    setFinalReels(selected);

    const mult = serverResult.win ? serverResult.multiplier : 0;
    const winAmount = serverResult.payout || 0;
    const jpHit = serverResult.jackpot;

    setTimeout(() => {
      setSpinning(false);
      setBalance(serverResult.newBalance);
      balanceRef.current = serverResult.newBalance;
      setLastWin(winAmount);
      const netGain = winAmount - bet;
      setResult({ gain: netGain, mult, symbols: selected, win: winAmount > 0, jackpot: jpHit });
      if (addTransaction) {
        addTransaction(netGain >= 0 ? "casino_win" : "casino_loss", netGain >= 0 ? netGain : -bet, netGain >= 0 ? `Slots: +${netGain}` : `Slots: -${bet}`, "casino");
      }
      if (winAmount > 0) {
        setWinData({ amount: winAmount, multiplier: mult, isJackpot: jpHit });
        setShowWin(true);
      }
      if (autoSpinningRef.current && serverResult.newBalance - bet >= 0) {
        setAutoCount(c => c + 1);
        autoRef.current = setTimeout(() => doSpin(), 800);
      } else if (autoSpinningRef.current) {
        stopAutoSpin();
      }
    }, 2000);
  };

  const spin = () => { if (!autoSpinning) doSpin(); };

  const toggleAutoSpin = () => {
    if (autoSpinning) { stopAutoSpin(); return; }
    if (bet > balance) { toast.error("Solde insuffisant"); return; }
    setAutoSpinning(true);
    setAutoCount(0);
    doSpin();
  };

  const stopAutoSpin = () => {
    setAutoSpinning(false);
    if (autoRef.current) { clearTimeout(autoRef.current); autoRef.current = null; }
  };

  const wildSymbol = SYMBOLS.find(s => s.isText && s.s.length > 2) || SYMBOLS[2];
  const topSymbol = SYMBOLS[0];

  return (
    <div className="space-y-0 select-none">
      <CasinoWinEffect
        show={showWin}
        amount={winData?.amount}
        multiplier={winData?.multiplier}
        isJackpot={winData?.isJackpot}
        onDone={() => setShowWin(false)}
      />
      <WinEffect
        show={showWin}
        amount={winData?.amount}
        multiplier={winData?.multiplier}
        isJackpot={winData?.isJackpot}
        onDone={() => setShowWin(false)}
      />

      {/* === JACKPOT DISPLAYS === */}
      <div className="space-y-1 mb-3">
        {/* Grand Jackpot */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl"
          style={{ background: theme.grandBg, border: theme.grandBorder }}>
          <span className="text-xs font-black" style={{ color: theme.grandColor }}>GRAND ×2</span>
          <span className="font-mono font-black text-base" style={{ color: "#ffffff", textShadow: "0 0 8px #ffffff60" }}>
            {(globalJackpot ? globalJackpot * 2 : 2000000).toLocaleString()}
          </span>
        </div>
        {/* Jackpot bar */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl"
          style={{ background: theme.jackpotBg, border: theme.jackpotBorder, boxShadow: theme.jackpotShadow }}>
          <span className="text-xs font-black" style={{ color: theme.jackpotColor }}>✨ JACKPOT</span>
          <motion.span animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 0.5, repeat: Infinity }}
            className="font-mono font-black text-xl" style={{ color: theme.jackpotColor, textShadow: `0 0 12px ${theme.jackpotColor}aa` }}>
            {(globalJackpot || 1000000).toLocaleString()}
          </motion.span>
          <span className="text-xs font-black" style={{ color: theme.jackpotColor }}>MAJOR ×2</span>
        </div>
      </div>

      {/* === MACHINE FRAME === */}
      <div className="relative mx-auto" style={{ maxWidth: "340px" }}>
        {/* Outer glow */}
        <div className="absolute -inset-3 rounded-3xl pointer-events-none"
          style={{ background: theme.outerGlow, filter: "blur(12px)" }} />

        <div className="relative rounded-3xl overflow-hidden"
          style={{
            background: theme.machineBg,
            border: theme.machineBorder,
            boxShadow: theme.machineShadow,
          }}>

          {/* Top neon lights */}
          <div className="flex justify-center gap-1 px-3 py-2.5">
            {Array.from({ length: 18 }).map((_, i) => {
              const active = i % 6 === lightPhase % 6;
              return (
                <div key={i} className="rounded-full transition-all duration-100"
                  style={{
                    width: "9px", height: "9px",
                    background: active ? theme.neonTop[i % 6] : "rgba(255,255,255,0.08)",
                    boxShadow: active ? `0 0 8px ${theme.neonTop[i % 6]}, 0 0 16px ${theme.neonTop[i % 6]}` : "none"
                  }} />
              );
            })}
          </div>

          {/* REELS SCREEN */}
          <div className="mx-2 mb-1 rounded-2xl overflow-hidden relative"
            style={{
              background: theme.reelBg,
              border: theme.reelBorder,
              boxShadow: theme.reelShadow,
            }}>
            {/* Screen glow effect */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{ background: `radial-gradient(ellipse at center top, ${theme.neonTop[0]}10, transparent 60%)` }} />

            {/* Top hint row */}
            <div className="flex justify-between items-center px-4 pt-2 pb-0.5 opacity-30">
              <span className="text-[11px] font-black text-white">{topSymbol.s}</span>
              <span className="text-[11px] font-black text-white">{topSymbol.s}</span>
            </div>

            {/* Reels */}
            <div className="flex gap-1.5 justify-center px-2 py-2 relative">
              {/* Left payline arrow */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-8 flex items-center justify-center z-20">
                <div className="w-0 h-0" style={{ borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: `8px solid ${theme.paylineColor}`, filter: `drop-shadow(0 0 4px ${theme.paylineColor})` }} />
              </div>
              {/* Right payline arrow */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-8 flex items-center justify-center z-20">
                <div className="w-0 h-0" style={{ borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: `8px solid ${theme.paylineColor}`, filter: `drop-shadow(0 0 4px ${theme.paylineColor})` }} />
              </div>

              {[0, 1, 2].map(i => (
                <Reel key={i}
                  spinning={spinning}
                  finalSymbol={finalReels[i]}
                  stopDelay={600 + i * 500}
                  showResult={result?.win && !spinning}
                  symbols={SYMBOLS}
                  reelBg={theme.reelBg}
                  reelBorder={theme.reelBorder.replace("2px solid ", "")}
                  reelFadeColor={theme.reelFadeColor}
                />
              ))}
            </div>

            {/* Bottom hint row */}
            <div className="flex justify-between items-center px-4 pt-0.5 pb-2 opacity-30">
              <span className="text-[11px] font-black" style={{ color: wildSymbol.color }}>{wildSymbol.s}</span>
              <span className="text-[11px] font-black" style={{ color: topSymbol.color }}>{topSymbol.s}</span>
            </div>
          </div>

          {/* Bottom neon lights */}
          <div className="flex justify-center gap-1 px-3 py-2">
            {Array.from({ length: 18 }).map((_, i) => {
              const active = i % 6 === (lightPhase + 3) % 6;
              return (
                <div key={i} className="rounded-full transition-all duration-100"
                  style={{
                    width: "9px", height: "9px",
                    background: active ? theme.neonBottom[i % 6] : "rgba(255,255,255,0.07)",
                    boxShadow: active ? `0 0 8px ${theme.neonBottom[i % 6]}, 0 0 16px ${theme.neonBottom[i % 6]}` : "none"
                  }} />
              );
            })}
          </div>

          {/* === CONTROLS === */}
          <div className="px-4 pb-5 space-y-3">
            {/* LAST WIN bar */}
            <div className="flex items-center justify-between px-3 py-2 rounded-2xl"
              style={{ background: theme.lastWinBg, border: theme.lastWinBorder }}>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: theme.lastWinLabel }}>LAST WIN</p>
                <motion.p key={lastWin}
                  initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                  className="font-mono font-black text-xl text-white">
                  {lastWin.toLocaleString()}
                </motion.p>
              </div>
              {/* SPIN / AUTO-SPIN buttons */}
              <div className="flex gap-1.5">
              <motion.button onClick={spin} disabled={spinning || autoSpinning}
                whileTap={{ scale: 0.9 }}
                className="px-4 py-3 rounded-2xl font-black text-sm transition-all"
                style={{
                  background: spinning || autoSpinning
                    ? "linear-gradient(135deg, #333, #222)"
                    : theme.spinBg,
                  color: "white",
                  boxShadow: spinning || autoSpinning ? "none" : theme.spinShadow,
                  border: "none",
                }}>
                {spinning ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ...
                  </span>
                ) : autoSpinning ? "..." : "SPIN"}
              </motion.button>
              <motion.button onClick={toggleAutoSpin}
                whileTap={{ scale: 0.9 }}
                className="px-3 py-3 rounded-2xl font-black text-xs transition-all"
                style={{
                  background: autoSpinning
                    ? "linear-gradient(135deg, #ff4444, #cc0000)"
                    : theme.autoBg,
                  color: "white",
                  boxShadow: autoSpinning ? "0 0 10px #ff444480" : theme.autoShadow,
                  border: "none",
                }}>
                {autoSpinning ? (
                  <span>STOP<br /><span className="text-[9px] opacity-70">×{autoCount}</span></span>
                ) : "AUTO"}
              </motion.button>
              </div>
            </div>

            {/* Bet chips */}
            <div className="flex gap-1.5">
              {BETS.map(b => (
                <motion.button key={b} onClick={() => setBet(b)}
                  whileTap={{ scale: 0.9 }}
                  className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
                  style={{
                    background: bet === b
                      ? theme.betActiveBg
                      : "rgba(255,255,255,0.05)",
                    color: bet === b ? "white" : "#555",
                    border: `1px solid ${bet === b ? theme.betActiveBorder : "rgba(255,255,255,0.08)"}`,
                    boxShadow: bet === b ? theme.betActiveShadow : "none"
                  }}>
                  {b >= 1000 ? `${b / 1000}K` : b}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom coin row */}
      <div className="flex justify-center gap-1 pt-3 opacity-50">
        {["🪙","🪙","🪙","🪙","🪙","🪙","🪙"].map((c, i) => (
          <motion.span key={i} animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.2, delay: i * 0.12, repeat: Infinity }}>
            {c}
          </motion.span>
        ))}
      </div>

      {/* Paytable */}
      <div className="pt-3">
        <p className="text-[9px] font-black text-center tracking-widest uppercase mb-2" style={{ color: theme.paytableColor }}>
          TABLEAU DES GAINS
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {SYMBOLS.slice(0, 4).map(s => (
            <div key={s.s} className="p-2 rounded-xl text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-base font-black mb-0.5 leading-none"
                style={{ color: s.color, textShadow: `0 0 6px ${s.glow}`, fontFamily: s.isText ? "'Arial Black', sans-serif" : "inherit" }}>
                {s.s}
              </p>
              <p className="text-[9px] font-black" style={{ color: theme.jackpotColor }}>×{s.mult}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}