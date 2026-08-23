import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

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
import CasinoLobby from "@/components/casino/CasinoLobby";
import SlotWorldsGrid from "@/components/casino/SlotWorldsGrid";
import SlotMachineSelect from "@/components/casino/SlotMachineSelect";
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
  const [slotView, setSlotView] = useState(null); // null | "worlds" | "machines"
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [slotThemeId, setSlotThemeId] = useState(null);
  const [casinoCoins, setCasinoCoins] = useCasinoCoins();
  const { jackpot } = useCasinoJackpot();
  const [settings, setSettings] = useState({ bgVariant: "space", accent: "#a855f7", glow: true, particles: true, animations: true });

  const vipTier = [...VIP_TIERS].reverse().find(t => casinoCoins >= t.min) || VIP_TIERS[0];

  // Profile screen
  if (showProfile) return <CasinoProfile onBack={() => setShowProfile(false)} />;

  // VIP Club screen
  if (showVipClub) return <VIPClubPage coins={casinoCoins} onBack={() => setShowVipClub(false)} />;

  // Slot worlds grid — choosing which slot world to play
  if (slotView === "worlds") {
    return (
      <SlotWorldsGrid
        balance={casinoCoins}
        onBack={() => setSlotView(null)}
        onSelectWorld={(world) => { setSelectedWorld(world); setSlotView("machines"); }}
      />
    );
  }

  // Slot machine select — choosing which tier machine to play
  if (slotView === "machines" && selectedWorld) {
    return (
      <SlotMachineSelect
        world={selectedWorld}
        balance={casinoCoins}
        onBack={() => setSlotView("worlds")}
        onSelectMachine={() => { setSlotView(null); setSelectedWorld(null); setSlotThemeId(selectedWorld.themeId || null); setScreen("slots"); }}
      />
    );
  }

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
                  {screen === "slots" && <SlotsGame balance={casinoCoins} setBalance={setCasinoCoins} accentColor={meta.color} jackpot={jackpot} themeId={slotThemeId} />}
                  {screen === "blackjack" && <BlackjackGame balance={casinoCoins} setBalance={setCasinoCoins} accentColor={meta.color} jackpot={jackpot} />}
                  {screen === "roulette" && <RouletteGame balance={casinoCoins} setBalance={setCasinoCoins} accentColor={meta.color} jackpot={jackpot} />}
                  {screen === "bingo" && <BingoGame balance={casinoCoins} setBalance={setCasinoCoins} accentColor={meta.color} jackpot={jackpot} />}
                  {screen === "lotto" && <LottoGame balance={casinoCoins} setBalance={setCasinoCoins} />}
                  {screen === "poker" && <PokerGame balance={casinoCoins} setBalance={setCasinoCoins} />}
                  {screen === "baccarat" && <BaccaratGame balance={casinoCoins} setBalance={setCasinoCoins} accentColor={meta.color} jackpot={jackpot} />}
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
      <CasinoLobby
        balance={casinoCoins}
        jackpot={jackpot}
        onPlayGame={(key) => {
          if (key === "slots") { setSlotView("worlds"); return; }
          if (GAME_META[key]) setScreen(key);
        }}
        onShop={() => setShowShop(true)}
        onProfile={() => setShowProfile(true)}
        onVipClub={() => setShowVipClub(true)}
      />

      {/* Modals */}
      {showShop && <CasinoShop balance={casinoCoins} setBalance={setCasinoCoins} onClose={() => setShowShop(false)} />}
      {navPanel && <CasinoNavPanel type={navPanel} onClose={() => setNavPanel(null)} onPlayGame={(key) => { if (GAME_META[key]) setScreen(key); }} />}
      <CasinoSettings open={showSettings} onClose={() => setShowSettings(false)} settings={settings} onChange={setSettings} />
    </div>
  );
}