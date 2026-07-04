import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, History, BarChart3, Trophy } from "lucide-react";

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, color: suit === "♥" || suit === "♦" ? "red" : "black" });
    }
  }
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(card) {
  if (["10", "J", "Q", "K"].includes(card.rank)) return 0;
  if (card.rank === "A") return 1;
  return parseInt(card.rank, 10);
}

function handValue(hand) {
  const sum = hand.reduce((acc, c) => acc + cardValue(c), 0);
  return sum % 10;
}

// Standard baccarat third-card drawing rules
function shouldDrawThirdCard(playerHand, bankerHand, playerThird) {
  const pTotal = handValue(playerHand);
  const bTotal = handValue(bankerHand);

  // Naturals — no third card
  if (pTotal >= 8 || bTotal >= 8) return null;

  // Player draws?
  let playerDrew = false;
  let pThirdVal = null;
  if (pTotal <= 5 && playerHand.length === 2) {
    playerDrew = true;
    pThirdVal = cardValue(playerThird);
  }

  // Banker drawing rules
  if (!playerDrew) {
    // Banker stands on 6-7, draws on 0-5
    return bTotal <= 5;
  }

  // Banker rules when player drew a third card
  if (bTotal <= 2) return true;
  if (bTotal === 3) return pThirdVal !== 8;
  if (bTotal === 4) return pThirdVal >= 2 && pThirdVal <= 7;
  if (bTotal === 5) return pThirdVal >= 4 && pThirdVal <= 7;
  if (bTotal === 6) return pThirdVal >= 6 && pThirdVal <= 7;
  return false; // 7 stands
}

const BET_TYPES = {
  player: { label: "Joueur", payout: 1, color: "#3b82f6" },
  banker: { label: "Banque", payout: 0.95, color: "#a855f7" },
  tie: { label: "Égalité", payout: 8, color: "#fbbf24" },
};

function PlayingCard({ card, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -40, rotateY: 180 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.4, delay }}
      className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg flex flex-col items-center justify-center shrink-0 shadow-lg"
      style={{
        background: "linear-gradient(145deg, #fff, #f0f0f0)",
        border: "2px solid rgba(0,0,0,0.1)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      <span className="text-lg font-black" style={{ color: card.color === "red" ? "#dc2626" : "#000" }}>
        {card.rank}
      </span>
      <span className="text-xl" style={{ color: card.color === "red" ? "#dc2626" : "#000" }}>
        {card.suit}
      </span>
    </motion.div>
  );
}

