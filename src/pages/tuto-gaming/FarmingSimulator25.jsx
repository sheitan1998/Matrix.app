import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { FARMING_SIM_POSTER, FARMING_SIM_SECTIONS } from "@/components/tuto-gaming/farmingSimData";

export default function FarmingSimulator25() {
  return (
    <div className="min-h-screen" style={{ background: "#0d0518" }}>
      {/* Back link */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-4">
        <Link
          to="/tuto-gaming"
          className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold">Retour au Hub</span>
        </Link>
      </div>

      {/* Poster / Hero */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-4">
        <div
          className="relative overflow-hidden rounded-2xl border border-white/10"
          style={{ boxShadow: "0 0 40px rgba(191,90,242,0.15)" }}
        >
          <img
            src={FARMING_SIM_POSTER}
            alt="Farming Simulator 25"
            className="w-full h-auto object-cover"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, transparent 60%, rgba(13,5,24,0.6) 100%)",
            }}
          />
        </div>
      </div>

      {/* Category grid - clickable sections */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-sm font-black uppercase tracking-wider text-white/60 mb-4">
          Catégories du Catalogue
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FARMING_SIM_SECTIONS.map((section) => (
            <Link
              key={section.id}
              to={`/tuto-gaming/farming-simulator-25/${section.id}`}
              className="group relative overflow-hidden rounded-xl border border-white/5 hover:border-white/20 transition"
              style={{ background: "#1a1a1a" }}
            >
              <img
                src={section.img}
                alt={section.title}
                className="w-full h-40 object-cover object-top group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 50%, rgba(13,5,24,0.9) 100%)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-tight">
                  {section.title}
                </span>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}