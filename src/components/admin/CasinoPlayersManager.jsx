import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle, RotateCcw, Users } from "lucide-react";
import { toast } from "sonner";
import CasinoToken from "@/components/casino/CasinoToken";
import { formatBet } from "@/components/casino/slotThemes";

export default function CasinoPlayersManager() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(null);
  const [resettingAll, setResettingAll] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);

  const loadPlayers = useCallback(async () => {
    try {
      const records = await base44.entities.CasinoPlayer.filter({}, { sort: '-total_won', limit: 100 });
      setPlayers(records.items || records || []);
    } catch {
      toast.error("Erreur lors du chargement des joueurs");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadPlayers(); }, [loadPlayers]);

  const resetPlayer = async (playerId, email) => {
    setResetting(playerId);
    try {
      await base44.entities.CasinoPlayer.update(playerId, {
        balance: 5000,
        total_won: 0,
        total_wagered: 0,
        total_bets: 0,
        biggest_win: 0,
        won_24h: 0,
        jackpot_wins: 0,
      });
      toast.success(`Gains de ${email} réinitialisés`);
      loadPlayers();
    } catch {
      toast.error("Erreur lors de la réinitialisation");
    }
    setResetting(null);
  };

  const resetAllPlayers = async () => {
    setResettingAll(true);
    try {
      await base44.entities.CasinoPlayer.updateMany({}, {
        $set: {
          balance: 5000,
          total_won: 0,
          total_wagered: 0,
          total_bets: 0,
          biggest_win: 0,
          won_24h: 0,
          jackpot_wins: 0,
        }
      });
      toast.success("Tous les gains casino ont été réinitialisés");
      setConfirmAll(false);
      loadPlayers();
    } catch {
      toast.error("Erreur lors de la réinitialisation globale");
    }
    setResettingAll(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Gestion des Gains Casino</h3>
          <p className="text-[10px] text-white/40">{players.length} joueur(s) enregistré(s)</p>
        </div>
        <button
          onClick={() => setConfirmAll(true)}
          disabled={resettingAll || players.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white transition hover:opacity-90 disabled:opacity-40 tap-sm"
          style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
        >
          {resettingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          Réinitialiser TOUS les gains
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "rgba(15,10,25,0.6)" }}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
                <th className="text-left px-4 py-3 text-[10px] font-black text-white/50 uppercase tracking-wider">Joueur</th>
                <th className="text-right px-4 py-3 text-[10px] font-black text-white/50 uppercase tracking-wider">Solde</th>
                <th className="text-right px-4 py-3 text-[10px] font-black text-white/50 uppercase tracking-wider">Gains</th>
                <th className="text-right px-4 py-3 text-[10px] font-black text-white/50 uppercase tracking-wider">Parties</th>
                <th className="text-right px-4 py-3 text-[10px] font-black text-white/50 uppercase tracking-wider">Misé</th>
                <th className="text-right px-4 py-3 text-[10px] font-black text-white/50 uppercase tracking-wider">Plus gros gain</th>
                <th className="text-center px-4 py-3 text-[10px] font-black text-white/50 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/30 text-xs">Aucun joueur enregistré</td>
                </tr>
              ) : players.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3">
                    <p className="text-xs font-bold text-white">{p.pseudo || p.user_email}</p>
                    <p className="text-[9px] text-white/30">{p.user_email}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <CasinoToken size={14} />
                      <span className="text-xs font-mono font-black" style={{ color: "#C5A059" }}>{formatBet(p.balance || 0)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-mono font-bold text-green-400">{formatBet(p.total_won || 0)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-mono text-white/60">{p.total_bets || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-mono text-white/40">{formatBet(p.total_wagered || 0)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-mono text-white/40">{formatBet(p.biggest_win || 0)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => resetPlayer(p.id, p.user_email)}
                      disabled={resetting === p.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white/70 hover:text-white transition tap-sm"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
                    >
                      {resetting === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                      Reset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmAll && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setConfirmAll(false)}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "rgba(15,10,25,0.95)", border: "1px solid rgba(239,68,68,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }}>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Réinitialiser TOUS les gains</h3>
                <p className="text-[10px] text-white/40">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-xs text-white/60 mb-5">
              Tous les soldes et gains de casino de tous les joueurs seront remis à zéro. Les statistiques de parties et gains cumulés seront effacées.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmAll(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white/60 transition hover:text-white tap-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Annuler
              </button>
              <button
                onClick={resetAllPlayers}
                disabled={resettingAll}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-black text-white transition hover:opacity-90 tap-sm"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
              >
                {resettingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" /> : null}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}