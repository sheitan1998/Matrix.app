import React, { useState, useCallback } from "react";
import { Search, Loader2, X, ChevronLeft, ChevronRight, Sword, Shield, Package, Skull, Layers } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORIES = [
  { id: "all", label: "Tout", icon: Package },
  { id: "equipment", label: "Équipements", icon: Shield },
  { id: "weapons", label: "Armes", icon: Sword },
  { id: "resources", label: "Ressources", icon: Package },
  { id: "monsters", label: "Bestiaire", icon: Skull },
  { id: "sets", label: "Panoplies", icon: Layers },
];

export default function Dofus() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [minLevel, setMinLevel] = useState("");
  const [maxLevel, setMaxLevel] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemDetails, setItemDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchData = useCallback(async (p = 1, tab = activeTab, s = search) => {
    setLoading(true);
    try {
      const action = tab === "monsters" ? "getMonsters" : tab === "sets" ? "getItemSets" : "searchItems";
      const res = await base44.functions.invoke("dofusApi", {
        action,
        lang: "fr",
        page: p,
        limit: 24,
        search: s,
        category: tab,
        minLevel: Number(minLevel) || 0,
        maxLevel: Number(maxLevel) || 0,
      });
      const data = res.data || res;
      setItems(data.items || []);
      setTotal(data.total || 0);
      setHasMore(data.has_more || false);
      setPage(p);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, minLevel, maxLevel]);

  const handleSearch = () => fetchData(1, activeTab, search);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    fetchData(1, tab, "");
  };

  const openItem = async (item) => {
    setSelectedItem(item);
    setItemDetails(null);
    if (activeTab === "monsters" || activeTab === "sets") return;
    setLoadingDetails(true);
    try {
      const res = await base44.functions.invoke("dofusApi", {
        action: "getItemDetails",
        id: item.id,
        lang: "fr",
      });
      setItemDetails(res.data || res);
    } catch {
      setItemDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0f0a1a" }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Encyclopédie Dofus</h1>
          <p className="text-sm text-white/50">Équipements, armes, ressources, bestiaire et panoplies — données DofusDB</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleTabChange(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === cat.id
                    ? "bg-yellow-500 text-black"
                    : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Rechercher par nom..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-yellow-500/50"
            />
          </div>
          {activeTab !== "monsters" && activeTab !== "sets" && (
            <>
              <input
                type="number"
                value={minLevel}
                onChange={(e) => setMinLevel(e.target.value)}
                placeholder="Niv. min"
                className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-yellow-500/50"
              />
              <input
                type="number"
                value={maxLevel}
                onChange={(e) => setMaxLevel(e.target.value)}
                placeholder="Niv. max"
                className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-yellow-500/50"
              />
            </>
          )}
          <button
            onClick={handleSearch}
            className="px-4 py-2 rounded-lg bg-yellow-500 text-black text-sm font-bold hover:bg-yellow-400 transition"
          >
            Rechercher
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <p>Aucun résultat. Lancez une recherche.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openItem(item)}
                  className="group relative rounded-xl bg-white/5 border border-white/10 hover:border-yellow-500/40 transition overflow-hidden"
                >
                  <div className="aspect-square flex items-center justify-center bg-black/30">
                    {item.img ? (
                      <img
                        src={item.img}
                        alt={item.name}
                        loading="lazy"
                        className="max-w-full max-h-full object-contain p-2 group-hover:scale-105 transition"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-white/20" />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold text-white truncate">{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-white/40 truncate">{item.type}</span>
                      {item.level > 0 && (
                        <span className="text-[10px] font-bold text-yellow-500">Niv. {item.level}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => fetchData(page - 1)}
                disabled={page <= 1 || loading}
                className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-white/60">Page {page} — {total} résultats</span>
              <button
                onClick={() => fetchData(page + 1)}
                disabled={!hasMore || loading}
                className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Item Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl bg-[#1a1128] border border-white/10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-24 h-24 flex items-center justify-center bg-black/40 rounded-xl flex-shrink-0">
                {selectedItem.img ? (
                  <img src={selectedItem.img} alt={selectedItem.name} className="max-w-full max-h-full object-contain p-2" />
                ) : (
                  <Package className="w-10 h-10 text-white/20" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{selectedItem.name}</h2>
                <p className="text-sm text-white/50">{selectedItem.type}</p>
                {selectedItem.level > 0 && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                    Niveau {selectedItem.level}
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-2 text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedItem.description && (
              <p className="text-sm text-white/60 mb-4 leading-relaxed">{selectedItem.description}</p>
            )}

            {loadingDetails ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
              </div>
            ) : itemDetails?.recipes?.length > 0 ? (
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Recette de craft</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {itemDetails.recipes.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                      {r.ingredientImg ? (
                        <img src={r.ingredientImg} alt={r.ingredientName} className="w-8 h-8 object-contain" loading="lazy" />
                      ) : (
                        <div className="w-8 h-8 bg-white/5 rounded" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs text-white truncate">{r.ingredientName}</p>
                        <p className="text-[10px] text-yellow-500">x{r.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {itemDetails?.effects?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Effets</h3>
                <div className="space-y-1">
                  {itemDetails.effects.map((e, i) => (
                    <p key={i} className="text-sm text-white/70">Effet #{e.id}: {e.value}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}