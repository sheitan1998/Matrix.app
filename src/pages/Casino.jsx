import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Home, ShoppingBag, User, Sparkles } from "lucide-react";
import { casinoGetBalance, casinoGetProfile, casinoGetWon24h } from "@/hooks/useCasinoJackpot";
import SlotsGame from "@/components/casino/SlotsGame";
import CasinoToken from "@/components/casino/CasinoToken";
import CasinoShop from "@/pages/casino/CasinoShop";
import CasinoProfile from "@/pages/casino/CasinoProfile";
import { formatBet } from "@/components/casino/slotThemes";
import { toast } from "sonner";
import ThemeSelectionModal from "@/components/casino/ThemeSelectionModal";

const CASINO_BALANCE_KEY = "matrix_casino_coins";
const SLOTS_CARD_IMG = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/62275f2a2_generated_image.png";

function useCasinoCoins() {
  const [coins, setCoinsState] = useState(() => {
    const s = localStorage.getItem(CASINO_BALANCE_KEY);
    return s ? parseInt(s, 10) : 5000;
  });

  useEffect(() => {
    casinoGetBalance().
    then((serverBalance) => {
      setCoinsState(serverBalance);
      localStorage.setItem(CASINO_BALANCE_KEY, String(serverBalance));
    }).
    catch(() => {});
  }, []);

  const setCoins = useCallback((valOrFn) => {
    setCoinsState((prev) => {
      const next = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      localStorage.setItem(CASINO_BALANCE_KEY, String(next));
      return next;
    });
  }, []);
  return [coins, setCoins];
}

export default function Casino() {
  const [screen, setScreen] = useState("home"); // "home" | "slots" | "shop" | "profile"
  const [casinoCoins, setCasinoCoins] = useCasinoCoins();
  const [won24h, setWon24h] = useState(0);
  const [newAchievements, setNewAchievements] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [showThemeSelect, setShowThemeSelect] = useState(false);

  // Fetch 24h gains on mount
  useEffect(() => {
    casinoGetWon24h().then((w) => setWon24h(w)).catch(() => {});
  }, []);

  // Handle payment success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      // Refresh balance from server
      casinoGetBalance().then((b) => setCasinoCoins(b)).catch(() => {});
      setScreen("shop");
      toast.success("Achat réussi ! Vos jetons M ont été crédités.");
      // Clean URL
      window.history.replaceState({}, "", "/casino");
    } else if (params.get("payment") === "cancelled") {
      toast.error("Paiement annulé.");
      window.history.replaceState({}, "", "/casino");
    }
  }, []);

  const handleWin = () => {
    casinoGetWon24h().then((w) => setWon24h(w)).catch(() => {});
  };

  return (
    <div className="min-h-screen relative overflow-hidden select-none"
    style={{ background: "linear-gradient(160deg, #0a050f 0%, #1a0a2e 40%, #2a0a3a 70%, #0a050f 100%)" }}>

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 10%, rgba(139,107,43,0.12), transparent 50%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 80% 80%, rgba(91,44,110,0.2), transparent 50%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(197,160,89,0.05), transparent 70%)" }} />
      </div>

      {/* Floating tokens background */}
      <FloatingTokens />

      {/* Top header bar */}
      <header className="relative z-30 flex items-center justify-between px-4 py-3"
      style={{ background: "rgba(10,5,15,0.7)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(197,160,89,0.15)" }}>
        {/* Left: nav + credits */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition tap-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Retour</span>
          </Link>
          {screen !== "home" &&
          <button onClick={() => setScreen("home")} className="flex items-center gap-2 text-white/60 hover:text-white transition ml-1 px-2 py-1 rounded-lg hover:bg-white/5 tap-sm">
              <Home className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Accueil</span>
            </button>
          }
          <div className="flex items-center gap-2 px-3 h-9 rounded-xl ml-1"
          style={{ background: "rgba(197,160,89,0.08)", border: "1px solid rgba(197,160,89,0.2)" }}>
            <CasinoToken size={22} />
            <span className="text-sm font-mono font-black" style={{ color: "#C5A059" }}>
              {formatBet(casinoCoins)}
            </span>
          </div>
        </div>

        {/* Center: logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-wider" style={{
            background: "linear-gradient(135deg, #C5A059, #8B6B2B)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 20px rgba(197,160,89,0.3)"
          }}>NEXUS GAME</span>
        </div>

        {/* Right: nav buttons + 24h gains */}
        <div className="flex items-center gap-2">
          {screen !== "profile" &&
          <button onClick={() => setScreen("profile")} className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold text-white/80 transition hover:opacity-90 tap-sm"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <User className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Profil</span>
            </button>
          }
          {screen !== "shop" &&
          <button onClick={() => setScreen("shop")} className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold text-white transition hover:opacity-90 tap-sm"
          style={{ background: "linear-gradient(135deg, #C5A059, #8B6B2B)", boxShadow: "0 0 12px rgba(197,160,89,0.2)" }}>
              <ShoppingBag className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Boutique</span>
            </button>
          }
          <div className="flex items-center gap-2 px-3 h-9 rounded-xl"
          style={{ background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.2)" }}>
            <span className="text-[8px] font-bold text-white/50 uppercase tracking-wider hidden sm:block">24h</span>
            <CasinoToken size={18} />
            <span className="text-sm font-mono font-black" style={{ color: "#4caf50" }}>
              {formatBet(won24h)}
            </span>
          </div>
        </div>
      </header>

      {/* Responsible gaming notice */}
      


      

      {/* Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {screen === "home" ?
          <motion.div key="home"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}>
              <CasinoHome balance={casinoCoins} onPlay={() => setShowThemeSelect(true)} />
            </motion.div> :
          screen === "shop" ?
          <motion.div key="shop"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}>
              <CasinoShop balance={casinoCoins} onBack={() => setScreen("home")} />
            </motion.div> :
          screen === "profile" ?
          <motion.div key="profile"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}>
              <CasinoProfile onBack={() => setScreen("home")} />
            </motion.div> :

          <motion.div key="slots"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}>
              <SlotsGame
              balance={casinoCoins}
              setBalance={setCasinoCoins}
              themeId={selectedTheme}
              onWin={handleWin} />
            </motion.div>
          }
        </AnimatePresence>
      </div>

      {/* Achievement toasts */}
      {newAchievements.length > 0 &&
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 space-y-2">
          {newAchievements.map((ach, i) =>
        <motion.div key={ach.id}
        initial={{ opacity: 0, y: 30, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: i * 0.2 }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{ background: "linear-gradient(135deg, rgba(197,160,89,0.2), rgba(139,107,43,0.1))", border: "1px solid rgba(197,160,89,0.4)", boxShadow: "0 0 20px rgba(197,160,89,0.2)" }}>
              <span className="text-3xl">{ach.emoji}</span>
              <div>
                <p className="text-xs font-black" style={{ color: "#C5A059" }}>SUCCÈS DÉBLOQUÉ !</p>
                <p className="text-sm font-bold text-white">{ach.label}</p>
                <p className="text-[10px] text-white/50">{ach.desc}</p>
              </div>
            </motion.div>
        )}
        </div>
      }

      {/* Theme selection modal */}
      <ThemeSelectionModal
        show={showThemeSelect}
        onSelect={(themeKey) => {
          setSelectedTheme(themeKey);
          setShowThemeSelect(false);
          setScreen("slots");
        }}
        onClose={() => setShowThemeSelect(false)}
      />
    </div>);

}

