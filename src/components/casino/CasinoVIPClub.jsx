import React from "react";
import { motion } from "framer-motion";
import { Crown, Check } from "lucide-react";
import { VIP_TIERS } from "./casinoData";

export default function CasinoVIPClub({ coins }) {
  const currentTier = [...VIP_TIERS].reverse().find(t => coins >= t.min) || VIP_TIERS[0];

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5" style={{ color: "#fbbf24" }} />
        <h3 className="text-lg font-black text-white">VIP Club</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${currentTier.color}15`, color: currentTier.color }}>
          Niveau actuel: {currentTier.name}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {VIP_TIERS.map((tier, i) => {
          const unlocked = coins >= tier.min;
          const isCurrent = tier.name === currentTier.name;
          return (
            <motion.div key={tier.name}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-4 transition relative overflow-hidden"
              style={{
                background: isCurrent ? `linear-gradient(135deg, ${tier.color}12, rgba(12,12,16,0.9))` : "rgba(12,12,16,0.7)",
                border: isCurrent ? `1px solid ${tier.color}40` : "1px solid rgba(255,255,255,0.06)",
                boxShadow: isCurrent ? `0 0 25px ${tier.color}15` : "none",
                opacity: unlocked ? 1 : 0.5,
              }}>
              {isCurrent && (
                <div className="absolute top-2 right-2">
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: `${tier.color}20`, color: tier.color }}>ACTUEL</span>
                </div>
              )}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: `${tier.color}15` }}>
                <Crown className="w-5 h-5" style={{ color: tier.color }} />
              </div>
              <p className="text-sm font-black mb-1" style={{ color: tier.color }}>{tier.name}</p>
              <p className="text-[10px] text-white/40 mb-2">{tier.min.toLocaleString()}+ Coins</p>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-white/60">
                  <Check className="w-3 h-3" style={{ color: tier.color }} /> Cashback {tier.cashback}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/60">
                  <Check className="w-3 h-3" style={{ color: tier.color }} /> Bonus {tier.bonus}
                </div>
                {tier.perks.slice(0, 2).map((perk) => (
                  <div key={perk} className="flex items-center gap-1.5 text-[10px] text-white/50">
                    <Check className="w-3 h-3" style={{ color: tier.color }} /> {perk}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}