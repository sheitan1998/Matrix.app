import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const TABS = ["All-Time", "Weekly", "Today"];
const ROW_BG = ["#b8860b", "#808080", "#8b4513", "#4a3880", "#3a2870", "#2a1860", "#3a2870", "#2a1860", "#3a2870", "#2a1860"];
const RANK_COLORS = ["#ffd700", "#cccccc", "#cd7f32"];

function getRankColor(i) { return i < 3 ? RANK_COLORS[i] : "#9988ff"; }

export default function CasinoLeaderboard({ accentColor, currentUserBalance = 0 }) {
  const [tab, setTab] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  // Fetch real wallet transactions to build leaderboard
  const { data: transactions = [] } = useQuery({
    queryKey: ["leaderboard-transactions", tab],
    queryFn: async () => {
      const all = await base44.entities.WalletTransaction.list("-created_date", 500);
      // Filter by time
      const now = Date.now();
      const cutoff = tab === 1 ? now - 7 * 86400000 : tab === 2 ? now - 86400000 : 0;
      return cutoff > 0 ? all.filter(t => new Date(t.created_date).getTime() > cutoff) : all;
    },
    refetchInterval: 5000,
  });

  // Aggregate winnings per user
  const leaderboard = React.useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "casino_win" && t.amount > 0).forEach(t => {
      if (!map[t.user_email]) map[t.user_email] = { email: t.user_email, total: 0, game: t.description || "Casino" };
      map[t.user_email].total += t.amount;
      map[t.user_email].game = (t.description || "Casino").split(":")[0];
    });
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((p, i) => ({ ...p, rank: i + 1, name: p.email.split("@")[0], avatar: "🎲", color: getRankColor(i) }));
  }, [transactions]);

  // Add current user if not in list
  const displayList = React.useMemo(() => {
    if (!user || currentUserBalance === 0) return leaderboard;
    const inList = leaderboard.find(p => p.email === user.email);
    if (inList) return leaderboard;
    return leaderboard;
  }, [leaderboard, user, currentUserBalance]);

  return (
    <div className="select-none">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-4"
        style={{
          background: "linear-gradient(160deg, #1a0040 0%, #2d0070 50%, #1a0040 100%)",
          border: "2px solid #8844ff60"
        }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          {["🃏","🂡","🂱","🃁"].map((c, i) => (
            <div key={i} className="absolute text-4xl"
              style={{ left: `${i * 25}%`, top: `${10 + (i % 2) * 20}%`, transform: `rotate(${-15 + i * 10}deg)` }}>{c}</div>
          ))}
        </div>

        <div className="relative z-10 p-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "#ff8844" }}>CLASSEMENT EN TEMPS RÉEL</p>
          <p className="font-black text-3xl text-white" style={{ fontFamily: "'Arial Black', sans-serif", textShadow: "0 0 15px rgba(255,255,255,0.3)" }}>
            TOP LEAGUE
          </p>
          <div className="flex justify-center mt-3">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all mx-1"
                style={{
                  background: tab === i ? "linear-gradient(135deg, #ffaa00, #cc7700)" : "rgba(255,255,255,0.08)",
                  color: tab === i ? "#000" : "#888",
                  border: tab === i ? "none" : "1px solid rgba(255,255,255,0.1)"
                }}>
                {t === "All-Time" ? "🏅 All-Time" : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-3 py-1.5 mb-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
        <span className="w-16 text-[10px] font-black uppercase tracking-widest text-purple-400">Place</span>
        <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-purple-400">Joueur</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Gains</span>
      </div>

      {/* Player rows */}
      <div className="space-y-1.5">
        {displayList.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-4xl mb-2">🎲</p>
            <p className="font-bold text-white">Aucun joueur pour le moment</p>
            <p className="text-xs mt-1">Jouez pour apparaître dans le classement !</p>
          </div>
        )}
        <AnimatePresence>
          {displayList.map((p, idx) => (
            <motion.div key={`${p.email}-${tab}`}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              className="flex items-center px-3 py-2.5 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${ROW_BG[idx] || "#2a1860"}cc, ${ROW_BG[idx] || "#2a1860"}88)`,
                border: `1px solid ${p.color}40`,
                outline: p.email === user?.email ? `2px solid ${p.color}` : "none",
              }}>
              <div className="w-16 shrink-0">
                <p className="font-black text-sm" style={{ color: p.color }}>
                  {idx === 0 ? "1er" : idx === 1 ? "2ème" : idx === 2 ? "3ème" : `${idx + 1}ème`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl shrink-0"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${p.color}40, ${p.color}10)`, border: `2px solid ${p.color}60` }}>
                  {p.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm text-white">
                    {p.name}
                    {p.email === user?.email && <span className="ml-1 text-[9px] text-purple-300">(Vous)</span>}
                  </p>
                  <p className="text-[9px] text-purple-300">{p.game}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono font-black text-sm" style={{ color: p.color, textShadow: idx < 3 ? `0 0 8px ${p.color}` : "none" }}>
                  {p.total.toLocaleString()} 🪙
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {displayList.length > 0 && (
        <motion.div
          animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-4 py-3 px-4 rounded-2xl text-center"
          style={{ background: "linear-gradient(135deg, #ffd700, #ff8800)", boxShadow: "0 0 20px #ffd70060" }}>
          <p className="font-black text-xl text-black" style={{ fontFamily: "'Arial Black', sans-serif" }}>
            MONTREZ VOS TALENTS ! 🎲
          </p>
        </motion.div>
      )}
    </div>
  );
}