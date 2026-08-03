import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Info, X, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { SLOT_WORLDS } from "./slotWorldsData";

const ITEMS_PER_PAGE = 8;

export default function SlotWorldsGrid({ balance, onBack, onSelectWorld }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(SLOT_WORLDS.length / ITEMS_PER_PAGE);
  const currentWorlds = SLOT_WORLDS.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen relative overflow-hidden select-none flex flex-col"
      style={{ background: "linear-gradient(160deg, #3d0066 0%, #4b0082 40%, #550080 100%)" }}>

      {/* Subtle swirl pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(ellipse at 20% 30%, rgba(199,21,133,0.15), transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(139,43,226,0.15), transparent 50%)",
        }} />

      {/* === HEADER === */}
      <div className="relative z-30 flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: "rgba(30,0,50,0.5)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            <Home className="w-4 h-4 text-white/60" />
          </button>
          <h2 className="text-sm font-black text-white tracking-wide">SLOTS</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}>
            <span className="text-xs font-mono font-black text-white">{(balance || 0).toLocaleString()}</span>
            <span className="text-[10px] font-bold" style={{ color: "#FFD700" }}>MC</span>
          </div>
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* === GRID === */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl w-full">
          {currentWorlds.map((world, i) => (
            <motion.button key={world.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectWorld(world)}
              className="relative overflow-hidden rounded-2xl text-left group"
              style={{
                aspectRatio: "1",
                background: world.bgGradient,
                border: `2px solid ${world.themeColor}40`,
                boxShadow: `0 0 20px ${world.themeColor}25, 0 4px 16px rgba(0,0,0,0.4)`,
              }}>
              {/* Image */}
              <div className="absolute inset-0">
                <img src={world.img} alt={world.name} className="w-full h-full object-cover" style={{ opacity: 0.75 }} />
              </div>
              {/* Glossy overlay */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.4) 100%)" }} />

              {/* Header bar with jackpot value + info icon */}
              <div className="absolute top-0 left-0 right-0 z-10 px-2 py-1.5 flex items-center justify-between"
                style={{ background: "rgba(20,0,40,0.65)", backdropFilter: "blur(4px)" }}>
                <span className="text-[9px] font-mono font-bold text-white truncate flex-1">
                  {world.jackpot}
                </span>
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 ml-1"
                  style={{ background: "#007bff" }}>
                  <Info className="w-2.5 h-2.5 text-white" />
                </div>
              </div>

              {/* Title at bottom */}
              <div className="absolute bottom-0 left-0 right-0 z-10 px-2 py-1.5">
                <p className="text-[10px] sm:text-xs font-black text-white tracking-wide text-center"
                  style={{ textShadow: "0 0 6px rgba(0,0,0,0.9)" }}>
                  {world.name}
                </p>
              </div>

              {/* Hover play overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "rgba(0,0,0,0.45)" }}>
                <div className="px-4 py-1.5 rounded-xl text-xs font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${world.themeColor}, ${world.themeColor}cc)`, boxShadow: `0 0 15px ${world.themeColor}80` }}>
                  ▶ JOUER
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* === FOOTER NAV === */}
      <div className="relative z-30 flex items-center justify-center gap-4 px-4 py-3 shrink-0"
        style={{ background: "rgba(30,0,50,0.5)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="w-9 h-9 rounded-full flex items-center justify-center transition disabled:opacity-30"
          style={{ background: "rgba(80,200,0,0.15)", border: "1px solid rgba(80,200,0,0.3)" }}>
          <ChevronLeft className="w-4 h-4 text-green-400" />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: page === i ? "24px" : "8px",
                height: "8px",
                background: page === i ? "#50c800" : "rgba(255,255,255,0.2)",
              }} />
          ))}
        </div>

        <button
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page === totalPages - 1}
          className="w-9 h-9 rounded-full flex items-center justify-center transition disabled:opacity-30"
          style={{ background: "rgba(80,200,0,0.15)", border: "1px solid rgba(80,200,0,0.3)" }}>
          <ChevronRight className="w-4 h-4 text-green-400" />
        </button>
      </div>
    </div>
  );
}