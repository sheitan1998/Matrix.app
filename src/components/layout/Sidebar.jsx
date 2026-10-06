import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Flame,
  Radio,
  Clapperboard,
  Heart,
  Music2,
  Gamepad2,
  GraduationCap,
  Newspaper,
  Cpu,
  Tv2,
  MessageCircle,
  Sparkles,
  Dices,
  ShoppingBag,
  Search,
  Wrench,
  BarChart3,
  User,
  Crown,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import CheckoutModal from "@/components/CheckoutModal";

const mainNav = [
  { to: "/stream", label: "Accueil", icon: Home },
  { to: "/trending", label: "Tendances", icon: Flame },
  { to: "/live", label: "En direct", icon: Radio },
  { to: "/shorts", label: "Shorts", icon: Clapperboard },
  { to: "/subscriptions", label: "Abonnements", icon: Heart },
];

const categories = [
  { to: "/category/music", label: "Musique", icon: Music2 },
  { to: "/category/gaming", label: "Gaming", icon: Gamepad2 },
  { to: "/category/education", label: "Éducation", icon: GraduationCap },
  { to: "/category/news", label: "Actualité", icon: Newspaper },
  { to: "/category/tech", label: "Tech", icon: Cpu },
];

const universes = [
  { to: "/community", label: "Communauté", icon: MessageCircle },
  { to: "/ai", label: "AI Studio", icon: Sparkles },
  { to: "/casino", label: "Casino", icon: Dices },
  { to: "/market", label: "Marketplace", icon: ShoppingBag },
  { to: "/prospecteurs", label: "Prospecteurs", icon: Search },
  { to: "/playlists", label: "Playlists", icon: Music2 },
  { to: "/outils", label: "Outils", icon: Wrench },
  { to: "/sondages", label: "Sondages", icon: BarChart3 },
  { to: "/mon-profil", label: "Mon profil", icon: User },
];

function NavItem({ to, label, icon: Icon, active }) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0")} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to || (to === "/stream" && pathname === "/");
  const [showVipCheckout, setShowVipCheckout] = useState(false);

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border h-[calc(100vh-64px)] sticky top-16 overflow-y-auto scrollbar-thin py-4 px-3 gap-1">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Principale</p>
      <div className="flex flex-col gap-0.5">
        {mainNav.map((item) => (
          <NavItem key={item.to} {...item} active={isActive(item.to)} />
        ))}
      </div>

      <div className="h-px bg-border my-3" />

      <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Catégories</p>
      <div className="flex flex-col gap-0.5">
        {categories.map((item) => (
          <NavItem key={item.to} {...item} active={pathname === item.to} />
        ))}
      </div>

      <div className="h-px bg-border my-3" />

      <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Plateforme</p>
      <div className="flex flex-col gap-0.5">
        {universes.map((item) => (
          <NavItem key={item.to} {...item} active={isActive(item.to)} />
        ))}
      </div>

      {/* VIP Subscription encart */}
      <div className="mt-auto pt-4 space-y-3">
        <button
          onClick={() => setShowVipCheckout(true)}
          className="w-full rounded-xl p-3 transition hover:opacity-90 text-left"
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(109,40,217,0.1))",
            border: "1px solid rgba(168,85,247,0.25)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(168,85,247,0.2)" }}
            >
              <Crown className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
            </div>
            <span className="text-xs font-black text-white">VIP Prospecteur</span>
          </div>
          <p className="text-[10px] text-white/50 leading-tight mb-1.5">
            Cooldown de vote réduit à <span className="font-bold text-purple-400">1h</span> au lieu de 2h
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-white">2,99€<span className="text-[10px] font-normal text-white/40">/mois</span></span>
            <span
              className="text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1"
              style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)", color: "#fff" }}
            >
              <Zap className="w-2.5 h-2.5" /> S'abonner
            </span>
          </div>
        </button>

        <Link to="/studio"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition hover:opacity-80"
          style={{ background: "linear-gradient(135deg, #ff4d4d, #cc3838)", color: "#fff" }}>
          <Tv2 className="w-4 h-4" />
          Lancer un direct
        </Link>
      </div>

      {showVipCheckout && (
        <CheckoutModal
          functionName="stripePayment"
          params={{ action: "createVIPSubscription", plan: "vip_vote" }}
          onClose={() => setShowVipCheckout(false)}
          onSuccess={() => {
            setShowVipCheckout(false);
            window.location.reload();
          }}
        />
      )}
    </aside>
  );
}