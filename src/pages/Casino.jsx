import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Dices, CircleDot, Spade } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import AgeGate from "@/components/casino/AgeGate";
import RouletteGame from "@/components/casino/RouletteGame";
import SlotsGame from "@/components/casino/SlotsGame";
import BlackjackGame from "@/components/casino/BlackjackGame";
import { cn } from "@/lib/utils";

const GAMES = [
  { key: "roulette", label: "Roulette", icon: CircleDot, desc: "Mise sur rouge, noir ou un numéro" },
  { key: "slots", label: "Machines à sous", icon: Dices, desc: "Tentez votre chance aux 7 fruits" },
  { key: "blackjack", label: "Blackjack", icon: Spade, desc: "Battez le croupier à 21" },
];

export default function Casino() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [game, setGame] = useState("roulette");
  const [balance, setBalance] = useState(1000);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const verified = sessionStorage.getItem("casino_age_ok");
    if (verified === "yes") setAgeVerified(true);
  }, []);

  const onVerified = () => {
    sessionStorage.setItem("casino_age_ok", "yes");
    setAgeVerified(true);
  };

  if (!ageVerified) return <AgeGate onVerified={onVerified} />;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl px-4 py-3 flex items-center gap-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-black text-lg">
          <span style={{ color: "hsl(45 100% 55%)" }}>M</span>ATRIX Casino
        </span>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full border border-trix/30 bg-trix/10">
          <span className="text-sm font-mono font-black text-trix">{balance.toLocaleString()} 🪙</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Warning */}
        <div className="p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs text-center font-semibold">
          ⚠️ Jeu fictif uniquement — Aucun argent réel. Jouer peut créer une dépendance. Jouez de manière responsable.
        </div>

        {/* Game selector */}
        <div className="grid grid-cols-3 gap-3">
          {GAMES.map((g) => {
            const Icon = g.icon;
            return (
              <button
                key={g.key}
                onClick={() => setGame(g.key)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition",
                  game === g.key
                    ? "border-trix/50 bg-trix/10"
                    : "border-border hover:border-trix/30"
                )}
              >
                <Icon className={cn("w-6 h-6 mb-2", game === g.key ? "text-trix" : "text-muted-foreground")} />
                <p className="font-bold text-sm">{g.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{g.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Game area */}
        <div className="rounded-3xl border border-border bg-card p-6">
          {game === "roulette" && <RouletteGame balance={balance} setBalance={setBalance} />}
          {game === "slots" && <SlotsGame balance={balance} setBalance={setBalance} />}
          {game === "blackjack" && <BlackjackGame balance={balance} setBalance={setBalance} />}
        </div>
      </div>
    </div>
  );
}