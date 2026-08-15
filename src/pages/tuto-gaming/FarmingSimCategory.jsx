import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { FARMING_SIM_POSTER, FARMING_SIM_SECTIONS } from "@/components/tuto-gaming/farmingSimData";

export default function FarmingSimCategory() {
  const { categoryId } = useParams();
  const section = FARMING_SIM_SECTIONS.find((s) => s.id === categoryId);
  const otherSections = FARMING_SIM_SECTIONS.filter((s) => s.id !== categoryId);

  if (!section) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#0d0518" }}>
        <p className="text-sm text-white/40">Catégorie introuvable</p>
        <Link to="/tuto-gaming/farming-simulator-25" className="text-xs font-bold text-white/60 hover:text-white">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0d0518" }}>
      {/* Back link */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-4">
        <Link
          to="/tuto-gaming/farming-simulator-25"
          className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold">Retour au Catalogue</span>
        </Link>
      </div>

      {/* Category title */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-1">
          <img src={FARMING_SIM_POSTER} alt="FS25" className="w-8 h-8 rounded object-cover" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Farming Simulator 25
          </span>
        </div>
        <h1 className="text-xl font-black text-white uppercase tracking-tight">
          {section.title}
        </h1>
      </div>

      {/* Full section screenshot */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-6">
        <div
          className="overflow-hidden rounded-xl border border-white/10"
          style={{ boxShadow: "0 0 30px rgba(191,90,242,0.1)" }}
        >
          <img
            src={section.img}
            alt={section.title}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Other categories */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-sm font-black uppercase tracking-wider text-white/60 mb-4">
          Autres Catégories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {otherSections.map((s) => (
            <Link
              key={s.id}
              to={`/tuto-gaming/farming-simulator-25/${s.id}`}
              className="group relative overflow-hidden rounded-lg border border-white/5 hover:border-white/20 transition"
              style={{ background: "#1a1a1a" }}
            >
              <img
                src={s.img}
                alt={s.title}
                className="w-full h-24 object-cover object-top group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 40%, rgba(13,5,24,0.9) 100%)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white uppercase tracking-tight line-clamp-1">
                  {s.title}
                </span>
                <ChevronRight className="w-3 h-3 text-white/40 group-hover:text-white transition shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}