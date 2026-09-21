import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Fence, TrendingUp, Factory } from "lucide-react";
import { FARMING_SIM_POSTER, fetchFarmingSimCategories } from "@/components/tuto-gaming/farmingSimData";
import CategoryCard from "@/components/tuto-gaming/CategoryCard";
import BlockRenderer from "@/components/tuto-gaming/BlockRenderer";
import FarmingSimPopupModal from "@/components/tuto-gaming/FarmingSimPopupModal";

const POPUP_BUTTONS = [
  { key: "enclos", label: "Enclos", icon: Fence },
  { key: "rendement", label: "Rendement", icon: TrendingUp },
  { key: "usines", label: "Usines", icon: Factory },
];

export default function FarmingSimulator25() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePopup, setActivePopup] = useState(null);

  useEffect(() => {
    fetchFarmingSimCategories().then((cats) => {
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#1a1a1a" }}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/tuto-gaming"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold">Retour au Hub</span>
          </Link>
          {POPUP_BUTTONS.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.key}
                onClick={() => setActivePopup(btn)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white/70 hover:text-white transition tap-sm"
                style={{
                  background: "rgba(125,166,39,0.08)",
                  border: "1px solid rgba(125,166,39,0.2)",
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activePopup && (
        <FarmingSimPopupModal
          popupKey={activePopup.key}
          title={activePopup.label}
          onClose={() => setActivePopup(null)}
        />
      )}

      











      

      {/* Dynamic blocks from admin (accordion, banners, etc.) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-4">
        <BlockRenderer gameSlug="farming-simulator-25" pageKey="hub" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12 space-y-8">
        {loading ?
        <div className="text-center py-12 text-white/30 text-xs">Chargement…</div> :

        categories.map((category) =>
        <div key={category.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="block w-1 h-5 rounded-full" style={{ background: "#7DA627" }} />
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  {category.title}
                </h2>
                {category.cards.length > 0 &&
            <span className="text-[10px] text-white/30 ml-auto">
                    {category.cards.length} modèle{category.cards.length > 1 ? "s" : ""}
                  </span>
            }
              </div>
              {category.cards.length > 0 ?
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {category.cards.map((card) =>
            <CategoryCard key={card.id} card={card} />
            )}
                </div> :

          <div
            className="rounded-lg border border-dashed border-white/10 py-6 text-center"
            style={{ background: "rgba(38,38,38,0.4)" }}>
            
                  <span className="text-xs text-white/30 uppercase tracking-wider">Bientôt disponible</span>
                </div>
          }
            </div>
        )
        }
      </div>
    </div>);

}