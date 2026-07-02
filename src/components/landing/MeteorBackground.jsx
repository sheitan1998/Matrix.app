import React from "react";
import { motion } from "framer-motion";

const METEOR_COLORS = ["#a855f7", "#06b6d4", "#a855f7", "#22c55e", "#a855f7", "#06b6d4"];

const METEORS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  startX: Math.random() * 110 - 10,
  startY: Math.random() * 50 - 10,
  angle: 20 + Math.random() * 40,
  duration: 1.2 + Math.random() * 2,
  delay: i * 0.8 + Math.random() * 3,
  length: 100 + Math.random() * 200,
  thickness: 1 + Math.random() * 1.5,
  color: METEOR_COLORS[i % METEOR_COLORS.length],
}));

const ASTEROIDS = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 16 + Math.random() * 44,
  delay: Math.random() * 5,
  floatDur: 7 + Math.random() * 8,
  rotDur: 20 + Math.random() * 40,
  craters: Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => ({
    cx: 20 + Math.random() * 60,
    cy: 20 + Math.random() * 60,
    r: 2 + Math.random() * 5,
  })),
}));

export default function MeteorBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ background: "#050505" }}>
      {/* Subtle grid */}
      <div className="absolute inset-0 grid-bg opacity-15" />

      {/* CRT scanlines */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)",
          backgroundSize: "100% 4px",
        }} />

      {/* Deep space gradient */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 70% 20%, rgba(168,85,247,0.06), transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(6,182,212,0.05), transparent 50%)" }} />

      {/* Glow orbs */}
      <motion.div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[140px]"
        style={{ background: "rgba(168,85,247,0.08)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full blur-[120px]"
        style={{ background: "rgba(6,182,212,0.06)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }} />

      {/* 3D Asteroids */}
      {ASTEROIDS.map((a) => (
        <motion.div key={`ast-${a.id}`}
          className="absolute"
          style={{ left: `${a.x}%`, top: `${a.y}%`, width: a.size, height: a.size }}
          animate={{ y: [0, -20, 0], x: [0, 8, 0], rotate: [0, 360] }}
          transition={{
            y: { duration: a.floatDur, repeat: Infinity, ease: "easeInOut", delay: a.delay },
            x: { duration: a.floatDur * 1.3, repeat: Infinity, ease: "easeInOut", delay: a.delay },
            rotate: { duration: a.rotDur, repeat: Infinity, ease: "linear" },
          }}>
          <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: "drop-shadow(0 0 6px rgba(0,0,0,0.8))" }}>
            <defs>
              <radialGradient id={`ast-grad-${a.id}`} cx="35%" cy="30%">
                <stop offset="0%" stopColor="#3a3a3a" />
                <stop offset="50%" stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="#080808" />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="50" rx="48" ry="46" fill={`url(#ast-grad-${a.id})`} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            {a.craters.map((c, ci) => (
              <circle key={ci} cx={c.cx} cy={c.cy} r={c.r} fill="#0a0a0a" opacity="0.7" />
            ))}
            <ellipse cx="35" cy="28" rx="12" ry="8" fill="rgba(255,255,255,0.04)" />
          </svg>
        </motion.div>
      ))}

      {/* Meteors with prominent streaks */}
      {METEORS.map((m) => (
        <motion.div key={`met-${m.id}`}
          className="absolute"
          style={{ left: `${m.startX}%`, top: `${m.startY}%` }}
          initial={{ opacity: 0 }}
          animate={{
            x: [0, Math.cos((m.angle * Math.PI) / 180) * 1200],
            y: [0, Math.sin((m.angle * Math.PI) / 180) * 1200],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            repeatDelay: 2 + Math.random() * 5,
            ease: "easeOut",
          }}>
          {/* Meteor head */}
          <div className="rounded-full"
            style={{
              width: `${m.thickness * 2}px`,
              height: `${m.thickness * 2}px`,
              background: m.color,
              boxShadow: `0 0 6px ${m.color}, 0 0 16px ${m.color}, 0 0 30px ${m.color}80`,
            }} />
          {/* Meteor trail */}
          <div className="absolute top-1/2 -translate-y-1/2"
            style={{
              right: "100%",
              width: `${m.length}px`,
              height: `${m.thickness}px`,
              background: `linear-gradient(90deg, transparent, ${m.color}40, ${m.color}90, ${m.color})`,
              filter: "blur(0.5px)",
            }} />
        </motion.div>
      ))}

      {/* Vignette */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)" }} />
    </div>
  );
}