import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, TrendingUp, Clapperboard, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/stream", icon: Home, label: "Accueil" },
  { to: "/trending", icon: TrendingUp, label: "Tendances" },
  { to: "/shorts", icon: Clapperboard, label: "Shorts" },
  { to: "/profile", icon: User, label: "Profil" },
];

export default function BottomTabs() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {TABS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <button
              key={to}
              onClick={() => {
                if (active) {
                  // Reset: navigate to root of this tab (replaces history stack)
                  navigate(to, { replace: true });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  navigate(to);
                }
              }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] transition-colors select-none",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}