import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, ArrowLeft, Map as MapIcon, ShoppingBag, Shirt, User } from "lucide-react";
import FortniteMapCard from "@/components/tuto-gaming/FortniteMapCard";
import FeaturedMaps from "@/components/fortnite/FeaturedMaps";
import ApiFeaturedMaps from "@/components/fortnite/ApiFeaturedMaps";
import SubmitMapModal from "@/components/tuto-gaming/SubmitMapModal";
import MapDetailModal from "@/components/tuto-gaming/MapDetailModal";
import { FORTNITE_BANNER, MAP_CATEGORIES } from "@/components/tuto-gaming/fortniteMapsData";
import { useTutoGamingAssets, getAssetUrl } from "@/hooks/useTutoGamingAssets";
import usePageSEO from "@/hooks/usePageSEO";
import useFortniteMaps from "@/components/fortnite/useFortniteMaps";

export default function FortniteMaps() {
  usePageSEO({
    title: "Fortnite Maps - Cartes créatives | MATRIX",
    description: "Découvrez et partagez les meilleures cartes créatives Fortnite. Explorez, votez et publiez vos maps préférées.",
    path: "/fortnite-maps",
  });

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { maps: filteredMaps, total, loading, error, hasMore, loadingMore, loadMore, refresh: fetchMaps } = useFortniteMaps(search, activeCategory);
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedMap, setSelectedMap] = useState(null);
  const [editMap, setEditMap] = useState(null);
  const [user, setUser] = useState(null);
  const [sections, setSections] = useState({
    show_api_maps: true,
    show_daily_shop: true,
    show_cosmetics: true,
    show_player_stats: true,
  });
  const { assets } = useTutoGamingAssets();
  const fortniteBanner = getAssetUrl(assets, "fortnite_banner", FORTNITE_BANNER);

  useEffect(() => {
    base44.functions
      .invoke("fortniteApi", { action: "getSectionsConfig" })
      .then((res) => {
        if (res.data) setSections(res.data);
      })
      .catch(() => {});
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto pb-12">
      {/* Back */}
      <Link
        to="/tuto-gaming"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition mb-5 tap-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-bold">Retour au Hub</span>
      </Link>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {sections.show_daily_shop && (
          <Link
            to="/fortnite-shop"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition tap-sm"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}
          >
            <ShoppingBag className="w-4 h-4" /> Boutique du Jour
          </Link>
        )}
        {sections.show_cosmetics && (
          <Link
            to="/fortnite-cosmetics"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition tap-sm"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}
          >
            <Shirt className="w-4 h-4" /> Cosmétiques
          </Link>
        )}
        {sections.show_player_stats && (
          <Link
            to="/fortnite-stats"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition tap-sm"
            style={{ background: "rgba(191,90,242,0.1)", border: "1px solid rgba(191,90,242,0.2)", color: "#BF5AF2" }}
          >
            <User className="w-4 h-4" /> Statistiques Joueur
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="max-w-xl mb-4">
        <div
          className="relative flex items-center"
          style={{
            borderRadius: "9999px",
            background: "rgba(13,5,24,0.7)",
            border: "1.5px solid rgba(191,90,242,0.25)",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre ou créateur..."
            className="w-full h-11 px-5 pr-11 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          />
          <div className="absolute right-4">
            <Search className="w-4 h-4" style={{ color: "#BF5AF2" }} />
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto no-scrollbar pb-1">
        {MAP_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition tap-sm"
            style={
              activeCategory === cat.id
                ? { background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}50` }
                : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }
            }
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Page title */}
      <h1 className="text-2xl font-black text-white mb-1">Fortnite Maps</h1>
      <p className="text-xs text-white/40 mb-4">Découvrez et partagez les meilleures cartes créatives Fortnite</p>

      {sections.show_api_maps && <ApiFeaturedMaps search={search} category={activeCategory} user={user} />}
      {/* Featured maps with live player counts (manual) */}
      <FeaturedMaps />
      <h2 className="mb-3 text-lg font-black text-foreground">Cartes de la communauté</h2>

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-white/30 uppercase tracking-wider">
          {total} map{total > 1 ? "s" : ""}
        </span>
      </div>

      {/* Maps grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div>
      ) : error ? (
        <p role="alert" className="py-8 text-center text-sm text-destructive">Impossible de charger les cartes. <button onClick={fetchMaps} className="underline">Réessayer</button></p>
      ) : filteredMaps.length === 0 ? (
        <div className="text-center py-16">
          <MapIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-sm text-white/40 mb-2">
            {search ? `Aucune map trouvée pour "${search}"` : "Aucune map disponible pour le moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredMaps.map((m, i) => (
            <FortniteMapCard key={m.id} map={m} index={i} onClick={setSelectedMap} user={user} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button onClick={loadMore} disabled={loadingMore} className="rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-50">
            {loadingMore ? "Chargement…" : "Voir plus"}
          </button>
        </div>
      )}

      {/* Detail modal */}
      <MapDetailModal
        map={selectedMap}
        user={user}
        onClose={() => setSelectedMap(null)}
        onEdit={(m) => {
          setSelectedMap(null);
          setEditMap(m);
          setShowSubmit(true);
        }}
      />

      {/* Edit modal */}
      <SubmitMapModal
        open={showSubmit}
        editMap={editMap}
        onClose={() => {
          setShowSubmit(false);
          setEditMap(null);
        }}
        onSuccess={fetchMaps}
        userEmail={user?.email}
      />
    </div>
  );
}