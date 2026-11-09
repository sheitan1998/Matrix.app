import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications as useNotificationList } from "@/hooks/useNotifications";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import MessagingPanel from "@/components/messaging/MessagingPanel";

const NEON_ACTIVE_BG = "linear-gradient(90deg, rgba(147, 51, 234, 0.35) 0%, rgba(88, 28, 135, 0.12) 100%)";
const NEON_ACTIVE_BORDER = "2px solid rgba(168, 85, 247, 1)";
const NEON_ACTIVE_SHADOW = "0 0 16px rgba(168, 85, 247, 0.4), inset 0 0 12px rgba(168, 85, 247, 0.08)";
const LIGHT_ACTIVE_BG = "rgba(124,58,237,0.08)";
const LIGHT_ACTIVE_BORDER = "2px solid #7c3aed";

function CountBadge({ count, color, collapsed }) {
  if (!count) return null;
  const label = count > 99 ? "99+" : count;

  if (collapsed) {
    return (
      <span
        className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
        style={{ background: color }}
      >
        {count > 9 ? "9+" : count}
      </span>
    );
  }

  return (
    <span
      className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
      style={{ background: color, boxShadow: `0 0 6px ${color}99` }}
    >
      {label}
    </span>
  );
}

export default function SidebarQuickActions({ collapsed = false, isLight = false }) {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { unreadCount: notificationCount } = useNotificationList(user);
  const { unreadCount: messageCount, open, preselectedEmail, openInbox, closeInbox, markMessagesRead } =
    useUnreadMessages(user, isAuthenticated);

  if (!isAuthenticated || !user) return null;

  const isNotificationsActive = pathname === "/notifications";

  const baseClass = cn(
    "relative flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent",
    collapsed && "justify-center px-0",
    isLight ? "text-gray-600 hover:text-gray-900 hover:bg-black/5" : "text-muted-foreground hover:text-white hover:bg-white/5"
  );

  const activeStyle = isLight
    ? { background: LIGHT_ACTIVE_BG, borderLeft: collapsed ? undefined : LIGHT_ACTIVE_BORDER }
    : {
        background: NEON_ACTIVE_BG,
        borderLeft: collapsed ? undefined : NEON_ACTIVE_BORDER,
        boxShadow: NEON_ACTIVE_SHADOW,
      };

  // Le halo néon des icônes est géré par `.sqr-icon-neon` (index.css) afin
  // d'être présent au repos et de s'intensifier au survol du bouton.
  const iconStyle = isLight ? { color: "#7c3aed" } : undefined;
  const iconClass = cn("w-[18px] h-[18px] shrink-0", !isLight && "sqr-icon-neon");

  const label = (text) => (
    <span className={cn("truncate transition-all duration-200 overflow-hidden", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
      {text}
    </span>
  );

  return (
    <>
      <button
        type="button"
        onClick={openInbox}
        className={cn(baseClass, "sqr-action")}
        title={collapsed ? "Messagerie" : undefined}
      >
        <Mail className={iconClass} style={iconStyle} />
        {label("Messagerie")}
        <CountBadge count={messageCount} color="#ec4899" collapsed={collapsed} />
      </button>

      <button
        type="button"
        onClick={() => nav("/notifications")}
        className={cn(baseClass, "sqr-action")}
        style={isNotificationsActive ? activeStyle : undefined}
        title={collapsed ? "Notifications" : undefined}
      >
        <Bell className={iconClass} style={iconStyle} />
        {label("Notifications")}
        <CountBadge count={notificationCount} color="#ef4444" collapsed={collapsed} />
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