import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const WHEEL_NUMBERS = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

const BETS = [
  { key: "red", label: "🔴 Rouge", payout: 2 },
  { key: "black", label: "⚫ Noir", payout: 2 },
  { key: "even", label: "Pair", payout: 2 },
  { key: "odd", label: "Impair", payout: 2 },
  { key: "1-18", label: "1–18", payout: 2 },
  { key: "19-36", label: "19–36", payout: 2 },
];

export default function RouletteGame({ balance, setBalance }) {
  const [bet, setBet] = useState("red");
  const [amount, setAmount] = useState("50");
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [ballAngle, setBallAngle] = useState(0);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const targetAngleRef = useRef(0);
  const spinDurationRef = useRef(3000);

  const drawWheel = (rot) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 4;
    const sliceAngle = (Math.PI * 2) / 37;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.fillStyle = "#b8860b";
    ctx.fill();

    WHEEL_NUMBERS.forEach((num, i) => {
      const startA = rot + i * sliceAngle - Math.PI / 2;
      const endA = startA + sliceAngle;
      const isRed = RED_NUMBERS.includes(num);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startA, endA);
      ctx.closePath();
      ctx.fillStyle = num === 0 ? "#1a8a2e" : isRed ? "#c0392b" : "#1a1a1a";
      ctx.fill();
      ctx.strokeStyle = "#b8860b";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Number text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startA + sliceAngle / 2);
      ctx.textAlign = "center";
      ctx.font = `bold ${r > 80 ? 9 : 7}px sans-serif`;
      ctx.fillStyle = "#fff";
      ctx.fillText(num, r * 0.78, 3);
      ctx.restore();
    });

    // Center hub
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = "#b8860b";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#8B6914";
    ctx.fill();
  };

  const drawBall = (rot, bAngle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 4;
    const ballR = r * 0.88;
    const bx = cx + ballR * Math.cos(bAngle);
    const by = cy + ballR * Math.sin(bAngle);

    ctx.beginPath();
    ctx.arc(bx, by, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.shadowBlur = 6;
    ctx.shadowColor = "#fff";
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    drawWheel(angle);
  }, []);

  const animate = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const duration = spinDurationRef.current;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentAngle = eased * targetAngleRef.current;
    const ballProgress = 1 - Math.pow(1 - Math.min(elapsed / (duration * 0.8), 1), 2);
    const ballA = -ballProgress * targetAngleRef.current * 3.5;

    drawWheel(currentAngle);
    drawBall(currentAngle, ballA);

    if (progress < 1) {
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      setAngle(currentAngle);
      setBallAngle(ballA);
      setSpinning(false);
    }
  };

  const spin = () => {
    const stake = parseInt(amount);
    if (!stake || stake <= 0 || stake > balance) { toast.error("Mise invalide"); return; }
    setSpinning(true);
    setResult(null);

    const num = Math.floor(Math.random() * 37);
    const numIdx = WHEEL_NUMBERS.indexOf(num);
    const sliceAngle = (Math.PI * 2) / 37;
    const totalRotations = 5 + Math.random() * 3;
    const target = angle + totalRotations * Math.PI * 2 - numIdx * sliceAngle;

    targetAngleRef.current = target - angle;
    spinDurationRef.current = 3500 + Math.random() * 1000;
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
      if (win) toast.success(`+${stake} 🪙 Gagné !`);
      else toast.error(`-${stake} 🪙 Dommage !`);
    }, spinDurationRef.current);
  };

  return (
    <div className="space-y-5">
      <h3 className="font-black text-xl text-center text-white">Roulette</h3>

      {/* Canvas wheel */}
      <div className="flex justify-center relative">
        <div className="relative">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0"
            style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "14px solid #ffd700" }} />
          <canvas ref={canvasRef} width={220} height={220} className="rounded-full"
            style={{ boxShadow: "0 0 40px rgba(0,0,0,0.8), 0 0 20px rgba(184,134,11,0.3)" }} />
        </div>
      </div>

      {/* Result */}
      {result && !spinning && (
        <div className={cn("text-center p-3 rounded-2xl font-bold text-base",
          result.win ? "bg-primary/10 text-primary border border-primary/30" : "bg-destructive/10 text-destructive border border-destructive/30")}>
          <span className="text-2xl">{result.num}</span>
          <span className="ml-2">{result.win ? `🎉 +${Math.abs(result.gain)} 🪙` : `💸 -${Math.abs(result.gain)} 🪙`}</span>
        </div>
      )}

      {/* Bets */}
      <div className="grid grid-cols-3 gap-2">
        {BETS.map((b) => (
          <button key={b.key} onClick={() => setBet(b.key)}
            className={cn("py-2 px-2 rounded-xl text-xs font-bold border-2 transition",
              bet === b.key ? "border-yellow-500 bg-yellow-500/10 text-yellow-400" : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20")}>
            {b.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder="Mise" className="bg-white/5 border-white/10 text-white" />
        <Button onClick={spin} disabled={spinning}
          className="shrink-0 px-8 font-bold" style={{ background: "hsl(45 100% 55%)", color: "#0a0a0a" }}>
          {spinning ? "⏳" : "Lancer"}
        </Button>
      </div>
      <p className="text-xs text-center text-muted-foreground">Solde : {balance.toLocaleString()} 🪙</p>
    </div>
  );
}