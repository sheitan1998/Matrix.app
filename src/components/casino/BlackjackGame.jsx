import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

function CardUI({ card, hidden }) {
  const isRed = ["♥","♦"].includes(card.suit);
  if (hidden) return (
    <div className="w-14 h-20 rounded-xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-2xl">🂠</div>
  );
  return (
    <div className={cn("w-14 h-20 rounded-xl bg-white flex flex-col items-center justify-center border border-gray-200 shadow", isRed ? "text-red-600" : "text-gray-900")}>
      <span className="text-lg font-black leading-none">{card.value}</span>
      <span className="text-xl">{card.suit}</span>
    </div>
  );
}

export default function BlackjackGame({ balance, setBalance }) {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [phase, setPhase] = useState("bet"); // bet | playing | done
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
    if (pt > 21) { gain = -s; msg = "💸 Bust ! Vous perdez."; }
    else if (dt > 21 || pt > dt) { gain = natural ? Math.round(s * 1.5) : s; msg = `🎉 Gagné ! +${gain} 🪙`; }
    else if (pt === dt) { gain = 0; msg = "🤝 Égalité !"; }
    else { gain = -s; msg = `💸 Le croupier gagne. -${s} 🪙`; }
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
    <div className="space-y-6">
      <h3 className="font-black text-xl text-center">Blackjack</h3>

      {phase !== "bet" && (
        <>
          <div>
            <p className="text-xs text-muted-foreground mb-2 text-center">Croupier {!hideDealer ? `(${handTotal(dealerHand)})` : ""}</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {dealerHand.map((c, i) => <CardUI key={i} card={c} hidden={hideDealer && i === 1} />)}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 text-center">Vous ({handTotal(playerHand)})</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {playerHand.map((c, i) => <CardUI key={i} card={c} hidden={false} />)}
            </div>
          </div>
        </>
      )}

      {message && (
        <div className={cn(
          "text-center p-4 rounded-xl font-bold text-lg",
          message.includes("Gagné") ? "bg-primary/10 text-primary border border-primary/30" : message.includes("Égalité") ? "bg-secondary border border-border" : "bg-destructive/10 text-destructive border border-destructive/30"
        )}>
          {message}
        </div>
      )}

      {phase === "bet" && (
        <div className="flex gap-3">
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Mise" className="bg-secondary/60 border-border" />
          <Button onClick={deal} className="shrink-0 px-8 font-bold" style={{ background: "hsl(45 100% 55%)", color: "hsl(0 0% 5%)" }}>
            Distribuer
          </Button>
        </div>
      )}

      {phase === "playing" && (
        <div className="flex gap-3 justify-center">
          <Button onClick={hit} className="px-8 font-bold bg-primary text-background">Carte</Button>
          <Button onClick={stand} variant="outline" className="px-8 font-bold">Rester</Button>
        </div>
      )}

      {phase === "done" && (
        <Button onClick={reset} className="w-full font-bold" style={{ background: "hsl(45 100% 55%)", color: "hsl(0 0% 5%)" }}>
          Rejouer
        </Button>
      )}

      <p className="text-xs text-center text-muted-foreground">Solde : {balance.toLocaleString()} 🪙</p>
    </div>
  );
}