import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, Coins, Check, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useProgression } from "@/context/ProgressionContext";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";
import TrixIcon from "@/components/TrixIcon";

const BOOSTERS = [
  {
    id: "x2_1h", multiplier: 2, duration_hours: 1, price_trix: 50,
    label: "x2 XP", duration_label: "1 heure", color: "#3b82f6",
  },
  {
    id: "x2_4h", multiplier: 2, duration_hours: 4, price_trix: 100,
    label: "x2 XP", duration_label: "4 heures", color: "#3b82f6",
  },
  {
    id: "x2_24h", multiplier: 2, duration_hours: 24, price_trix: 200,
    label: "x2 XP", duration_label: "24 heures", color: "#3b82f6",
  },
  {
    id: "x5_1h", multiplier: 5, duration_hours: 1, price_trix: 150,
    label: "x5 XP", duration_label: "1 heure", color: "#a855f7",
  },
  {
    id: "x5_4h", multiplier: 5, duration_hours: 4, price_trix: 300,
    label: "x5 XP", duration_label: "4 heures", color: "#a855f7",
  },
  {
    id: "x5_24h", multiplier: 5, duration_hours: 24, price_trix: 600,
    label: "x5 XP", duration_label: "24 heures", color: "#a855f7",
  },
  {
    id: "x10_1h", multiplier: 10, duration_hours: 1, price_trix: 300,
    label: "x10 XP", duration_label: "1 heure", color: "#f59e0b",
  },
  {
    id: "x10_4h", multiplier: 10, duration_hours: 4, price_trix: 600,
    label: "x10 XP", duration_label: "4 heures", color: "#f59e0b",
  },
  {
    id: "x10_24h", multiplier: 10, duration_hours: 24, price_trix: 1200,
    label: "x10 XP", duration_label: "24 heures", color: "#f59e0b",
  },
];

export default function XPBoosterShop() {
  const { progress, buyXPBooster, activateXPBooster, activeBoost } = useProgression();
  const { balance } = useWallet();
  const [buying, setBuying] = useState(null);
  const [activating, setActivating] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Live countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleBuy = async (booster) => {
    if ((balance || 0) < booster.price_trix) {
      toast.error("Solde Trix insuffisant");
      return;
    }
    setBuying(booster.id);
    try {
      await buyXPBooster(booster);
      toast.success(`${booster.label} (${booster.duration_label}) acheté !`);
    } catch (e) {
      toast.error("Erreur lors de l'achat");
    }
    setBuying(null);
  };

  const handleActivate = async (booster) => {
    setActivating(booster.id);
    try {
      await activateXPBooster(booster);
      toast.success(`${booster.label} activé pendant ${booster.duration_label} !`);
    } catch (e) {
      toast.error("Erreur lors de l'activation");
    }
    setActivating(null);
  };

  const inventory = progress?.xp_boosters || [];
  const activeBoostData = activeBoost
    ? {
        ...BOOSTERS.find(b => b.multiplier === activeBoost.multiplier && b.id === activeBoost.booster_id),
        expires_at: activeBoost.expires_at,
      }
    : null;

  const formatCountdown = (expiresAt) => {
    const remaining = new Date(expiresAt).getTime() - now;
    if (remaining <= 0) return "Expiré";
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  };

  // Group boosters by multiplier
  const grouped = BOOSTERS.reduce((acc, b) => {
    const key = b.multiplier;
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Active boost banner */}
      {activeBoostData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl flex items-center gap-3"
          style={{ background: `linear-gradient(135deg, ${activeBoostData.color}20, ${activeBoostData.color}05)`, border: `1px solid ${activeBoostData.color}40` }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${activeBoostData.color}20` }}>
            <Zap className="w-5 h-5" style={{ color: activeBoostData.color }} fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white">{activeBoostData.label} actif</p>
            <p className="text-[10px] text-white/50">Tous vos gains d'XP sont multipliés par {activeBoostData.multiplier}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-mono font-black" style={{ color: activeBoostData.color }}>{formatCountdown(activeBoostData.expires_at)}</p>
            <p className="text-[9px] text-white/40">restant</p>
          </div>
        </motion.div>
      )}

      {/* Balance */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <TrixIcon size={20} />
        <span className="font-bold text-white">{balance || 0}</span> Trix disponibles
      </div>

      {/* Shop — grouped by multiplier */}
      {Object.entries(grouped).map(([mult, boosters]) => {
        const color = boosters[0].color;
        return (
          <div key={mult}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4" style={{ color }} fill="currentColor" />
              <h3 className="text-sm font-black text-white">Boosters x{mult}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {boosters.map(booster => {
                const canAfford = (balance || 0) >= booster.price_trix;
                return (
                  <div key={booster.id}
                    className="p-4 rounded-2xl flex flex-col gap-2 transition"
                    style={{ background: "#13131a", border: `1px solid ${canAfford ? color + "30" : "rgba(255,255,255,0.04)"}` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black" style={{ color }}>x{booster.multiplier}</span>
                      <div className="flex items-center gap-1 text-[10px] text-white/40">
                        <Clock className="w-3 h-3" /> {booster.duration_label}
                      </div>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      Multiplie tous vos gains d'XP par {booster.multiplier} pendant {booster.duration_label}.
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrixIcon size={16} />
                      <span className="text-sm font-black" style={{ color: canAfford ? "#fbbf24" : "#ef4444" }}>{booster.price_trix}</span>
                    </div>
                    <button
                      onClick={() => handleBuy(booster)}
                      disabled={!canAfford || buying === booster.id}
                      className="w-full py-2 rounded-xl text-xs font-bold text-white transition disabled:opacity-30 flex items-center justify-center gap-1.5 tap-sm"
                      style={{ background: canAfford ? `linear-gradient(135deg, ${color}, ${color}dd)` : "rgba(255,255,255,0.05)" }}
                    >
                      {buying === booster.id ? "..." : canAfford ? "Acheter" : "Insuffisant"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {inventory.length > 0 && (
        <div className="p-3 rounded-xl flex items-center gap-2 text-xs text-white/40" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
          {inventory.length} booster{inventory.length > 1 ? "s" : ""} en stock — consultez votre inventaire sur votre profil pour les activer.
        </div>
      )}
    </div>
  );
}