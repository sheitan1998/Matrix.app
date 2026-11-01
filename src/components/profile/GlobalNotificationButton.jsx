import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useSidebarPresence } from "@/hooks/useSidebarPresence";

const EXCLUDED_PREFIXES = [
  "/twitch", "/nexus", "/mon-profil", "/login", "/register",
  "/forgot-password", "/reset-password", "/oauth",
];

function FloatingNotificationButton() {
  const location = useLocation();
  const nav = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications(user);

  const isExcluded = useMemo(() => {
    const p = location.pathname;
    if (p === "/live" || p.startsWith("/live/")) return true;
    return EXCLUDED_PREFIXES.some(prefix => p === prefix || p.startsWith(prefix + "/"));
  }, [location.pathname]);

  if (!isAuthenticated || !user || isExcluded) return null;

  return (
    <button
      onClick={() => nav("/notifications")}
      className="fixed top-2.5 right-[52px] z-[55] w-9 h-9 rounded-full flex items-center justify-center transition hover:scale-105 active:scale-95"
      style={{
        background: "hsl(var(--popover) / 0.85)",
        border: "1.5px solid hsl(var(--border))",
        boxShadow: "0 4px 16px hsl(var(--primary) / 0.2)",
        backdropFilter: "blur(12px)",
      }}
      title="Notifications"
    >
      <Bell className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ background: "#ef4444", boxShadow: "0 0 6px rgba(239,68,68,0.6)" }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

export default function GlobalNotificationButton() {
  const hasSidebar = useSidebarPresence();
  if (hasSidebar) return null;
  return <FloatingNotificationButton />;
}