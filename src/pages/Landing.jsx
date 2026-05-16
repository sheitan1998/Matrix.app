import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tv2, Users, Zap, Shield, Star, ShoppingBag, Cpu, Dices } from "lucide-react";

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

  const UNIVERSES = [
    {
      path: "/stream", label: "Streaming", desc: "Vidéos, lives, shorts. Crée ta chaîne et partage ton contenu.",
      icon: Tv2, hsl: "135 100% 50%",
    },
    {
      path: "/community", label: "Communauté", desc: "Discute, réagis, commente. Rejoins ou crée des salons vocaux.",
      icon: Users, hsl: "280 100% 65%",
    },
    {
      path: "/market", label: "Market", desc: "Achète et vends vêtements, objets, accessoires. Simple, rapide.",
      icon: ShoppingBag, hsl: "25 100% 55%",
    },
    {
      path: "/ai", label: "AI Studio", desc: "Chat, création, code, histoires. Exploite l'IA sans limites.",
      icon: Cpu, hsl: "200 100% 55%",
    },
    {
      path: "/casino", label: "Casino", desc: "Roulette, machines à sous, blackjack. Jeux fictifs uniquement.",
      icon: Dices, hsl: "45 100% 55%", badge: "18+",
    },
  ];

  return (
    <div className="min-h-screen bg-black overflow-y-auto overflow-x-hidden"
      style={{ WebkitOverflowScrolling: "touch" }}>

      {/* Fixed decorative background — non-interactive */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)",
            backgroundSize: "100% 4px",
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-premium/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/6 blur-[100px]" />
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
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex flex-col items-center px-5 pt-16 pb-12 min-h-screen">

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
          className="text-center mb-10"
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

        {/* Universe cards */}
        {showChoices && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-lg grid grid-cols-1 gap-3"
          >
            {UNIVERSES.map(({ path, label, desc, icon: Icon, hsl, badge }, idx) => (
              <motion.button
                key={path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07, duration: 0.4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => nav(path)}
                className="relative rounded-2xl overflow-hidden text-left transition-all active:brightness-90"
                style={{
                  background: `linear-gradient(135deg, hsl(${hsl} / 0.1) 0%, hsl(0 0% 6%) 60%)`,
                  border: `1px solid hsl(${hsl} / 0.3)`,
                  padding: "18px 20px",
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `hsl(${hsl} / 0.12)`, border: `1px solid hsl(${hsl} / 0.25)` }}>
                    <Icon className="w-5 h-5" style={{ color: `hsl(${hsl})` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="text-base font-black text-white">{label}</h2>
                      {badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: "hsl(0 84% 60% / 0.2)", color: "hsl(0 84% 65%)" }}>
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "hsl(0 0% 55%)" }}>{desc}</p>
                  </div>
                  <span className="text-sm font-black shrink-0" style={{ color: `hsl(${hsl})` }}>→</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}