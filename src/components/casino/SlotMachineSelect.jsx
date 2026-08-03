import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, X, Home, Globe, Star, Lock, Coins } from "lucide-react";
import { MACHINE_TIERS } from "./slotWorldsData";

export default function SlotMachineSelect({ world, balance, userLevel = 1, onBack, onSelectMachine }) {
  if (!world) return null;

  return (
    <div className="min-h-screen relative overflow-hidden select-none flex flex-col"
      style={{ background: "linear-gradient(160deg, #1a2a6c 0%, #2D48E0 40%, #0066ff 100%)" }}>

      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-15"
        style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(0,163,255,0.2), transparent 50%)" }} />

      {/* === HEADER === */}
      <div className="relative z-30 flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: "rgba(0,30,100,0.5)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <ArrowLeft className="w-4 h-4 text-white/70" />
          </button>
          <h2 className="text-sm font-black text-white tracking-wide" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
            Choisissez votre jeu
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}>
            <Coins className="w-3.5 h-3.5" style={{ color: "#FFD700" }} />
            <span className="text-xs font-mono font-black text-white">{((balance || 0) / 1000000).toFixed(0)}M</span>
          </div>
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Player count */}
      <div className="relative z-20 flex items-center gap-1.5 px-4 py-1.5 shrink-0">
        <Globe className="w-3.5 h-3.5 text-green-400" />
        <span className="text-xs font-bold text-green-400">{Math.floor(80 + Math.random() * 200)}</span>
      </div>

      {/* === MACHINE CARDS === */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-3xl w-full">
          {MACHINE_TIERS.map((tier, i) => {
            const isLocked = userLevel < tier.requiredLevel;
            return (
              <motion.div key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
                className="relative rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: isLocked ? "rgba(20,20,40,0.6)" : `${world.bgGradient}`,
                  border: `2px solid ${isLocked ? "rgba(255,255,255,0.1)" : tier.color + "60"}`,
                  boxShadow: isLocked ? "none" : `0 0 20px ${tier.color}30`,
                }}>

                {/* Jackpot tier title */}
                <div className="px-3 py-1.5 text-center"
                  style={{ background: isLocked ? "rgba(40,40,60,0.5)" : "linear-gradient(135deg, #FFD700, #FF8C00)" }}>
                  <span className="text-xs font-black tracking-wide"
                    style={{ color: "#000", WebkitTextStroke: "0.5px rgba(0,0,0,0.3)" }}>
                    {tier.title}
                  </span>
                </div>

                {/* Jackpot value */}
                <div className="px-3 py-1.5 text-center"
                  style={{ background: "rgba(0,0,0,0.7)", borderBottom: `1px solid ${isLocked ? "rgba(255,255,255,0.05)" : "rgba(255,215,0,0.3)"}` }}>
                  <div className="flex items-center justify-center gap-1">
                    <Coins className="w-3 h-3" style={{ color: "#FFD700" }} />
                    <span className="text-[10px] font-mono font-bold text-white">{tier.jackpotValue}</span>
                  </div>
                </div>

                {/* Machine visual */}
                <div className="relative flex-1 flex items-center justify-center p-3" style={{ minHeight: "140px" }}>
                  <div className="w-full aspect-square rounded-xl overflow-hidden relative"
                    style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${isLocked ? "rgba(255,255,255,0.05)" : tier.color + "40"}` }}>
                    <img src={world.img} alt={world.machineName}
                      className="w-full h-full object-cover"
                      style={{ filter: isLocked ? "grayscale(1) opacity(0.4)" : "none", opacity: isLocked ? 0.4 : 0.8 }} />
                    {/* Machine label overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-black text-white text-center px-2"
                        style={{ textShadow: "0 0 8px rgba(0,0,0,0.9)" }}>
                        {world.machineName}
                      </span>
                    </div>
                  </div>

                  {/* Level star badge for locked machines */}
                  {isLocked && (
                    <div className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full flex items-center justify-center z-20"
                      style={{ background: "#FFD700", boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                      <div className="flex flex-col items-center">
                        <Star className="w-3 h-3" style={{ color: "#000", fill: "#000" }} />
                        <span className="text-[9px] font-black text-black leading-none">{tier.requiredLevel}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tier label */}
                <div className="px-3 py-1 text-center">
                  <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded"
                    style={{
                      background: isLocked ? "rgba(255,255,255,0.05)" : `${tier.color}20`,
                      color: isLocked ? "rgba(255,255,255,0.4)" : "#fff",
                    }}>
                    {tier.label}
                  </span>
                </div>

                {/* Required level notice for locked */}
                {isLocked && (
                  <div className="px-3 py-1 mx-3 mb-2 rounded text-center"
                    style={{ background: "#FFD700" }}>
                    <span className="text-[9px] font-black text-black">NIVEAU REQUIS</span>
                  </div>
                )}

                {/* Bet info */}
                <div className="mx-3 mb-3 rounded p-2"
                  style={{ background: "#cc0000" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Coins className="w-2.5 h-2.5 text-white" />
                      <span className="text-[9px] font-bold text-white">MIN {tier.minBet}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="w-2.5 h-2.5 text-white" />
                      <span className="text-[9px] font-bold text-white">MAX {tier.maxBet}</span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="px-3 pb-3">
                  {isLocked ? (
                    <div className="w-full py-2 rounded-xl text-center text-xs font-black text-white/30 flex items-center justify-center gap-1"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <Lock className="w-3 h-3" /> VERROUILLÉ
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onSelectMachine(tier)}
                      className="w-full py-2 rounded-xl text-xs font-black text-white"
                      style={{
                        background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`,
                        boxShadow: `0 0 12px ${tier.color}60`,
                      }}>
                      ▶ JOUER
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}