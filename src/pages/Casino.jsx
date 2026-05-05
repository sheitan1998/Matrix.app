import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Dices, CircleDot, Spade, Trophy, ShoppingCart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AgeGate from "@/components/casino/AgeGate";
import RouletteGame from "@/components/casino/RouletteGame";
import SlotsGame from "@/components/casino/SlotsGame";
import BlackjackGame from "@/components/casino/BlackjackGame";
import SportsBetting from "@/components/casino/SportsBetting";
import CasinoShop from "@/pages/casino/CasinoShop";
import { cn } from "@/lib/utils";

const GAMES = [
  { key: "sports", label: "Paris Sportifs", icon: Trophy, desc: "Misez sur vos équipes favorites" },
  { key: "roulette", label: "Roulette", icon: CircleDot, desc: "Mise sur rouge, noir ou un numéro" },
  { key: "slots", label: "Machines à sous", icon: Dices, desc: "Tentez votre chance aux 7 fruits" },
  { key: "blackjack", label: "Blackjack", icon: Spade, desc: "Battez le croupier à 21" },
];

export default function Casino() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [game, setGame] = useState("sports");
  const [balance, setBalance] = useState(1000);
  const [showShop, setShowShop] = useState(false);
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
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #0a0a12 0%, #110a1a 50%, #0a0f0a 100%)" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl px-4 py-3 flex items-center gap-3"
        style={{ background: "linear-gradient(to right, rgba(10,10,20,0.95), rgba(17,10,26,0.95))" }}>
        <Link to="/" className="text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-black text-lg tracking-wide">
          <span style={{ color: "hsl(45 100% 55%)", textShadow: "0 0 20px hsl(45 100% 55% / 0.5)" }}>M</span>
          <span className="text-white">ATRIX</span>
          <span className="ml-2 text-sm font-bold text-trix">CASINO</span>
        </span>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setShowShop(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-trix/40 bg-trix/10 hover:bg-trix/20 transition"
          >
            <ShoppingCart className="w-4 h-4 text-trix" />
            <span className="text-sm font-mono font-black text-trix">{balance.toLocaleString()} 🪙</span>
          </button>
        </div>
      </div>

      {/* Responsible gaming banner */}
      <div className="px-4 py-2 text-center text-xs font-semibold border-b border-border/30" style={{ background: "rgba(255,180,0,0.05)", color: "hsl(45 80% 60%)" }}>
        ⚠️ Jouez responsablement — Jeu fictif, aucun argent réel — 18+ uniquement
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Game selector — casino style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {GAMES.map((g) => {
            const Icon = g.icon;
            return (
              <button
                key={g.key}
                onClick={() => setGame(g.key)}
                className={cn(
                  "relative p-4 rounded-2xl border text-left transition overflow-hidden",
                  game === g.key
                    ? "border-trix/60 bg-gradient-to-br from-trix/15 to-transparent"
                    : "border-white/10 bg-white/5 hover:border-trix/30 hover:bg-white/8"
                )}
              >
                {game === g.key && (
                  <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ background: "radial-gradient(circle at top left, hsl(45 100% 55%), transparent 60%)" }} />
                )}
                <Icon className={cn("w-5 h-5 mb-2", game === g.key ? "text-trix" : "text-muted-foreground")} />
                <p className={cn("font-bold text-sm", game === g.key ? "text-white" : "text-muted-foreground")}>{g.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{g.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Game area — felt-like table */}
        <div className="rounded-3xl overflow-hidden border border-white/10"
          style={{ background: "linear-gradient(145deg, #0f1a0f 0%, #0d1510 50%, #0a130a 100%)", boxShadow: "0 0 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
          <div className="p-6 sm:p-8">
            {game === "sports" && <SportsBetting balance={balance} setBalance={setBalance} />}
            {game === "roulette" && <RouletteGame balance={balance} setBalance={setBalance} />}
            {game === "slots" && <SlotsGame balance={balance} setBalance={setBalance} />}
            {game === "blackjack" && <BlackjackGame balance={balance} setBalance={setBalance} />}
          </div>
        </div>
      </div>

      {showShop && <CasinoShop balance={balance} setBalance={setBalance} onClose={() => setShowShop(false)} />}
    </div>
  );
}