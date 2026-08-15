import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FARMING_SIM_POSTER, FARMING_SIM_SECTIONS } from "@/components/tuto-gaming/farmingSimData";

export default function FarmingSimulator25() {
  return (
    <div className="min-h-screen" style={{ background: "#1a1a1a" }}>
      {/* Back link */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4">
        <Link
          to="/tuto-gaming"
          className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm">
          
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold">Retour au Hub</span>
        </Link>
      </div>

      {/* Poster banner */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4">
        <div className="relative overflow-hidden rounded-xl border border-white/10">
          <img
            src={FARMING_SIM_POSTER}
            alt="Farming Simulator 25"
            className="w-full h-32 sm:h-48 object-cover object-center" />
          
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
              "linear-gradient(180deg, transparent 30%, rgba(26,26,26,0.95) 100%)"
            }} />
          
        </div>
      </div>

      {/* Level 1 — Category grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-lg font-black uppercase tracking-wider text-white mb-4">
          Catégories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {FARMING_SIM_SECTIONS.map((section) =>
          <Link
            key={section.id}
            to={`/tuto-gaming/farming-simulator-25/${section.id}`}
            className="group relative overflow-hidden rounded-lg border border-white/5 hover:border-[#a3d633] transition-all duration-200 hidden"
            style={{ background: "#262626" }}>
            
              <div className="relative h-28 sm:h-32 overflow-hidden py-3 mt-5 mb-5 opacity-100">
                



              
              
                <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                  "linear-gradient(180deg, transparent 30%, rgba(38,38,38,0.95) 100%)"
                }} />
              
                {/* Green active tab on hover */}
                <div
                className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "#a3d633" }} />
              
              </div>
              <div className="p-2.5">
                <span
                className="block text-[10px] font-bold uppercase tracking-wider mb-0.5"
                style={{ color: "#a3d633" }}>
                
                  Catégorie
                </span>
                <span className="block text-xs font-bold text-white uppercase tracking-tight line-clamp-2">
                  {section.title}
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>);

}