import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications as useNotificationList } from "@/hooks/useNotifications";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import MessagingPanel from "@/components/messaging/MessagingPanel";

// Mêmes variables néon que la navigation de la sidebar (Sidebar.jsx) :
// la couleur personnalisée du thème s'applique donc aussi à ces deux icônes.
const NEON_ICON_GLOW = "var(--app-neon-icon-glow)";
const NEON_ICON_IDLE = "var(--app-neon-icon-idle)";
const NEON_ICON_COLOR = "var(--app-neon-icon)";
const NEON_ICON_BRIGHT = "var(--app-neon-bright)";
const NEON_ACTIVE_BG = "var(--app-neon-active-bg)";
const NEON_ACTIVE_BORDER = "var(--app-neon-active-border)";
const NEON_ACTIVE_SHADOW = "var(--app-neon-active-shadow)";
const NEON_ACTIVE_TEXT = "var(--app-neon-active-text)";
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

/** Bouton identique à un NavItem de la sidebar (glow au survol, thème néon, light mode). */
function QuickActionButton({ icon: Icon, text, count, badgeColor, active, onClick, collapsed, isLight }) {
  const [hovered, setHovered] = useState(false);
  const glow = active || hovered;

  const iconColor = isLight
    ? (glow ? "#6d28d9" : "#7c3aed")
    : (glow ? NEON_ICON_BRIGHT : NEON_ICON_COLOR);
  const iconFilter = isLight ? "none" : (glow ? NEON_ICON_GLOW : NEON_ICON_IDLE);

  const className = cn(
    "relative flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent",
    collapsed && "justify-center px-0",
    isLight
      ? (glow ? "text-gray-900" : "text-gray-600")
      : (glow ? "text-white" : "text-muted-foreground")
  );

  const style = glow
    ? isLight
      ? { background: LIGHT_ACTIVE_BG, borderLeft: collapsed ? undefined : LIGHT_ACTIVE_BORDER }
      : { background: NEON_ACTIVE_BG, borderLeft: collapsed ? undefined : NEON_ACTIVE_BORDER, boxShadow: NEON_ACTIVE_SHADOW, textShadow: NEON_ACTIVE_TEXT }
    : isLight
      ? { background: hovered ? "rgba(0,0,0,0.04)" : undefined }
      : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      style={style}
      title={collapsed ? text : undefined}
    >
      <Icon className="w-[18px] h-[18px] shrink-0 transition-colors" style={{ color: iconColor, filter: iconFilter }} />
      <span className={cn("truncate transition-all duration-200 overflow-hidden", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
        {text}
      </span>
      <CountBadge count={count} color={badgeColor} collapsed={collapsed} />
    </button>
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

  return (
    <>
      <QuickActionButton
        icon={Mail}
        text="Messagerie"
        count={messageCount}
        badgeColor="#ec4899"
        onClick={openInbox}
        collapsed={collapsed}
        isLight={isLight}
      />

      <QuickActionButton
        icon={Bell}
        text="Notifications"
        count={notificationCount}
        badgeColor="#ef4444"
        active={pathname === "/notifications"}
        onClick={() => nav("/notifications")}
        collapsed={collapsed}
        isLight={isLight}
      />

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