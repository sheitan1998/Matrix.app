import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "🔔", "💎", "7️⃣", "⭐"];

function spin3() {
  return [0, 1, 2].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
}

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

export default function SlotsGame({ balance, setBalance }) {
  const [reels, setReels] = useState(["🎰", "🎰", "🎰"]);
  const [amount, setAmount] = useState("50");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const play = async () => {
    const stake = parseInt(amount);
    if (!stake || stake <= 0 || stake > balance) { toast.error("Mise invalide"); return; }
    setSpinning(true);
    setResult(null);
    setReels(["🎰", "🎰", "🎰"]);
    await new Promise((r) => setTimeout(r, 1200));
    const final = spin3();
    setReels(final);
    const mult = getMultiplier(final);
    const gain = mult > 0 ? Math.round(stake * mult) - stake : -stake;
    setBalance((b) => b + gain);
    setResult({ gain, mult });
    setSpinning(false);
    if (gain > 0) toast.success(`+${gain} 🪙 — Multiplicateur x${mult} !`);
    else toast.error(`-${stake} 🪙 — Rejouez !`);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-black text-xl text-center">Machines à Sous</h3>

      {/* Reels */}
      <div className="flex items-center justify-center gap-3">
        {reels.map((s, i) => (
          <div key={i} className={cn(
            "w-24 h-24 rounded-2xl border-2 border-trix/40 bg-secondary/60 flex items-center justify-center text-4xl transition-all duration-300",
            spinning && "animate-bounce"
          )}>
            {s}
          </div>
        ))}
      </div>

      {result && !spinning && (
        <div className={cn(
          "text-center p-4 rounded-xl font-bold text-lg",
          result.gain > 0 ? "bg-primary/10 text-primary border border-primary/30" : "bg-destructive/10 text-destructive border border-destructive/30"
        )}>
          {result.gain > 0 ? `🎉 x${result.mult} — +${result.gain} 🪙` : `💸 Pas de chance...`}
        </div>
      )}

      <div className="text-xs text-center text-muted-foreground space-y-0.5">
        <p>💎💎💎 = x50 &nbsp;|&nbsp; 7️⃣7️⃣7️⃣ = x20 &nbsp;|&nbsp; ⭐⭐⭐ = x10 &nbsp;|&nbsp; 3 identiques = x5</p>
        <p>2 identiques = x1.5</p>
      </div>

      <div className="flex gap-3">
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder="Mise" className="bg-secondary/60 border-border" />
        <Button onClick={play} disabled={spinning} className="shrink-0 px-8 font-bold"
          style={{ background: "hsl(45 100% 55%)", color: "hsl(0 0% 5%)" }}>
          {spinning ? "⏳" : "Jouer"}
        </Button>
      </div>
      <p className="text-xs text-center text-muted-foreground">Solde : {balance.toLocaleString()} 🪙</p>
    </div>
  );
}