import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

function getNextSaturday() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 6=Sat
  const daysUntil = day === 6 ? (now.getHours() >= 21 ? 7 : 0) : (6 - day);
  const sat = new Date(now);
  sat.setDate(now.getDate() + daysUntil);
  sat.setHours(21, 0, 0, 0);
  return sat;
}

function formatCountdown(target) {
  const diff = target - Date.now();
  if (diff <= 0) return "Tirage en cours !";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${d}j ${h}h ${m}m ${s}s`;
}

export default function LottoGame({ balance, setBalance, addTransaction }) {
  const [user, setUser] = useState(null);
  const [picked, setPicked] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [drawNumbers, setDrawNumbers] = useState(null);
  const [drawn, setDrawn] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [nextDraw, setNextDraw] = useState(getNextSaturday());
  const [countdown, setCountdown] = useState("");
  const [betAmount, setBetAmount] = useState(100);
  const [presenterActive, setPresenterActive] = useState(false);

  const MAX_TICKETS = 3;
  const BET_OPTIONS = [50, 100, 250, 500, 1000];

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(formatCountdown(nextDraw));
      const now = new Date();
      if (now >= nextDraw && !drawing && !drawNumbers) {
        performDraw();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [nextDraw]);

  // Load existing tickets
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`lotto_tickets_${user.email}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.drawDate === nextDraw.toISOString() && Array.isArray(data.tickets)) {
          setTickets(data.tickets);
        }
      } catch {}
    }
  }, [user, nextDraw.toISOString()]);

  const hasValidatedTicket = tickets.length > 0;
  const ticketsRemaining = MAX_TICKETS - tickets.length;

  const toggleNumber = (n) => {
    if (hasValidatedTicket) return;
    if (picked.includes(n)) {
      setPicked(picked.filter((x) => x !== n));
    } else if (picked.length < 6) {
      setPicked([...picked, n].sort((a, b) => a - b));
    } else {
      toast.error("6 numéros maximum");
    }
  };

  const buyTicket = async () => {
    if (picked.length !== 6) { toast.error("Choisis 6 numéros"); return; }
    if (tickets.length >= MAX_TICKETS) { toast.error("Maximum 3 tickets !"); return; }
    const totalCost = betAmount;
    if (balance < totalCost) { toast.error("Solde insuffisant"); return; }
    if (addTransaction) await addTransaction("casino_loss", -totalCost, `Ticket Loto ${tickets.length + 1}/${MAX_TICKETS}`, "casino");
    setBalance((b) => b - totalCost);
    const newTickets = [...tickets, { numbers: [...picked], bet: betAmount }];
    setTickets(newTickets);
    setPicked([]);
    localStorage.setItem(`lotto_tickets_${user.email}`, JSON.stringify({ tickets: newTickets, drawDate: nextDraw.toISOString() }));
    toast.success(`Ticket ${newTickets.length}/${MAX_TICKETS} acheté !`);
  };

  const performDraw = () => {
    setPresenterActive(true);
    setDrawing(true);
    const allNumbers = Array.from({ length: 49 }, (_, i) => i + 1);
    const shuffled = [];
    for (let i = 0; i < 7; i++) {
      const idx = Math.floor(Math.random() * allNumbers.length);
      shuffled.push(allNumbers[idx]);
      allNumbers.splice(idx, 1);
    }
    const winNumbers = shuffled.slice(0, 6).sort((a, b) => a - b);
    const bonus = shuffled[6];
    setDrawNumbers({ numbers: winNumbers, bonus });

    // Animated reveal with presenter
    const drawnSeq = [...winNumbers, bonus];
    let i = 0;
    const revealInterval = setInterval(() => {
      setDrawn((prev) => [...prev, drawnSeq[i]]);
      i++;
      if (i >= 7) {
        clearInterval(revealInterval);
        setTimeout(() => {
          setDrawing(false);
          setPresenterActive(false);
          checkWin(winNumbers, bonus);
          setNextDraw(getNextSaturday());
        }, 2000);
      }
    }, 1500);
  };

  const checkWin = (winNumbers, bonus) => {
    if (tickets.length === 0) return;
    let totalPrize = 0;
    let bestLabel = "";
    tickets.forEach((ticket) => {
      const bet = ticket.bet || 100;
      const matches = ticket.numbers.filter((n) => winNumbers.includes(n)).length;
      const hasBonus = ticket.numbers.includes(bonus);
      let prize = 0;
      let label = "";
      if (matches === 6) { prize = 10000000 * (bet / 100); label = "🎉 JACKPOT !!"; }
      else if (matches === 5 && hasBonus) { prize = 500000 * (bet / 100); label = "5 + Bonus"; }
      else if (matches === 5) { prize = 100000 * (bet / 100); label = "5 numéros"; }
      else if (matches === 4) { prize = 5000 * (bet / 100); label = "4 numéros"; }
      else if (matches === 3) { prize = 500 * (bet / 100); label = "3 numéros"; }
      if (prize > 0) {
        totalPrize += prize;
        if (!bestLabel || prize > totalPrize) bestLabel = label;
      }
    });
    if (totalPrize > 0) {
      setBalance((b) => b + Math.round(totalPrize));
      if (addTransaction) addTransaction("casino_win", Math.round(totalPrize), `Loto: ${bestLabel} (${Math.round(totalPrize)} TRIX)`, "casino");
      toast.success(`${bestLabel} — ${Math.round(totalPrize).toLocaleString()} TRIX gagnés !`);
    } else {
      toast("Pas de gain cette semaine. Retente ta chance !");
    }
    setTickets([]);
    setPicked([]);
    localStorage.removeItem(`lotto_tickets_${user.email}`);
  };

  const canPlay = new Date().getDay() !== 6 || new Date().getHours() >= 21;
  const isDrawingPhase = drawNumbers && new Date() >= nextDraw;

  return (
    <div className="space-y-4 select-none">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">🎰</span>
          <h2 className="font-black text-xl text-white" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            MATRIX LOTO
          </h2>
          <span className="text-3xl">🎰</span>
        </div>
        <p className="text-sm text-muted-foreground">Tirage chaque samedi à 21h00</p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono font-bold text-primary">{countdown}</span>
        </div>
      </div>

      {/* Presenter animation */}
      {presenterActive && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 text-center">
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity }}
            className="text-5xl mb-2">👩‍🦰</motion.div>
          <p className="text-pink-300 font-bold text-sm">Le tirage est en cours...</p>
          <p className="text-white/50 text-xs">Restez attentif aux numéros !</p>
        </motion.div>
      )}

      {/* Tickets summary */}
      {tickets.length > 0 && !drawNumbers && (
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/30 space-y-1">
          <p className="text-xs font-bold text-primary">🎫 {tickets.length}/{MAX_TICKETS} tickets achetés</p>
          {tickets.map((t, i) => (
            <p key={i} className="text-[10px] text-primary/70">
              Ticket {i + 1}: {t.numbers.join(", ")} • Mise: {t.bet || 100} TRIX
            </p>
          ))}
          {tickets.length >= MAX_TICKETS && (
            <p className="text-[10px] font-bold text-yellow-400">✅ Maximum atteint — vos tickets sont verrouillés</p>
          )}
        </div>
      )}

      {/* Bet amount selector */}
      {!hasValidatedTicket && !drawNumbers && (
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10">
          <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest text-center">Montant de la mise</p>
          <div className="flex gap-1.5">
            {BET_OPTIONS.map(b => (
              <motion.button key={b} onClick={() => setBetAmount(b)} whileTap={{ scale: 0.9 }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
                  betAmount === b ? "bg-primary/30 border-primary/40 text-white" : "bg-white/5 text-muted-foreground border border-white/10 hover:border-primary/30"
                }`}>
                {b >= 1000 ? `${b/1000}K` : b}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Number grid */}
      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10">
        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest text-center">
          {hasValidatedTicket ? "✅ Tickets enregistrés" : tickets.length >= MAX_TICKETS ? "✅ Maximum atteint" : `Choisis 6 numéros (${picked.length}/6)`}
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 49 }, (_, i) => i + 1).map((n) => {
            const isPicked = picked.includes(n);
            const isDrawn = drawn.includes(n);
            const isBonus = drawNumbers?.bonus === n;
            let bg = "bg-white/5";
            if (isDrawn) bg = "bg-green-500/40 border-green-400";
            else if (isPicked) bg = "bg-primary/30 border-primary/40";
            if (isBonus) bg = "bg-yellow-500/40 border-yellow-400";

            return (
              <motion.button key={n} onClick={() => toggleNumber(n)} disabled={hasValidatedTicket || tickets.length >= MAX_TICKETS}
                whileTap={{ scale: 0.9 }}
                className={`w-9 h-9 rounded-lg text-xs font-bold border transition ${bg} 
                  ${isPicked ? "text-white" : "text-muted-foreground"}
                  ${hasValidatedTicket || tickets.length >= MAX_TICKETS ? "cursor-not-allowed opacity-60" : "hover:border-primary/60"}`}>
                {n}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Drawn numbers display */}
      {drawn.length > 0 && (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Numéros tirés</p>
          <div className="flex flex-wrap justify-center gap-2">
            {drawNumbers?.numbers.map((n) => (
              <motion.div key={n} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-10 h-10 rounded-xl bg-green-500/30 border-2 border-green-400 flex items-center justify-center font-black text-white">
                {n}
              </motion.div>
            ))}
            {drawNumbers?.bonus && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-xs font-bold">+</span>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="w-10 h-10 rounded-xl bg-yellow-500/30 border-2 border-yellow-400 flex items-center justify-center font-black text-white">
                  {drawNumbers.bonus}
                </motion.div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buy button */}
      {!hasValidatedTicket && tickets.length < MAX_TICKETS && !drawNumbers && (
        <button onClick={buyTicket}
          disabled={picked.length !== 6}
          className="w-full py-3 rounded-2xl font-black text-sm transition-all disabled:opacity-30"
          style={{
            background: picked.length === 6 ? "linear-gradient(135deg, #ffd700, #ff8800)" : "rgba(255,255,255,0.08)",
            color: picked.length === 6 ? "#000" : "#555",
            border: "none",
            boxShadow: picked.length === 6 ? "0 0 20px #ffd70060" : "none",
          }}>
          {picked.length === 6 ? `🎫 Acheter (${betAmount} TRIX) — ${ticketsRemaining} restant(s)` : "Choisis 6 numéros"}
        </button>
      )}

      {/* Flash aleatoire */}
      {!hasValidatedTicket && tickets.length < MAX_TICKETS && !drawNumbers && (
        <button onClick={() => {
          const nums = new Set();
          while (nums.size < 6) nums.add(Math.floor(Math.random() * 49) + 1);
          setPicked([...nums].sort((a, b) => a - b));
        }}
          className="w-full py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-white transition border border-white/10">
          🎲 Flash aléatoire
        </button>
      )}

      {/* Jackpot info */}
      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-[10px] text-muted-foreground">
        <p className="font-bold text-yellow-400 mb-1">💰 Gains</p>
        <div className="grid grid-cols-2 gap-1">
          <span>6 numéros → 10M TRIX</span>
          <span>5+B → 500K TRIX</span>
          <span>5 numéros → 100K TRIX</span>
          <span>4 numéros → 5K TRIX</span>
          <span>3 numéros → 500 TRIX</span>
        </div>
      </div>
    </div>
  );
}