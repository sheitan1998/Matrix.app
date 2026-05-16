import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NEON_SYMBOLS = [
  { s: "7", label: "SEVEN", color: "#ff2020", glow: "#ff0000", mult: 50, rare: 1 },
  { s: "BAR", label: "BAR", color: "#ffffff", glow: "#aaaaff", mult: 20, rare: 2 },
  { s: "Wild", label: "WILD", color: "#ff00ff", glow: "#ff00ff", mult: 15, rare: 2 },
  { s: "🍒", label: "Cherry", color: "#ff4466", glow: "#ff2244", mult: 8, rare: 4 },
  { s: "🍇", label: "Grape", color: "#aa44ff", glow: "#8822ff", mult: 6, rare: 5 },
  { s: "🍉", label: "Melon", color: "#44ff66", glow: "#22dd44", mult: 5, rare: 5 },
  { s: "🍍", label: "Pine", color: "#ffdd00", glow: "#ffaa00", mult: 4, rare: 6 },
];

function pickSymbol() {
  const pool = [];
  NEON_SYMBOLS.forEach((s) => { for (let i = 0; i < s.rare; i++) pool.push(s); });
  return pool[Math.floor(Math.random() * pool.length)];
}

function getMultiplier(reels) {
  if (reels[0].s === reels[1].s && reels[1].s === reels[2].s) return reels[0].mult;
  if (reels[0].s === reels[1].s || reels[1].s === reels[2].s || reels[0].s === reels[2].s) return 1.5;
  // Wild substitution
  const wildCount = reels.filter(r => r.s === "Wild").length;
  if (wildCount >= 2) return 3;
  if (wildCount === 1) return 1.5;
  return 0;
}

