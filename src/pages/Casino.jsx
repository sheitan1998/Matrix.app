import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useWallet } from "@/hooks/useWallet";
import { ArrowLeft, Trophy, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useCasinoJackpot, casinoGetBalance } from "@/hooks/useCasinoJackpot";

import RouletteGame from "@/components/casino/RouletteGame";
import SlotsGame from "@/components/casino/SlotsGame";
import BingoGame from "@/components/casino/BingoGame";
import BlackjackGame from "@/components/casino/BlackjackGame";
import CasinoLeaderboard from "@/components/casino/CasinoLeaderboard";
import LottoGame from "@/components/casino/LottoGame";
import PokerGame from "@/components/casino/PokerGame";
import BaccaratGame from "@/components/casino/BaccaratGame";
import CasinoShop from "@/pages/casino/CasinoShop";
import CasinoProfile from "@/pages/casino/CasinoProfile";
import VIPClubPage from "@/pages/casino/VIPClubPage";

import CasinoBackground from "@/components/casino/CasinoBackground";
import CasinoSidebar from "@/components/casino/CasinoSidebar";
import CasinoTopbar from "@/components/casino/CasinoTopbar";
import JackpotBanner from "@/components/casino/JackpotBanner";
import CasinoCategoryFilters from "@/components/casino/CasinoCategoryFilters";
import CasinoGameCard from "@/components/casino/CasinoGameCard";
import CasinoLiveSection from "@/components/casino/CasinoLiveSection";
import CasinoTournaments from "@/components/casino/CasinoTournaments";
import CasinoRecentWinners from "@/components/casino/CasinoRecentWinners";
import CasinoLeaderboards from "@/components/casino/CasinoLeaderboards";
import CasinoVIPClub from "@/components/casino/CasinoVIPClub";
import CasinoPromotions from "@/components/casino/CasinoPromotions";
import CasinoQuests from "@/components/casino/CasinoQuests";
import CasinoAchievements from "@/components/casino/CasinoAchievements";
import CasinoSettings from "@/components/casino/CasinoSettings";
import CasinoSecurityBar from "@/components/casino/CasinoSecurityBar";
import CasinoNavPanel from "@/components/casino/CasinoNavPanel";
import { GAMES, VIP_TIERS } from "@/components/casino/casinoData";

const GAME_META = {
  slots:       { label: "DIAMOND SLOTS", color: "#8866ff", emoji: "💎" },
  blackjack:   { label: "BLACKJACK", color: "#ffd700", emoji: "🃏" },
  roulette:    { label: "ROULETTE", color: "#ff2020", emoji: "🎡" },
  bingo:       { label: "BINGO", color: "#ffaa00", emoji: "🎱" },
  lotto:       { label: "LOTO", color: "#ffd700", emoji: "🎰" },
  poker:       { label: "POKER", color: "#00ff88", emoji: "♠️" },
  baccarat:    { label: "BACCARAT PRO", color: "#a855f7", emoji: "🎴" },
  leaderboard: { label: "TOP LEAGUE", color: "#ffd700", emoji: "🏆" },
};

const CASINO_BALANCE_KEY = "matrix_casino_coins";
function useCasinoCoins() {
  const [coins, setCoinsState] = useState(() => {
    const s = localStorage.getItem(CASINO_BALANCE_KEY);
    return s ? parseInt(s, 10) : 5000;
  });

  // Sync from server on mount
  useEffect(() => {
    casinoGetBalance()
      .then(serverBalance => {
        setCoinsState(serverBalance);
        localStorage.setItem(CASINO_BALANCE_KEY, String(serverBalance));
      })
      .catch(() => {});
  }, []);

  const setCoins = useCallback((valOrFn) => {
    setCoinsState(prev => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      localStorage.setItem(CASINO_BALANCE_KEY, String(next));
      return next;
    });
  }, []);
  return [coins, setCoins];
}

