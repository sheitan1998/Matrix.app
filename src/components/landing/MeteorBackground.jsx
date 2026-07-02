import React from "react";
import { motion } from "framer-motion";

const METEORS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  startX: Math.random() * 100,
  startY: Math.random() * 40 - 10,
  angle: 25 + Math.random() * 35,
  duration: 1.5 + Math.random() * 2,
  delay: i * 1.2 + Math.random() * 4,
  length: 80 + Math.random() * 120,
  color: ["#a855f7", "#06b6d4", "#a855f7", "#22c55e", "#a855f7"][i % 5],
}));

const ASTEROIDS = Array.from({ length: 7 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 18 + Math.random() * 38,
  delay: Math.random() * 5,
  floatDur: 8 + Math.random() * 6,
  rotDur: 25 + Math.random() * 30,
}));

export default function MeteorBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ background: "#050505" }}>
      {/* Subtle grid */}
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* CRT scanlines */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)",
          backgroundSize: "100% 4px",
        }} />

      {/* Glow orbs */}
      <motion.div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-[120px]"
        style={{ background: "rgba(168,85,247,0.10)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-[100px]"
        style={{ background: "rgba(6,182,212,0.08)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }} />

      {/* Asteroids */}
      {ASTEROIDS.map((a) => (
        <motion.div key={`ast-${a.id}`}
          className="absolute rounded-full"
          style={{
            left: `${a.x}%`, top: `${a.y}%`,
            width: a.size, height: a.size,
            background: "radial-gradient(circle at 30% 30%, #2a2a2a, #0a0a0a 70%)",
            border: "1px solid rgba(255,255,255,0.04)",
            boxShadow: "inset -3px -3px 8px rgba(0,0,0,0.8), inset 2px 2px 4px rgba(255,255,255,0.03)",
          }}
          animate={{ y: [0, -25, 0], rotate: [0, 360] }}
          transition={{
            y: { duration: a.floatDur, repeat: Infinity, ease: "easeInOut", delay: a.delay },
            rotate: { duration: a.rotDur, repeat: Infinity, ease: "linear" },
          }} />
      ))}

      {/* Meteors */}
      {METEORS.map((m) => (
        <motion.div key={`met-${m.id}`}
          className="absolute"
          style={{ left: `${m.startX}%`, top: `${m.startY}%` }}
          initial={{ opacity: 0 }}
          animate={{
            x: [0, Math.cos((m.angle * Math.PI) / 180) * 900],
            y: [0, Math.sin((m.angle * Math.PI) / 180) * 900],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            repeatDelay: 3 + Math.random() * 6,
            ease: "easeOut",
          }}>
          <div className="rounded-full"
            style={{
              width: "3px", height: "3px",
              background: m.color,
              boxShadow: `0 0 8px 2px ${m.color}, 0 0 20px 4px ${m.color}80`,
            }} />
          <div className="absolute top-1/2 -translate-y-1/2"
            style={{
              right: "100%",
              width: `${m.length}px`,
              height: "1.5px",
              background: `linear-gradient(90deg, transparent, ${m.color}80, ${m.color})`,
              filter: "blur(0.5px)",
            }} />
        </motion.div>
      ))}

      {/* Vignette */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />
    </div>
  );
}