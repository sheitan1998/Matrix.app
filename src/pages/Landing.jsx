import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import AuthModal from "@/components/landing/AuthModal";
import ProfileMenu from "@/components/landing/ProfileMenu";
import {
  Youtube, Radio, MessageCircle, Cpu, Dices, Search, GraduationCap,
  Wrench, BarChart3, Clapperboard, TrendingUp,
  Gem, Shield, Star, ChevronDown, User, ArrowRight,
} from "lucide-react";

const LEFT_CARDS = [
  { path: "/stream", label: "Youtube", desc: "Vidéos, lives, shorts. Crée ta chaîne et partage ton contenu.", icon: Youtube, color: "#FF0000" },
  { path: "/twitch", label: "Twitch", desc: "Streams en direct, clips, discussions et rencontres.", icon: Radio, color: "#9146FF" },
  { path: "/community", label: "Discord", desc: "Discute, réagis, commente. Rejoins ou crée des salons vocaux.", icon: MessageCircle, color: "#3B82F6" },
  { path: "/ai", label: "AI Studio", desc: "Chat, création, code, histoires. Exploite l'IA sans limites.", icon: Cpu, color: "#06B6D4" },
  { path: "/casino", label: "Casino", desc: "Roulette, machines à sous, blackjack. Jeux fictifs uniquement.", icon: Dices, color: "#F59E0B", badge: "18+" },
  { path: "/prospecteurs", label: "Recherche Joueur/Serveur", desc: "Trouve des joueurs, recrute ou explore des serveurs de jeu.", icon: Search, color: "#8a4fff" },
  { path: "/category/gaming", label: "Tuto Gaming/Entraide", desc: "Guides, astuces, entraide et solutions pour tous les jeux.", icon: GraduationCap, color: "#3B82F6" },
];

const RIGHT_TOP = [
  { path: "/outils", label: "Outils", desc: "Accède à des outils utiles pour t'aider au quotidien.", icon: Wrench },
  { path: "/community", label: "Sondage", desc: "Participe aux sondages et donne ton avis.", icon: BarChart3 },
];

const RIGHT_FULL = [
  { path: "/video-studio", label: "Montage Videos", desc: "Édite, assemble, partage. Crée des vidéos incroyables.", icon: Clapperboard },
  { path: "/progression", label: "Niveaux/Progressions", desc: "Monte en niveau, débloque des badges et des avantages.", icon: TrendingUp },
];

export default function Landing() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleProfileClick = () => {
    if (user) {
      setShowMenu(!showMenu);
    } else {
      setShowAuth(true);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout("/");
  };

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden" style={{ backgroundColor: "#0a050f" }}>
      {/* Space background image */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "url(https://media.base44.com/images/public/69e14a987a927963a9924d5a/891f5968b_Gemini_Generated_Image_vsevw4vsevw4vsev.png)", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "rgba(10,5,15,0.5)" }} />

      <div className="relative z-10 min-h-screen flex flex-col px-4 sm:px-6 lg:px-10 py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 lg:mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">MATRIX</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-px w-8" style={{ background: "linear-gradient(to right, transparent, #a855f7)" }} />
              <div className="flex items-center gap-1.5">
                <Gem className="w-3 h-3" style={{ color: "#a855f7" }} />
                <Shield className="w-3 h-3" style={{ color: "#a855f7" }} />
                <Star className="w-3 h-3" style={{ color: "#a855f7" }} />
              </div>
              <div className="h-px w-8" style={{ background: "linear-gradient(to left, transparent, #a855f7)" }} />
            </div>
            <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/40 mt-1.5 font-mono">Choisissez votre univers</p>
          </motion.div>

          <div className="relative">
            <motion.button
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              onClick={handleProfileClick}
              className="flex items-center gap-2 px-3 py-2 rounded-full tap-sm"
              style={{ border: "1.5px solid rgba(168,85,247,0.4)", background: "rgba(168,85,247,0.05)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden" style={{ background: "rgba(168,85,247,0.2)" }}>
                <User className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
              </div>
              <span className="text-xs font-bold text-white">{user?.pseudo || user?.full_name || user?.email?.split("@")[0] || "Se connecter"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/40" />
            </motion.button>

            <AnimatePresence>
              {showMenu && user && (
                <ProfileMenu user={user} onClose={() => setShowMenu(false)} onLogout={handleLogout} />
              )}
            </AnimatePresence>
          </div>

          <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
        </header>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-8">
          {/* Left column */}
          <div className="space-y-3">
            {LEFT_CARDS.map((u, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => nav(u.path)}
                className="relative w-full rounded-2xl overflow-hidden text-left group flex items-center gap-4 p-4"
                style={{ background: "#101015", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: u.color }} />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${u.color}1a` }}>
                  <u.icon className="w-5 h-5" style={{ color: u.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-base font-black text-white">{u.label}</h2>
                    {u.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>{u.badge}</span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-white/50">{u.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: u.color }} />
              </motion.button>
            ))}
          </div>

          {/* Right column */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {RIGHT_TOP.map((u, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => nav(u.path)}
                  className="rounded-2xl p-4 text-left flex flex-col gap-2"
                  style={{ background: "#101015", border: "1px solid rgba(168,85,247,0.15)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.1)" }}>
                    <u.icon className="w-5 h-5" style={{ color: "#a855f7" }} />
                  </div>
                  <h3 className="text-sm font-black text-white">{u.label}</h3>
                  <p className="text-[11px] leading-relaxed text-white/40">{u.desc}</p>
                </motion.button>
              ))}
            </div>

            {RIGHT_FULL.map((u, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => nav(u.path)}
                className="w-full rounded-2xl p-4 text-left flex items-center gap-4"
                style={{ background: "#101015", border: "1px solid rgba(168,85,247,0.15)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.1)" }}>
                  <u.icon className="w-5 h-5" style={{ color: "#a855f7" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-white">{u.label}</h3>
                  <p className="text-xs leading-relaxed text-white/40">{u.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0" style={{ color: "#a855f7" }} />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 lg:mt-12 flex flex-col items-center gap-4 pt-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#5865F2" }}>
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#FF0000" }}>
              <Youtube className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-[10px] text-white/30 font-mono">© 2025 MATRIX. TOUS DROITS RÉSERVÉS.</p>
        </footer>
      </div>
    </div>
  );
}