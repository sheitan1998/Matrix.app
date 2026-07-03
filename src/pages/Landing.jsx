import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Tv2, Users, Cpu, Dices, Gem, Star, MessageCircle, Radio, Play, Music, Camera, ChevronDown, User, Clapperboard, ListMusic } from "lucide-react";
import UniverseCard from "@/components/landing/UniverseCard";
import DiscoverSection from "@/components/landing/DiscoverSection";
import LiveNowSection from "@/components/landing/LiveNowSection";

const UNIVERSES = [
  { path: "/stream", label: "Streaming", desc: "Vidéos, lives, shorts. Crée ta chaîne et partage ton contenu.", icon: Tv2, color: "#22c55e" },
  { path: "/community", label: "Communauté", desc: "Discute, réagis, commente. Rejoins ou crée des salons vocaux.", icon: Users, color: "#a855f7" },
  { path: "/ai", label: "AI Studio", desc: "Chat, création, code, histoires. Exploite l'IA sans limites.", icon: Cpu, color: "#06b6d4" },
  { path: "/casino", label: "Casino", desc: "Roulette, machines à sous, blackjack. Jeux fictifs uniquement.", icon: Dices, color: "#eab308", badge: "18+" },
  { path: "/video-studio", label: "Video Studio", desc: "Édite, assemble, partage. Un studio vidéo complet intégré.", icon: Clapperboard, color: "#8b5cf6", badge: "NEW" },
  { path: "/playlists", label: "Playlists", desc: "Crée, organise, partage tes playlists musicales.", icon: ListMusic, color: "#ec4899", badge: "NEW" },
];

const SOCIALS = [
  { icon: MessageCircle, label: "Discord" },
  { icon: Radio, label: "Twitch" },
  { icon: Play, label: "YouTube" },
  { icon: Music, label: "TikTok" },
  { icon: Camera, label: "Instagram" },
];

export default function Landing() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden"
      style={{
        backgroundImage: `url(https://media.base44.com/images/public/69e14a987a927963a9924d5a/e20a0d5be_ChatGPTImage2juil202604_45_31.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundColor: "#050505",
      }}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} />

      <div className="relative z-10 min-h-screen flex flex-col px-4 sm:px-6 lg:px-10 py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 lg:mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              <span style={{
                background: "linear-gradient(135deg, #a855f7, #3b82f6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 20px rgba(168,85,247,0.6))",
              }}>M</span>ATRIX
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-px w-8" style={{ background: "linear-gradient(to right, transparent, #a855f7)" }} />
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3" style={{ color: "#a855f7" }} />
                <Gem className="w-3 h-3" style={{ color: "#a855f7" }} />
                <Star className="w-3 h-3" style={{ color: "#a855f7" }} />
              </div>
              <div className="h-px w-8" style={{ background: "linear-gradient(to left, transparent, #a855f7)" }} />
            </div>
            <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/40 mt-1.5 font-mono">Choisissez votre univers</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => user ? nav("/profile") : base44.auth.redirectToLogin()}
            className="flex items-center gap-2 px-3 py-2 rounded-full tap-sm"
            style={{ border: "1.5px solid rgba(168,85,247,0.4)", background: "rgba(168,85,247,0.05)" }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(168,85,247,0.2)" }}>
              <User className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
            </div>
            <span className="text-xs font-bold text-white">{user?.pseudo || user?.full_name || user?.email?.split("@")[0] || "Se connecter"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          </motion.button>
        </header>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-8">
          <div className="space-y-3">
            {UNIVERSES.map((u, i) => (
              <UniverseCard key={u.path} {...u} delay={0.3 + i * 0.1} onClick={() => nav(u.path)} />
            ))}
          </div>
          <div className="space-y-5">
            <DiscoverSection />
            <LiveNowSection />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 lg:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-widest text-white/30">CONNECTÉ AVEC</span>
            <div className="flex items-center gap-2">
              {SOCIALS.map((s, i) => (
                <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/5 transition" title={s.label}>
                  <s.icon className="w-3.5 h-3.5 text-white/40 hover:text-white transition" />
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-white/30 font-mono">© 2025 MATRIX. TOUS DROITS RÉSERVÉS.</p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.05)" }}>
            <motion.div className="w-2 h-2 rounded-full bg-green-500"
              animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="text-[10px] font-bold text-green-400">SYSTÈME EN LIGNE</span>
            <span className="text-[9px] text-white/30 hidden sm:inline">· TOUT EST OPÉRATIONNEL</span>
          </div>
        </footer>
      </div>
    </div>
  );
}