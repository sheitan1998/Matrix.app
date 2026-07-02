import React from "react";
import { motion } from "framer-motion";

const METEOR_COLORS = ["#a855f7", "#06b6d4", "#a855f7", "#22c55e", "#a855f7", "#06b6d4"];

const METEORS = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  startX: Math.random() * 110 - 10,
  startY: Math.random() * 60 - 10,
  angle: 20 + Math.random() * 45,
  duration: 1 + Math.random() * 2.5,
  delay: i * 0.6 + Math.random() * 3,
  length: 120 + Math.random() * 250,
  thickness: 1.5 + Math.random() * 2,
  color: METEOR_COLORS[i % METEOR_COLORS.length],
}));

const ASTEROIDS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 18 + Math.random() * 50,
  delay: Math.random() * 5,
  floatDur: 6 + Math.random() * 8,
  rotDur: 18 + Math.random() * 40,
  craters: Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => ({
    cx: 15 + Math.random() * 70,
    cy: 15 + Math.random() * 70,
    r: 2 + Math.random() * 6,
  })),
}));

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  twinkleDur: 2 + Math.random() * 4,
  delay: Math.random() * 5,
}));

export default function MeteorBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ background: "#050505" }}>
      {/* Starfield */}
      {STARS.map((s) => (
        <motion.div key={`star-${s.id}`}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.twinkleDur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      {/* Subtle grid */}
      <div className="absolute inset-0 grid-bg opacity-10" />

      {/* CRT scanlines */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)",
          backgroundSize: "100% 4px",
        }} />

      {/* Deep space gradient */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 70% 20%, rgba(168,85,247,0.08), transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(6,182,212,0.06), transparent 50%)" }} />

      {/* Glow orbs */}
      <motion.div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[140px]"
        style={{ background: "rgba(168,85,247,0.10)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full blur-[120px]"
        style={{ background: "rgba(6,182,212,0.08)" }}
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
          <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.9))" }}>
            <defs>
              <radialGradient id={`ast-grad-${a.id}`} cx="35%" cy="30%">
                <stop offset="0%" stopColor="#4a4a4a" />
                <stop offset="40%" stopColor="#222222" />
                <stop offset="80%" stopColor="#0e0e0e" />
                <stop offset="100%" stopColor="#050505" />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="50" rx="48" ry="46" fill={`url(#ast-grad-${a.id})`} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            {a.craters.map((c, ci) => (
              <circle key={ci} cx={c.cx} cy={c.cy} r={c.r} fill="#080808" opacity="0.8" />
            ))}
            {/* Highlight */}
            <ellipse cx="35" cy="28" rx="14" ry="9" fill="rgba(255,255,255,0.06)" />
          </svg>
        </motion.div>
      ))}

      {/* Meteors with bright streaks */}
      {METEORS.map((m) => (
        <motion.div key={`met-${m.id}`}
          className="absolute"
          style={{ left: `${m.startX}%`, top: `${m.startY}%` }}
          initial={{ opacity: 0 }}
          animate={{
            x: [0, Math.cos((m.angle * Math.PI) / 180) * 1400],
            y: [0, Math.sin((m.angle * Math.PI) / 180) * 1400],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            repeatDelay: 1 + Math.random() * 4,
            ease: "easeOut",
          }}>
          {/* Meteor head */}
          <div className="rounded-full"
            style={{
              width: `${m.thickness * 2.5}px`,
              height: `${m.thickness * 2.5}px`,
              background: m.color,
              boxShadow: `0 0 8px ${m.color}, 0 0 20px ${m.color}, 0 0 40px ${m.color}80`,
            }} />
          {/* Meteor trail */}
          <div className="absolute top-1/2 -translate-y-1/2"
            style={{
              right: "100%",
              width: `${m.length}px`,
              height: `${m.thickness}px`,
              background: `linear-gradient(90deg, transparent, ${m.color}30, ${m.color}80, ${m.color})`,
              filter: "blur(0.5px)",
              boxShadow: `0 0 4px ${m.color}60`,
            }} />
        </motion.div>
      ))}

      {/* Vignette */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.65) 100%)" }} />
    </div>
  );
}