import React, { useState, useCallback } from "react";
import { Search, Loader2, ShoppingBag, Trophy, Package, ExternalLink, User } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PLATFORMS = [
  { id: "epic", label: "Epic" },
  { id: "steam", label: "Steam" },
  { id: "psn", label: "PSN" },
  { id: "xbox", label: "Xbox" },
];

const RARITY_COLORS = {
  common: "#9ca3af", uncommon: "#22c55e", rare: "#3b82f6",
  very_rare: "#a855f7", import: "#f59e0b", exotic: "#ec4899",
  black_market: "#1f2937", limited: "#ef4444", premium: "#fbbf24",
};

export default function RocketLeague() {
  const [tab, setTab] = useState("shop");
  const [loading, setLoading] = useState(false);
  const [shopCategories, setShopCategories] = useState([]);
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
            <div className="mb-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <p className="text-sm text-cyan-300">
                Parcourez les catégories d'objets Rocket League. Cliquez sur une catégorie pour accéder au catalogue complet sur RL Garage.
              </p>
            </div>
            {shopCategories.length === 0 ? (
              <div className="text-center py-20 text-white/40">
                <p>Catégories indisponibles temporairement.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {shopCategories.map((cat, i) => (
                  <a
                    key={i}
                    href={cat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition"
                  >
                    <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition">
                      <Package className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className="text-sm font-bold text-white text-center">{cat.label}</span>
                    <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-cyan-400 transition" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats Tracker */}
        {tab === "stats" && !loading && (
          <div className="max-w-3xl">
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
                {/* Profile header */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  {playerStats.avatar ? (
                    <img src={playerStats.avatar} alt="" className="w-16 h-16 rounded-full" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <User className="w-8 h-8 text-cyan-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white">{playerStats.username}</h2>
                    <p className="text-sm text-white/50 capitalize">Plateforme: {playerStats.platform}</p>
                  </div>
                </div>

                {/* Ranked stats */}
                {playerStats.ranks?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Rangs classés</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {playerStats.ranks.map((rank, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition"
                        >
                          <p className="text-sm font-bold text-white mb-1">{rank.playlist}</p>
                          <p className="text-cyan-400 font-bold">{rank.rank}</p>
                          {rank.tier && <p className="text-xs text-white/60">{rank.tier}</p>}
                          {rank.division && <p className="text-xs text-white/50">{rank.division}</p>}
                          {rank.rating > 0 && (
                            <p className="text-xs text-white/40 mt-1">MMR: {rank.rating}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overview stats */}
                {playerStats.overview && Object.keys(playerStats.overview).length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Statistiques générales</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(playerStats.overview).slice(0, 8).map(([key, stat]) => (
                        <div key={key} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-lg font-bold text-white">{stat.value ?? '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}