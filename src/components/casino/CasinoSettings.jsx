import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Image } from "lucide-react";

const BG_OPTIONS = [
  { value: "space", label: "Fond MATRIX", preview: "linear-gradient(135deg, #0a0020, #100030)" },
  { value: "nebula", label: "Nébuleuse", preview: "linear-gradient(135deg, #1a0030, #300050)" },
  { value: "cyberpunk", label: "Cyberpunk", preview: "linear-gradient(135deg, #0a0a2a, #2a0a3a)" },
  { value: "black", label: "Noir Premium", preview: "linear-gradient(135deg, #050505, #0a0a0a)" },
];

const ACCENT_OPTIONS = [
  { value: "#a855f7", label: "Violet" },
  { value: "#3b82f6", label: "Bleu" },
  { value: "#fbbf24", label: "Or" },
  { value: "#22c55e", label: "Vert" },
  { value: "#ec4899", label: "Rose" },
];

export default function CasinoSettings({ open, onClose, settings, onChange }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        onClick={onClose}>
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-3xl overflow-hidden max-h-[85vh] overflow-y-auto scrollbar-thin"
          style={{ background: "rgba(15,15,20,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.1)" }}>

          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h3 className="text-base font-black text-white">Personnalisation</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition hover:bg-white/5">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-6">
            {/* Background */}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white/40 mb-3">Fond du casino</p>
              <div className="grid grid-cols-2 gap-2">
                {BG_OPTIONS.map((bg) => (
                  <button key={bg.value} onClick={() => onChange({ ...settings, bgVariant: bg.value })}
                    className="relative h-16 rounded-xl overflow-hidden transition"
                    style={{ background: bg.preview, border: settings.bgVariant === bg.value ? "2px solid #a855f7" : "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white/80">{bg.label}</span>
                    {settings.bgVariant === bg.value && <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent color */}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white/40 mb-3">Couleur principale</p>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_OPTIONS.map((c) => (
                  <button key={c.value} onClick={() => onChange({ ...settings, accent: c.value })}
                    className="w-9 h-9 rounded-full transition flex items-center justify-center"
                    style={{ background: c.value, boxShadow: settings.accent === c.value ? `0 0 15px ${c.value}` : "none", outline: settings.accent === c.value ? "2px solid white" : "none", outlineOffset: "2px" }}>
                    {settings.accent === c.value && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-wider text-white/40">Effets</p>
              {[
                { key: "glow", label: "Effets lumineux (Glow)" },
                { key: "particles", label: "Particules" },
                { key: "animations", label: "Animations fluides" },
              ].map((opt) => (
                <button key={opt.key} onClick={() => onChange({ ...settings, [opt.key]: !settings[opt.key] })}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-xs text-white/70">{opt.label}</span>
                  <div className="w-9 h-5 rounded-full transition relative" style={{ background: settings[opt.key] ? "#a855f7" : "rgba(255,255,255,0.1)" }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: settings[opt.key] ? "18px" : "2px" }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}