import React, { useEffect, useState } from "react";
import { X, ArrowLeft, Loader2 } from "lucide-react";
import SlotsGame from "@/components/casino/SlotsGame";
import WheelOfFortuneScreen from "@/components/casino/WheelOfFortuneScreen";
import ScratchGameScreen from "@/components/casino/ScratchGameScreen";
import ThemeSelectionModal from "@/components/casino/ThemeSelectionModal";
import CasinoShop from "@/pages/casino/CasinoShop";
import Roulette from "@/pages/nexus/Roulette";
import CasinoToken from "@/components/casino/CasinoToken";
import { formatBet } from "@/components/casino/slotThemes";

const TITLES = {
  slots: "Machines à sous",
  wheel: "Roue de la Fortune",
  roulette: "Roulette Royale",
  scratch: "Tickets à gratter",
  shop: "Boutique de jetons",
};

export default function NexusArcadePlayer({ game, balance, setBalance, onClose, onRefreshBalance }) {
  const [themeId, setThemeId] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);

  useEffect(() => {
    if (!game) return;
    const onKey = (event) => {
      if (event.key === "Escape" && !document.querySelector('[role="dialog"]')) onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [game, onClose]);

  if (!game) return null;

  const handleSlotsSelect = (key) => {
    setConfigLoading(true);
    setThemeId(key);
    setTimeout(() => setConfigLoading(false), 400);
  };

  const renderGame = () => {
    switch (game) {
      case "slots":
        if (!themeId) {
          return (
            <div className="min-h-full flex items-center justify-center p-6">
              <ThemeSelectionModal
                show
                balance={balance}
                onSelect={handleSlotsSelect}
                onClose={onClose}
              />
            </div>
          );
        }
        if (configLoading) {
          return (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#a855f7" }} />
            </div>
          );
        }
        return (
          <SlotsGame
            balance={balance}
            setBalance={setBalance}
            themeId={themeId}
            onWin={onRefreshBalance}
          />
        );
      case "wheel":
        return <WheelOfFortuneScreen balance={balance} setBalance={setBalance} onBack={onClose} />;
      case "scratch":
        return <ScratchGameScreen balance={balance} setBalance={setBalance} onBack={onClose} />;
      case "roulette":
        return <Roulette />;
      case "shop":
        return (
          <CasinoShop
            balance={balance}
            onBack={onClose}
            onPurchaseSuccess={onRefreshBalance}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex flex-col" style={{ background: "#0a050f" }}>
      <div
        className="flex items-center gap-3 px-4 h-14 shrink-0"
        style={{ background: "rgba(15,8,24,0.96)", borderBottom: "1px solid rgba(168,85,247,0.25)" }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white/60 hover:text-white transition tap-sm"
          title="Fermer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold hidden sm:inline">Catalogue</span>
        </button>
        <div className="min-w-0">
          <p className="text-sm font-black text-white truncate">{TITLES[game]}</p>
          <p className="text-[10px] text-white/40">Nexus Game · jeux intégrés</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg"
            style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)" }}
          >
            <CasinoToken size={16} />
            <span className="text-[11px] font-mono font-black" style={{ color: "#c084fc" }}>{formatBet(balance)}</span>
          </span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white transition tap-sm"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
            title="Fermer le jeu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 overflow-y-auto">{renderGame()}</div>
    </div>
  );
}