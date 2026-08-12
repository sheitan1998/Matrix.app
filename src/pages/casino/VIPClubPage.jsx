import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Gem, Star, Gift, TrendingUp, Shield, Sparkles, Coins, Zap, Check, Home } from "lucide-react";
import { VIP_TIERS } from "@/components/casino/casinoData";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import NexusVIPShop from "@/components/nexus/NexusVIPShop";

const VIP_BENEFITS = [
  { icon: Coins, title: "Bonus de bienvenue VIP", desc: "Recevez un bonus de coins exclusif à chaque niveau atteint", color: "#fbbf24" },
  { icon: Zap, title: "Boost de gains", desc: "Augmentez vos gains de casino avec des multiplicateurs VIP", color: "#a855f7" },
  { icon: Shield, title: "Cashback exclusif", desc: "Récupérez un pourcentage de vos pertes chaque semaine", color: "#3b82f6" },
  { icon: Gift, title: "Cadeaux mensuels", desc: "Recevez des récompenses gratuites chaque mois", color: "#22c55e" },
  { icon: TrendingUp, title: "Limites de mise élevées", desc: "Profitez de limites de mise supérieures sur tous les jeux", color: "#ef4444" },
  { icon: Sparkles, title: "Support prioritaire", desc: "Accédez à un support client VIP disponible 24/7", color: "#06b6d4" },
];

const EXCLUSIVE_REWARDS = [
  { id: "vip_avatar", title: "Avatar VIP Doré", desc: "Un avatar exclusif avec effet doré", cost: "Niveau Bronze", icon: Crown },
  { id: "vip_border", title: "Bordure Premium", desc: "Bordure de profil animée exclusive", cost: "Niveau Argent", icon: Gem },
  { id: "vip_emoji", title: "Pack Emoji VIP", desc: "Emojis exclusifs pour le chat", cost: "Niveau Or", icon: Star },
  { id: "vip_bonus", title: "Bonus Quotidien x2", desc: "Doublez votre bonus quotidien de coins", cost: "Niveau Platine", icon: Coins },
  { id: "vip_cashback", title: "Cashback 10%", desc: "10% de vos pertes remboursés", cost: "Niveau Diamant", icon: Shield },
  { id: "vip_exclusive", title: "Jeux Exclusifs", desc: "Accès à des jeux réservés VIP", cost: "Niveau Elite", icon: Sparkles },
];

