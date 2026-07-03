import React from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { CATEGORIES } from "./casinoData";

export default function CasinoCategoryFilters({ active, onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
      {CATEGORIES.map((cat, i) => {
        const isActive = active === cat.value;
        return (
          <motion.button key={cat.value}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => onSelect(cat.value)}
            className="shrink-0 h-8 px-3.5 rounded-lg text-xs font-bold transition whitespace-nowrap"
            style={isActive
              ? { background: "rgba(139,92,246,0.15)", color: "#fff", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 15px rgba(139,92,246,0.1)" }
              : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
            onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; } }}
            onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}>
            {cat.label}
          </motion.button>
        );
      })}
      <button className="shrink-0 h-8 px-3 rounded-lg text-xs font-bold text-white/40 hover:text-white/70 transition flex items-center gap-1.5"
        style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <SlidersHorizontal className="w-3 h-3" /> Filtres
      </button>
    </div>
  );
}