import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Loader2, ArrowLeft, Calendar } from "lucide-react";
import ShopItemModal from "@/components/fortnite/ShopItemModal";
import FortniteShopSection from "@/components/fortnite/FortniteShopSection";
import usePageSEO from "@/hooks/usePageSEO";
import useFortniteCatalog from "@/components/fortnite/useFortniteCatalog";
import useVoteCounts from "@/components/fortnite/useVoteCounts";
import { base44 } from "@/api/base44Client";

export default function FortniteShop() {
  usePageSEO({
    title: "Boutique Fortnite du Jour | MATRIX",
    description: "Découvrez la boutique Fortnite du jour avec tous les objets, skins, pioches et emotes disponibles.",
    path: "/fortnite-shop",
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [user, setUser] = useState(null);
  const { items: allItems, total, date, loading, loadingMore, hasMore, loadMore, error } = useFortniteCatalog('getDailyShop');
  const visibleItems = allItems;

  // Group items by layout section
  const sections = useMemo(() => {
    const map = {};
    for (const item of visibleItems) {
      const key = item.section_id || item.layout || 'other';
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }
    return Object.entries(map);
  }, [visibleItems]);

  // Batch fetch vote counts for all visible items
  const itemIds = useMemo(() => visibleItems.map(i => i.id).filter(Boolean), [visibleItems]);
  const voteCounts = useVoteCounts(itemIds, itemIds.length > 0);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto pb-12">
      <Link to="/fortnite-maps" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition mb-5 tap-sm">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-bold">Cartes Fortnite</span>
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <ShoppingBag className="w-5 h-5" style={{ color: "#f59e0b" }} />
        <h1 className="text-2xl font-black text-white">Boutique du Jour</h1>
      </div>
      <p className="text-xs text-white/40 mb-4">Offres, packs et sections officiels de la boutique Fortnite du jour</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div>
      ) : error || allItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-sm text-white/40">Boutique indisponible pour le moment.</p>
        </div>
      ) : (
        <>
          {date && (
            <div className="flex items-center gap-1.5 mb-5 text-xs text-white/40">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          )}

          <p className="text-[10px] text-white/30 mb-4">{total} offres disponibles · cache 1 heure</p>

          {/* Sections grouped by layout */}
          {sections.map(([sectionId, sectionItems]) => (
            <FortniteShopSection key={sectionId} items={sectionItems} onSelect={setSelectedItem} user={user} voteCounts={voteCounts} />
          ))}

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90 tap-sm"
                style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}
              >
                {loadingMore ? "Chargement…" : `Voir plus (${Math.max(0, total - allItems.length)} restants)`}
              </button>
            </div>
          )}
        </>
      )}

      {error && <p role="alert" className="mt-3 text-sm text-destructive">Chargement impossible. Réessayez dans quelques instants.</p>}
      <ShopItemModal item={selectedItem} onClose={() => setSelectedItem(null)} user={user} />
    </div>
  );
}