import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ShoppingBag, X } from "lucide-react";

export default function ShopSelectionModal({ open, onClose, onSelectTrix, onSelectCosmetics }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{ background: "#120a1f", border: "1.5px solid rgba(168,85,247,0.3)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-sm font-black text-white">Boutique MATRIX</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            {/* Two selection cards */}
            <div className="p-5 space-y-3">
              <button
                onClick={() => { onSelectTrix?.(); onClose(); }}
                className="w-full p-4 rounded-2xl flex items-center gap-3 text-left transition hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.03))", border: "1.5px solid rgba(251,191,36,0.2)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(251,191,36,0.1)" }}>
                  <RefreshCw className="w-6 h-6" style={{ color: "#fbbf24" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-white">Acheter des Jetons TRIX</h3>
                  <p className="text-[11px] text-white/50 leading-relaxed">Recharger votre solde de jetons</p>
                </div>
              </button>

              <button
                onClick={() => { onSelectCosmetics?.(); onClose(); }}
                className="w-full p-4 rounded-2xl flex items-center gap-3 text-left transition hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(168,85,247,0.03))", border: "1.5px solid rgba(168,85,247,0.2)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.1)" }}>
                  <ShoppingBag className="w-6 h-6" style={{ color: "#a855f7" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-white">Acheter des Cosmétiques</h3>
                  <p className="text-[11px] text-white/50 leading-relaxed">Dépenser vos Trix en animations, badges, couvertures</p>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}