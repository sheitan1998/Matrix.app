import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Confetti particle
function Particle({ x, y, color, size, angle, speed }) {
  return (
    <motion.div
      className="absolute rounded-sm pointer-events-none"
      style={{ left: x, top: y, width: size, height: size * 0.6, background: color, originX: 0.5, originY: 0.5 }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        x: Math.cos(angle) * speed * 3,
        y: Math.sin(angle) * speed * 2 + 300,
        opacity: 0,
        rotate: Math.random() * 720 - 360,
        scale: 0.3,
      }}
      transition={{ duration: 1.8 + Math.random() * 0.8, ease: "easeOut" }}
    />
  );
}

export default function WinEffect({ show, amount, multiplier, isJackpot, onDone }) {
  const [particles, setParticles] = useState([]);
  const COLORS = ["#ffd700", "#ff00ff", "#00aaff", "#ff4444", "#44ff44", "#ffaa00", "#ffffff", "#cc44ff"];

  useEffect(() => {
    if (!show) return;
    const p = Array.from({ length: isJackpot ? 80 : 50 }, (_, i) => ({
      id: i,
      x: `${20 + Math.random() * 60}%`,
      y: `${10 + Math.random() * 40}%`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.floor(Math.random() * 10),
      angle: (Math.random() * Math.PI * 2),
      speed: 60 + Math.random() * 100,
    }));
    setParticles(p);
    const t = setTimeout(() => { setParticles([]); onDone?.(); }, isJackpot ? 5000 : 3000);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Dark overlay */}
      <motion.div className="absolute inset-0"
        initial={{ opacity: 0 }} animate={{ opacity: isJackpot ? 0.85 : 0.6 }} exit={{ opacity: 0 }}
        style={{ background: isJackpot ? "radial-gradient(ellipse at center, #000040 0%, rgba(0,0,0,0.9) 100%)" : "rgba(0,0,0,0.7)" }} />

      {/* Confetti */}
      {particles.map(p => <Particle key={p.id} {...p} />)}

      {/* Main win display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {isJackpot ? (
          <>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="text-center">
              {/* Big shimmer emojis */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 0.6, repeat: Infinity }}
                className="flex justify-center gap-2 mb-3">
                {["💎","💎","💎","💎","💎"].map((d, i) => (
                  <motion.span key={i} className="text-4xl"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }}>
                    {d}
                  </motion.span>
                ))}
              </motion.div>

              <motion.p
                animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.5, repeat: Infinity }}
                style={{
                  fontSize: "20px", color: "#ff8800", fontFamily: "'Arial Black', sans-serif",
                  textShadow: "0 0 20px #ff6600, 0 0 40px #ff4400"
                }}>
                HIT THE
              </motion.p>
              <p style={{
                fontSize: "52px", color: "#ffd700", fontFamily: "'Arial Black', sans-serif",
                textShadow: "0 0 20px #ffd700, 0 0 40px #ffaa00, 0 0 80px #ff8800",
                WebkitTextStroke: "2px #ff8800", lineHeight: 1
              }}>ULTIMATE</p>
              <p style={{
                fontSize: "52px", color: "#ffd700", fontFamily: "'Arial Black', sans-serif",
                textShadow: "0 0 20px #ffd700, 0 0 40px #ffaa00, 0 0 80px #ff8800",
                WebkitTextStroke: "2px #ff8800", lineHeight: 1
              }}>JACKPOT</p>

              {/* Awarded box */}
              <motion.div className="mt-4 px-6 py-3 rounded-2xl inline-block"
                style={{ background: "linear-gradient(135deg, #1a0030, #2a0060)", border: "2px solid #ff00ff", boxShadow: "0 0 30px #ff00ff80" }}
                animate={{ boxShadow: ["0 0 20px #ff00ff60", "0 0 40px #ff00ff80", "0 0 20px #ff00ff60"] }}
                transition={{ duration: 1, repeat: Infinity }}>
                <p className="text-sm font-bold" style={{ color: "#ff88ff" }}>✨ Jackpot</p>
                <p className="text-xl font-black text-white">AWARDED!!!</p>
                <p className="text-2xl font-mono font-black" style={{ color: "#ffd700" }}>+{amount?.toLocaleString()} 🪙</p>
              </motion.div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="text-center">
            {/* Win flash */}
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.4, repeat: Infinity }}>
              <p className="font-black" style={{
                fontSize: multiplier >= 10 ? "36px" : "28px",
                color: multiplier >= 20 ? "#ffd700" : multiplier >= 10 ? "#ff8800" : "#44ff88",
                textShadow: multiplier >= 20
                  ? "0 0 20px #ffd700, 0 0 40px #ffaa00"
                  : multiplier >= 10
                    ? "0 0 20px #ff8800, 0 0 40px #ff6600"
                    : "0 0 15px #44ff88",
                fontFamily: "'Arial Black', sans-serif"
              }}>
                {multiplier >= 20 ? "🔥 MEGA WIN 🔥" : multiplier >= 10 ? "🎉 BIG WIN 🎉" : "✨ WIN ✨"}
              </p>
            </motion.div>
            <motion.p
              initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-mono font-black mt-2"
              style={{ fontSize: "40px", color: "#ffffff", textShadow: "0 0 20px rgba(255,255,255,0.5)" }}>
              +{amount?.toLocaleString()}
            </motion.p>
            <p className="text-lg text-yellow-400 font-black mt-1">🪙 COINS</p>
            {multiplier && (
              <div className="mt-3 inline-block px-4 py-1.5 rounded-full font-black text-sm"
                style={{ background: "rgba(255,215,0,0.2)", color: "#ffd700", border: "1px solid #ffd70050" }}>
                ×{multiplier} MULTIPLICATEUR
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Rotating sparkles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div key={i} className="absolute pointer-events-none"
          style={{ left: "50%", top: "50%", transformOrigin: "0 0" }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "linear", delay: i * 0.2 }}>
          <motion.div className="absolute text-xl"
            style={{ left: `${60 + i * 20}px`, top: 0 }}
            animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}>
            {["⭐","✨","💫","🌟","⭐","✨","💫","🌟"][i]}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}