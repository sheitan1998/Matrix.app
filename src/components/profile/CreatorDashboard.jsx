import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, Sparkles, ChevronRight } from "lucide-react";

export default function CreatorDashboard({ onNavigate }) {
  const nav = useNavigate();
  const open = () => (onNavigate ? onNavigate("/affiliate") : nav("/affiliate"));

  return (
    <div className="p-6 rounded-3xl relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.10), rgba(168,85,247,0.10))", border: "1px solid rgba(255,215,0,0.25)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(255,215,0,0.18), transparent 60%)" }} />
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.35)" }}>
          <Star className="w-6 h-6" style={{ color: "#FFD700" }} />
        </div>
        <h3 className="text-lg font-black text-white">Programme Affiliés & Partenaires</h3>
        <p className="text-xs text-white/50 mt-1.5 leading-relaxed max-w-md">
          Devenez affilié instantanément, récupérez votre lien personnel et suivez vos filleuls. Les créateurs éligibles peuvent aussi postuler au programme Partenaire.
        </p>
        <button
          onClick={open}
          className="mt-5 inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-black text-black transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)" }}
        >
          <Sparkles className="w-4 h-4" /> Ouvrir <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}