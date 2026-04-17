import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Flame, Radio, Music2, Gamepad2, GraduationCap, Newspaper, Cpu, Crown, Coins, Upload, User as UserIcon, Heart, LayoutDashboard, Tv2, Clapperboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { to: "/stream", label: "Accueil", icon: Home },
  { to: "/trending", label: "Tendances", icon: Flame },
  { to: "/live", label: "En direct", icon: Radio },
  { to: "/shorts", label: "Shorts", icon: Clapperboard },
  { to: "/subscriptions", label: "Abonnements", icon: Heart },
  { to: "/community", label: "Communauté", icon: Users, color: "text-premium" },
];

const categories = [
  { to: "/category/music", label: "Musique", icon: Music2 },
  { to: "/category/gaming", label: "Gaming", icon: Gamepad2 },
  { to: "/category/education", label: "Éducation", icon: GraduationCap },
  { to: "/category/news", label: "Actualités", icon: Newspaper },
  { to: "/category/tech", label: "Tech", icon: Cpu },
];

const features = [
  { to: "/premium", label: "Premium", icon: Crown, color: "text-premium" },
  { to: "/trix-store", label: "TRIX Store", icon: Coins, color: "text-trix" },
  { to: "/studio", label: "Lancer un live", icon: Tv2, color: "text-live" },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Mettre en ligne", icon: Upload },
  { to: "/profile", label: "Mon profil", icon: UserIcon },
];

function NavItem({ to, label, icon: Icon, color, active }) {
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
      <Icon className={cn("w-5 h-5 shrink-0", color)} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to || (to === "/stream" && pathname === "/");
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border h-[calc(100vh-64px)] sticky top-16 overflow-y-auto scrollbar-thin py-4 px-3 gap-1">
      <div className="flex flex-col gap-0.5">
        {mainNav.map((item) => (
          <NavItem key={item.to} {...item} active={isActive(item.to)} />
        ))}
      </div>

      <div className="h-px bg-border my-3" />

      <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        Catégories
      </p>
      <div className="flex flex-col gap-0.5">
        {categories.map((item) => (
          <NavItem key={item.to} {...item} active={pathname === item.to} />
        ))}
      </div>

      <div className="h-px bg-border my-3" />

      <div className="flex flex-col gap-0.5">
        {features.map((item) => (
          <NavItem key={item.to} {...item} active={pathname === item.to} />
        ))}
      </div>

      <div className="mt-auto pt-4 px-3">
        <p className="text-[10px] text-muted-foreground font-mono">
          MATRIX © 2026
        </p>
      </div>
    </aside>
  );
}