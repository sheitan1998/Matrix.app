import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, User, Trophy, Target, Skull, Zap } from "lucide-react";

export default function PlayerStatsSearch() {
  const [pseudo, setPseudo] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pseudo.trim()) return;
    setLoading(true);
    setSearched(true);
    setStats(null);
    try {
      const res = await base44.functions.invoke("fortniteApi", {
        action: "getPlayerStats",
        pseudo: pseudo.trim(),
      });
      setStats(res.data);
    } catch {
      setStats({ error: "Erreur lors de la recherche" });
    } finally {
      setLoading(false);
    }
  };

  const allTime = stats?.stats?.all?.overall || stats?.stats?.overall || {};
  const account = stats?.account || {};
  const battlePass = stats?.battlePass || {};

  return (
    <div className="mb-8">
      <h2 className="text-sm font-black text-white uppercase tracking-tight mb-3 flex items-center gap-2">
        <User className="w-4 h-4" style={{ color: "#BF5AF2" }} />
        Statistiques Joueur
      </h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            placeholder="Pseudo Epic Games..."
            className="w-full h-11 px-4 pr-10 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
            style={{ background: "rgba(13,5,24,0.7)", border: "1.5px solid rgba(191,90,242,0.25)" }}
          />
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#BF5AF2" }} />
        </div>
        <button
          type="submit"
          disabled={loading || !pseudo.trim()}
          className="px-5 h-11 rounded-lg text-xs font-black text-white transition hover:opacity-90 disabled:opacity-50 tap-sm"
          style={{ background: "linear-gradient(135deg, #BF5AF2, #7C3AED)" }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Rechercher"}
        </button>
      </form>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div>
      )}

      {!loading && searched && stats?.error && (
        <div className="text-center py-6">
          <p className="text-sm text-white/40">{stats.error}</p>
        </div>
      )}

      {!loading && stats && !stats.error && (
        <div className="rounded-xl p-5" style={{ background: "rgba(13,5,24,0.6)", border: "1px solid rgba(191,90,242,0.2)" }}>
          {/* Player header */}
          <div className="flex items-center gap-3 mb-4">
            {account.avatar && (
              <img src={account.avatar} alt={account.name} className="w-12 h-12 rounded-lg" />
            )}
            <div className="flex-1">
              <h3 className="text-base font-black text-white">{account.name || pseudo}</h3>
              {account.id && <p className="text-[10px] text-white/30 font-mono">{account.id}</p>}
            </div>
            {battlePass?.level && (
              <div className="text-right">
                <p className="text-[9px] text-white/40 uppercase">BP Level</p>
                <p className="text-lg font-black" style={{ color: "#BF5AF2" }}>{battlePass.level}</p>
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Trophy} label="Victoires" value={allTime.wins || 0} color="#22c55e" />
            <StatCard icon={Target} label="Top 10" value={allTime.top10 || allTime.top5 || 0} color="#3b82f6" />
            <StatCard icon={Skull} label="Éliminations" value={allTime.kills || 0} color="#ef4444" />
            <StatCard icon={Zap} label="Parties" value={allTime.matches || allTime.gamesPlayed || 0} color="#f59e0b" />
          </div>

          {/* Additional stats */}
          <div className="mt-3 grid grid-cols-3 gap-3">
            <MiniStat label="KD" value={allTime.kd || allTime.kdr || (allTime.kills / Math.max(allTime.matches - allTime.wins, 1)).toFixed(2)} />
            <MiniStat label="Win Rate" value={`${((allTime.winRate || (allTime.wins / Math.max(allTime.matches, 1)) * 100) || 0).toFixed(1)}%`} />
            <MiniStat label="Score/match" value={allTime.scorePerMatch?.toFixed?.(0) || allTime.scorePerMatch || '—'} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-lg p-3 text-center" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${color}30` }}>
      <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
      <p className="text-[9px] text-white/40 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-black text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-[9px] text-white/30 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-white/70">{value}</p>
    </div>
  );
}