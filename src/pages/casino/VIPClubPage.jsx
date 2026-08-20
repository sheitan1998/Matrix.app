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
{ icon: Sparkles, title: "Support prioritaire", desc: "Accédez à un support client VIP disponible 24/7", color: "#06b6d4" }];


const EXCLUSIVE_REWARDS = [
{ id: "vip_avatar", title: "Avatar VIP Doré", desc: "Un avatar exclusif avec effet doré", cost: "Niveau Bronze", icon: Crown },
{ id: "vip_border", title: "Bordure Premium", desc: "Bordure de profil animée exclusive", cost: "Niveau Argent", icon: Gem },
{ id: "vip_emoji", title: "Pack Emoji VIP", desc: "Emojis exclusifs pour le chat", cost: "Niveau Or", icon: Star },
{ id: "vip_bonus", title: "Bonus Quotidien x2", desc: "Doublez votre bonus quotidien de coins", cost: "Niveau Platine", icon: Coins },
{ id: "vip_cashback", title: "Cashback 10%", desc: "10% de vos pertes remboursés", cost: "Niveau Diamant", icon: Shield },
{ id: "vip_exclusive", title: "Jeux Exclusifs", desc: "Accès à des jeux réservés VIP", cost: "Niveau Elite", icon: Sparkles }];


export default function VIPClubPage({ coins, onBack }) {
  const [user, setUser] = useState(null);
  useEffect(() => {base44.auth.me().then(setUser).catch(() => {});}, []);
  const currentTier = [...VIP_TIERS].reverse().find((t) => (coins || 0) >= t.min) || VIP_TIERS[0];
  const nextTier = VIP_TIERS.find((t) => t.min > (coins || 0));

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
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>VIP CLUB</h1>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-3 h-8 rounded-lg" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
            <Coins className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />
            <span className="text-xs font-mono font-bold" style={{ color: "#fbbf24" }}>{(coins || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-10 pb-16">
          {/* Hero */}
          

































          

          {/* VIP Tiers */}
          <section>
            

            
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {VIP_TIERS.map((tier, i) => {
                const isCurrent = tier.name === currentTier.name;
                const isUnlocked = (coins || 0) >= tier.min;
                return null;


























              })}
            </div>
          </section>

          {/* Benefits */}
          <section>
            

            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {VIP_BENEFITS.map((b, i) =>
              <motion.div key={b.title}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-5 hidden"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: b.color + "20" }}>
                    <b.icon className="w-5 h-5" style={{ color: b.color }} />
                  </div>
                  <p className="font-bold text-sm text-white">{b.title}</p>
                  <p className="text-xs text-white/50 mt-1">{b.desc}</p>
                </motion.div>
              )}
            </div>
          </section>

          {/* Exclusive Rewards */}
          <section>
            

            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXCLUSIVE_REWARDS.map((r, i) =>
              <motion.div key={r.id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-5 hidden"
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
              )}
            </div>
          </section>

          {/* VIP Bonus */}
          

















          

          {/* Nexus VIP Subscriptions */}
          <section>
            <NexusVIPShop user={user} />
          </section>
        </div>
      </div>
    </div>);

}