import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Crown, X, Sparkles, ImageOff, Check } from "lucide-react";

const PERKS = [
  "Détourage automatique et suppression d'arrière-plan",
  "Export PNG transparent haute résolution",
  "Retouches avancées sans limite",
];

export default function PhotoUpgradeModal({ open, onClose, onSubscribe }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl p-6 space-y-4 relative"
        style={{ background: "linear-gradient(160deg, #1a1226, #0e0a16)", border: "1px solid rgba(168,85,247,0.35)", boxShadow: "0 0 40px rgba(168,85,247,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.35)" }}>
          <ImageOff className="w-6 h-6 text-purple-300" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" /> Fonction Pro
          </h2>
          <p className="text-xs text-white/60 mt-1">
            La suppression d'arrière-plan fait partie de l'abonnement MATRIX Pro.
          </p>
        </div>
        <ul className="space-y-1.5">
          {PERKS.map((p) => (
            <li key={p} className="flex items-start gap-2 text-xs text-white/70">
              <Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-white">4,99 €</span>
          <span className="text-xs text-white/50">/ mois</span>
        </div>
        <button
          onClick={onSubscribe}
          className="w-full h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
        >
          <Sparkles className="w-4 h-4" /> Passer à Pro
        </button>
        <p className="text-[10px] text-white/35 text-center">Paiement sécurisé par Stripe · sans engagement</p>
      </div>
    </div>,
    document.body
  );
}