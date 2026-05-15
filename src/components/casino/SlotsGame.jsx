import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SYMBOLS = [
  { s: "🍒", name: "Cerise", mult: 5 },
  { s: "🍋", name: "Citron", mult: 5 },
  { s: "🍊", name: "Orange", mult: 5 },
  { s: "🍇", name: "Raisin", mult: 6 },
  { s: "🔔", name: "Cloche", mult: 8 },
  { s: "💎", name: "Diamant", mult: 50 },
  { s: "7️⃣", name: "Sept", mult: 20 },
  { s: "⭐", name: "Étoile", mult: 10 },
];

function getMultiplier(reels) {
  const [a, b, c] = reels;
  if (a === b && b === c) return SYMBOLS.find((s) => s.s === a)?.mult || 5;
  if (a === b || b === c || a === c) return 1.5;
  return 0;
}

function Reel({ spinning, finalSymbol, delay, index }) {
  const [displaySymbols, setDisplaySymbols] = useState([finalSymbol, "🎰", "🎰"]);
  const [offset, setOffset] = useState(0);
  const [settled, setSettled] = useState(true);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (spinning) {
      setSettled(false);
      intervalRef.current = setInterval(() => {
        setDisplaySymbols([
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].s,
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].s,
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].s,
        ]);
        setOffset((o) => (o + 1) % 3);
      }, 60 + index * 10);
    } else {
      timeoutRef.current = setTimeout(() => {
        clearInterval(intervalRef.current);
        setDisplaySymbols([
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].s,
          finalSymbol || "🎰",
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].s,
        ]);
        setSettled(true);
      }, delay);
    }
    return () => { clearInterval(intervalRef.current); clearTimeout(timeoutRef.current); };
  }, [spinning, finalSymbol, delay, index]);

  const glowColor = spinning ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.05)";

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 w-20 sm:w-24"
      style={{
        height: "88px",
        borderColor: spinning ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.12)",
        background: spinning
          ? "linear-gradient(145deg, rgba(255,215,0,0.06), rgba(0,0,0,0.4))"
          : "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.3))",
        boxShadow: spinning ? `0 0 20px ${glowColor}, inset 0 0 15px rgba(255,215,0,0.04)` : "inset 0 2px 4px rgba(0,0,0,0.5)",
        transition: "all 0.3s",
      }}>
      {/* Top/bottom fade masks */}
      <div className="absolute top-0 left-0 right-0 h-6 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-6 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }} />

      {/* Symbols strip */}
      <div className="flex flex-col items-center justify-center h-full gap-0">
        {displaySymbols.map((sym, i) => (
          <div key={i} className={cn("flex items-center justify-center", i === 1 ? "text-4xl sm:text-5xl" : "text-2xl opacity-30")}
            style={{ height: i === 1 ? "52px" : "18px" }}>
            {sym}
          </div>
        ))}
      </div>

      {/* Payline highlight on middle row */}
      {settled && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-14 pointer-events-none rounded-xl border"
          style={{ borderColor: "rgba(255,215,0,0.15)", background: "rgba(255,215,0,0.03)" }} />
      )}
    </div>
  );
}

