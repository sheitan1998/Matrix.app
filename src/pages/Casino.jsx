import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "@/components/NotificationBell";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { base44 } from "@/api/base44Client";
import RouletteGame from "@/components/casino/RouletteGame";
import SlotsGame from "@/components/casino/SlotsGame";
import BingoGame from "@/components/casino/BingoGame";
import BlackjackGame from "@/components/casino/BlackjackGame";
import CasinoLeaderboard from "@/components/casino/CasinoLeaderboard";
import LottoGame from "@/components/casino/LottoGame";
import PokerGame from "@/components/casino/PokerGame";
import CasinoHome from "@/components/casino/CasinoHome";
import CasinoShop from "@/pages/casino/CasinoShop";
import CasinoProfile from "@/pages/casino/CasinoProfile";
import TrixCounter from "@/components/casino/TrixCounter";
import { motion, AnimatePresence } from "framer-motion";

const GAME_META = {
  slots:       { label: "DIAMOND SLOTS",     color: "#8866ff", emoji: "💎" },
  blackjack:   { label: "BLACKJACK",          color: "#ffd700", emoji: "🃏" },
  roulette:    { label: "ROULETTE",           color: "#ff2020", emoji: "🎡" },
  bingo:       { label: "BINGO",              color: "#ffaa00", emoji: "🎱" },
  lotto:       { label: "LOTO",               color: "#ffd700", emoji: "🎰" },
  poker:       { label: "POKER",              color: "#00ff88", emoji: "♠️" },
  leaderboard: { label: "TOP LEAGUE",         color: "#ffd700", emoji: "🏆" },
};

// Casino coins are SEPARATE from Trix (streaming currency)
const CASINO_BALANCE_KEY = "matrix_casino_coins";
function useCasinoCoins() {
  const [coins, setCoinsState] = React.useState(() => {
    const s = localStorage.getItem(CASINO_BALANCE_KEY);
    return s ? parseInt(s, 10) : 5000;
  });
  const setCoins = React.useCallback((valOrFn) => {
    setCoinsState(prev => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      localStorage.setItem(CASINO_BALANCE_KEY, String(next));
      return next;
    });
  }, []);
  return [coins, setCoins];
}

// Global jackpot — stored in ServerMessage entity for all users, resets to 0 on win
function useJackpot() {
  const [jackpot, setJackpotState] = React.useState(1000000);
  const [loaded, setLoaded] = React.useState(false);

  // Load jackpot from shared entity on mount
  React.useEffect(() => {
    base44.entities.ServerMessage.filter({ server_id: "casino_jackpot", channel_id: "global" }, "-created_date", 1)
      .then(msgs => {
        if (msgs.length > 0) {
          try {
            const data = JSON.parse(msgs[0].content);
            setJackpotState(data.amount || 1000000);
          } catch { setJackpotState(1000000); }
        } else {
          base44.entities.ServerMessage.create({
            server_id: "casino_jackpot", channel_id: "global",
            author_email: "system", author_name: "System",
            content: JSON.stringify({ amount: 1000000 }), type: "system"
          }).catch(() => {});
        }
        setLoaded(true);
      }).catch(() => setLoaded(true));
  }, []);

  const saveJackpot = React.useCallback(async (amount) => {
    const msgs = await base44.entities.ServerMessage.filter({ server_id: "casino_jackpot", channel_id: "global" }, "-created_date", 1);
    if (msgs.length > 0) {
      await base44.entities.ServerMessage.update(msgs[0].id, { content: JSON.stringify({ amount }) });
    } else {
      await base44.entities.ServerMessage.create({
        server_id: "casino_jackpot", channel_id: "global",
        author_email: "system", author_name: "System",
        content: JSON.stringify({ amount }), type: "system"
      });
    }
  }, []);

  // Grow jackpot continuously
  React.useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => {
      setJackpotState(j => {
        const next = j + Math.floor(Math.random() * 500 + 100);
        return next;
      });
    }, 500);
    return () => clearInterval(t);
  }, [loaded]);

  // Save jackpot periodically
  React.useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => {
      setJackpotState(j => { saveJackpot(j).catch(() => {}); return j; });
    }, 5000);
    return () => clearInterval(t);
  }, [loaded, saveJackpot]);

  const winJackpot = React.useCallback(() => {
    let amount = 0;
    setJackpotState(j => { amount = j; return 0; });
    saveJackpot(0).catch(() => {});
    return amount;
  }, [saveJackpot]);
  return [jackpot, winJackpot];
}

