import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FARMING_SIM_POSTER, FARMING_SIM_CATEGORIES } from "@/components/tuto-gaming/farmingSimData";
import CategoryCard from "@/components/tuto-gaming/CategoryCard";
import WikiItemCard from "@/components/tuto-gaming/WikiItemCard";
import WikiItemModal from "@/components/tuto-gaming/WikiItemModal";

export default function FarmingSimCategory() {
  const { categoryId } = useParams();
  const [wikiItems, setWikiItems] = useState([]);
  const [loadingWiki, setLoadingWiki] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

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

  useEffect(() => {
    if (!categoryId) return;
    setLoadingWiki(true);
    base44.entities.WikiEntry.filter({ sub_category: categoryId, game_slug: "farming-simulator-25" }).
    then((items) => setWikiItems(items)).
    catch(() => setWikiItems([])).
    finally(() => setLoadingWiki(false));
  }, [categoryId]);

  if (!foundCard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#1a1a1a" }}>
        <p className="text-sm text-white/40">Catégorie introuvable</p>
        <Link to="/tuto-gaming/farming-simulator-25" className="text-xs font-bold text-white/60 hover:text-white">
          Retour au catalogue
        </Link>
      </div>);

  }

  const otherCards = parentCategory.cards.filter((c) => c.id !== foundCard.id);

  return (
    <div className="min-h-screen" style={{ background: "#1a1a1a" }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-40"
        style={{ background: "rgba(26,26,26,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/tuto-gaming/farming-simulator-25"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition tap-sm">
            
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Catalogue</span>
          </Link>
          <div className="flex items-center gap-2 ml-2">
            
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
          style={{ color: "#7DA627" }}>
          
          Catégorie
        </span>
        <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mb-4">
          {foundCard.title}
        </h1>

        <div
          className="overflow-hidden rounded-lg border border-[#3a3a3a]"
          style={{ background: "#262626" }}>
          
          


          
          
        </div>
      </div>

      {/* Wiki items grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-white/60 mb-4">
          Éléments — {foundCard.title}
        </h2>
        {loadingWiki ?
        <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-white/30" />
          </div> :
        wikiItems.length > 0 ?
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {wikiItems.map((item) =>
          <WikiItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
          )}
          </div> :

        <div
          className="rounded-lg border border-dashed border-white/10 py-6 text-center"
          style={{ background: "rgba(38,38,38,0.4)" }}>
          
            <span className="text-xs text-white/30 uppercase tracking-wider">
              Aucun élément ajouté pour le moment
            </span>
          </div>
        }
      </div>

      {/* Other cards in the same category */}
      {otherCards.length > 0 &&
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
          

        
          



        
        </div>
      }

      {/* Wiki item modal */}
      {selectedItem &&
      <WikiItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      }
    </div>);

}