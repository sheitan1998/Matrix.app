import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Loader2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const STATIC_MATCHES = [
  {
    id: "m1", sport: "⚽ Football", league: "Ligue 1",
    home: "PSG", away: "OM", time: "21:00",
    odds: { home: 1.65, draw: 3.80, away: 4.50 }
  },
  {
    id: "m2", sport: "⚽ Football", league: "Premier League",
    home: "Man City", away: "Arsenal", time: "20:45",
    odds: { home: 2.10, draw: 3.40, away: 3.20 }
  },
  {
    id: "m3", sport: "🎾 Tennis", league: "ATP Masters",
    home: "Djokovic", away: "Alcaraz", time: "15:30",
    odds: { home: 1.85, draw: null, away: 1.95 }
  },
  {
    id: "m4", sport: "🏀 Basketball", league: "NBA",
    home: "Lakers", away: "Warriors", time: "02:30",
    odds: { home: 2.20, draw: null, away: 1.72 }
  },
  {
    id: "m5", sport: "⚽ Football", league: "Champions League",
    home: "Real Madrid", away: "Bayern", time: "21:00",
    odds: { home: 2.05, draw: 3.50, away: 3.30 }
  },
  {
    id: "m6", sport: "🏉 Rugby", league: "Top 14",
    home: "Toulouse", away: "La Rochelle", time: "20:45",
    odds: { home: 1.55, draw: 8.00, away: 2.40 }
  },
];

const BET_TYPES = { home: "Victoire équipe 1", draw: "Match nul", away: "Victoire équipe 2" };

export default function SportsBetting({ balance, setBalance }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [betSlip, setBetSlip] = useState({}); // matchId -> { type, odds }
  const [betAmount, setBetAmount] = useState("50");
  const [results, setResults] = useState({});

  useEffect(() => {
    // Try to enrich with live odds via AI, fallback to static
    const enrich = async () => {
      try {
        const data = await base44.integrations.Core.InvokeLLM({
          prompt: "Génère des cotes réalistes pour 6 matchs sportifs du jour (foot, tennis, basket). Format JSON.",
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              matches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    sport: { type: "string" },
                    league: { type: "string" },
                    home: { type: "string" },
                    away: { type: "string" },
                    time: { type: "string" },
                    odds: {
                      type: "object",
                      properties: {
                        home: { type: "number" },
                        draw: { type: "number" },
                        away: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        });
        if (data?.matches?.length > 0) {
          setMatches(data.matches);
        } else {
          setMatches(STATIC_MATCHES);
        }
      } catch {
        setMatches(STATIC_MATCHES);
      }
      setLoading(false);
    };
    enrich();
  }, []);

  const toggleBet = (matchId, type, odds) => {
    setBetSlip((prev) => {
      const existing = prev[matchId];
      if (existing?.type === type) {
        const next = { ...prev };
        delete next[matchId];
        return next;
      }
      return { ...prev, [matchId]: { type, odds } };
    });
  };

  const totalOdds = Object.values(betSlip).reduce((acc, b) => acc * b.odds, 1);
  const potentialGain = (parseFloat(betAmount) || 0) * totalOdds;
  const slipCount = Object.keys(betSlip).length;

  const placeBet = async () => {
    const stake = parseFloat(betAmount);
    if (!stake || stake <= 0 || stake > balance || slipCount === 0) { toast.error("Mise invalide ou panier vide"); return; }

    setBalance((b) => b - stake);

    // Simulate results
    const newResults = {};
    let totalWin = 0;
    let allWon = true;
    for (const [matchId, bet] of Object.entries(betSlip)) {
      const match = matches.find((m) => m.id === matchId);
      const possibleOutcomes = ["home", match?.odds?.draw !== null ? "draw" : null, "away"].filter(Boolean);
      const outcome = possibleOutcomes[Math.floor(Math.random() * possibleOutcomes.length)];
      const won = outcome === bet.type;
      newResults[matchId] = { won, outcome };
      if (!won) allWon = false;
    }

    setResults(newResults);

    if (allWon) {
      const gain = Math.round(potentialGain);
      setBalance((b) => b + gain);
      toast.success(`🎉 Pari combiné GAGNÉ ! +${gain.toLocaleString()} 🪙`);
    } else {
      toast.error(`💸 Pari perdu ! -${stake} 🪙`);
    }
    setBetSlip({});
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-trix" />
      <p className="text-sm text-muted-foreground">Chargement des matchs en direct...</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-xl">Paris Sportifs</h3>
        <p className="text-xs text-muted-foreground">Solde : <span className="text-trix font-bold">{balance.toLocaleString()} 🪙</span></p>
      </div>

      {/* Matches */}
      <div className="space-y-3">
        {matches.map((match) => {
          const myBet = betSlip[match.id];
          const result = results[match.id];
          return (
            <div key={match.id} className={cn(
              "rounded-2xl border bg-secondary/30 p-4 transition",
              myBet ? "border-trix/50" : "border-border",
              result && (result.won ? "border-primary/50 bg-primary/5" : "border-destructive/30 bg-destructive/5")
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">{match.sport}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{match.league}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{match.time}</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm">{match.home}</span>
                <span className="text-xs text-muted-foreground font-mono">VS</span>
                <span className="font-bold text-sm">{match.away}</span>
              </div>

              <div className="flex gap-2">
                {(["home", match.odds.draw !== null ? "draw" : null, "away"]).filter(Boolean).map((type) => {
                  const odds = match.odds[type];
                  if (!odds) return null;
                  const isSelected = myBet?.type === type;
                  const betResult = result;
                  return (
                    <button
                      key={type}
                      onClick={() => !result && toggleBet(match.id, type, odds)}
                      disabled={!!result}
                      className={cn(
                        "flex-1 py-2 px-1 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-0.5",
                        isSelected ? "border-trix bg-trix/20 text-trix" : "border-border hover:border-trix/40 text-muted-foreground hover:text-foreground",
                        betResult && betResult.outcome === type ? "border-primary bg-primary/10 text-primary" : "",
                        betResult && betResult.outcome !== type && isSelected ? "border-destructive/40 bg-destructive/10 text-destructive" : ""
                      )}
                    >
                      <span className="text-[10px] opacity-70">{type === "home" ? match.home : type === "away" ? match.away : "Nul"}</span>
                      <span className="text-sm font-black">{odds.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bet slip */}
      {slipCount > 0 && (
        <div className="sticky bottom-0 rounded-2xl border border-trix/50 bg-card p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-trix" />
              <span className="font-bold text-sm">{slipCount} sélection{slipCount > 1 ? "s" : ""}</span>
            </div>
            <span className="font-black text-trix">Cote: x{totalOdds.toFixed(2)}</span>
          </div>
          <div className="flex gap-3 items-center">
            <Input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Mise (🪙)" className="bg-secondary/60 border-border" />
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Gain potentiel</p>
              <p className="font-black text-primary">{Math.round(potentialGain).toLocaleString()} 🪙</p>
            </div>
          </div>
          <Button onClick={placeBet} className="w-full font-bold h-11" style={{ background: "hsl(45 100% 55%)", color: "#000" }}>
            Valider le pari
          </Button>
        </div>
      )}
    </div>
  );
}