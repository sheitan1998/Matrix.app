import React from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { FARMING_SIM_POSTER, FARMING_SIM_CATEGORIES } from "@/components/tuto-gaming/farmingSimData";
import CategoryCard from "@/components/tuto-gaming/CategoryCard";

export default function FarmingSimCategory() {
  const { categoryId } = useParams();

  // Search across all categories for a card matching the param
  let foundCard = null;
  let parentCategory = null;
  for (const cat of FARMING_SIM_CATEGORIES) {
    const match = cat.cards.find((c) => c.id === categoryId);
    if (match) {
      foundCard = match;
      parentCategory = cat;
      break;
    }
  }

  if (!foundCard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#1a1a1a" }}>
        <p className="text-sm text-white/40">Catégorie introuvable</p>
        <Link to="/tuto-gaming/farming-simulator-25" className="text-xs font-bold text-white/60 hover:text-white">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  // Other cards in the same category
  const otherCards = parentCategory.cards.filter((c) => c.id !== foundCard.id);

  return (
    <div className="min-h-screen" style={{ background: "#1a1a1a" }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-40"
        style={{ background: "rgba(26,26,26,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/tuto-gaming/farming-simulator-25"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition tap-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Catalogue</span>
          </Link>
          <div className="flex items-center gap-2 ml-2">
            <img src={FARMING_SIM_POSTER} alt="FS25" className="w-6 h-6 rounded object-cover" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              {parentCategory.title}
            </span>
          </div>
        </div>
      </div>

      {/* Card detail */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4">
        <span
          className="block text-[10px] font-bold uppercase tracking-wider mb-1"
          style={{ color: "#7DA627" }}
        >
          Catégorie
        </span>
        <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mb-4">
          {foundCard.title}
        </h1>

        <div
          className="overflow-hidden rounded-lg border border-[#3a3a3a]"
          style={{ background: "#262626" }}
        >
          <img
            src={foundCard.img}
            alt={foundCard.title}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Other cards in the same category */}
      {otherCards.length > 0 && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
          <h2 className="text-sm font-black uppercase tracking-wider text-white/60 mb-4">
            Autres modèles — {parentCategory.title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {otherCards.map((card) => (
              <CategoryCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}