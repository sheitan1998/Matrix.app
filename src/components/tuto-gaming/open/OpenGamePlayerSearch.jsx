import React, { useState } from "react";
import { Search, Loader2, UserRound } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CLIENT_GAMES, fetchOpenPlayerClient } from "@/lib/openGameClient";

export default function OpenGamePlayerSearch({ slug, accent, hint }) {
  const [query, setQuery] = useState("");
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setError(null);
    setPlayer(null);
    try {
      if (CLIENT_GAMES.has(slug)) {
        setPlayer(await fetchOpenPlayerClient(slug, query.trim()));
        return;
      }
      const res = await base44.functions.invoke("openGameApi", { action: "player", game: slug, query: query.trim() });
      if (res.data?.error) throw new Error(res.data.error);
      setPlayer(res.data.player);
    } catch (err) {
      setError(err?.message || "Profil introuvable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(13,5,24,0.7)", border: `1px solid ${accent}33` }}>
      <div className="flex items-center gap-2 mb-3">
        <UserRound className="w-4 h-4" style={{ color: accent }} />
        <span className="text-[11px] font-black uppercase tracking-wider text-white/70">Suivi joueur</span>
        <span className="text-[9px] text-white/30 ml-auto">Sans connexion ni clé API</span>
      </div>

      <form onSubmit={search} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={hint || "Pseudo / ID public"}
          className="flex-1 h-10 px-3 rounded-lg bg-black/40 text-xs text-white placeholder:text-white/25 outline-none"
          style={{ border: `1px solid ${accent}33` }}
        />
        <button
          type="submit"
          disabled={loading}
          className="h-10 px-4 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 tap-sm"
          style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}55` }}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          Chercher
        </button>
      </form>

      {error && <p className="text-[10px] text-red-400 mt-2">{error}</p>}

      {player && (
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          {player.avatar && (
            <img src={player.avatar} alt={player.name} className="w-12 h-12 rounded-lg object-cover" />
          )}
          <div>
            <p className="text-sm font-black text-white">{player.name}</p>
            <p className="text-[10px] text-white/40">{player.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full mt-2">
            {(player.stats || []).map((s) => (
              <div key={s.label} className="px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-[9px] uppercase tracking-wider text-white/35">{s.label}</p>
                <p className="text-[11px] font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}