function NeonSymbol({ symbol, size = "lg", spinning = false, bright = false }) {
  const isText = ["7", "BAR", "Wild"].includes(symbol.s);
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Glow backdrop */}
      {(bright || spinning) && (
        <div className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${symbol.glow}30 0%, transparent 70%)`,
            animation: "pulse 1s ease-in-out infinite alternate"
          }} />
      )}
      {isText ? (
        <span
          className={cn("font-black select-none leading-none", size === "lg" ? "text-4xl" : size === "md" ? "text-2xl" : "text-lg")}
          style={{
            color: symbol.color,
            textShadow: bright
              ? `0 0 8px ${symbol.glow}, 0 0 20px ${symbol.glow}, 0 0 40px ${symbol.glow}, 0 0 60px ${symbol.glow}`
              : `0 0 4px ${symbol.glow}, 0 0 10px ${symbol.glow}`,
            fontFamily: "'Arial Black', sans-serif",
            letterSpacing: symbol.s === "Wild" ? "-1px" : "0",
            transition: "text-shadow 0.3s",
          }}>
          {symbol.s}
        </span>
      ) : (
        <span className={cn("select-none", size === "lg" ? "text-4xl" : size === "md" ? "text-2xl" : "text-xl")}
          style={{ filter: bright ? `drop-shadow(0 0 8px ${symbol.glow}) drop-shadow(0 0 16px ${symbol.glow})` : "none" }}>
          {symbol.s}
        </span>
      )}
    </div>
  );
}

function ReelColumn({ spinning, finalSymbol, stopDelay, bright }) {
  const [current, setCurrent] = useState([pickSymbol(), pickSymbol(), pickSymbol()]);
  const [stopped, setStopped] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (spinning) {
      setStopped(false);
      intervalRef.current = setInterval(() => {
        setCurrent([pickSymbol(), pickSymbol(), pickSymbol()]);
      }, 80);
    } else {
      const t = setTimeout(() => {
        clearInterval(intervalRef.current);
        setCurrent([pickSymbol(), finalSymbol, pickSymbol()]);
        setStopped(true);
      }, stopDelay);
      return () => clearTimeout(t);
    }
    return () => clearInterval(intervalRef.current);
  }, [spinning, finalSymbol, stopDelay]);

  return (
    <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-xl"
      style={{
        width: "90px",
        height: "220px",
        background: "linear-gradient(180deg, #0a0010 0%, #12002a 50%, #0a0010 100%)",
        border: `2px solid ${stopped && bright ? "#ff00ff80" : "#44004480"}`,
        boxShadow: stopped && bright ? "0 0 20px #ff00ff40, inset 0 0 20px #ff000010" : "inset 0 0 10px #00000080",
      }}>
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-14 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, #0a0010 0%, transparent 100%)" }} />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-14 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to top, #0a0010 0%, transparent 100%)" }} />

      {/* Center win line */}
      <div className="absolute left-0 right-0 z-10 pointer-events-none"
        style={{ top: "50%", transform: "translateY(-50%)", height: "74px",
          border: `1px solid ${bright && stopped ? "#ff00ff60" : "rgba(255,255,255,0.06)"}`,
          background: bright && stopped ? "rgba(255,0,255,0.04)" : "transparent" }} />

      {/* Symbols */}
      {current.map((sym, i) => (
        <motion.div key={i} className="flex items-center justify-center"
          style={{ width: "90px", height: "73px" }}
          animate={spinning ? { y: [0, -8, 0] } : {}}
          transition={{ duration: 0.08, repeat: Infinity }}>
          <NeonSymbol symbol={sym} size={i === 1 ? "lg" : "md"} bright={i === 1 && bright && stopped} />
        </motion.div>
      ))}
    </div>
  );
}

export default function SlotsGame({ balance, setBalance, accentColor }) {
  const [spinning, setSpinning] = useState(false);
  const [finalReels, setFinalReels] = useState([NEON_SYMBOLS[3], NEON_SYMBOLS[4], NEON_SYMBOLS[5]]);
  const [result, setResult] = useState(null);
  const [bet, setBet] = useState(100);
  const [jackpot, setJackpot] = useState(1234567);
  const [showJackpot, setShowJackpot] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [lightPhase, setLightPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setLightPhase(p => (p + 1) % 8);
      setJackpot(j => j + Math.floor(Math.random() * 13));
    }, 200);
    return () => clearInterval(t);
  }, []);

  const spin = () => {
    if (spinning || bet > balance || bet <= 0) { toast.error("Mise invalide"); return; }
    setSpinning(true);
    setResult(null);
    setShowJackpot(false);

    const selected = [pickSymbol(), pickSymbol(), pickSymbol()];
    setFinalReels(selected);
    setBalance(b => b - bet);

    setTimeout(() => {
      setSpinning(false);
      const mult = getMultiplier(selected);
      const winAmount = mult > 0 ? Math.round(bet * mult) : 0;
      setLastWin(winAmount);
      if (winAmount > 0) setBalance(b => b + winAmount);
      setResult({ gain: winAmount - bet, mult, symbols: selected, win: winAmount > 0 });

      if (selected[0].s === "7" && selected[1].s === "7" && selected[2].s === "7") {
        setShowJackpot(true);
        const bonus = jackpot;
        setBalance(b => b + bonus);
        setTimeout(() => setShowJackpot(false), 5000);
        toast.success(`🎰 JACKPOT ULTIME !!! +${bonus.toLocaleString()} 🪙`, { duration: 6000 });
      } else if (winAmount > 0) {
        toast.success(`🎉 x${mult} — +${winAmount} 🪙`);
      } else {
        toast.error("Pas de chance... Encore !");
      }
    }, 2600 + 400 * 2);
  };

  const BETS = [50, 100, 250, 500, 1000];

  return (
    <div className="space-y-0 select-none">
      {/* JACKPOT EXPLOSION */}
      <AnimatePresence>
        {showJackpot && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
            style={{ background: "rgba(0,0,0,0.85)" }}>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
              className="text-center px-6">
              <p className="text-3xl font-black mb-2" style={{ color: "#ff6600", textShadow: "0 0 30px #ff6600, 0 0 60px #ff3300", fontFamily: "'Arial Black', sans-serif" }}>HIT THE</p>
              <p className="text-6xl font-black" style={{ color: "#ffcc00", textShadow: "0 0 30px #ffcc00, 0 0 60px #ff9900", fontFamily: "'Arial Black', sans-serif", WebkitTextStroke: "2px #ff6600" }}>ULTIMATE</p>
              <p className="text-6xl font-black" style={{ color: "#ffcc00", textShadow: "0 0 30px #ffcc00, 0 0 60px #ff9900", fontFamily: "'Arial Black', sans-serif", WebkitTextStroke: "2px #ff6600" }}>JACKPOT</p>
              <div className="mt-4 px-6 py-2 rounded-lg border-2 border-yellow-400"
                style={{ background: "#0a0020", boxShadow: "0 0 20px #ff00ff" }}>
                <p className="text-sm font-bold text-fuchsia-400">✨ Jackpot</p>
                <p className="text-2xl font-black text-white">AWARDED!!!</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jackpot counter */}
      <div className="text-center py-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{ background: "linear-gradient(90deg, #1a0030, #2a0050, #1a0030)", border: "1px solid #aa00ff60" }}>
          <span className="text-xs font-bold text-fuchsia-400">JACKPOT</span>
          <span className="font-mono font-black text-lg" style={{ color: "#ffcc00", textShadow: "0 0 10px #ffaa00" }}>
            {jackpot.toLocaleString()} 🪙
          </span>
        </div>
      </div>

      {/* Main machine frame */}
      <div className="relative mx-auto max-w-xs">
        {/* Machine outer glow */}
        <div className="absolute -inset-2 rounded-3xl opacity-60 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #8800ff20, transparent 70%)", filter: "blur(10px)" }} />

        <div className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #1a0035 0%, #0f0025 50%, #15002d 100%)",
            border: "3px solid #6600cc80",
            boxShadow: "0 0 40px #8800ff40, 0 0 80px #4400aa20, inset 0 1px 0 rgba(255,255,255,0.1)"
          }}>

          {/* Animated neon border lights */}
          <div className="flex justify-center gap-1.5 px-4 py-2.5">
            {Array.from({ length: 14 }).map((_, i) => {
              const colors = ["#ff00ff", "#aa00ff", "#0088ff", "#ff0088"];
              const active = (i % 4 === lightPhase % 4);
              return (
                <div key={i} className="rounded-full transition-all duration-100"
                  style={{
                    width: "8px", height: "8px",
                    background: active ? colors[i % 4] : "rgba(255,255,255,0.1)",
                    boxShadow: active ? `0 0 8px ${colors[i % 4]}, 0 0 16px ${colors[i % 4]}` : "none"
                  }} />
              );
            })}
          </div>

          {/* Reels area */}
          <div className="mx-3 mb-3 rounded-2xl overflow-hidden p-3"
            style={{
              background: "linear-gradient(180deg, #080018 0%, #100020 100%)",
              border: "2px solid #aa00ff60",
              boxShadow: "inset 0 0 30px #00000080, 0 0 20px #8800ff20"
            }}>

            {/* Top symbols row hint */}
            <div className="flex justify-between px-1 mb-1 opacity-40">
              <span className="text-xs text-fuchsia-400 font-bold">BAR</span>
              <span className="text-xs font-black" style={{ color: "#ff00ff", textShadow: "0 0 8px #ff00ff" }}>Wild</span>
              <span className="text-xs text-purple-400 font-bold">🍇</span>
            </div>

            {/* Reels */}
            <div className="flex gap-2 justify-center">
              {[0, 1, 2].map(i => (
                <ReelColumn key={i}
                  spinning={spinning}
                  finalSymbol={finalReels[i]}
                  stopDelay={600 + i * 500}
                  bright={result?.win && !spinning}
                />
              ))}
            </div>

            {/* Bottom symbols row hint */}
            <div className="flex justify-between px-1 mt-1 opacity-40">
              <span className="text-xs font-black" style={{ color: "#ff00ff", textShadow: "0 0 6px #ff00ff" }}>Wild</span>
              <span className="text-xs text-purple-400">🍒</span>
              <span className="text-xs text-fuchsia-400 font-bold">BAR</span>
            </div>
          </div>

          {/* Bottom neon lights */}
          <div className="flex justify-center gap-1.5 px-4 py-2">
            {Array.from({ length: 14 }).map((_, i) => {
              const colors = ["#0088ff", "#ff0088", "#aa00ff", "#ff00ff"];
              const active = (i % 4 === (lightPhase + 2) % 4);
              return (
                <div key={i} className="rounded-full transition-all duration-100"
                  style={{
                    width: "8px", height: "8px",
                    background: active ? colors[i % 4] : "rgba(255,255,255,0.1)",
                    boxShadow: active ? `0 0 8px ${colors[i % 4]}, 0 0 16px ${colors[i % 4]}` : "none"
                  }} />
              );
            })}
          </div>

          {/* Controls */}
          <div className="px-4 pb-4 space-y-3">
            {/* Last win + balance */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl"
              style={{ background: "#0a001a", border: "1px solid #44006680" }}>
              <div>
                <p className="text-[10px] font-bold text-fuchsia-500 uppercase">Last Win</p>
                <p className="font-mono font-black text-lg text-white">{lastWin.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-fuchsia-500 uppercase">Solde</p>
                <p className="font-mono font-black text-lg" style={{ color: "#ffcc00" }}>{balance.toLocaleString()}</p>
              </div>
            </div>

            {/* Bet selector */}
            <div className="flex gap-1 justify-center">
              {BETS.map(b => (
                <button key={b} onClick={() => setBet(b)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-black transition-all"
                  style={{
                    background: bet === b ? "linear-gradient(135deg, #8800ff, #4400aa)" : "rgba(255,255,255,0.06)",
                    color: bet === b ? "white" : "#888",
                    border: `1px solid ${bet === b ? "#aa00ff" : "transparent"}`,
                    boxShadow: bet === b ? "0 0 10px #8800ff60" : "none"
                  }}>
                  {b >= 1000 ? `${b / 1000}K` : b}
                </button>
              ))}
            </div>

            {/* SPIN button */}
            <motion.button onClick={spin} disabled={spinning}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3.5 rounded-2xl font-black text-lg tracking-wider transition-all"
              style={{
                background: spinning
                  ? "linear-gradient(135deg, #440088, #220044)"
                  : "linear-gradient(135deg, #44cc00, #22aa00)",
                color: "white",
                textShadow: spinning ? "none" : "0 0 10px rgba(255,255,255,0.5)",
                boxShadow: spinning ? "none" : "0 0 20px #44cc0060, 0 4px 0 #116600",
                border: "none",
              }}>
              {spinning ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  EN COURS...
                </span>
              ) : "SPIN 🎰"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Win result */}
      <AnimatePresence>
        {result && !spinning && result.win && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-3 rounded-2xl mx-2"
            style={{ background: "linear-gradient(135deg, #1a0035, #2a005a)", border: "1px solid #aa00ff60", boxShadow: "0 0 20px #8800ff40" }}>
            <p className="text-2xl font-black" style={{ color: "#ffcc00", textShadow: "0 0 20px #ffaa00" }}>
              🎉 x{result.mult} — +{result.win} 🪙
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paytable */}
      <div className="px-2 mt-3">
        <p className="text-[10px] font-bold uppercase text-center text-fuchsia-400 mb-2 tracking-widest">Tableau des gains</p>
        <div className="grid grid-cols-4 gap-1">
          {NEON_SYMBOLS.slice(0, 4).map(s => (
            <div key={s.s} className="p-2 rounded-xl text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-sm font-black mb-0.5" style={{ color: s.color, textShadow: `0 0 6px ${s.glow}` }}>
                {s.s}{s.s}{s.s}
              </p>
              <p className="text-[10px] font-bold" style={{ color: "#ffcc00" }}>×{s.mult}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}