export default function VIPClubPage({ coins, onBack }) {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);
  const currentTier = [...VIP_TIERS].reverse().find(t => (coins || 0) >= t.min) || VIP_TIERS[0];
  const nextTier = VIP_TIERS.find(t => t.min > (coins || 0));

  return (
    <div className="min-h-screen relative overflow-y-auto" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a1505 50%, #0a0a0a 100%)" }}>
      {/* Decorative glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fbbf24, transparent)" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
          style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(251,191,36,0.15)" }}>
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition tap-sm">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:inline">Retour</span>
          </Link>
          <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white transition ml-1 tap-sm">
            <Home className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Accueil</span>
          </button>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" style={{ color: "#fbbf24", filter: "drop-shadow(0 0 8px #fbbf24)" }} />
            <h1 className="font-black text-lg tracking-wider" style={{
              background: "linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>VIP CLUB</h1>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-3 h-8 rounded-lg" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
            <Coins className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />
            <span className="text-xs font-mono font-bold" style={{ color: "#fbbf24" }}>{(coins || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-10 pb-16">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden p-8 lg:p-12 text-center"
            style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(168,85,247,0.05))", border: "1px solid rgba(251,191,36,0.2)" }}>
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
              className="inline-flex mb-4">
              <Crown className="w-16 h-16 lg:w-20 lg:h-20" style={{ color: "#fbbf24", filter: "drop-shadow(0 0 20px #fbbf24)" }} />
            </motion.div>
            <h2 className="text-3xl lg:text-5xl font-black mb-3" style={{
              background: "linear-gradient(135deg, #fbbf24, #f59e0b, #d4af37, #fbbf24)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 2px 10px rgba(251,191,36,0.3))",
            }}>CLUB VIP EXCLUSIF</h2>
            <p className="text-sm lg:text-base text-white/60 max-w-lg mx-auto">
              Plus vous jouez, plus vous êtes récompensé. Découvrez des avantages exclusifs, des bonus uniques et un traitement royal.
            </p>

            {/* Current tier */}
            <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-2xl"
              style={{ background: "rgba(251,191,36,0.08)", border: `1px solid ${currentTier.color}40` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: currentTier.color + "20" }}>
                <Crown className="w-5 h-5" style={{ color: currentTier.color }} />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Votre niveau</p>
                <p className="text-lg font-black" style={{ color: currentTier.color }}>{currentTier.name}</p>
              </div>
              {nextTier && (
                <div className="ml-4 pl-4 border-l border-white/10 text-left">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Prochain niveau</p>
                  <p className="text-sm font-bold text-white/70">{nextTier.name}</p>
                  <p className="text-[10px] text-white/40">{((nextTier.min - (coins || 0))).toLocaleString()} MC restants</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* VIP Tiers */}
          <section>
            <h3 className="text-xl font-black text-white mb-1 flex items-center gap-2">
              <Gem className="w-5 h-5" style={{ color: "#fbbf24" }} /> Niveaux VIP
            </h3>
            <p className="text-xs text-white/40 mb-5">Progression par solde de casino</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {VIP_TIERS.map((tier, i) => {
                const isCurrent = tier.name === currentTier.name;
                const isUnlocked = (coins || 0) >= tier.min;
                return (
                  <motion.div key={tier.name}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                    className="relative rounded-2xl p-5 text-center overflow-hidden"
                    style={{
                      background: isUnlocked ? `linear-gradient(135deg, ${tier.color}15, ${tier.color}05)` : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isUnlocked ? tier.color + "40" : "rgba(255,255,255,0.06)"}`,
                      boxShadow: isCurrent ? `0 0 30px ${tier.color}30` : "none",
                    }}>
                    {isCurrent && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black" style={{ background: tier.color, color: "#000" }}>
                        ACTUEL
                      </div>
                    )}
                    <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
                      style={{ background: tier.color + "20", border: `1px solid ${tier.color}40` }}>
                      <Crown className="w-7 h-7" style={{ color: tier.color, filter: isUnlocked ? `drop-shadow(0 0 8px ${tier.color})` : "none" }} />
                    </div>
                    <p className="font-black text-sm" style={{ color: isUnlocked ? tier.color : "rgba(255,255,255,0.3)" }}>{tier.name}</p>
                    <p className="text-[10px] text-white/40 mt-1">{tier.min.toLocaleString()} MC</p>
                    {tier.perks?.map((perk, j) => (
                      <p key={j} className="text-[10px] text-white/50 mt-2 flex items-center justify-center gap-1">
                        <Check className="w-2.5 h-2.5" style={{ color: tier.color }} /> {perk}
                      </p>
                    ))}
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Benefits */}
          <section>
            <h3 className="text-xl font-black text-white mb-5 flex items-center gap-2">
              <Gift className="w-5 h-5" style={{ color: "#fbbf24" }} /> Avantages VIP
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {VIP_BENEFITS.map((b, i) => (
                <motion.div key={b.title}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: b.color + "20" }}>
                    <b.icon className="w-5 h-5" style={{ color: b.color }} />
                  </div>
                  <p className="font-bold text-sm text-white">{b.title}</p>
                  <p className="text-xs text-white/50 mt-1">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Exclusive Rewards */}
          <section>
            <h3 className="text-xl font-black text-white mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: "#fbbf24" }} /> Récompenses Exclusives
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXCLUSIVE_REWARDS.map((r, i) => (
                <motion.div key={r.id}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl p-5"
                  style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.05), rgba(168,85,247,0.03))", border: "1px solid rgba(251,191,36,0.15)" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(251,191,36,0.15)" }}>
                      <r.icon className="w-5 h-5" style={{ color: "#fbbf24" }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{r.title}</p>
                      <p className="text-[10px] text-white/40">{r.cost}</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/50">{r.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* VIP Bonus */}
          <section className="rounded-3xl p-8 text-center"
            style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(168,85,247,0.05))", border: "1px solid rgba(251,191,36,0.2)" }}>
            <h3 className="text-xl font-black text-white mb-2">Bonus VIP Mensuel</h3>
            <p className="text-sm text-white/50 max-w-md mx-auto mb-4">
              Recevez un bonus de coins gratuit chaque mois selon votre niveau VIP. Plus votre niveau est élevé, plus le bonus est important.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { tier: "Bronze", bonus: "500 MC" },
                { tier: "Or", bonus: "2,000 MC" },
                { tier: "Elite", bonus: "10,000 MC" },
              ].map((b) => (
                <div key={b.tier} className="rounded-xl p-3" style={{ background: "rgba(251,191,36,0.05)" }}>
                  <p className="text-xs font-bold text-white/70">{b.tier}</p>
                  <p className="text-sm font-black mt-1" style={{ color: "#fbbf24" }}>{b.bonus}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Nexus VIP Subscriptions */}
          <section>
            <NexusVIPShop user={user} />
          </section>
        </div>
      </div>
    </div>
  );
}