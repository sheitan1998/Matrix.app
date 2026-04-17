import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tv2, Users, Zap, Shield, Star } from "lucide-react";

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 3,
  duration: Math.random() * 4 + 3,
}));

export default function Landing() {
  const nav = useNavigate();
  const [showChoices, setShowChoices] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowChoices(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-premium/60"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-premium/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/6 blur-[100px] pointer-events-none" />

      {/* Giant M background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: showChoices ? 0.03 : 0.06, scale: showChoices ? 1.5 : 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span
          className="font-black leading-none"
          style={{
            fontSize: "clamp(300px, 65vw, 800px)",
            fontFamily: "var(--font-sans)",
            color: "hsl(280 100% 65%)",
            textShadow: "0 0 120px hsl(280 100% 65% / 0.4)",
          }}
        >
          M
        </span>
      </motion.div>

      {/* Glow rings */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.12, scale: 1 }}
        transition={{ duration: 2, delay: 0.2 }}
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ border: "1px solid hsl(280 100% 65% / 0.3)" }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.06, scale: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{ border: "1px solid hsl(280 100% 65% / 0.15)" }}
      />

      {/* Wordmark */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
        className="relative z-10 text-center"
      >
        <div className="flex items-center justify-center mb-3">
          <span className="text-6xl md:text-8xl font-black tracking-tight text-white">
            <span style={{ color: "hsl(280 100% 65%)", textShadow: "0 0 40px hsl(280 100% 65% / 0.6)" }}>M</span>ATRIX
          </span>
        </div>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex items-center justify-center gap-4 mb-3"
        >
          <div className="h-px flex-1 max-w-16" style={{ background: "linear-gradient(to right, transparent, hsl(280 100% 65% / 0.5))" }} />
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3" style={{ color: "hsl(280 100% 65%)" }} />
            <Shield className="w-3 h-3" style={{ color: "hsl(280 100% 65%)" }} />
            <Star className="w-3 h-3" style={{ color: "hsl(280 100% 65%)" }} />
          </div>
          <div className="h-px flex-1 max-w-16" style={{ background: "linear-gradient(to left, transparent, hsl(280 100% 65% / 0.5))" }} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-sm md:text-base tracking-[0.35em] uppercase font-mono"
          style={{ color: "hsl(0 0% 50%)" }}
        >
          Choisissez votre univers
        </motion.p>
      </motion.div>

      {/* Cards */}
      {showChoices && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 mt-14 grid grid-cols-1 sm:grid-cols-2 gap-5 px-6 w-full max-w-2xl"
        >
          {/* Streaming */}
          <motion.button
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => nav("/stream")}
            className="group relative rounded-3xl overflow-hidden text-left p-7 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, hsl(135 100% 50% / 0.08) 0%, hsl(0 0% 6%) 60%)",
              border: "1px solid hsl(135 100% 50% / 0.25)",
              boxShadow: "0 0 0 0 hsl(135 100% 50% / 0)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 40px hsl(135 100% 50% / 0.15), inset 0 1px 0 hsl(135 100% 50% / 0.1)";
              e.currentTarget.style.borderColor = "hsl(135 100% 50% / 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "hsl(135 100% 50% / 0.25)";
            }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: "radial-gradient(circle, hsl(135 100% 50% / 0.12) 0%, transparent 70%)" }} />
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "hsl(135 100% 50% / 0.12)", border: "1px solid hsl(135 100% 50% / 0.2)" }}>
              <Tv2 className="w-6 h-6" style={{ color: "hsl(135 100% 50%)" }} />
            </div>
            <h2 className="text-xl font-black text-white mb-1.5">Streaming</h2>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(0 0% 55%)" }}>
              Vidéos, lives, shorts. Crée ta chaîne et partage ton contenu.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold" style={{ color: "hsl(135 100% 50%)" }}>
              ENTRER →
            </div>
          </motion.button>

          {/* Community */}
          <motion.button
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => nav("/community")}
            className="group relative rounded-3xl overflow-hidden text-left p-7 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, hsl(280 100% 65% / 0.08) 0%, hsl(0 0% 6%) 60%)",
              border: "1px solid hsl(280 100% 65% / 0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 40px hsl(280 100% 65% / 0.15), inset 0 1px 0 hsl(280 100% 65% / 0.1)";
              e.currentTarget.style.borderColor = "hsl(280 100% 65% / 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "hsl(280 100% 65% / 0.25)";
            }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: "radial-gradient(circle, hsl(280 100% 65% / 0.12) 0%, transparent 70%)" }} />
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "hsl(280 100% 65% / 0.12)", border: "1px solid hsl(280 100% 65% / 0.2)" }}>
              <Users className="w-6 h-6" style={{ color: "hsl(280 100% 65%)" }} />
            </div>
            <h2 className="text-xl font-black text-white mb-1.5">Communauté</h2>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(0 0% 55%)" }}>
              Discute, réagis, commente. Rejoins ou crée des salons vocaux.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold" style={{ color: "hsl(280 100% 65%)" }}>
              ENTRER →
            </div>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}