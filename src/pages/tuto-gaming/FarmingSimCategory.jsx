import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { FARMING_SIM_POSTER, FARMING_SIM_SECTIONS } from "@/components/tuto-gaming/farmingSimData";

export default function FarmingSimCategory() {
  const { categoryId } = useParams();
  const section = FARMING_SIM_SECTIONS.find((s) => s.id === categoryId);
  const otherSections = FARMING_SIM_SECTIONS.filter((s) => s.id !== categoryId);

  if (!section) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#1a1a1a" }}>
        <p className="text-sm text-white/40">Catégorie introuvable</p>
        <Link to="/tuto-gaming/farming-simulator-25" className="text-xs font-bold text-white/60 hover:text-white">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#1a1a1a" }}>
      {/* Top bar with back button */}
      <div className="sticky top-0 z-40" style={{ background: "rgba(26,26,26,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/tuto-gaming/farming-simulator-25"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition tap-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Catégories</span>
          </Link>
          <div className="flex items-center gap-2 ml-2">
            <img src={FARMING_SIM_POSTER} alt="FS25" className="w-6 h-6 rounded object-cover" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Farming Simulator 25
            </span>
          </div>
        </div>
      </div>

      {/* Category title */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
          {section.title}
        </h1>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#a3d633" }}>
          Catégorie
        </span>
      </div>

      {/* Level 2 — Full category screenshot */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-6">
        <div className="overflow-hidden rounded-lg border border-white/10" style={{ background: "#262626" }}>
          <img
            src={section.img}
            alt={section.title}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Other categories */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-sm font-black uppercase tracking-wider text-white/60 mb-4">
          Autres Catégories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {otherSections.map((s) => (
            <Link
              key={s.id}
              to={`/tuto-gaming/farming-simulator-25/${s.id}`}
              className="group relative overflow-hidden rounded-lg border border-white/5 hover:border-[#a3d633] transition-all duration-200"
              style={{ background: "#262626" }}
            >
              <div className="relative h-24 overflow-hidden">
                <img
                  src={s.img}
                  alt={s.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 30%, rgba(38,38,38,0.95) 100%)",
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "#a3d633" }}
                />
              </div>
              <div className="p-2">
                <span
                  className="block text-[9px] font-bold uppercase tracking-wider mb-0.5"
                  style={{ color: "#a3d633" }}
                >
                  Catégorie
                </span>
                <span className="block text-[11px] font-bold text-white uppercase tracking-tight line-clamp-2">
                  {s.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}