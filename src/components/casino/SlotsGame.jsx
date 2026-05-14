import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SYMBOLS = ["🍒","🍋","🍊","🍇","🔔","💎","7️⃣","⭐"];

function getMultiplier(reels) {
  const [a, b, c] = reels;
  if (a === b && b === c) {
    if (a === "💎") return 50;
    if (a === "7️⃣") return 20;
    if (a === "⭐") return 10;
    return 5;
  }
  if (a === b || b === c || a === c) return 1.5;
  return 0;
}

function Reel({ spinning, finalSymbol, delay }) {
  const [display, setDisplay] = useState(finalSymbol || "🎰");
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (spinning) {
      setDisplay(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
      intervalRef.current = setInterval(() => {
        setDisplay(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
      }, 80);
    } else {
      timeoutRef.current = setTimeout(() => {
        clearInterval(intervalRef.current);
        setDisplay(finalSymbol || "🎰");
      }, delay);
    }
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [spinning, finalSymbol, delay]);

  return (
    <div className={cn(
      "w-20 h-24 sm:w-24 sm:h-28 rounded-2xl border-2 flex items-center justify-center text-4xl sm:text-5xl transition-all",
      spinning ? "border-yellow-500/60 shadow-[0_0_20px_rgba(255,215,0,0.3)] scale-105" : "border-white/10 bg-white/5"
    )}
      style={spinning ? { background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,215,0,0.02))" } : {}}>
      <span className={spinning ? "animate-spin" : "transition-all duration-300"}>{display}</span>
    </div>
  );
}

export default function SlotsGame({ balance, setBalance, accentColor = "hsl(45 100% 55%)" }) {
  const [spinning, setSpinning] = useState(false);
  const [finalReels, setFinalReels] = useState(["🎰","🎰","🎰"]);
  const [showFinal, setShowFinal] = useState(false);
  const [amount, setAmount] = useState("50");
  const [result, setResult] = useState(null);

  const play = () => {
    const stake = parseInt(amount);
    if (!stake || stake <= 0 || stake > balance) { toast.error("Mise invalide"); return; }
    setSpinning(true);
    setShowFinal(false);
    setResult(null);

    const final = [0,1,2].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    setFinalReels(final);

    setTimeout(() => {
      setSpinning(false);
      setShowFinal(true);
      const mult = getMultiplier(final);
      const gain = mult > 0 ? Math.round(stake * mult) - stake : -stake;
      setBalance((b) => b + gain);
      setResult({ gain, mult, final });
      if (gain > 0) toast.success(`x${mult} — +${gain} 🪙 !`);
      else toast.error(`-${stake} 🪙 Rejouer !`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-black text-xl text-center text-white">Machines à Sous</h3>

      {/* Machine frame */}
      <div className="relative mx-auto max-w-xs">
        <div className="rounded-3xl border border-yellow-500/20 p-4 sm:p-6"
          style={{ background: "linear-gradient(145deg, rgba(255,215,0,0.05), rgba(0,0,0,0.3))", boxShadow: "inset 0 2px 0 rgba(255,215,0,0.1), 0 0 40px rgba(0,0,0,0.5)" }}>
          {/* Light bar top */}
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({length: 7}).map((_,i) => (
              <div key={i} className={cn("w-2 h-2 rounded-full transition-all", spinning ? "animate-pulse bg-yellow-400" : "bg-yellow-500/30")}
                style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>

          {/* Reels */}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {[0,1,2].map((i) => (
              <Reel key={i} spinning={spinning} finalSymbol={showFinal ? finalReels[i] : "🎰"} delay={i * 300} />
            ))}
          </div>

          {/* Payline indicator */}
          <div className="flex justify-center mt-4">
            <div className="h-0.5 w-3/4 rounded-full" style={{ background: spinning ? "rgba(255,215,0,0.6)" : "rgba(255,255,255,0.1)" }} />
          </div>
        </div>

        {/* Lever */}
        <button onClick={play} disabled={spinning}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-24 flex flex-col items-center gap-0.5 cursor-pointer disabled:opacity-50"
          style={{ filter: spinning ? "none" : "drop-shadow(0 0 6px rgba(255,215,0,0.4))" }}>
          <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-red-300 shadow-lg" />
          <div className="flex-1 w-2 rounded-full bg-gradient-to-b from-yellow-600 to-yellow-800 border border-yellow-500/40" />
        </button>
      </div>

      {/* Result */}
      {result && !spinning && (
        <div className={cn("text-center p-3 rounded-2xl font-bold",
          result.gain > 0 ? "bg-primary/10 text-primary border border-primary/30" : "bg-destructive/10 text-destructive border border-destructive/30")}>
          {result.gain > 0 ? `🎉 x${result.mult} — +${result.gain} 🪙` : `💸 Pas de chance...`}
        </div>
      )}

      {/* Paytable */}
      <div className="text-[10px] sm:text-xs text-center text-muted-foreground grid grid-cols-2 gap-1 px-2">
        <span>💎💎💎 = <b className="text-yellow-400">×50</b></span>
        <span>7️⃣7️⃣7️⃣ = <b className="text-yellow-400">×20</b></span>
        <span>⭐⭐⭐ = <b className="text-yellow-400">×10</b></span>
        <span>3 identiques = <b className="text-yellow-400">×5</b></span>
      </div>

      <div className="flex gap-3">
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder="Mise" className="bg-white/5 border-white/10 text-white" />
        <Button onClick={play} disabled={spinning} className="shrink-0 px-8 font-bold"
          style={{ background: accentColor, color: "#0a0a0a" }}>
          {spinning ? "🎰..." : "Jouer"}
        </Button>
      </div>
      <p className="text-xs text-center text-muted-foreground">Solde : {balance.toLocaleString()} 🪙</p>
    </div>
  );
}