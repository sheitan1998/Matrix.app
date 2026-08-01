import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import CasinoWinEffect from "./CasinoWinEffect";
import { casinoPlaceBet } from "@/hooks/useCasinoJackpot";

const SUITS = ["♠","♥","♦","♣"];
const VALUES = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

// Generate a biased deck so the card outcome matches the server-determined result.
// pop() order: player1, dealer1, player2, dealer2, hitCard, ...
function makeBiasedDeck(isWin) {
  const biased = isWin
    ? [
        { suit: "♠", value: "10" }, // player1
        { suit: "♥", value: "10" }, // dealer1
        { suit: "♦", value: "A" },  // player2 → 21 natural
        { suit: "♣", value: "5" },  // dealer2 → 15, draws and busts/stands
        { suit: "♠", value: "2" },  // hit card (unused — natural ends game)
      ]
    : [
        { suit: "♠", value: "10" }, // player1
        { suit: "♥", value: "10" }, // dealer1
        { suit: "♦", value: "6" },  // player2 → 16
        { suit: "♣", value: "10" }, // dealer2 → 20 stands
        { suit: "♠", value: "K" },  // hit → 10 value → bust 26
      ];
  const usedKeys = new Set(biased.map(c => c.suit + c.value));
  const rest = [];
  for (const s of SUITS) for (const v of VALUES) {
    if (!usedKeys.has(s + v)) rest.push({ suit: s, value: v });
  }
  rest.sort(() => Math.random() - 0.5);
  // Deck ends with biased cards in reverse so pop() gives them in order
  const deck = [...rest];
  for (let i = biased.length - 1; i >= 0; i--) deck.push(biased[i]);
  return deck;
}

function newDeck() {
  const deck = [];
  for (const s of SUITS) for (const v of VALUES) deck.push({ suit: s, value: v });
  return deck.sort(() => Math.random() - 0.5);
}
function cardValue(card) {
  if (["J","Q","K"].includes(card.value)) return 10;
  if (card.value === "A") return 11;
  return parseInt(card.value);
}
function handTotal(hand) {
  let total = hand.reduce((s, c) => s + cardValue(c), 0);
  let aces = hand.filter((c) => c.value === "A").length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function Card({ card, hidden, delay = 0 }) {
  const isRed = card && ["♥","♦"].includes(card.suit);
  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0, y: -30, scale: 0.8 }}
      animate={{ rotateY: 0, opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: "backOut" }}
      className="shrink-0 relative"
      style={{ perspective: "800px" }}>
      {hidden ? (
        <div className="w-12 h-18 rounded-xl flex items-center justify-center select-none"
          style={{
            width: "48px", height: "72px",
            background: "linear-gradient(135deg, #1a0060, #0d0040)",
            border: "1px solid rgba(100,80,200,0.6)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.7), 0 0 10px rgba(100,50,255,0.3)"
          }}>
          <span className="text-2xl">🂠</span>
        </div>
      ) : (
        <div className="rounded-xl flex flex-col p-1 select-none relative overflow-hidden"
          style={{
            width: "48px", height: "72px",
            background: "linear-gradient(135deg, #fefefe, #e8e8e8)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.3)"
          }}>
          <span className="text-sm font-black leading-none" style={{ color: isRed ? "#dc2626" : "#111" }}>
            {card.value}
          </span>
          <span className="text-base leading-none mt-0.5" style={{ color: isRed ? "#dc2626" : "#111" }}>
            {card.suit}
          </span>
          <span className="mt-auto text-sm font-black leading-none self-end rotate-180" style={{ color: isRed ? "#dc2626" : "#111" }}>
            {card.value}
          </span>
          {/* Shine */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%)", borderRadius: "10px" }} />
        </div>
      )}
    </motion.div>
  );
}

const BETS_PRESET = [100, 250, 500, 1000, 2500];

