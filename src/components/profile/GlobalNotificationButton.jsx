import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useSidebarPresence } from "@/hooks/useSidebarPresence";

const EXCLUDED_PREFIXES = [
"/twitch", "/nexus", "/mon-profil", "/login", "/register",
"/forgot-password", "/reset-password", "/oauth"];


function FloatingNotificationButton() {
  const location = useLocation();
  const nav = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications(user);

  const isExcluded = useMemo(() => {
    const p = location.pathname;
    if (p === "/live" || p.startsWith("/live/")) return true;
    return EXCLUDED_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix + "/"));
  }, [location.pathname]);

  if (!isAuthenticated || !user || isExcluded) return null;

  return null;

























}

export default function GlobalNotificationButton() {
  const hasSidebar = useSidebarPresence();
  if (hasSidebar) return null;
  return <FloatingNotificationButton />;
}