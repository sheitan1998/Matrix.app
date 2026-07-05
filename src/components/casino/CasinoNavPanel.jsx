import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, History as HistoryIcon, Star, Trophy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { GAMES } from "./casinoData";
import { formatTimeAgo } from "@/lib/format";

const FAV_KEY = "matrix_casino_favorites";

export function toggleFavorite(gameKey) {
  const favs = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  const idx = favs.indexOf(gameKey);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(gameKey);
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  return favs;
}

export function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; }
}

export default function CasinoNavPanel({ type, onClose, onPlayGame }) {
  const [favorites, setFavorites] = useState(getFavorites());
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (type === "history") {
      (async () => {
        try {
          const me = await base44.auth.me();
          if (me) {
            const txs = await base44.entities.WalletTransaction.filter(
              { user_email: me.email, universe: "casino" },
              "-created_date",
              30
            );
            setHistory(txs);
          }
        } catch (e) {}
      })();
    }
  }, [type]);

  const favoriteGames = GAMES.filter(g => favorites.includes(g.key));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.8)" }}
        onClick={onClose}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(160deg, rgba(14,0,30,0.95), rgba(18,0,40,0.95))", border: "1px solid rgba(168,85,247,0.2)" }}
          onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {type === "favorites" ? (
              <Heart className="w-5 h-5" style={{ color: "#ef4444" }} />
            ) : (
              <HistoryIcon className="w-5 h-5" style={{ color: "#a855f7" }} />
            )}
            <h2 className="font-black text-lg text-white">
              {type === "favorites" ? "Mes Favoris" : "Historique"}
            </h2>
            <button onClick={onClose} className="ml-auto text-white/40 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 max-h-[60vh] overflow-y-auto scrollbar-thin">
            {type === "favorites" && (
              favoriteGames.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-white/40">
                  <Heart className="w-10 h-10 opacity-20" />
                  <p className="text-sm">Aucun jeu favori pour le moment</p>
                  <p className="text-xs text-white/30">Clique sur l'étoile d'un jeu pour l'ajouter</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {favoriteGames.map(g => (
                    <button key={g.key} onClick={() => { onPlayGame?.(g.key); onClose(); }}
                      className="flex items-center gap-3 p-3 rounded-xl text-left transition hover:bg-white/5"
                      style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                      <img src={g.img} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{g.name}</p>
                        <p className="text-[10px] text-white/40">{g.provider}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}

            {type === "history" && (
              history.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-white/40">
                  <HistoryIcon className="w-10 h-10 opacity-20" />
                  <p className="text-sm">Aucun historique de jeu</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: tx.amount > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)" }}>
                        {tx.amount > 0
                          ? <Trophy className="w-4 h-4 text-green-400" />
                          : <HistoryIcon className="w-4 h-4 text-red-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{tx.description || tx.type}</p>
                        <p className="text-[10px] text-white/40">{formatTimeAgo(tx.created_date)}</p>
                      </div>
                      <span className="text-sm font-mono font-bold" style={{ color: tx.amount > 0 ? "#22c55e" : "#ef4444" }}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}