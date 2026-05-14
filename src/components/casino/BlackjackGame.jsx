import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SUITS = ["♠","♥","♦","♣"];
const VALUES = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

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
  const isRed = ["♥","♦"].includes(card?.suit);
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0, y: -20 }}
      animate={{ rotateY: 0, opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "backOut" }}
      className="shrink-0"
      style={{ perspective: 600 }}
    >
      {hidden ? (
        <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-xl flex items-center justify-center text-2xl border-2 select-none"
          style={{ background: "linear-gradient(135deg, #1a1060, #0d0940)", borderColor: "rgba(100,80,200,0.4)", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
          🂠
        </div>
      ) : (
        <div className={cn(
          "w-14 h-20 sm:w-16 sm:h-24 rounded-xl flex flex-col p-1.5 border border-gray-200/10 select-none",
          isRed ? "text-red-500" : "text-white"
        )}
          style={{ background: "linear-gradient(135deg, #fafafa, #e8e8e8)", boxShadow: "0 4px 12px rgba(0,0,0,0.4)", color: isRed ? "#dc2626" : "#111" }}>
          <span className="text-base font-black leading-none">{card.value}</span>
          <span className="text-lg leading-none">{card.suit}</span>
          <span className="mt-auto text-base font-black leading-none self-end rotate-180">{card.value}</span>
        </div>
      )}
    </motion.div>
  );
}

export default function BlackjackGame({ balance, setBalance }) {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [phase, setPhase] = useState("bet");
  const [amount, setAmount] = useState("50");
  const [stake, setStake] = useState(0);
  const [message, setMessage] = useState("");
  const [hideDealer, setHideDealer] = useState(true);

  const deal = () => {
    const s = parseInt(amount);
    if (!s || s <= 0 || s > balance) { toast.error("Mise invalide"); return; }
    const d = newDeck();
    const p = [d.pop(), d.pop()];
    const dl = [d.pop(), d.pop()];
    setDeck(d); setPlayerHand(p); setDealerHand(dl); setStake(s);
    setHideDealer(true); setMessage(""); setPhase("playing");
    if (handTotal(p) === 21) endGame(p, dl, d, true, s);
  };

  const endGame = (ph, dh, d, natural, s) => {
    setHideDealer(false);
    let dl = [...dh];
    let dk = [...d];
    while (handTotal(dl) < 17) { dl.push(dk.pop()); }
    setDealerHand(dl);
    const pt = natural ? 21 : handTotal(ph);
    const dt = handTotal(dl);
    let gain = 0, msg = "";
    if (pt > 21) { gain = -s; msg = `💸 Bust ! -${s} 🪙`; }
    else if (dt > 21 || pt > dt) { gain = natural ? Math.round(s * 1.5) : s; msg = `🎉 Gagné ! +${gain} 🪙`; }
    else if (pt === dt) { gain = 0; msg = "🤝 Égalité !"; }
    else { gain = -s; msg = `💸 Croupier gagne. -${s} 🪙`; }
    setBalance((b) => b + gain);
    setMessage(msg);
    setPhase("done");
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
    <div className="space-y-5">
      <h3 className="font-black text-xl text-center text-white">Blackjack</h3>

      {/* Table felt area */}
      {phase !== "bet" && (
        <div className="rounded-3xl p-4 space-y-4"
          style={{ background: "linear-gradient(145deg, #0a2010, #061508)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Dealer */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 text-center font-semibold tracking-wider uppercase">
              Croupier {!hideDealer ? `(${handTotal(dealerHand)})` : ""}
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <AnimatePresence>
                {dealerHand.map((c, i) => (
                  <Card key={i} card={c} hidden={hideDealer && i === 1} delay={i * 0.15} />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 px-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-white/30 uppercase tracking-widest">vs</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Player */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 text-center font-semibold tracking-wider uppercase">
              Vous ({handTotal(playerHand)})
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <AnimatePresence>
                {playerHand.map((c, i) => (
                  <Card key={i} card={c} hidden={false} delay={i * 0.15 + 0.2} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className={cn("text-center p-4 rounded-2xl font-bold text-lg",
              message.includes("Gagné") ? "bg-primary/10 text-primary border border-primary/30"
              : message.includes("Égalité") ? "bg-white/5 text-white border border-white/10"
              : "bg-destructive/10 text-destructive border border-destructive/30")}>
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      {phase === "bet" && (
        <div className="flex gap-3">
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="Mise" className="bg-white/5 border-white/10 text-white" />
          <Button onClick={deal} className="shrink-0 px-8 font-bold" style={{ background: "hsl(45 100% 55%)", color: "#0a0a0a" }}>
            Distribuer
          </Button>
        </div>
      )}

      {phase === "playing" && (
        <div className="flex gap-3 justify-center">
          <Button onClick={hit} className="px-8 font-bold bg-primary text-background hover:bg-primary/90">
            +Carte
          </Button>
          <Button onClick={stand} variant="outline" className="px-8 font-bold border-white/20 text-white hover:bg-white/10">
            Rester
          </Button>
        </div>
      )}

      {phase === "done" && (
        <Button onClick={reset} className="w-full font-bold h-11 rounded-2xl"
          style={{ background: "hsl(45 100% 55%)", color: "#0a0a0a" }}>
          Rejouer
        </Button>
      )}

      <p className="text-xs text-center text-muted-foreground">Solde : {balance.toLocaleString()} 🪙</p>
    </div>
  );
}