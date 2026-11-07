import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";

export default function ToolCard({ tool, index, onOpen }) {
  const [hover, setHover] = useState(false);
  const Icon = tool.icon;
  const color = tool.color;

  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.4 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.985 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
      className="group relative flex h-full min-h-[196px] w-full flex-col gap-4 overflow-hidden rounded-2xl p-5 text-left"
      style={{
        background: "linear-gradient(160deg, rgba(18,13,29,0.94), rgba(9,7,15,0.94))",
        border: `1px solid ${color}${hover ? "cc" : "73"}`,
        boxShadow: hover
          ? `0 0 0 1px ${color}55, 0 0 26px ${color}59, 0 0 58px ${color}2e, inset 0 0 24px ${color}1f`
          : `0 0 0 1px ${color}1a, 0 0 18px ${color}33, inset 0 0 16px ${color}12`,
        transition: "box-shadow 220ms ease, border-color 220ms ease, background 220ms ease",
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}59, transparent 70%)`, opacity: hover ? 0.85 : 0.45, transition: "opacity 220ms ease" }}
      />

      <div
        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}1f`, border: `1px solid ${color}59`, boxShadow: `0 0 14px ${color}3d` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>

      <div className="relative flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h2 className="text-[15px] font-black leading-tight text-white">{tool.label}</h2>
          {tool.badge && (
            <span className="rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider" style={{ background: `${color}26`, color, border: `1px solid ${color}4d` }}>
              {tool.badge}
            </span>
          )}
        </div>
        <p className="text-[11px] leading-relaxed text-white/45">{tool.desc}</p>
      </div>

      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
          <Sparkles className="h-3 w-3" /> Ouvrir
        </span>
        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" style={{ color }} />
      </div>
    </motion.button>
  );
}