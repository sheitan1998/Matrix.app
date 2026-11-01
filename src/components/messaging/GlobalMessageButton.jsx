import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Mail } from "lucide-react";
import { useSidebarPresence } from "@/hooks/useSidebarPresence";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import MessagingPanel from "@/components/messaging/MessagingPanel";

const EXCLUDED_PREFIXES = [
  "/twitch", "/nexus", "/mon-profil", "/login", "/register",
  "/forgot-password", "/reset-password", "/oauth",
];

function FloatingMessageButton() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const isExcluded = useMemo(() => {
    const p = location.pathname;
    if (p === "/live" || p.startsWith("/live/")) return true;
    return EXCLUDED_PREFIXES.some(prefix => p === prefix || p.startsWith(prefix + "/"));
  }, [location.pathname]);

  const { unreadCount, open, preselectedEmail, openInbox, closeInbox, markMessagesRead } =
    useUnreadMessages(user, isAuthenticated && !isExcluded);

  if (!isAuthenticated || !user || isExcluded) return null;

  return (
    <>
      <button
        onClick={openInbox}
        className="fixed top-2.5 right-[94px] z-[55] w-9 h-9 rounded-full flex items-center justify-center transition hover:scale-105 active:scale-95"
        style={{
          background: "hsl(var(--popover) / 0.85)",
          border: "1.5px solid hsl(var(--border))",
          boxShadow: "0 4px 16px hsl(var(--primary) / 0.2)",
          backdropFilter: "blur(12px)",
        }}
        title="Messagerie"
      >
        <Mail className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "#ec4899", boxShadow: "0 0 6px rgba(236,72,153,0.6)" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <MessagingPanel
        user={user}
        open={open}
        preselectedEmail={preselectedEmail}
        onClose={closeInbox}
        onMessagesRead={markMessagesRead}
      />
    </>
  );
}

export default function GlobalMessageButton() {
  const hasSidebar = useSidebarPresence();
  if (hasSidebar) return null;
  return <FloatingMessageButton />;
}