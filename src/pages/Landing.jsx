import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tv2, Users } from "lucide-react";

export default function Landing() {
  const nav = useNavigate();
  const [showChoices, setShowChoices] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowChoices(true), 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background M */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: showChoices ? 0.04 : 0.08, scale: showChoices ? 1.4 : 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span
          className="font-black text-white leading-none"
          style={{ fontSize: "clamp(300px, 60vw, 700px)", fontFamily: "var(--font-sans)" }}
        >
          M
        </span>
      </motion.div>

      {/* Glow rings */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute w-[600px] h-[600px] rounded-full border border-primary/30 pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.08, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.6 }}
        className="absolute w-[900px] h-[900px] rounded-full border border-primary/20 pointer-events-none"
      />

      {/* MATRIX wordmark */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative z-10 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-6xl md:text-8xl font-black tracking-tight text-white">
            <span className="text-primary">M</span>ATRIX
          </span>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-muted-foreground text-sm md:text-base tracking-[0.3em] uppercase font-mono"
        >
          Choisissez votre univers
        </motion.p>
      </motion.div>

      {/* Universe choices */}
      {showChoices && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 px-6 w-full max-w-2xl"
        >
          {/* Streaming */}
          <motion.button
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => nav("/stream")}
            className="group relative rounded-3xl overflow-hidden border border-primary/30 bg-black p-8 text-left transition"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-5">
              <Tv2 className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Streaming</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Regarde des vidéos, lives, shorts. Crée ta chaîne et partage tes contenus avec le monde.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-primary text-sm font-semibold">
              Entrer →
            </div>
          </motion.button>

          {/* Community */}
          <motion.button
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => nav("/community")}
            className="group relative rounded-3xl overflow-hidden border border-premium/30 bg-black p-8 text-left transition"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-premium/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
            <div className="w-14 h-14 rounded-2xl bg-premium/15 flex items-center justify-center mb-5">
              <Users className="w-7 h-7 text-premium" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Communauté</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discute, partage des images, réagis, commente. Rejoins ou crée des salons vocaux.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-premium text-sm font-semibold">
              Entrer →
            </div>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}