export default function SlotsGame({ balance, setBalance, accentColor = "hsl(45 100% 55%)" }) {
  const [spinning, setSpinning] = useState(false);
  const [finalReels, setFinalReels] = useState(["🎰","🎰","🎰"]);
  const [showFinal, setShowFinal] = useState(false);
  const [amount, setAmount] = useState("50");
  const [result, setResult] = useState(null);
  const [leverPressed, setLeverPressed] = useState(false);
  const [lightFrame, setLightFrame] = useState(0);

  useEffect(() => {
    let t;
    if (spinning) t = setInterval(() => setLightFrame((f) => (f + 1) % 7), 100);
    return () => clearInterval(t);
  }, [spinning]);

  const play = () => {
    const stake = parseInt(amount);
    if (!stake || stake <= 0 || stake > balance) { toast.error("Mise invalide"); return; }
    setSpinning(true);
    setShowFinal(false);
    setResult(null);
    setLeverPressed(true);
    setTimeout(() => setLeverPressed(false), 400);

    const final = SYMBOLS.map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].s);
    const selected = [0,1,2].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].s);
    setFinalReels(selected);

    setTimeout(() => {
      setSpinning(false);
      setShowFinal(true);
      const mult = getMultiplier(selected);
      const gain = mult > 0 ? Math.round(stake * mult) - stake : -stake;
      setBalance((b) => b + gain);
      setResult({ gain, mult, symbols: selected });
      if (gain > 0) toast.success(`${selected[0]}${selected[1]}${selected[2]} — x${mult} → +${gain} 🪙 !`);
      else toast.error("Pas de chance... Réessaie !");
    }, 2400);
  };

  return (
    <div className="space-y-5">
      <h3 className="font-black text-xl text-center text-white tracking-wide">🎰 Machines à Sous</h3>

      <div className="relative mx-auto max-w-sm">
        {/* Machine body */}
        <div className="rounded-3xl border overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(80,40,0,0.6) 0%, rgba(40,20,0,0.8) 100%)",
            borderColor: "rgba(255,215,0,0.2)",
            boxShadow: "0 0 60px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,215,0,0.15)",
          }}>

          {/* Light strip */}
          <div className="flex justify-center gap-1.5 px-6 py-3 border-b" style={{ borderColor: "rgba(255,215,0,0.1)" }}>
            {Array.from({length:11}).map((_,i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full transition-all duration-100"
                style={{
                  background: spinning && (i % 7 === lightFrame) ? accentColor : "rgba(255,215,0,0.2)",
                  boxShadow: spinning && (i % 7 === lightFrame) ? `0 0 8px ${accentColor}` : "none",
                }} />
            ))}
          </div>

          {/* Screen area */}
          <div className="px-6 py-4 bg-black/40">
            {/* Reels */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 relative">
              {[0,1,2].map((i) => (
                <Reel key={i} spinning={spinning} finalSymbol={showFinal ? finalReels[i] : "🎰"} delay={600 + i * 400} index={i} />
              ))}
              {/* Payline arrow indicators */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-xs font-black" style={{ color: accentColor }}>▶</div>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-xs font-black" style={{ color: accentColor }}>◀</div>
            </div>
          </div>

          {/* Bottom panel */}
          <div className="px-6 py-4 border-t" style={{ borderColor: "rgba(255,215,0,0.1)" }}>
            {/* Credit display */}
            <div className="flex justify-between items-center mb-3 text-xs">
              <div className="text-center">
                <p className="text-muted-foreground">CRÉDIT</p>
                <p className="font-mono font-black text-sm" style={{ color: accentColor }}>{balance.toLocaleString()}</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <p className="text-muted-foreground">MISE</p>
                <p className="font-mono font-black text-sm" style={{ color: accentColor }}>{amount || 0}</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <p className="text-muted-foreground">GAIN</p>
                <p className={cn("font-mono font-black text-sm", result?.gain > 0 ? "text-green-400" : "text-muted-foreground")}>
                  {result ? (result.gain > 0 ? `+${result.gain}` : result.gain) : "—"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="h-9 bg-black/50 border-white/10 text-white font-mono text-center" />
              <Button onClick={play} disabled={spinning} className="shrink-0 px-6 h-9 font-bold rounded-xl"
                style={{ background: accentColor, color: "#0a0a0a" }}>
                {spinning ? "⏳" : "JOUER"}
              </Button>
            </div>
          </div>
        </div>

        {/* Lever */}
        <button onClick={play} disabled={spinning}
          className="absolute -right-5 top-1/4 flex flex-col items-center gap-0 cursor-pointer disabled:opacity-40 select-none"
          style={{ filter: `drop-shadow(0 0 8px ${accentColor}40)` }}>
          <motion.div animate={leverPressed ? { y: 20 } : { y: 0 }} transition={{ type: "spring", stiffness: 600, damping: 20 }}>
            <div className="w-6 h-6 rounded-full border-2 shadow-lg"
              style={{ background: "radial-gradient(circle at 30% 30%, #ff6b6b, #cc0000)", borderColor: "#ff9999" }} />
          </motion.div>
          <motion.div
            animate={leverPressed ? { scaleY: 0.7, originY: 0 } : { scaleY: 1 }}
            className="w-3 rounded-full mt-0.5"
            style={{ height: "64px", background: "linear-gradient(to bottom, #b8860b, #8B6914)", border: "1px solid rgba(255,215,0,0.3)" }} />
          <div className="w-5 h-3 rounded-b-lg" style={{ background: "#4a3200" }} />
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && !spinning && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className={cn("text-center p-3 rounded-2xl font-bold border",
              result.gain > 0 ? "bg-primary/10 text-primary border-primary/30" : "bg-destructive/10 text-destructive border-destructive/30")}>
            {result.gain > 0 ? `🎉 x${result.mult} — +${result.gain} 🪙` : "💸 Pas de chance... Encore !"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paytable */}
      <div className="grid grid-cols-4 gap-1 text-center text-[10px] text-muted-foreground">
        {SYMBOLS.slice(4).map((s) => (
          <div key={s.s} className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-base">{s.s}{s.s}{s.s}</p>
            <p className="font-bold" style={{ color: accentColor }}>×{s.mult}</p>
          </div>
        ))}
      </div>
    </div>
  );
}