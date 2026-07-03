import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { SPACE_BG } from "./casinoData";

// Pre-generate star positions so they don't change on every render
function useStars(count) {
  return useMemo(() =>
    Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 2,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 5,
    })), [count]);
}

function useMeteors(count) {
  return useMemo(() =>
    Array.from({ length: count }, () => ({
      startX: Math.random() * 120 - 10,
      startY: Math.random() * 40,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 10,
      length: 60 + Math.random() * 80,
    })), [count]);
}

export default function CasinoBackground({ variant = "space" }) {
  const stars = useStars(60);
  const meteors = useMeteors(4);

  const bgImage = variant === "space" ? SPACE_BG : variant === "cyberpunk"
    ? "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop"
    : variant === "nebula"
    ? "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&h=1080&fit=crop"
    : variant === "black"
    ? null
    : SPACE_BG;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Base layer */}
      <div className="absolute inset-0"
        style={bgImage
          ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }
          : { background: "linear-gradient(160deg, #050507 0%, #0a0a12 50%, #050507 100%)" }} />

      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(5,5,8,0.65)" }} />

      {/* Nebula glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)", filter: "blur(40px)" }} />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)", filter: "blur(40px)" }} />

      {/* Stars */}
      {stars.map((s, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, background: "#fff" }}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      {/* Meteors */}
      {meteors.map((m, i) => (
        <motion.div key={`m${i}`} className="absolute"
          style={{ left: `${m.startX}%`, top: `${m.startY}%`, width: m.length, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)", borderRadius: "1px" }}
          animate={{ x: [0, 200], y: [0, 150], opacity: [0, 1, 0] }}
          transition={{ duration: m.duration, delay: m.delay, repeat: Infinity, ease: "easeOut" }} />
      ))}

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
    </div>
  );
}