export default function BaccaratGame({ balance, setBalance, accentColor, jackpot, winJackpot, addTransaction }) {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [bankerHand, setBankerHand] = useState([]);
  const [phase, setPhase] = useState("betting"); // betting | dealing | revealing | result
  const [bet, setBet] = useState(100);
  const [betType, setBetType] = useState("player");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ played: 0, wins: 0, losses: 0, ties: 0, biggestWin: 0 });

  const deal = useCallback(() => {
    if (balance < bet) return;
    setBalance(b => b - bet);
    setPhase("dealing");
    setResult(null);

    const d = createDeck();
    const p = [d.pop(), d.pop()];
    const b = [d.pop(), d.pop()];
    setPlayerHand(p);
    setBankerHand(b);
    setDeck(d);

    const pTotal = handValue(p);
    const bTotal = handValue(b);

    // Check naturals
    if (pTotal >= 8 || bTotal >= 8) {
      setTimeout(() => resolveRound(p, b, null), 1200);
      return;
    }

    // Player third card
    let pThird = null;
    if (pTotal <= 5) {
      setTimeout(() => {
        pThird = d.pop();
        const newP = [...p, pThird];
        setPlayerHand(newP);
        setDeck([...d]);

        // Banker third card
        const drawBanker = shouldDrawThirdCard(p, b, pThird);
        if (drawBanker) {
          setTimeout(() => {
            const bThird = d.pop();
            const newB = [...b, bThird];
            setBankerHand(newB);
            setTimeout(() => resolveRound(newP, newB, pThird), 800);
          }, 800);
        } else {
          setTimeout(() => resolveRound(newP, b, pThird), 800);
        }
      }, 800);
    } else {
      // Player stands — banker draws on 0-5
      const drawBanker = shouldDrawThirdCard(p, b, null);
      if (drawBanker) {
        setTimeout(() => {
          const bThird = d.pop();
          const newB = [...b, bThird];
          setBankerHand(newB);
          setTimeout(() => resolveRound(p, newB, null), 800);
        }, 800);
      } else {
        setTimeout(() => resolveRound(p, b, null), 800);
      }
    }
  }, [balance, bet, setBalance]);

  const resolveRound = (p, b, pThird) => {
    const pTotal = handValue(p);
    const bTotal = handValue(b);
    let outcome;
    if (pTotal > bTotal) outcome = "player";
    else if (bTotal > pTotal) outcome = "banker";
    else outcome = "tie";

    let winnings = 0;
    if (outcome === betType) {
      winnings = Math.floor(bet * BET_TYPES[betType].payout);
      if (outcome === "tie") {
        // On tie win, also return the bet
        winnings += bet;
      }
    } else if (outcome === "tie" && betType !== "tie") {
      // Tie returns half the bet (varies by casino; we use push = return bet)
      winnings = bet;
    }

    // Rare jackpot trigger — natural 9 vs natural 8
    let jackpotWin = 0;
    if (p.length === 2 && b.length === 2 && pTotal === 9 && bTotal === 8 && Math.random() < 0.1) {
      jackpotWin = winJackpot();
      winnings += jackpotWin;
    }

    if (winnings > 0) {
      setBalance(bal => bal + winnings);
      if (addTransaction && winnings > bet) {
        addTransaction({
          type: "casino_win",
          amount: winnings - bet,
          description: `Baccarat — ${outcome === betType ? "Gagné" : "Égalité"}`,
          universe: "casino",
        });
      }
    } else {
      if (addTransaction) {
        addTransaction({
          type: "casino_loss",
          amount: -bet,
          description: `Baccarat — Perdu (${outcome === "player" ? "Joueur" : outcome === "banker" ? "Banque" : "Égalité"})`,
          universe: "casino",
        });
      }
    }

    setResult({ outcome, pTotal, bTotal, winnings, jackpotWin });
    setPhase("result");

    setStats(s => ({
      played: s.played + 1,
      wins: s.wins + (winnings > bet ? 1 : 0),
      losses: s.losses + (winnings === 0 ? 1 : 0),
      ties: s.ties + (winnings === bet && outcome !== betType ? 1 : 0),
      biggestWin: Math.max(s.biggestWin, winnings),
    }));

    setHistory(h => [{ outcome, pTotal, bTotal, bet, winnings, time: Date.now() }, ...h].slice(0, 15));
  };

  const reset = () => {
    setPlayerHand([]);
    setBankerHand([]);
    setResult(null);
    setPhase("betting");
  };

  const winRate = stats.played > 0 ? ((stats.wins / stats.played) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse at center, rgba(30,60,40,0.4), rgba(10,15,12,0.8))", border: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Table label */}
        <div className="text-center mb-4">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: `${accentColor}80` }}>Baccarat Pro · Punto Banco</p>
        </div>

        {/* Banker hand */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: BET_TYPES.banker.color }}>BANQUE</span>
            {bankerHand.length > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                {handValue(bankerHand)}
              </span>
            )}
          </div>
          <div className="flex gap-2 min-h-[96px] items-center">
            {bankerHand.map((c, i) => <PlayingCard key={i} card={c} delay={i * 0.3} />)}
            {bankerHand.length === 0 && <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 border-dashed border-white/10" />}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          <span className="text-[10px] font-black text-white/30 tracking-widest">VS</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Player hand */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: BET_TYPES.player.color }}>JOUEUR</span>
            {playerHand.length > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                {handValue(playerHand)}
              </span>
            )}
          </div>
          <div className="flex gap-2 min-h-[96px] items-center">
            {playerHand.map((c, i) => <PlayingCard key={i} card={c} delay={i * 0.3} />)}
            {playerHand.length === 0 && <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 border-dashed border-white/10" />}
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
              <div className="text-center">
                <p className="text-3xl font-black mb-1" style={{ color: result.winnings > bet ? "#22c55e" : result.winnings === bet ? "#fbbf24" : "#ef4444" }}>
                  {result.outcome === "player" ? "Joueur gagne" : result.outcome === "banker" ? "Banque gagne" : "Égalité"}
                </p>
                <p className="text-sm font-bold" style={{ color: result.winnings > 0 ? "#22c55e" : "#ef4444" }}>
                  {result.winnings > 0 ? `+${result.winnings.toLocaleString()} coins` : `-${bet.toLocaleString()} coins`}
                </p>
                {result.jackpotWin > 0 && (
                  <p className="text-lg font-black text-yellow-400 mt-2 animate-pulse">🎉 JACKPOT +{result.jackpotWin.toLocaleString()}</p>
                )}
                <button onClick={reset} className="mt-4 px-6 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: accentColor }}>
                  Continuer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Betting controls */}
      {phase === "betting" && (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(18,18,21,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Placez votre mise</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(BET_TYPES).map(([key, bet]) => (
              <button key={key} onClick={() => setBetType(key)}
                className="p-3 rounded-xl text-center transition"
                style={betType === key
                  ? { background: `${bet.color}20`, border: `1.5px solid ${bet.color}`, color: bet.color }
                  : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                <p className="text-xs font-bold">{bet.label}</p>
                <p className="text-[9px] mt-0.5">{bet.payout === 0.95 ? "0.95:1" : `${bet.payout}:1`}</p>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {[50, 100, 500, 1000].map(v => (
              <button key={v} onClick={() => setBet(v)}
                className="flex-1 h-9 rounded-lg text-xs font-bold transition"
                style={bet === v ? { background: accentColor, color: "#fff" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}>
                {v}
              </button>
            ))}
          </div>

          <button onClick={deal} disabled={balance < bet}
            className="w-full h-11 rounded-xl text-sm font-black text-white transition disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
            {balance < bet ? "Solde insuffisant" : `Distribuer — ${bet.toLocaleString()} coins`}
          </button>
        </div>
      )}

      {/* Stats + History */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: "rgba(18,18,21,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Statistiques</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><p className="text-white/30">Parties</p><p className="font-bold text-white">{stats.played}</p></div>
            <div><p className="text-white/30">Victoires</p><p className="font-bold text-green-400">{stats.wins}</p></div>
            <div><p className="text-white/30">Défaites</p><p className="font-bold text-red-400">{stats.losses}</p></div>
            <div><p className="text-white/30">Win rate</p><p className="font-bold text-white">{winRate}%</p></div>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: "rgba(18,18,21,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <History className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Historique</p>
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-thin">
            {history.length === 0 && <p className="text-[10px] text-white/30">Aucune partie</p>}
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-[10px]">
                <span style={{ color: BET_TYPES[h.outcome]?.color || "#fbbf24" }}>
                  {h.outcome === "player" ? "J" : h.outcome === "banker" ? "B" : "É"} {h.pTotal}-{h.bTotal}
                </span>
                <span className={h.winnings > h.bet ? "text-green-400" : h.winnings === 0 ? "text-red-400" : "text-white/40"}>
                  {h.winnings > 0 ? `+${h.winnings}` : `-${h.bet}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rules */}
      <details className="rounded-2xl p-4" style={{ background: "rgba(18,18,21,0.6)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <summary className="text-xs font-bold text-white/50 cursor-pointer">📜 Règles du Baccarat (Punto Banco)</summary>
        <div className="mt-3 text-[11px] text-white/40 space-y-1.5 leading-relaxed">
          <p>• <b className="text-white/60">Objectif :</b> Parier sur la main (Joueur ou Banque) la plus proche de 9.</p>
          <p>• <b className="text-white/60">Valeur des cartes :</b> As = 1, 2-9 = face, 10/J/Q/K = 0. Le total est modulo 10.</p>
          <p>• <b className="text-white/60">Naturel :</b> 8 ou 9 sur les 2 premières cartes → arrêt immédiat.</p>
          <p>• <b className="text-white/60">Tirage Joueur :</b> Tire une 3e carte si total ≤ 5.</p>
          <p>• <b className="text-white/60">Tirage Banque :</b> Dépend du total et de la 3e carte du joueur (règles standard Punto Banco).</p>
          <p>• <b className="text-white/60">Mises :</b> Joueur 1:1 · Banque 0.95:1 (commission 5%) · Égalité 8:1.</p>
        </div>
      </details>
    </div>
  );
}