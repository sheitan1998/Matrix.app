import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Mail } from "lucide-react";
import { useSidebarPresence } from "@/hooks/useSidebarPresence";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import MessagingPanel from "@/components/messaging/MessagingPanel";

const EXCLUDED_PREFIXES = [
"/twitch", "/nexus", "/mon-profil", "/login", "/register",
"/forgot-password", "/reset-password", "/oauth"];


function FloatingMessageButton() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const isExcluded = useMemo(() => {
    const p = location.pathname;
    if (p === "/live" || p.startsWith("/live/")) return true;
    return EXCLUDED_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix + "/"));
  }, [location.pathname]);

  const { unreadCount, open, preselectedEmail, openInbox, closeInbox, markMessagesRead } =
  useUnreadMessages(user, isAuthenticated && !isExcluded);

  if (!isAuthenticated || !user || isExcluded) return null;

  return (
    <>
      






















      

      <MessagingPanel
        user={user}
        open={open}
        preselectedEmail={preselectedEmail}
        onClose={closeInbox}
        onMessagesRead={markMessagesRead} />
      
    </>);

}

export default function GlobalMessageButton() {
  const hasSidebar = useSidebarPresence();
  if (hasSidebar) return null;
  return <FloatingMessageButton />;
}