export default function BlackjackGame({ balance, setBalance, accentColor = "#ffd700", jackpot = 0 }) {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [phase, setPhase] = useState("bet");
  const [bet, setBet] = useState(250);
  const [stake, setStake] = useState(0);
  const [message, setMessage] = useState("");
  const [hideDealer, setHideDealer] = useState(true);
  const [chipAnim, setChipAnim] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [winData, setWinData] = useState(null);
  const serverResultRef = useRef(null);

  const deal = async () => {
    if (bet <= 0 || bet > balance) { toast.error("Mise invalide"); return; }

    let serverResult;
    try {
      serverResult = await casinoPlaceBet("blackjack", bet);
    } catch { toast.error("Erreur de connexion"); return; }
    if (serverResult.error) { toast.error(serverResult.error); return; }

    serverResultRef.current = serverResult;
    setChipAnim(true);
    setTimeout(() => setChipAnim(false), 600);

    const d = makeBiasedDeck(serverResult.win);
    const p = [d.pop(), d.pop()];
    const dl = [d.pop(), d.pop()];
    setDeck(d); setPlayerHand(p); setDealerHand(dl); setStake(bet);
    setHideDealer(true); setMessage(""); setPhase("playing");
    // Show balance after bet deduction (before payout)
    setBalance(serverResult.newBalance - (serverResult.payout || 0));
    if (handTotal(p) === 21) endGame(p, dl, d, true, bet);
  };

  const endGame = (ph, dh, d, natural, s) => {
    setHideDealer(false);
    let dl = [...dh];
    let dk = [...d];
    while (handTotal(dl) < 17) { dl.push(dk.pop()); }
    setDealerHand(dl);
    const pt = natural ? 21 : handTotal(ph);

    const sr = serverResultRef.current;
    if (!sr) return;

    const gain = sr.payout || 0;
    const jpHit = sr.jackpot;
    let msg;
    if (jpHit) {
      msg = `🎰 JACKPOT ! +${gain.toLocaleString()} 🪙`;
    } else if (sr.win) {
      msg = natural ? `🃏 BLACKJACK ! +${gain} 🪙` : `🎉 Gagné ! +${gain} 🪙`;
    } else {
      msg = pt > 21 ? `💸 Bust ! -${s} 🪙` : `💸 Croupier gagne. -${s} 🪙`;
    }

    setBalance(sr.newBalance);
    setMessage(msg);
    setPhase("done");
    if (gain > 0) {
      setWinData({ amount: gain, multiplier: Math.round(gain / s) || 1, isJackpot: jpHit });
      setShowWin(true);
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  };

  const hit = () => {
    const newCard = deck[deck.length - 1];
    const newDk = deck.slice(0, -1);
    const newPh = [...playerHand, newCard];
    setDeck(newDk); setPlayerHand(newPh);
    if (handTotal(newPh) >= 21) endGame(newPh, dealerHand, newDk, false, stake);
  };

  const stand = () => endGame(playerHand, dealerHand, deck, false, stake);
  const reset = () => { setPhase("bet"); setPlayerHand([]); setDealerHand([]); setMessage(""); };

  return (
    <div className="space-y-4 select-none">
      <CasinoWinEffect show={showWin} amount={winData?.amount} multiplier={winData?.multiplier} isJackpot={winData?.isJackpot} onDone={() => setShowWin(false)} />
      {/* Title */}
      <div className="text-center">
        <p className="text-3xl font-black tracking-wider"
          style={{
            color: "#ffd700",
            textShadow: "0 0 10px #ffaa00, 0 0 30px #ff8800",
            fontFamily: "'Arial Black', sans-serif",
            WebkitTextStroke: "1px #ff8800"
          }}>
          BLACKJACK
        </p>
        <p className="text-xs text-yellow-600 font-semibold mt-0.5">DEALER PAYS 3 TO 2 · DEALER HITS SOFT 17</p>
      </div>

      {/* Table */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at center, #1a4a1a 0%, #0d2d0d 60%, #071507 100%)",
          border: "3px solid #4a8a1a40",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)",
          minHeight: "360px"
        }}>

        {/* Table texture overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 0, transparent 50%)", backgroundSize: "4px 4px" }} />

        {/* Floating coins decoration */}
        {["💰","💰","🪙","💰"].map((c, i) => (
          <motion.div key={i} className="absolute pointer-events-none text-2xl opacity-60"
            style={{ left: `${10 + i * 25}%`, top: `${15 + (i % 2) * 60}%` }}
            animate={{ y: [0, -8, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}>
            {c}
          </motion.div>
        ))}

        {/* Blackjack watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <p className="text-6xl font-black text-white tracking-widest">BLACKJACK</p>
        </div>

        <div className="relative z-10 p-4 space-y-3">
          {/* Dealer area */}
          {phase !== "bet" && (
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-px flex-1 bg-yellow-900/40" />
                <p className="text-xs font-bold tracking-widest text-yellow-700 uppercase">
                  Croupier {!hideDealer ? `• ${handTotal(dealerHand)}` : ""}
                </p>
                <div className="h-px flex-1 bg-yellow-900/40" />
              </div>
              <div className="flex gap-1.5 justify-center flex-wrap">
                <AnimatePresence>
                  {dealerHand.map((c, i) => (
                    <Card key={i} card={c} hidden={hideDealer && i === 1} delay={i * 0.15} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Center divider */}
          {phase !== "bet" && (
            <div className="flex items-center gap-2 px-4 py-1">
              <div className="flex-1 h-px" style={{ background: "rgba(255,215,0,0.15)" }} />
              <div className="px-3 py-0.5 rounded-full text-[10px] font-bold text-yellow-600 border border-yellow-800/40">
                vs
              </div>
              <div className="flex-1 h-px" style={{ background: "rgba(255,215,0,0.15)" }} />
            </div>
          )}

          {/* Player area */}
          {phase !== "bet" && (
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-px flex-1 bg-yellow-900/40" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-yellow-600 overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center">
                    <span className="text-base">👤</span>
                  </div>
                  <p className="text-xs font-bold tracking-widest text-yellow-700 uppercase">
                    Vous • {handTotal(playerHand)}
                  </p>
                </div>
                <div className="h-px flex-1 bg-yellow-900/40" />
              </div>
              <div className="flex gap-1.5 justify-center flex-wrap">
                <AnimatePresence>
                  {playerHand.map((c, i) => (
                    <Card key={i} card={c} hidden={false} delay={i * 0.15 + 0.2} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Bet phase */}
          {phase === "bet" && (
            <div className="py-8 text-center space-y-4">
              <p className="text-white/40 text-sm font-semibold">Choisissez votre mise</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {BETS_PRESET.map(b => (
                  <motion.button key={b} whileTap={{ scale: 0.9 }} onClick={() => setBet(b)}
                    className="relative flex flex-col items-center transition-all"
                    style={{ filter: bet === b ? `drop-shadow(0 0 12px ${accentColor})` : "none" }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-sm border-4 transition-all"
                      style={{
                        background: bet === b
                          ? `radial-gradient(circle at 30% 30%, ${accentColor}, #aa7700)`
                          : "radial-gradient(circle at 30% 30%, #4a3a1a, #2a1a08)",
                        borderColor: bet === b ? accentColor : "#3a2a0a",
                        color: bet === b ? "#0a0a0a" : "#888",
                        boxShadow: bet === b ? `0 4px 0 #664400, 0 6px 12px rgba(0,0,0,0.5)` : "0 4px 0 #1a0e00",
                      }}>
                      {b >= 1000 ? `${b/1000}K` : b}
                    </div>
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-yellow-700">Solde: <span className="font-bold text-yellow-500">{balance.toLocaleString()} 🪙</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center py-3 px-4 rounded-2xl font-black text-lg"
            style={{
              background: message.includes("Gagné") || message.includes("BLACKJACK")
                ? "linear-gradient(135deg, #0a2a00, #153d00)"
                : message.includes("Égalité")
                  ? "linear-gradient(135deg, #1a1a00, #2a2a00)"
                  : "linear-gradient(135deg, #2a0000, #3d0000)",
              border: `1px solid ${message.includes("Gagné") || message.includes("BLACKJACK") ? "#44ff0040" : message.includes("Égalité") ? "#ffff0030" : "#ff000040"}`,
              color: message.includes("Gagné") || message.includes("BLACKJACK") ? "#44ff44" : message.includes("Égalité") ? "#ffff66" : "#ff6666",
              textShadow: "0 0 10px currentColor"
            }}>
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      {phase === "bet" && (
        <motion.button onClick={deal} whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl font-black text-xl tracking-wider text-black"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, #cc8800)`,
            boxShadow: `0 0 20px ${accentColor}60, 0 4px 0 #664400`,
            textShadow: "0 1px 2px rgba(0,0,0,0.3)"
          }}>
          🃏 DISTRIBUER
        </motion.button>
      )}

      {phase === "playing" && (
        <div className="flex gap-3">
          <motion.button onClick={hit} whileTap={{ scale: 0.95 }}
            className="flex-1 py-4 rounded-2xl font-black text-lg text-black"
            style={{
              background: "linear-gradient(135deg, #44aaff, #2266cc)",
              boxShadow: "0 0 15px #44aaff40, 0 4px 0 #113366",
              color: "white"
            }}>
            HIT
          </motion.button>
          <motion.button onClick={stand} whileTap={{ scale: 0.95 }}
            className="flex-1 py-4 rounded-2xl font-black text-lg"
            style={{
              background: "linear-gradient(135deg, #ff6644, #cc3300)",
              boxShadow: "0 0 15px #ff664440, 0 4px 0 #661100",
              color: "white"
            }}>
            STAND
          </motion.button>
        </div>
      )}

      {phase === "done" && (
        <motion.button onClick={reset} whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl font-black text-xl"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, #cc8800)`,
            boxShadow: `0 0 20px ${accentColor}60, 0 4px 0 #664400`,
            color: "#0a0a0a"
          }}>
          🔄 REJOUER
        </motion.button>
      )}

      {/* Huge jackpots footer */}
      <div className="text-center py-2">
        <p className="text-2xl font-black tracking-wider"
          style={{ color: "#ffd700", textShadow: "0 0 15px #ffaa00, 0 0 30px #ff8800", fontFamily: "'Arial Black', sans-serif" }}>
          HUGE JACKPOTS!
        </p>
      </div>
    </div>
  );
}