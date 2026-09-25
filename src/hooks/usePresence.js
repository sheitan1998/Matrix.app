import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const PRESENCE_UPDATE_INTERVAL = 30 * 1000; // 30 seconds
const VISIBILITY_UPDATE_DELAY = 2000; // 2 seconds after tab becomes visible

/**
 * Maps a route path to a human-readable activity label.
 */
function getActivityFromPath(pathname) {
  if (!pathname) return { label: "En ligne", type: "idle" };

  // Order matters — more specific routes first
  const map = [
    { match: "/casino", label: "Joue au Casino", type: "gaming" },
    { match: "/shorts", label: "Regarde des Shorts", type: "streaming" },
    { match: "/tuto-gaming", label: "Explore les tutoriels gaming", type: "browsing" },
    { match: "/twitch/watch", label: "Regarde un stream Twitch", type: "streaming" },
    { match: "/twitch", label: "Parcourt Twitch", type: "streaming" },
    { match: "/watch", label: "Regarde une vidéo", type: "streaming" },
    { match: "/stream", label: "Sur la page d'accueil", type: "browsing" },
    { match: "/live", label: "Regarde des lives", type: "streaming" },
    { match: "/community", label: "Dans la Communauté", type: "social" },
    { match: "/ai", label: "Utilise l'AI Studio", type: "creating" },
    { match: "/video-studio", label: "Édite une vidéo", type: "creating" },
    { match: "/upload", label: "Publie du contenu", type: "creating" },
    { match: "/progression", label: "Consulte sa progression", type: "browsing" },
    { match: "/wallet", label: "Gère son portefeuille", type: "browsing" },
    { match: "/trix-store", label: "Visite la boutique Trix", type: "shopping" },
    { match: "/boutique-matrix", label: "Visite la boutique Matrix", type: "shopping" },
    { match: "/boutique-nexus", label: "Visite la boutique Nexus", type: "shopping" },
    { match: "/market", label: "Parcourt le marché", type: "shopping" },
    { match: "/prospecteurs", label: "Cherche des joueurs", type: "browsing" },
    { match: "/sondages", label: "Participe aux sondages", type: "social" },
    { match: "/mon-profil", label: "Consulte son profil", type: "browsing" },
    { match: "/notifications", label: "Consulte ses notifications", type: "browsing" },
    { match: "/outils", label: "Utilise des outils", type: "browsing" },
    { match: "/playlists", label: "Gère ses playlists", type: "browsing" },
    { match: "/dashboard", label: "Consulte son dashboard", type: "browsing" },
    { match: "/admin", label: "Gère l'administration", type: "browsing" },
    { match: "/search", label: "Fait une recherche", type: "browsing" },
    { match: "/trending", label: "Explore les tendances", type: "browsing" },
    { match: "/subscriptions", label: "Gère ses abonnements", type: "browsing" },
    { match: "/category", label: "Parcourt les catégories", type: "browsing" },
    { match: "/", label: "Sur la page d'accueil", type: "browsing" },
  ];

  for (const entry of map) {
    if (pathname.startsWith(entry.match)) {
      return { label: entry.label, type: entry.type };
    }
  }
  return { label: "En ligne", type: "idle" };
}

/**
 * Hook that tracks the user's presence and current activity by updating
 * `last_seen` and `current_activity` on the User entity.
 * Updates every 30 seconds while the app is open, immediately when the tab
 * becomes visible again, and whenever the route changes.
 */
export function usePresence() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const updatePresence = () => {
      const { label, type } = getActivityFromPath(location.pathname);
      const activityKey = label + "|" + type;
      // Only update activity if it changed, but always update last_seen
      const shouldUpdateActivity = activityKey !== lastActivityRef.current;
      if (shouldUpdateActivity) {
        lastActivityRef.current = activityKey;
      }
      base44.auth
        .updateMe({
          last_seen: new Date().toISOString(),
          current_activity: label,
          current_activity_type: type,
        })
        .catch(() => {});
    };

    // Update immediately
    updatePresence();

    // Set up interval
    intervalRef.current = setInterval(updatePresence, PRESENCE_UPDATE_INTERVAL);

    // Update when tab becomes visible again
    const handleVisibility = () => {
      if (!document.hidden) {
        setTimeout(updatePresence, VISIBILITY_UPDATE_DELAY);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isAuthenticated, location.pathname]);
}

/**
 * Checks if a user is online based on their last_seen timestamp.
 * Online = last_seen within the last 2 minutes.
 */
export function isUserOnline(lastSeen) {
  if (!lastSeen) return false;
  const diff = Date.now() - new Date(lastSeen).getTime();
  return diff < 2 * 60 * 1000; // 2 minutes
}

/**
 * Returns the activity icon (emoji) for a given activity type.
 */
export function getActivityIcon(type) {
  const icons = {
    gaming: "🎮",
    streaming: "📺",
    browsing: "🌐",
    creating: "🎨",
    social: "💬",
    shopping: "🛒",
    idle: "🟢",
  };
  return icons[type] || icons.idle;
}