import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import CasinoWinEffect from "./CasinoWinEffect";

const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const WHEEL_NUMBERS = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

const BETS = [
  { key: "red", label: "🔴 Rouge", payout: 2, color: "#c0392b" },
  { key: "black", label: "⚫ Noir", payout: 2, color: "#1a1a1a" },
  { key: "even", label: "Pair", payout: 2, color: "#2563eb" },
  { key: "odd", label: "Impair", payout: 2, color: "#7c3aed" },
  { key: "1-18", label: "1–18", payout: 2, color: "#059669" },
  { key: "19-36", label: "19–36", payout: 2, color: "#d97706" },
];

export default function RouletteGame({ balance, setBalance, accentColor = "hsl(45 100% 55%)" }) {
  const [bet, setBet] = useState("red");
  const [amount, setAmount] = useState("50");
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [ballVisible, setBallVisible] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [winData, setWinData] = useState(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const stateRef = useRef({ angle: 0, ballAngle: 0, target: 0, duration: 4000, done: false });

  const draw = (wheelAngle, ballAngle, showBall) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const cx = W / 2, cy = W / 2;
    const R = cx - 6;
    const sliceA = (Math.PI * 2) / 37;

    ctx.clearRect(0, 0, W, W);

    // Outer ring - wood texture simulation
    const outerGrad = ctx.createRadialGradient(cx, cy, R - 2, cx, cy, R + 6);
    outerGrad.addColorStop(0, "#8B6914");
    outerGrad.addColorStop(0.5, "#b8860b");
    outerGrad.addColorStop(1, "#6B4F10");
    ctx.beginPath();
    ctx.arc(cx, cy, R + 6, 0, Math.PI * 2);
    ctx.fillStyle = outerGrad;
    ctx.fill();

    // Separators ring
    ctx.beginPath();
    ctx.arc(cx, cy, R + 1, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Slices
    WHEEL_NUMBERS.forEach((num, i) => {
      const startAngle = wheelAngle + i * sliceA - Math.PI / 2;
      const endAngle = startAngle + sliceA;
      const isRed = RED_NUMBERS.includes(num);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, startAngle, endAngle);
      ctx.closePath();

      // Gradient per slice
      const midA = startAngle + sliceA / 2;
      const gx1 = cx + (R * 0.4) * Math.cos(midA);
      const gy1 = cy + (R * 0.4) * Math.sin(midA);
      const gx2 = cx + (R * 0.9) * Math.cos(midA);
      const gy2 = cy + (R * 0.9) * Math.sin(midA);
      const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
      if (num === 0) {
        grad.addColorStop(0, "#1a9e35"); grad.addColorStop(1, "#0f6b22");
      } else if (isRed) {
        grad.addColorStop(0, "#d44040"); grad.addColorStop(1, "#8b1a1a");
      } else {
        grad.addColorStop(0, "#2a2a2a"); grad.addColorStop(1, "#0a0a0a");
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // Separator lines
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(startAngle), cy + R * Math.sin(startAngle));
      ctx.strokeStyle = "#b8860b80";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Numbers
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(midA);
      ctx.textAlign = "center";
      ctx.font = `bold ${R > 90 ? 9 : 7}px sans-serif`;
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 2;
      ctx.fillText(num, R * 0.78, 3.5);
      ctx.restore();
    });

    // Center decorative hub
    const hubGrad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, 18);
    hubGrad.addColorStop(0, "#ffd700");
    hubGrad.addColorStop(1, "#8B6914");
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#4a3200";
    ctx.fill();
    // Center diamond pattern
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((i * Math.PI) / 2);
      ctx.beginPath();
      ctx.moveTo(0, -7); ctx.lineTo(3, 0); ctx.lineTo(0, 7); ctx.lineTo(-3, 0);
      ctx.fillStyle = "#ffd700";
      ctx.fill();
      ctx.restore();
    }

    // Ball track ring
    if (showBall) {
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.9, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 8;
      ctx.stroke();
    }

    // Ball
    if (showBall) {
      const ballR = R * 0.88;
      const bx = cx + ballR * Math.cos(ballAngle);
      const by = cy + ballR * Math.sin(ballAngle);

      // Ball shadow
      ctx.beginPath();
      ctx.arc(bx + 2, by + 2, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fill();

      // Ball gradient (glossy)
      const bGrad = ctx.createRadialGradient(bx - 2, by - 2, 1, bx, by, 6);
      bGrad.addColorStop(0, "#ffffff");
      bGrad.addColorStop(0.4, "#e0e0e0");
      bGrad.addColorStop(1, "#909090");
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.fillStyle = bGrad;
      ctx.shadowColor = "rgba(255,255,255,0.6)";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  useEffect(() => { draw(0, 0, false); }, []);

  const animate = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const s = stateRef.current;
    const progress = Math.min(elapsed / s.duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const wheelAngle = eased * s.target;

    // Ball: spins opposite, decelerates faster and settles
    const ballProgress = Math.min(elapsed / (s.duration * 0.75), 1);
    const ballEased = 1 - Math.pow(1 - ballProgress, 2);
    const ballAngle = -ballEased * s.target * 3.2 + wheelAngle * 0.3;

    draw(wheelAngle, ballAngle, true);

    if (progress < 1) {
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      stateRef.current = { ...s, angle: wheelAngle, ballAngle, done: true };
      setSpinning(false);
    }
  };

  const spin = () => {
    const stake = parseInt(amount);
    if (!stake || stake <= 0 || stake > balance) { toast.error("Mise invalide"); return; }
    setSpinning(true);
    setBallVisible(true);
    setResult(null);

    const num = Math.floor(Math.random() * 37);
    const numIdx = WHEEL_NUMBERS.indexOf(num);
    const sliceAngle = (Math.PI * 2) / 37;
    const currentAngle = stateRef.current.angle || 0;
    const totalRotations = 6 + Math.random() * 4;
    const target = currentAngle + totalRotations * Math.PI * 2 - numIdx * sliceAngle;
    const duration = 4000 + Math.random() * 1500;

    stateRef.current = { angle: currentAngle, ballAngle: 0, target: target - currentAngle, duration, done: false };
    startTimeRef.current = null;
    animFrameRef.current = requestAnimationFrame(animate);

    setTimeout(() => {
      const isRed = RED_NUMBERS.includes(num);
      const color = num === 0 ? "green" : isRed ? "red" : "black";
      let win = false;
      if (bet === "red" && color === "red") win = true;
      if (bet === "black" && color === "black") win = true;
      if (bet === "even" && num !== 0 && num % 2 === 0) win = true;
      if (bet === "odd" && num % 2 !== 0) win = true;
      if (bet === "1-18" && num >= 1 && num <= 18) win = true;
      if (bet === "19-36" && num >= 19 && num <= 36) win = true;
      const gain = win ? stake : -stake;
      setBalance((b) => b + gain);
      setResult({ num, color, win, gain });
      if (win) {
        setWinData({ amount: stake, multiplier: 2 });
        setShowWin(true);
        toast.success(`🎉 ${num} — +${stake} 🪙`);
      } else toast.error(`💸 ${num} — -${stake} 🪙`);
    }, duration);
  };

  const numColor = result?.color === "red" ? "#c0392b" : result?.color === "black" ? "#fff" : "#1a8a2e";

  return (
    <div className="space-y-5">
      <CasinoWinEffect show={showWin} amount={winData?.amount} multiplier={winData?.multiplier} onDone={() => setShowWin(false)} />
      <h3 className="font-black text-xl text-center text-white tracking-wide">♠ Roulette ♠</h3>

      {/* Wheel container with felt */}
      <div className="flex justify-center relative">
        <div className="relative">
          {/* Pointer triangle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
            <div className="w-0 h-0" style={{ borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "18px solid #ffd700", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }} />
          </div>
          {/* Glow when spinning */}
          {spinning && (
            <div className="absolute inset-0 rounded-full animate-pulse"
              style={{ boxShadow: `0 0 60px ${accentColor}40`, borderRadius: "50%" }} />
          )}
          <canvas ref={canvasRef} width={240} height={240} className="rounded-full"
            style={{ boxShadow: "0 0 60px rgba(0,0,0,0.9), 0 0 30px rgba(184,134,11,0.4), inset 0 0 0 4px #8B6914" }} />
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && !spinning && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className={cn("text-center p-4 rounded-2xl font-bold text-lg border",
              result.win ? "bg-primary/10 text-primary border-primary/30" : "bg-destructive/10 text-destructive border-destructive/30")}>
            <span className="w-8 h-8 rounded-full inline-flex items-center justify-center text-base font-black mr-2 border"
              style={{ background: numColor + "30", color: numColor === "#fff" ? "#fff" : numColor, borderColor: numColor + "60" }}>
              {result.num}
            </span>
            {result.win ? `🎉 +${Math.abs(result.gain)} 🪙` : `💸 -${Math.abs(result.gain)} 🪙`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bet buttons */}
      <div className="grid grid-cols-3 gap-2">
        {BETS.map((b) => (
          <button key={b.key} onClick={() => setBet(b.key)}
            className={cn("py-2.5 px-2 rounded-xl text-xs font-bold border-2 transition",
              bet === b.key ? "scale-105" : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20")}
            style={bet === b.key ? { borderColor: b.color, background: b.color + "20", color: b.key === "black" ? "#fff" : b.color } : {}}>
            {b.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder="Mise" className="bg-white/5 border-white/10 text-white" />
        <Button onClick={spin} disabled={spinning} className="shrink-0 px-8 font-bold rounded-2xl"
          style={{ background: accentColor, color: "#0a0a0a", minWidth: "100px" }}>
          {spinning ? <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-black/40 border-t-black rounded-full animate-spin inline-block" /> Tourne...</span> : "Lancer"}
        </Button>
      </div>
      <p className="text-xs text-center text-muted-foreground">Solde : <span className="font-bold text-white">{balance.toLocaleString()}</span> 🪙</p>
    </div>
  );
}