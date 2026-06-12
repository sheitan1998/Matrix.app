import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import CasinoWinEffect from "./CasinoWinEffect";

function generateCard() {
  const cols = [
    [1,15], [16,30], [31,45], [46,60], [61,75]
  ];
  return cols.map(([min, max]) => {
    const nums = [];
    while (nums.length < 5) {
      const n = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!nums.includes(n)) nums.push(n);
    }
    return nums;
  });
}

const BALL_COLORS = ["#e53e3e","#dd6b20","#d69e2e","#38a169","#3182ce","#805ad5","#d53f8c"];

export default function BingoGame({ balance, setBalance, accentColor = "#ffd700" }) {
  const [card, setCard] = useState(generateCard());
  const [marked, setMarked] = useState(new Set());
  const [calledBalls, setCalledBalls] = useState([]);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [winData, setWinData] = useState(null);
  const [amount, setAmount] = useState("50");
  const [lastBall, setLastBall] = useState(null);
  const [showLast, setShowLast] = useState(false);
  const intervalRef = useRef(null);
  const stakeRef = useRef(0);

  const allNums = new Set(card.flat());

  const checkWin = (markedSet) => {
    // Check rows
    for (let row = 0; row < 5; row++) {
      const rowNums = card.map((col) => col[row]);
      if (rowNums.every((n) => markedSet.has(n))) return true;
    }
    // Check columns
    for (let col = 0; col < 5; col++) {
      if (card[col].every((n) => markedSet.has(n))) return true;
    }
    // Check diagonals
    const d1 = [card[0][0], card[1][1], card[2][2], card[3][3], card[4][4]];
    const d2 = [card[4][0], card[3][1], card[2][2], card[1][3], card[0][4]];
    if (d1.every((n) => markedSet.has(n))) return true;
    if (d2.every((n) => markedSet.has(n))) return true;
    return false;
  };

  const start = () => {
    const stake = parseInt(amount);
    if (!stake || stake <= 0 || stake > balance) { toast.error("Mise invalide"); return; }
    stakeRef.current = stake;
    setBalance((b) => b - stake);
    setCard(generateCard());
    setMarked(new Set());
    setCalledBalls([]);
    setWon(false);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const called = new Set();

    intervalRef.current = setInterval(() => {
      let ball;
      do { ball = Math.floor(Math.random() * 75) + 1; } while (called.has(ball));
      called.add(ball);
      setCalledBalls((prev) => {
        const next = [...prev, ball];
        if (next.length >= 75) { clearInterval(intervalRef.current); setRunning(false); }
        return next;
      });
      setLastBall(ball);
      setShowLast(true);
      setTimeout(() => setShowLast(false), 800);

      setMarked((prev) => {
        const next = new Set(prev);
        if (allNums.has(ball)) next.add(ball);
        if (checkWin(next)) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setWon(true);
          const prize = stakeRef.current * 10;
          setBalance((b) => b + prize);
          setWinData({ amount: prize, multiplier: 10 });
          setShowWin(true);
          toast.success(`🎉 BINGO ! +${prize} 🪙`);
        }
        return next;
      });
    }, 1500);

    return () => clearInterval(intervalRef.current);
  }, [running]);

  const stopGame = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    toast.info("Partie arrêtée");
  };

  const COLS = ["B","I","N","G","O"];
  const ballColor = lastBall ? BALL_COLORS[lastBall % BALL_COLORS.length] : accentColor;

  return (
    <div className="space-y-5">
      <CasinoWinEffect show={showWin} amount={winData?.amount} multiplier={winData?.multiplier} onDone={() => setShowWin(false)} />
      <h3 className="font-black text-xl text-center text-white">🎱 Bingo</h3>

      {/* Last ball indicator */}
      <div className="flex justify-center">
        <AnimatePresence mode="wait">
          {showLast && lastBall ? (
            <motion.div
              key={lastBall}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 font-black text-white shadow-2xl"
              style={{ background: ballColor, borderColor: "rgba(255,255,255,0.4)", boxShadow: `0 0 40px ${ballColor}60` }}>
              <span className="text-[10px] tracking-widest uppercase opacity-80">{COLS[Math.floor((lastBall - 1) / 15)]}</span>
              <span className="text-3xl leading-none">{lastBall}</span>
            </motion.div>
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-dashed"
              style={{ borderColor: accentColor + "40" }}>
              <span className="text-2xl text-muted-foreground">{running ? "⏳" : "🎱"}</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent balls */}
      {calledBalls.length > 0 && (
        <div className="flex gap-1 flex-wrap justify-center max-h-16 overflow-hidden">
          {calledBalls.slice(-20).map((b, i) => (
            <span key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: BALL_COLORS[b % BALL_COLORS.length] + "cc" }}>
              {b}
            </span>
          ))}
        </div>
      )}

      {/* Bingo card */}
      <div className="mx-auto max-w-xs">
        {/* Column headers */}
        <div className="grid grid-cols-5 gap-1 mb-1">
          {COLS.map((c, i) => (
            <div key={c} className="h-8 rounded-lg flex items-center justify-center font-black text-sm"
              style={{ background: accentColor, color: "#0a0a0a" }}>
              {c}
            </div>
          ))}
        </div>
        {/* Rows */}
        {[0,1,2,3,4].map((row) => (
          <div key={row} className="grid grid-cols-5 gap-1 mb-1">
            {card.map((col, colIdx) => {
              const num = col[row];
              const isMarked = marked.has(num);
              const isFree = row === 2 && colIdx === 2;
              return (
                <motion.div
                  key={`${colIdx}-${row}`}
                  animate={isMarked ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className={cn("h-11 rounded-xl flex items-center justify-center text-sm font-bold border transition-all cursor-default",
                    isFree ? "text-black" : isMarked ? "text-white" : "text-white/70")}
                  style={isFree
                    ? { background: accentColor, borderColor: "transparent" }
                    : isMarked
                      ? { background: BALL_COLORS[num % BALL_COLORS.length], borderColor: "rgba(255,255,255,0.3)", boxShadow: `0 0 12px ${BALL_COLORS[num % BALL_COLORS.length]}60` }
                      : { background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.08)" }}>
                  {isFree ? "★" : num}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Win state */}
      {won && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-4 rounded-2xl border font-black text-2xl"
          style={{ background: accentColor + "20", borderColor: accentColor + "60", color: accentColor }}>
          🎉 BINGO ! Vous avez gagné {parseInt(amount) * 10} 🪙 !
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder="Mise" disabled={running} className="bg-white/5 border-white/10 text-white" />
        {running ? (
          <Button onClick={stopGame} variant="destructive" className="shrink-0 px-6 font-bold">
            Arrêter
          </Button>
        ) : (
          <Button onClick={start} disabled={won && calledBalls.length > 0} className="shrink-0 px-6 font-bold"
            style={{ background: accentColor, color: "#0a0a0a" }}>
            {won ? "Nouvelle" : "Jouer"}
          </Button>
        )}
      </div>
      {won && (
        <Button onClick={() => { setWon(false); setCard(generateCard()); setMarked(new Set()); setCalledBalls([]); }}
          className="w-full font-bold" style={{ background: accentColor, color: "#0a0a0a" }}>
          Nouvelle partie
        </Button>
      )}
      <p className="text-xs text-center text-muted-foreground">Solde : {balance.toLocaleString()} 🪙 · Bingo = ×10</p>
    </div>
  );
}