export default function Casino() {
  const [screen, setScreen] = useState("home"); // "home" | game key
  const [showShop, setShowShop] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const { addTransaction } = useWallet(); // Trix = streaming only
  const [casinoCoins, setCasinoCoins] = useCasinoCoins(); // Casino-specific coins
  const [jackpot, winJackpot] = useJackpot();
  const [lightPhase, setLightPhase] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setLightPhase(p => (p + 1) % 12), 120);
    return () => clearInterval(t);
  }, []);

  // Profile screen
  if (showProfile) {
    return <CasinoProfile onBack={() => setShowProfile(false)} />;
  }

  // Home screen — delegated to CasinoHome
  if (screen === "home") {
    return (
      <CasinoHome
        balance={casinoCoins}
        jackpot={jackpot}
        onSelectGame={(key) => setScreen(key)}
        onShop={() => setShowShop(true)}
        onProfile={() => setShowProfile(true)}
      />
    );
  }

  const meta = GAME_META[screen] || GAME_META.slots;

  return (
    <div className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #080015 0%, #0f0028 50%, #080015 100%)" }}>

      {/* === HEADER === */}
      <div className="sticky top-0 z-40 backdrop-blur-xl"
        style={{
          background: "linear-gradient(180deg, rgba(15,0,35,0.98), rgba(8,0,20,0.95))",
          borderBottom: "2px solid rgba(136,68,255,0.25)",
          boxShadow: "0 4px 30px rgba(100,40,255,0.12)"
        }}>
        {/* Top neon strip */}
        <div className="h-1.5 flex overflow-hidden">
          {Array.from({ length: 36 }).map((_, i) => {
            const colors = ["#ff00ff", "#8844ff", "#0088ff", "#ff0088", "#ffcc00", "#00ffcc"];
            const active = i % 6 === lightPhase % 6;
            return (
              <div key={i} className="flex-1 transition-all duration-100"
                style={{ background: active ? colors[i % 6] : "rgba(255,255,255,0.05)", boxShadow: active ? `0 0 5px ${colors[i % 6]}` : "none" }} />
            );
          })}
        </div>

        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => setScreen("home")} className="text-white/60 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Game title */}
          <div className="flex items-center gap-2">
            <span className="text-xl" style={{ filter: `drop-shadow(0 0 6px ${meta.color})` }}>{meta.emoji}</span>
            <span className="font-black text-base tracking-wider"
              style={{ color: meta.color, textShadow: `0 0 10px ${meta.color}80`, fontFamily: "'Arial Black', sans-serif" }}>
              {meta.label}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {user && <NotificationBell user={user} />}
            <button onClick={() => setShowProfile(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold"
              style={{ borderColor: "rgba(136,68,255,0.3)", color: "#aa88ff", background: "rgba(100,40,255,0.1)" }}>
              👤
            </button>
            <button onClick={() => setShowShop(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold font-mono"
              style={{ borderColor: "rgba(255,215,0,0.3)", color: "#ffd700", background: "rgba(255,215,0,0.08)" }}>
              {casinoCoins.toLocaleString()} 🪙
            </button>
          </div>
        </div>

        {/* Bottom neon strip */}
        <div className="h-0.5 flex overflow-hidden">
          {Array.from({ length: 36 }).map((_, i) => {
            const colors = ["#00ffcc", "#0088ff", "#ff0088", "#aa44ff"];
            const active = i % 4 === (lightPhase + 2) % 4;
            return (
              <div key={i} className="flex-1 transition-all duration-100"
                style={{ background: active ? colors[i % 4] : "transparent" }} />
            );
          })}
        </div>
      </div>

      {/* Responsible gaming */}
      <div className="px-4 py-1.5 text-center text-[10px] font-semibold"
        style={{ background: "rgba(255,215,0,0.05)", color: "rgba(255,200,0,0.5)", borderBottom: "1px solid rgba(255,215,0,0.1)" }}>
        ⚠️ Jeu fictif — Aucun argent réel — 18+ uniquement
      </div>

      {/* === GAME AREA === */}
      <div className="px-3 pb-28 pt-4">
        <AnimatePresence mode="wait">
          <motion.div key={screen}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #0e001e 0%, #180035 60%, #0e001e 100%)",
              border: `2px solid ${meta.color}25`,
              boxShadow: `0 0 50px rgba(0,0,0,0.8), 0 0 25px ${meta.color}08`
            }}>
            <div className="p-4 sm:p-6">
              {screen === "slots"       && <SlotsGame balance={casinoCoins} setBalance={setCasinoCoins} accentColor={meta.color} addTransaction={addTransaction} jackpot={jackpot} winJackpot={winJackpot} />}
              {screen === "blackjack"   && <BlackjackGame balance={casinoCoins} setBalance={setCasinoCoins} accentColor={meta.color} jackpot={jackpot} winJackpot={winJackpot} />}
              {screen === "roulette"    && <RouletteGame balance={casinoCoins} setBalance={setCasinoCoins} accentColor={meta.color} jackpot={jackpot} winJackpot={winJackpot} />}
              {screen === "bingo"       && <BingoGame balance={casinoCoins} setBalance={setCasinoCoins} accentColor={meta.color} jackpot={jackpot} winJackpot={winJackpot} />}
              {screen === "lotto"       && <LottoGame balance={casinoCoins} setBalance={setCasinoCoins} addTransaction={addTransaction} />}
              {screen === "poker"       && <PokerGame balance={casinoCoins} setBalance={setCasinoCoins} addTransaction={addTransaction} />}
              {screen === "leaderboard" && <CasinoLeaderboard accentColor={meta.color} currentUserBalance={casinoCoins} />}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Quick nav back */}
        <button onClick={() => setScreen("home")}
          className="mt-4 w-full py-3 rounded-2xl font-bold text-sm text-center transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#666" }}>
          ← Retour à l'accueil Casino
        </button>
      </div>

      {showShop && <CasinoShop balance={casinoCoins} setBalance={setCasinoCoins} onClose={() => setShowShop(false)} />}
    </div>
  );
}