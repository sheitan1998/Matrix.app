import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { SLOT_THEMES } from "./slotThemes";

export default function ThemeSelectionModal({ show, onSelect, onClose }) {
  useEffect(() => {
    if (!show) return;
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-2xl overflow-hidden"
            style={{ background: "rgba(10,5,15,0.95)", border: "1px solid rgba(197,160,89,0.3)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid rgba(197,160,89,0.15)" }}>
              <div>
                <h3 className="text-base font-black" style={{ color: "#C5A059" }}>Choisissez votre machine</h3>
                <p className="text-[10px] text-white/40">6 univers thématiques disponibles</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white transition" style={{ background: "rgba(255,255,255,0.05)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Theme posters grid */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto scrollbar-thin">
              {Object.entries(SLOT_THEMES).map(([key, t], i) => (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSelect(key)}
                  className="relative rounded-xl overflow-hidden group"
                  style={{ border: `2px solid ${t.frameAccent}50`, boxShadow: `0 0 15px ${t.frameAccent}20` }}
                >
                  {/* Theme poster image */}
                  <img
                    src={t.bgImage}
                    alt={t.name}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-32 sm:h-36 object-cover"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)" }} />

                  {/* Theme name + emoji */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{t.emoji}</span>
                      <div>
                        <p className="text-xs font-black text-white leading-tight">{t.name}</p>
                        <p className="text-[8px] text-white/50">{t.paylines} lignes</p>
                      </div>
                    </div>
                  </div>

                  {/* Hover play indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: `${t.frameAccent}20` }}>
                    <span className="px-3 py-1.5 rounded-lg text-xs font-black text-white" style={{ background: t.frameAccent }}>
                      ▶ JOUER
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}