import React from "react";
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
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  { to: "/profile", label: "Mon profil", icon: User },
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

      <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Univers</p>
      <div className="flex flex-col gap-0.5">
        {universes.map((item) => (
          <NavItem key={item.to} {...item} active={isActive(item.to)} />
        ))}
      </div>

      <div className="mt-auto pt-4">
        <Link to="/studio"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition hover:opacity-80"
          style={{ background: "linear-gradient(135deg, #ff4d4d, #cc3838)", color: "#fff" }}>
          <Tv2 className="w-4 h-4" />
          Lancer un direct
        </Link>
      </div>
    </aside>
  );
}