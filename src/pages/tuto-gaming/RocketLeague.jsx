import React, { useState, useCallback } from "react";
import { Search, Loader2, ShoppingBag, Trophy, Package, ChevronLeft, ChevronRight, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const RARITY_COLORS = {
  common: "#9ca3af", uncommon: "#22c55e", rare: "#3b82f6",
  very_rare: "#a855f7", import: "#f59e0b", exotic: "#ec4899",
  black_market: "#6b7280", limited: "#ef4444", premium: "#fbbf24",
};

const PLATFORMS = [
  { id: "epic", label: "Epic" },
  { id: "steam", label: "Steam" },
  { id: "psn", label: "PSN" },
  { id: "xbox", label: "Xbox" },
];

export default function RocketLeague() {
  const [tab, setTab] = useState("shop");
  const [loading, setLoading] = useState(false);
  const [shopItems, setShopItems] = useState([]);
  const [dbItems, setDbItems] = useState([]);
  const [dbPage, setDbPage] = useState(1);
  const [dbTotal, setDbTotal] = useState(0);
  const [dbHasMore, setDbHasMore] = useState(false);
  const [rarityFilter, setRarityFilter] = useState("all");
  const [dbSearch, setDbSearch] = useState("");
  const [platform, setPlatform] = useState("epic");
  const [gamertag, setGamertag] = useState("");
  const [playerStats, setPlayerStats] = useState(null);
  const [statsError, setStatsError] = useState("");

  const fetchShop = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("rocketLeagueApi", { action: "getItemShop" });
      setShopItems((res.data || res).items || []);
    } catch {
      setShopItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDb = useCallback(async (p = 1, s = dbSearch, r = rarityFilter) => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("rocketLeagueApi", {
        action: "searchItems",
        page: p,
        search: s,
        rarity: r,
      });
      const data = res.data || res;
      setDbItems(data.items || []);
      setDbTotal(data.total || 0);
      setDbHasMore(data.has_more || false);
      setDbPage(p);
    } catch {
      setDbItems([]);
    } finally {
      setLoading(false);
    }
  }, [dbSearch, rarityFilter]);

  const fetchStats = useCallback(async () => {
    if (!gamertag.trim()) return;
    setLoading(true);
    setStatsError("");
    try {
      const res = await base44.functions.invoke("rocketLeagueApi", {
        action: "getPlayerStats",
        platform,
        gamertag: gamertag.trim(),
      });
      const data = res.data || res;
      if (data.error) {
        setStatsError(data.error);
        setPlayerStats(null);
      } else {
        setPlayerStats(data);
      }
    } catch {
      setStatsError("Erreur de connexion");
      setPlayerStats(null);
    } finally {
      setLoading(false);
    }
  }, [platform, gamertag]);

  React.useEffect(() => {
    if (tab === "shop" && shopItems.length === 0) fetchShop();
    if (tab === "database" && dbItems.length === 0) fetchDb();
  }, [tab]);

  return (
    <div className="min-h-screen" style={{ background: "#0a0f1a" }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">Rocket League</h1>
          <p className="text-sm text-white/50">Item Shop, Stats Tracker et Base de données</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "shop", label: "Item Shop", icon: ShoppingBag },
            { id: "stats", label: "Stats Joueurs", icon: Trophy },
            { id: "database", label: "Base de données", icon: Package },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition ${
                  tab === t.id ? "bg-cyan-500 text-black" : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        )}

        {/* Item Shop */}
        {tab === "shop" && !loading && (
          <div>
            {shopItems.length === 0 ? (
              <div className="text-center py-20 text-white/40">
                <p>Boutique indisponible temporairement.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {shopItems.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border overflow-hidden"
                    style={{ borderColor: item.rarityColor + "40", background: item.rarityColor + "10" }}
                  >
                    <div className="aspect-square flex items-center justify-center" style={{ background: item.rarityColor + "15" }}>
                      {item.img ? (
                        <img src={item.img} alt={item.name} loading="lazy" className="max-w-full max-h-full object-contain p-2" />
                      ) : (
                        <Package className="w-8 h-8 text-white/20" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-bold text-white truncate">{item.name}</p>
                      {item.price > 0 && <p className="text-[10px] text-cyan-400">{item.price} crédits</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats Tracker */}
        {tab === "stats" && !loading && (
          <div className="max-w-2xl">
            <div className="flex gap-2 mb-6 flex-wrap">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0a0f1a]">{p.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={gamertag}
                onChange={(e) => setGamertag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchStats()}
                placeholder="Pseudo Epic/Steam/PSN..."
                className="flex-1 min-w-[200px] px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30"
              />
              <button
                onClick={fetchStats}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition"
              >
                Rechercher
              </button>
            </div>

            {statsError && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
                {statsError}
              </div>
            )}

            {playerStats && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                  {playerStats.avatar && (
                    <img src={playerStats.avatar} alt="" className="w-16 h-16 rounded-full" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white">{playerStats.username}</h2>
                    <p className="text-sm text-white/50 capitalize">Plateforme: {playerStats.platform}</p>
                  </div>
                </div>

                {playerStats.ranks?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Rangs</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {playerStats.ranks.map((rank, i) => (
                        <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-sm font-bold text-white">{rank.playlist}</p>
                          <p className="text-cyan-400">{rank.rank} {rank.tier}</p>
                          {rank.division && <p className="text-xs text-white/50">{rank.division}</p>}
                          {rank.rating > 0 && <p className="text-xs text-white/40">MMR: {rank.rating}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Item Database */}
        {tab === "database" && !loading && (
          <div>
            <div className="flex gap-2 mb-6 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchDb(1, dbSearch, rarityFilter)}
                  placeholder="Rechercher un objet..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30"
                />
              </div>
              <select
                value={rarityFilter}
                onChange={(e) => { setRarityFilter(e.target.value); fetchDb(1, dbSearch, e.target.value); }}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              >
                <option value="all" className="bg-[#0a0f1a]">Toutes raretés</option>
                <option value="common" className="bg-[#0a0f1a]">Common</option>
                <option value="rare" className="bg-[#0a0f1a]">Rare</option>
                <option value="very_rare" className="bg-[#0a0f1a]">Very Rare</option>
                <option value="import" className="bg-[#0a0f1a]">Import</option>
                <option value="exotic" className="bg-[#0a0f1a]">Exotic</option>
                <option value="black_market" className="bg-[#0a0f1a]">Black Market</option>
              </select>
              <button
                onClick={() => fetchDb(1, dbSearch, rarityFilter)}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition"
              >
                Rechercher
              </button>
            </div>

            {dbItems.length === 0 ? (
              <div className="text-center py-20 text-white/40">
                <p>Aucun résultat.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {dbItems.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl border overflow-hidden"
                      style={{ borderColor: item.rarityColor + "40", background: item.rarityColor + "10" }}
                    >
                      <div className="aspect-square flex items-center justify-center" style={{ background: item.rarityColor + "15" }}>
                        {item.img ? (
                          <img src={item.img} alt={item.name} loading="lazy" className="max-w-full max-h-full object-contain p-2" />
                        ) : (
                          <Package className="w-8 h-8 text-white/20" />
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        <p className="text-[10px] capitalize" style={{ color: item.rarityColor }}>{item.rarity?.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => fetchDb(dbPage - 1)}
                    disabled={dbPage <= 1}
                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-white/60">Page {dbPage} — {dbTotal} résultats</span>
                  <button
                    onClick={() => fetchDb(dbPage + 1)}
                    disabled={!dbHasMore}
                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}