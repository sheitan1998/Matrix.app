import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function UniverseCard({ label, desc, icon: Icon, color, badge, delay, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-full rounded-2xl overflow-hidden text-left group"
      style={{
        background: `linear-gradient(135deg, ${color}1a 0%, rgba(5,5,5,0.9) 70%)`,
        border: `1.5px solid ${color}55`,
        boxShadow: `0 0 20px ${color}15`,
        padding: "18px 20px",
      }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `radial-gradient(ellipse at left, ${color}15, transparent 70%)` }} />
      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
          style={{ background: `${color}1a`, border: `1px solid ${color}40` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-base font-black text-white">{label}</h2>
            {badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-white/50">{desc}</p>
        </div>
        <ArrowRight className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1" style={{ color }} />
      </div>
    </motion.button>
  );
}