export default function Casino() {
  const [screen, setScreen] = useState("home");
  const [showShop, setShowShop] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVipClub, setShowVipClub] = useState(false);
  const [navPanel, setNavPanel] = useState(null); // "favorites" | "history" | null
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState("home");
  const [category, setCategory] = useState("all");
  const { addTransaction } = useWallet();
  const [casinoCoins, setCasinoCoins] = useCasinoCoins();
  const { jackpot } = useCasinoJackpot();
  const [settings, setSettings] = useState({ bgVariant: "space", accent: "#a855f7", glow: true, particles: true, animations: true });

  const vipTier = [...VIP_TIERS].reverse().find(t => casinoCoins >= t.min) || VIP_TIERS[0];

  // Profile screen
  if (showProfile) return <CasinoProfile onBack={() => setShowProfile(false)} />;

  // VIP Club screen
  if (showVipClub) return <VIPClubPage coins={casinoCoins} onBack={() => setShowVipClub(false)} />;

  // Game screen — premium wrapper around existing game components
  const meta = GAME_META[screen];
  if (meta) {
    return (
      <div className="min-h-screen relative">
        <CasinoBackground variant={settings.bgVariant} />
        <div className="relative z-10">
          {/* Game header */}
          <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
            style={{ background: "rgba(8,8,12,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition tap-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Retour</span>
            </Link>
            <button onClick={() => setScreen("home")} className="flex items-center gap-2 text-white/60 hover:text-white transition ml-1 px-2 py-1 rounded-lg hover:bg-white/5 tap-sm">
              <Home className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Accueil</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg" style={{ filter: `drop-shadow(0 0 6px ${meta.color})` }}>{meta.emoji}</span>
              <span className="font-black text-sm tracking-wider" style={{ color: meta.color, textShadow: `0 0 10px ${meta.color}80` }}>
                {meta.label}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 h-8 rounded-lg" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
                <span className="text-xs font-mono font-bold" style={{ color: "#fbbf24" }}>{casinoCoins.toLocaleString()}</span>
              </div>
              <button onClick={() => setShowShop(true)} className="h-8 px-3 rounded-lg text-xs font-bold text-white transition"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
                Boutique
              </button>
            </div>
          </div>

          {/* Responsible gaming */}
          <div className="px-4 py-1.5 text-center text-[10px] font-semibold"
            style={{ background: "rgba(251,191,36,0.04)", color: "rgba(251,191,36,0.4)", borderBottom: "1px solid rgba(251,191,36,0.08)" }}>
            ⚠️ Jeu fictif — Aucun argent réel — 18+ uniquement
          </div>

          <div className="px-3 py-4 pb-12">
            <AnimatePresence mode="wait">
              <motion.div key={screen}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: "linear-gradient(160deg, rgba(14,0,30,0.6), rgba(18,0,40,0.4), rgba(14,0,30,0.6))", border: `1px solid ${meta.color}20`, boxShadow: `0 0 40px rgba(0,0,0,0.5)` }}>
                <div className="p-4 sm:p-6">
                  {screen === "slots" && <SlotsGame balance={casinoCoins} setBalance={setCasinoCoins} accentColor={meta.color} addTransaction={addTransaction} jackpot={jackpot} />}
                  {screen === "blackjack" && <BlackjackGame balance={casinoCoins} setBalance={setCasinoCoins} accentColor={meta.color} jackpot={jackpot} />}
                  {screen === "roulette" && <RouletteGame balance={casinoCoins} setBalance={setCasinoCoins} accentColor={meta.color} jackpot={jackpot} />}
                  {screen === "bingo" && <BingoGame balance={casinoCoins} setBalance={setCasinoCoins} accentColor={meta.color} jackpot={jackpot} />}
                  {screen === "lotto" && <LottoGame balance={casinoCoins} setBalance={setCasinoCoins} addTransaction={addTransaction} />}
                  {screen === "poker" && <PokerGame balance={casinoCoins} setBalance={setCasinoCoins} addTransaction={addTransaction} />}
                  {screen === "baccarat" && <BaccaratGame balance={casinoCoins} setBalance={setCasinoCoins} accentColor={meta.color} jackpot={jackpot} addTransaction={addTransaction} />}
                  {screen === "leaderboard" && <CasinoLeaderboard accentColor={meta.color} currentUserBalance={casinoCoins} />}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {showShop && <CasinoShop balance={casinoCoins} setBalance={setCasinoCoins} onClose={() => setShowShop(false)} />}
      </div>
    );
  }

  // === HOME (premium casino lobby) ===
  const filteredGames = GAMES.filter(g => {
    if (category === "all") return true;
    if (category === "new") return g.badge === "new";
    if (category === "hot") return g.isHot;
    if (category === "jackpot") return g.badge === "jackpot";
    if (category === "live") return g.badge === "live";
    if (category === "cards") return g.category === "cards";
    if (category === "slots") return g.category === "slots";
    if (category === "roulette") return g.category === "roulette";
    if (category === "poker") return g.category === "poker";
    if (category === "blackjack") return g.key === "blackjack";
    return true;
  });

  const handleSidebarSelect = (target, gameKey) => {
    setActiveSidebar(target);
    if (target === "home") { setScreen("home"); return; }
    if (target === "favorites") { setNavPanel("favorites"); return; }
    if (target === "history") { setNavPanel("history"); return; }
    if (target === "vip") { setShowVipClub(true); return; }
    if (gameKey && GAME_META[gameKey]) { setScreen(gameKey); }
    else if (gameKey && !GAME_META[gameKey]) {
      if (gameKey === "crash" || gameKey === "mines" || gameKey === "dice") setScreen("slots");
    }
  };

  return (
    <div className="min-h-screen relative">
      <CasinoBackground variant={settings.bgVariant} />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <CasinoSidebar
          active={activeSidebar}
          onSelect={handleSidebarSelect}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(v => !v)}
          coins={casinoCoins}
          vipTier={vipTier}
        />

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">
          <CasinoTopbar
            balance={casinoCoins}
            onVipClub={() => setShowVipClub(true)}
            onSettings={() => setShowSettings(true)}
          />

          {/* Responsible gaming strip */}
          <div className="px-4 py-1 text-center text-[10px] font-medium"
            style={{ background: "rgba(251,191,36,0.03)", color: "rgba(251,191,36,0.35)" }}>
            ⚠️ Jeu fictif — Aucun argent réel — 18+ uniquement
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-4 lg:p-6 space-y-8 max-w-7xl mx-auto pb-12">

              {/* Jackpot Banner */}
              <JackpotBanner jackpot={jackpot} onViewJackpots={() => setScreen("slots")} />

              {/* Category Filters */}
              <CasinoCategoryFilters active={category} onSelect={setCategory} />

              {/* Game grid */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-white">Jeux</h3>
                  <span className="text-xs text-white/40">{filteredGames.length} jeux</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredGames.map((g, i) => (
                    <CasinoGameCard key={g.key} game={g} delay={i * 0.04}
                      onPlay={(key) => { if (GAME_META[key]) setScreen(key); }} />
                  ))}
                </div>
              </section>

              {/* Two-column: Live + Winners */}
              <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
                <CasinoLiveSection onJoin={() => setScreen("roulette")} />
                <CasinoRecentWinners />
              </div>

              {/* Tournaments + Leaderboards */}
              <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
                <CasinoTournaments onParticipate={() => setScreen("leaderboard")} />
                <div className="rounded-2xl p-5" style={{ background: "rgba(12,12,16,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <CasinoLeaderboards />
                </div>
              </div>

              {/* VIP Club */}
              <CasinoVIPClub coins={casinoCoins} />

              {/* Promotions */}
              <CasinoPromotions />

              {/* Quests + Achievements */}
              <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
                <CasinoQuests />
                <CasinoAchievements />
              </div>

              {/* Security bar */}
              <CasinoSecurityBar />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showShop && <CasinoShop balance={casinoCoins} setBalance={setCasinoCoins} onClose={() => setShowShop(false)} />}
      {navPanel && <CasinoNavPanel type={navPanel} onClose={() => setNavPanel(null)} onPlayGame={(key) => { if (GAME_META[key]) setScreen(key); }} />}
      <CasinoSettings open={showSettings} onClose={() => setShowSettings(false)} settings={settings} onChange={setSettings} />
    </div>
  );
}