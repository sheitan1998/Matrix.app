import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FARMING_SIM_POSTER, FARMING_SIM_CATEGORIES } from "@/components/tuto-gaming/farmingSimData";
import CategoryCard from "@/components/tuto-gaming/CategoryCard";

export default function FarmingSimulator25() {
  return (
    <div className="min-h-screen" style={{ background: "#1a1a1a" }}>
      {/* Back link */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4">
        <Link
          to="/tuto-gaming"
          className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm"
        >
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
            className="w-full h-32 sm:h-48 object-cover object-center"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, transparent 30%, rgba(26,26,26,0.95) 100%)",
            }}
          />
        </div>
      </div>

      {/* Categories stacked vertically */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12 space-y-8">
        {FARMING_SIM_CATEGORIES.map((category) => (
          <div key={category.id}>
            {/* Category header */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="block w-1 h-5 rounded-full"
                style={{ background: "#7DA627" }}
              />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                {category.title}
              </h2>
              {category.cards.length > 0 && (
                <span className="text-[10px] text-white/30 ml-auto">
                  {category.cards.length} modèle{category.cards.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Cards grid or empty state */}
            {category.cards.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {category.cards.map((card) => (
                  <CategoryCard key={card.id} card={card} />
                ))}
              </div>
            ) : (
              <div
                className="rounded-lg border border-dashed border-white/10 py-6 text-center"
                style={{ background: "rgba(38,38,38,0.4)" }}
              >
                <span className="text-xs text-white/30 uppercase tracking-wider">
                  Bientôt disponible
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}