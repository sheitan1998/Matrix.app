import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function PlatformCard({ item, index = 0, compact = false, stretch = false, onClick }) {
  const Icon = item.Icon;
  const color = item.color;
  const box = compact ? "w-10 h-10" : "w-11 h-11";

  return (
    <motion.button
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.08, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`platform-card relative w-full rounded-2xl overflow-hidden text-left group flex items-center ${compact ? "gap-3 p-3.5 min-h-[78px]" : "gap-4 p-4 min-h-[86px]"} ${stretch ? "h-full" : ""}`}
      style={{
        background: "hsl(var(--card))",
        border: `1px solid ${color}55`,
        "--pc-glow": `${color}99`,
        "--pc-glow-strong": `${color}`,
        "--pc-glow-soft": `${color}42`,
        "--pc-glow-inner": `${color}14`,
        "--pc-border": `${color}55`,
        "--pc-border-hover": `${color}cc`,
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: color, boxShadow: `0 0 10px ${color}80` }} />

      {item.logoUrl ? (
        <img
          src={item.logoUrl}
          alt={item.label}
          className={`${box} rounded-full object-cover shrink-0 transition-transform group-hover:scale-110`}
          style={{ border: `1.5px solid ${color}66`, boxShadow: `0 0 14px ${color}44` }}
        />
      ) : item.iconUrl ? (
        <img src={item.iconUrl} alt={item.label} style={{ height: compact ? 24 : 28, width: "auto" }} className="shrink-0" />
      ) : Icon ? (
        <div
          className={`${box} rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}
          style={{
            background: `linear-gradient(135deg, ${color}55, rgba(10,5,15,0.6))`,
            border: `1.5px solid ${color}99`,
            boxShadow: `0 0 16px ${color}66, inset 0 0 12px ${color}33`,
          }}
        >
          <Icon className={compact ? "w-4 h-4" : "w-5 h-5"} style={{ color: "#f5d0fe", filter: `drop-shadow(0 0 6px ${color})` }} />
        </div>
      ) : (
        <div className={`${box} rounded-xl flex items-center justify-center shrink-0`} style={{ background: `${color}1a`, boxShadow: `0 0 15px ${color}30` }}>
          <span className="text-lg font-black" style={{ color }}>{item.label.charAt(0)}</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className={`${compact ? "text-sm" : "text-base"} font-black text-foreground`}>{item.label}</h3>
        <p className={`leading-relaxed text-foreground/50 line-clamp-2 ${compact ? "text-[11px]" : "text-xs"}`}>{item.desc}</p>
      </div>
      <ArrowRight
        className={`${compact ? "w-4 h-4" : "w-5 h-5"} shrink-0 transition-transform group-hover:translate-x-1`}
        style={{ color }}
      />
    </motion.button>
  );
}