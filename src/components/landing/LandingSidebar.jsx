import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home, Clapperboard, BarChart3, TrendingUp, ShoppingBag,
  User, Trophy, Heart, Wrench, Moon, HelpCircle, Globe,
  Gem, Shield, Star, ChevronDown, Palette
} from "lucide-react";
import TranslationButton from "@/components/landing/TranslationButton";
import SidebarHoverIndicator from "@/components/landing/SidebarHoverIndicator";


const NAV_ITEMS = [
  { label: "Accueil", path: "/", icon: Home },
  { label: "Montage Vidéo", path: "/video-studio", icon: Clapperboard },
  { label: "Sondage", path: "/sondages", icon: BarChart3 },
  { label: "Niveaux/Progressions", path: "/progression", icon: TrendingUp },
  { label: "Boutique", path: "/boutique-matrix", icon: ShoppingBag },
  { label: "Mon profil", path: "/mon-profil", icon: User },
  { label: "Classement", path: "/progression", icon: Trophy, hash: "#classement" },
  { label: "Soutenir", path: "/", icon: Heart, scrollFooter: true },
];

export default function LandingSidebar({ onFaq, onOpenTheme }) {
  const nav = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  const handleNav = (item) => {
    if (item.scrollFooter) {
      const el = document.getElementById("landing-footer");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    nav(item.hash ? `${item.path}${item.hash}` : item.path);
  };

  const isActive = (item) => {
    if (item.scrollFooter) return false;
    return location.pathname === item.path && !item.hash;
  };

  return (
    <aside
      className="landing-sidebar-neon hidden lg:flex flex-col shrink-0 sticky top-0 h-screen"
      style={{
        width: 260,
        background: "linear-gradient(180deg, hsl(var(--popover)) 0%, hsl(var(--card)) 100%)",
        borderRight: "1px solid hsl(var(--border))",
      }}
    >
      <div ref={sidebarRef} className="relative isolate flex h-full min-h-0 flex-col">
      <SidebarHoverIndicator containerRef={sidebarRef} activeKey={`${location.pathname}${location.hash}`} />
      {/* Logo header */}
      <div className="relative z-10 px-5 pt-6 pb-5" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 data-sidebar-brand className="text-3xl font-black tracking-tight text-foreground">MATRIX</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="h-px w-6" style={{ background: "linear-gradient(to right, transparent, #a855f7)" }} />
            <div className="flex items-center gap-1">
              <Gem className="w-3 h-3" style={{ color: "#a855f7" }} />
              <Shield className="w-3 h-3" style={{ color: "#a855f7" }} />
              <Star className="w-3 h-3" style={{ color: "#a855f7" }} />
            </div>
            <div className="h-px w-6" style={{ background: "linear-gradient(to left, transparent, #a855f7)" }} />
          </div>
          <p data-sidebar-subtitle className="text-[9px] tracking-[0.25em] uppercase mt-1.5 font-mono">Explorez la plateforme</p>
        </motion.div>
      </div>

      {/* Nav */}
      <nav aria-label="Navigation principale" className="relative z-10 min-h-0 flex-1 overflow-y-auto px-3 py-4 space-y-1 no-scrollbar">
        {NAV_ITEMS.map((item, i) => {
          const active = isActive(item);
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              onClick={() => handleNav(item)}
              data-sidebar-link
              aria-current={active ? "page" : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left tap-sm group"
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-semibold">
                {item.label}
              </span>
            </motion.button>
          );
        })}

        {/* Mes outils */}
        <div className="pt-4 pb-1">
          <p className="text-[10px] tracking-[0.2em] uppercase text-foreground/30 font-mono px-3 mb-1">Mes Outils</p>
        </div>
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          onClick={() => nav("/outils")}
          data-sidebar-link
          aria-current={location.pathname === "/outils" ? "page" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left tap-sm"
        >
          <Wrench className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
          <span className="text-sm font-semibold text-foreground/70">Outils</span>
        </motion.button>
      </nav>

      {/* Utility footer */}
      <div className="relative z-10 px-3 py-4 space-y-1" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <button
          onClick={onOpenTheme}
          data-sidebar-link
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left tap-sm"
        >
          <Palette className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
          <span className="text-xs font-semibold text-foreground/70">Thème</span>
        </button>
        <button
          onClick={onFaq}
          data-sidebar-link
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left tap-sm"
        >
          <HelpCircle className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
          <span className="text-xs font-semibold text-foreground/70">FAQ</span>
        </button>
        <div className="relative" data-sidebar-translation>
          <TranslationButton />
        </div>
      </div>
      </div>
    </aside>
  );
}