import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

const BETS = [
  { key: "red", label: "🔴 Rouge", color: "bg-red-600", payout: 2 },
  { key: "black", label: "⚫ Noir", color: "bg-gray-800 border border-gray-600", payout: 2 },
  { key: "even", label: "Pair", color: "bg-secondary", payout: 2 },
  { key: "odd", label: "Impair", color: "bg-secondary", payout: 2 },
  { key: "1-18", label: "1 - 18", color: "bg-secondary", payout: 2 },
  { key: "19-36", label: "19 - 36", color: "bg-secondary", payout: 2 },
];

export default function RouletteGame({ balance, setBalance }) {
  const [bet, setBet] = useState("red");
  const [amount, setAmount] = useState("50");
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const spin = async () => {
    const stake = parseInt(amount);
    if (!stake || stake <= 0 || stake > balance) { toast.error("Mise invalide"); return; }
    setSpinning(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1500));
    const num = Math.floor(Math.random() * 37); // 0-36
    const isRed = RED_NUMBERS.includes(num);
    const color = num === 0 ? "green" : isRed ? "red" : "black";

    let win = false;
    if (bet === "red" && color === "red") win = true;
    if (bet === "black" && color === "black") win = true;
    if (bet === "even" && num !== 0 && num % 2 === 0) win = true;
    if (bet === "odd" && num % 2 !== 0) win = true;
    if (bet === "1-18" && num >= 1 && num <= 18) win = true;
    if (bet === "19-36" && num >= 19 && num <= 36) win = true;

    const gain = win ? stake : -stake;
    setBalance((b) => b + gain);
    setResult({ num, color, win, gain });
    setSpinning(false);
    if (win) toast.success(`+${stake} 🪙 — Vous avez gagné !`);
    else toast.error(`-${stake} 🪙 — Dommage !`);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-black text-xl text-center">Roulette</h3>

      {/* Wheel result */}
      <div className="flex items-center justify-center">
        <div className={cn(
          "w-32 h-32 rounded-full flex items-center justify-center text-4xl font-black border-4 transition-all duration-700",
          spinning ? "animate-spin border-trix" : result
            ? result.color === "red" ? "border-red-500 bg-red-500/20" : result.color === "black" ? "border-gray-500 bg-gray-500/20" : "border-green-500 bg-green-500/20"
            : "border-border bg-secondary/40"
        )}>
          {spinning ? "🎰" : result ? result.num : "?"}
        </div>
      </div>

      {result && !spinning && (
        <div className={cn(
          "text-center p-4 rounded-xl font-bold text-lg",
          result.win ? "bg-primary/10 text-primary border border-primary/30" : "bg-destructive/10 text-destructive border border-destructive/30"
        )}>
          {result.win ? `🎉 Gagné ! +${Math.abs(result.gain)} 🪙` : `💸 Perdu ! -${Math.abs(result.gain)} 🪙`}
        </div>
      )}

      {/* Bets */}
      <div className="grid grid-cols-3 gap-2">
        {BETS.map((b) => (
          <button key={b.key} onClick={() => setBet(b.key)}
            className={cn(
              "py-2 px-3 rounded-xl text-sm font-semibold border-2 transition",
              bet === b.key ? "border-trix" : "border-transparent",
              b.color
            )}>
            {b.label}
          </button>
        ))}
      </div>

      {/* Amount & Spin */}
      <div className="flex gap-3">
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder="Mise" className="bg-secondary/60 border-border" />
        <Button onClick={spin} disabled={spinning} className="shrink-0 px-8 font-bold"
          style={{ background: "hsl(45 100% 55%)", color: "hsl(0 0% 5%)" }}>
          {spinning ? "⏳" : "Lancer"}
        </Button>
      </div>
      <p className="text-xs text-center text-muted-foreground">Solde : {balance.toLocaleString()} 🪙</p>
    </div>
  );
}