// ─── Casino Home (lobby) ───
function CasinoHome({ balance, onPlay }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 py-8">
      {/* Clickable Slots card with user's image */}
      <motion.button
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onPlay}
        className="relative overflow-hidden rounded-2xl text-left w-full max-w-sm group"
        style={{
          border: "2px solid rgba(197,160,89,0.35)",
          boxShadow: "0 0 30px rgba(197,160,89,0.15), 0 8px 30px rgba(0,0,0,0.5)"
        }}>

        {/* The image fills the entire card */}
        <img
          src={SLOTS_CARD_IMG}
          alt="Machines à Sous"
          className="w-full h-auto block"
          style={{ objectFit: "contain" }} />
        

        {/* Subtle hover glow overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(135deg, rgba(197,160,89,0.1) 0%, transparent 50%, rgba(139,68,173,0.12) 100%)" }} />

        {/* Play indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl flex items-center gap-2 transition group-hover:scale-105"
        style={{ background: "rgba(10,5,15,0.8)", backdropFilter: "blur(8px)", border: "1px solid rgba(197,160,89,0.3)" }}>
          <Sparkles className="w-4 h-4" style={{ color: "#C5A059" }} />
          <span className="text-sm font-black" style={{ color: "#C5A059" }}>JOUER</span>
        </div>
      </motion.button>

      {/* Balance + RTP info row */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-4 mt-6">
        <div className="text-center">
          <p className="text-[9px] font-bold text-white/40 uppercase">Votre solde</p>
          <div className="flex items-center gap-1.5 mt-0.5 justify-center">
            <CasinoToken size={18} />
            <span className="text-lg font-mono font-black" style={{ color: "#C5A059" }}>{formatBet(balance)}</span>
          </div>
        </div>
        
        <div className="text-center">
          
          
        </div>
      </motion.div>

      {/* Info */}
      




      
    </div>);

}

// ─── Floating token background decoration ───
function FloatingTokens() {
  const tokens = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 8 + Math.random() * 6,
    size: 30 + Math.floor(Math.random() * 30)
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {tokens.map((t) =>
      <motion.div key={t.id}
      className="absolute"
      style={{ left: `${t.x}%`, bottom: "-60px", opacity: 0.06 }}
      animate={{ y: [0, -700], rotate: [0, 360] }}
      transition={{ duration: t.duration, delay: t.delay, repeat: Infinity, ease: "easeOut" }}>
          <CasinoToken size={t.size} />
        </motion.div>
      )}
    </div>);

}