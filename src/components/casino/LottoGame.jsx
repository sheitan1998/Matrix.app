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
  const [ticket, setTicket] = useState(null);
  const [drawNumbers, setDrawNumbers] = useState(null);
  const [drawn, setDrawn] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [nextDraw, setNextDraw] = useState(getNextSaturday());
  const [countdown, setCountdown] = useState("");

  const TICKET_PRICE = 100;

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

  // Load existing ticket
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`lotto_${user.email}`);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.drawDate === nextDraw.toISOString()) {
        setPicked(data.numbers || []);
      }
    }
  }, [user, nextDraw.toISOString()]);

  const toggleNumber = (n) => {
    if (ticket) return;
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
    if (balance < TICKET_PRICE) { toast.error("Solde insuffisant"); return; }
    if (addTransaction) await addTransaction("casino_loss", -TICKET_PRICE, "Ticket Loto", "casino");
    setBalance((b) => b - TICKET_PRICE);
    setTicket({ numbers: [...picked], drawDate: nextDraw.toISOString() });
    localStorage.setItem(`lotto_${user.email}`, JSON.stringify({ numbers: picked, drawDate: nextDraw.toISOString() }));
    toast.success("Ticket acheté ! Tirage samedi 21h");
  };

  const performDraw = () => {
    setDrawing(true);
    const allNumbers = Array.from({ length: 49 }, (_, i) => i + 1);
    const drawn = [];
    for (let i = 0; i < 7; i++) {
      const idx = Math.floor(Math.random() * allNumbers.length);
      drawn.push(allNumbers[idx]);
      allNumbers.splice(idx, 1);
    }
    const winNumbers = drawn.slice(0, 6);
    const bonus = drawn[6];
    setDrawNumbers({ numbers: winNumbers.sort((a, b) => a - b), bonus });

    // Animate reveal
    let i = 0;
    const revealInterval = setInterval(() => {
      setDrawn((prev) => [...prev, drawn[i]]);
      i++;
      if (i >= 7) {
        clearInterval(revealInterval);
        setDrawing(false);
        checkWin(winNumbers, bonus);
        setNextDraw(getNextSaturday());
      }
    }, 1500);
  };

  const checkWin = (winNumbers, bonus) => {
    if (!ticket) return;
    const matches = ticket.numbers.filter((n) => winNumbers.includes(n)).length;
    const hasBonus = ticket.numbers.includes(bonus);
    let prize = 0;
    let label = "";
    if (matches === 6) { prize = 10000000; label = "🎉 JACKPOT !!"; }
    else if (matches === 5 && hasBonus) { prize = 500000; label = "5 + Bonus"; }
    else if (matches === 5) { prize = 100000; label = "5 numéros"; }
    else if (matches === 4) { prize = 5000; label = "4 numéros"; }
    else if (matches === 3) { prize = 500; label = "3 numéros"; }

    if (prize > 0) {
      setBalance((b) => b + prize);
      if (addTransaction) addTransaction("casino_win", prize, `Loto: ${label} (${prize} TRIX)`, "casino");
      toast.success(`${label} — ${prize.toLocaleString()} TRIX gagnés !`);
    } else {
      toast("Pas de gain cette semaine. Retente ta chance !");
    }
    setTicket(null);
    setPicked([]);
    localStorage.removeItem(`lotto_${user.email}`);
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

      {/* Number grid */}
      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10">
        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest text-center">
          {ticket ? "✅ Ticket enregistré" : `Choisis 6 numéros (${picked.length}/6)`}
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
              <motion.button key={n} onClick={() => toggleNumber(n)} disabled={!!ticket}
                whileTap={{ scale: 0.9 }}
                className={`w-9 h-9 rounded-lg text-xs font-bold border transition ${bg} 
                  ${isPicked ? "text-white" : "text-muted-foreground"}
                  ${ticket ? "cursor-not-allowed opacity-60" : "hover:border-primary/60"}`}>
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
      {!ticket && !drawNumbers && (
        <button onClick={buyTicket}
          disabled={picked.length !== 6}
          className="w-full py-3 rounded-2xl font-black text-sm transition-all disabled:opacity-30"
          style={{
            background: picked.length === 6 ? "linear-gradient(135deg, #ffd700, #ff8800)" : "rgba(255,255,255,0.08)",
            color: picked.length === 6 ? "#000" : "#555",
            border: "none",
            boxShadow: picked.length === 6 ? "0 0 20px #ffd70060" : "none",
          }}>
          {picked.length === 6 ? `🎫 Acheter le ticket (${TICKET_PRICE} TRIX)` : "Choisis 6 numéros"}
        </button>
      )}

      {/* Flash aleatoire */}
      {!ticket && !drawNumbers && (
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