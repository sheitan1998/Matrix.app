import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced win effect with Trix visual feedback
function Confetti({ count = 30 }) {
  const pieces = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ["#ffd700", "#ff00ff", "#00ffcc", "#ff4444", "#44aaff", "#ffffff"][i % 6],
    delay: Math.random() * 0.5,
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <motion.div key={p.id}
          initial={{ x: `${p.x}vw`, y: "-10%", opacity: 1, rotate: 0 }}
          animate={{ y: "110%", opacity: [1, 1, 0], rotate: p.rotate + 360 }}
          transition={{ duration: 1.5 + Math.random(), delay: p.delay, ease: "easeIn" }}
          style={{ position: "absolute", width: p.size, height: p.size, background: p.color, borderRadius: "2px", top: 0 }}
        />
      ))}
    </div>
  );
}

function TrixRain({ amount }) {
  const coins = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 10 + (i * 7) % 80,
    delay: i * 0.08,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {coins.map((c) => (
        <motion.div key={c.id}
          className="absolute text-2xl"
          style={{ left: `${c.x}%`, top: "-5%" }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: "110vh", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, delay: c.delay, ease: "easeIn" }}>
          🪙
        </motion.div>
      ))}
    </div>
  );
}

function getWinTier(amount, multiplier) {
  if (!amount) return null;
  if (multiplier >= 50) return { label: "ULTRA WIN", color: "#ff00ff", glow: "#ff00ff", bg: "#1a0030", border: "#ff00ff", emoji: "💎", count: 80 };
  if (multiplier >= 30 || amount >= 100000) return { label: "MEGA WIN", color: "#ff8800", glow: "#ff6600", bg: "#1a0a00", border: "#ff8800", emoji: "🔥", count: 60 };
  if (multiplier >= 15 || amount >= 5000) return { label: "BIG WIN", color: "#44ff88", glow: "#22cc66", bg: "#001a00", border: "#44ff88", emoji: "🎉", count: 40 };
  return { label: "WIN", color: "#44aaff", glow: "#2288ff", bg: "#000a1a", border: "#44aaff", emoji: "✨", count: 20 };
}

export default function CasinoWinEffect({ show, amount, multiplier, isJackpot, onDone }) {
  const tier = getWinTier(amount, multiplier);
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDone, isJackpot ? 5000 : tier?.label === "ULTRA WIN" ? 4000 : tier?.label === "MEGA WIN" ? 3500 : 2800);
    return () => clearTimeout(t);
  }, [show, isJackpot, tier, onDone]);

  const count = isJackpot ? 100 : tier?.count || 30;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          style={{ background: isJackpot ? "rgba(0,0,0,0.85)" : tier?.label === "ULTRA WIN" ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)" }}>

          <Confetti count={count} />
          <TrixRain amount={amount} />

          {isJackpot ? (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: [0, 1.2, 1], rotate: ["-10deg", "3deg", "0deg"] }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative text-center px-10 py-8 rounded-3xl"
              style={{
                background: "linear-gradient(135deg, #2a1800, #6a3800)",
                border: "4px solid #ffd700",
                boxShadow: "0 0 80px #ffd70080, 0 0 40px #ffd70040"
              }}>
              {["★","✦","★","✦"].map((s, i) => (
                <motion.span key={i} className="absolute text-yellow-400 text-xl"
                  style={{ top: `${[-8, -8, 100, 100][i]}%`, left: `${[-5, 105, -5, 105][i]}%`, transform: "translate(-50%,-50%)" }}
                  animate={{ rotate: 360, scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
                  {s}
                </motion.span>
              ))}
              <p className="font-black text-5xl mb-1" style={{ color: "#ffd700", textShadow: "0 0 20px #ffd700", fontFamily: "'Arial Black', sans-serif" }}>
                JACKPOT!
              </p>
              <motion.p className="font-mono font-black text-3xl text-white"
                animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                +{amount?.toLocaleString()} 🪙
              </motion.p>
              <p className="text-yellow-300 font-bold mt-1 text-sm">×{multiplier} multiplicateur</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0, y: 40 }}
              animate={{ scale: [0, 1.15, 1], y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center px-8 py-6 rounded-3xl"
              style={{
                background: `linear-gradient(135deg, ${tier?.bg || "#001a00"}, ${tier?.bg || "#003300"})`,
                border: `3px solid ${tier?.border || "#44ff88"}`,
                boxShadow: `0 0 50px ${tier?.glow || "#44ff88"}60`
              }}>
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.4, repeat: Infinity }}>
                <p className="font-black" style={{
                  fontSize: tier?.label === "ULTRA WIN" ? "42px" : tier?.label === "MEGA WIN" ? "36px" : "28px",
                  color: tier?.color || "#44ff88",
                  textShadow: `0 0 20px ${tier?.glow}, 0 0 40px ${tier?.glow}`,
                  fontFamily: "'Arial Black', sans-serif"
                }}>
                  {tier?.emoji} {tier?.label} {tier?.emoji}
                </p>
              </motion.div>
              <motion.p className="font-mono font-black mt-2"
                style={{ fontSize: tier?.label === "ULTRA WIN" ? "44px" : "32px", color: "#ffffff", textShadow: "0 0 20px rgba(255,255,255,0.5)" }}>
                +{amount?.toLocaleString()}
              </motion.p>
              <p className="text-lg font-black mt-1" style={{ color: tier?.color }}>🪙 TRIX</p>
              {multiplier > 1 && (
                <div className="mt-3 inline-block px-4 py-1.5 rounded-full font-black text-sm"
                  style={{ background: `${tier?.color}20`, color: tier?.color, border: `1px solid ${tier?.color}50` }}>
                  ×{multiplier} MULTIPLIER
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}