import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CasinoToken from "./CasinoToken";

export default function PaytableModal({ show, theme, onClose, symbols }) {
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
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: theme.controlBg,
              border: `1px solid ${theme.frameAccent}50`,
              boxShadow: `0 0 40px ${theme.frameAccent}20`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${theme.frameAccent}30` }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{theme.emoji}</span>
                <h3 className="text-sm font-black text-white">{theme.name} — Table des gains</h3>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white transition" style={{ background: "rgba(255,255,255,0.05)" }}>
                ✕
              </button>
            </div>

            {/* Paytable content */}
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin">
              <p className="text-[10px] text-white/40 mb-2">
                Alignez 3 symboles identiques ou plus sur une ligne pour gagner. Le Wild ({(symbols || theme.symbols).find(s => s.isWild)?.s || "★"}) remplace n'importe quel symbole.
                </p>
                {(symbols || theme.symbols).map((sym, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: `${theme.frameAccent}08`, border: `1px solid ${theme.frameAccent}15` }}
                >
                  <div className="flex items-center gap-3">
                    {sym.image_url ? (
                      <img src={sym.image_url} alt={sym.label} className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="text-2xl">{sym.s}</span>
                    )}
                    <div>
                      <p className="text-sm font-bold text-white">{sym.label}</p>
                      {sym.isWild && <p className="text-[9px] font-black" style={{ color: theme.frameAccent }}>WILD</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CasinoToken size={14} />
                    <span className="text-sm font-mono font-black" style={{ color: sym.color }}>
                      ×{sym.mult}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3" style={{ borderTop: `1px solid ${theme.frameAccent}30` }}>
              <p className="text-[10px] text-white/40 text-center">
                {theme.paylines} lignes de paiement • Mise de 100 à 1 000 000
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}