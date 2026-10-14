import React, { useState, useCallback } from "react";
import { Search, Loader2, ShoppingBag, Trophy, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PLATFORMS = [
  { id: "epic", label: "Epic" },
  { id: "steam", label: "Steam" },
  { id: "psn", label: "PSN" },
  { id: "xbox", label: "Xbox" },
];

export default function RocketLeague() {
  const [tab, setTab] = useState("shop");
  const [loading, setLoading] = useState(false);
  const [shopCategories, setShopCategories] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [platform, setPlatform] = useState("epic");
  const [gamertag, setGamertag] = useState("");
  const [playerStats, setPlayerStats] = useState(null);
  const [statsError, setStatsError] = useState("");

  const fetchShop = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("rocketLeagueApi", { action: "getItemShop" });
      setShopCategories((res.data || res).categories || []);
    } catch {
      setShopCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDb = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("rocketLeagueApi", { action: "searchItems" });
      setDbCategories((res.data || res).categories || []);
    } catch {
      setDbCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (tab === "shop" && shopCategories.length === 0) fetchShop();
    if (tab === "database" && dbCategories.length === 0) fetchDb();
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
            {shopCategories.length === 0 ? (
              <div className="text-center py-20 text-white/40">
                <p>Catégories indisponibles temporairement.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {shopCategories.map((cat, i) => (
                  <a
                    key={i}
                    href={cat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition"
                  >
                    <ShoppingBag className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-sm font-bold text-white">{cat.label}</span>
                  </a>
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
            {dbCategories.length === 0 ? (
              <div className="text-center py-20 text-white/40">
                <p>Catégories indisponibles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {dbCategories.map((cat, i) => (
                  <a
                    key={i}
                    href={cat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition"
                  >
                    <Package className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-sm font-bold text-white">{cat.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}