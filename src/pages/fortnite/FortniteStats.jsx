import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Search,
  Loader2,
  ArrowLeft,
  User,
  Trophy,
  Target,
  Skull,
  Zap,
  Clock,
  TrendingUp,
  Crosshair,
} from "lucide-react";
import usePageSEO from "@/hooks/usePageSEO";

export default function FortniteStats() {
  usePageSEO({
    title: "Statistiques Joueur Fortnite | MATRIX",
    description: "Consultez les statistiques détaillées de n'importe quel joueur Fortnite. K/D, victoires, parties et plus encore.",
    path: "/fortnite-stats",
  });

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
    }
    setLoading(false);
  };

  const all = stats?.stats?.all || {};
  const overall = all.overall || {};
  const account = stats?.account || {};
  const battlePass = stats?.battlePass || {};
  const modes = ["solo", "duo", "squad"].filter((m) => all[m]);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-5xl mx-auto pb-12">
      <Link to="/fortnite-maps" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition mb-5 tap-sm">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-bold">Cartes Fortnite</span>
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <User className="w-5 h-5" style={{ color: "#BF5AF2" }} />
        <h1 className="text-2xl font-black text-white">Statistiques Joueur</h1>
      </div>
      <p className="text-xs text-white/40 mb-4">Recherchez les statistiques de n'importe quel joueur Fortnite</p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
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
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div>
      )}

      {!loading && searched && stats?.error && (
        <div className="text-center py-12">
          <p className="text-sm text-white/40">{stats.error}</p>
        </div>
      )}

      {!loading && stats && !stats.error && (
        <div className="space-y-4">
          {/* Player header */}
          <div
            className="rounded-xl p-5 flex items-center gap-4"
            style={{ background: "rgba(13,5,24,0.6)", border: "1px solid rgba(191,90,242,0.2)" }}
          >
            {account.avatar && <img src={account.avatar} alt={account.name} className="w-16 h-16 rounded-xl" />}
            <div className="flex-1">
              <h2 className="text-xl font-black text-white">{account.name || pseudo}</h2>
              {account.id && <p className="text-[10px] text-white/30 font-mono">{account.id}</p>}
            </div>
            {battlePass?.level && (
              <div className="text-right">
                <p className="text-[9px] text-white/40 uppercase">Passe</p>
                <p className="text-2xl font-black" style={{ color: "#BF5AF2" }}>
                  {battlePass.level}
                </p>
              </div>
            )}
          </div>

          {/* Overall stats */}
          <div>
            <h3 className="text-xs font-black text-white/60 uppercase tracking-wider mb-2">Statistiques globales</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Trophy} label="Victoires" value={overall.wins || 0} color="#22c55e" />
              <StatCard icon={Skull} label="Éliminations" value={overall.kills || 0} color="#ef4444" />
              <StatCard icon={Zap} label="Parties" value={overall.matches || overall.gamesPlayed || 0} color="#f59e0b" />
              <StatCard icon={Target} label="Top 10" value={overall.top10 || overall.top5 || 0} color="#3b82f6" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <MiniStat
                icon={TrendingUp}
                label="K/D"
                value={(overall.kd || overall.kdr || overall.kills / Math.max(overall.matches - overall.wins, 1)).toFixed(2)}
                color="#BF5AF2"
              />
              <MiniStat
                icon={Trophy}
                label="Win Rate"
                value={`${((overall.winRate || (overall.wins / Math.max(overall.matches, 1)) * 100) || 0).toFixed(1)}%`}
                color="#22c55e"
              />
              <MiniStat
                icon={Crosshair}
                label="Score/match"
                value={overall.scorePerMatch?.toFixed?.(0) || overall.scorePerMatch || "—"}
                color="#3b82f6"
              />
              <MiniStat
                icon={Clock}
                label="Score/min"
                value={overall.scorePerMin?.toFixed?.(0) || overall.scorePerMin || "—"}
                color="#f59e0b"
              />
            </div>
          </div>

          {/* Stats by mode */}
          {modes.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-white/60 uppercase tracking-wider mb-2">Stats par mode</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {modes.map((mode) => (
                  <ModeStats key={mode} mode={mode} data={all[mode]} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="rounded-lg p-3 text-center"
      style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${color}30` }}
    >
      <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
      <p className="text-[9px] text-white/40 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-black text-white">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }) {
  return (
    <div
      className="rounded-lg p-3 flex items-center gap-2"
      style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <div>
        <p className="text-[9px] text-white/30 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function ModeStats({ mode, data }) {
  const modeLabels = { solo: "Solo", duo: "Duo", squad: "Section" };
  const kd = data.kd || data.kdr || data.kills / Math.max(data.matches - data.wins, 1);
  const winRate = (data.winRate || (data.wins / Math.max(data.matches, 1)) * 100) || 0;
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(13,5,24,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <h4 className="text-sm font-black text-white mb-3 capitalize">{modeLabels[mode] || mode}</h4>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-white/40">Victoires</span>
          <span className="font-bold text-white">{data.wins || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Éliminations</span>
          <span className="font-bold text-white">{data.kills || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Parties</span>
          <span className="font-bold text-white">{data.matches || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">K/D</span>
          <span className="font-bold text-white">{kd.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40">Win Rate</span>
          <span className="font-bold text-white">{winRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}