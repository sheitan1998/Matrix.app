import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getTauriInvoke } from "@/lib/tauriInvoke";
import { DETECTABLE_GAMES } from "@/lib/detectedGames";

const PRESENCE_UPDATE_INTERVAL = 30 * 1000; // 30 seconds
const VISIBILITY_UPDATE_DELAY = 2000; // 2 seconds after tab becomes visible
const GAME_DETECTION_INTERVAL = 60 * 1000; // 60 seconds

/**
 * Maps a route path to a human-readable activity label.
 */
function getActivityFromPath(pathname) {
  if (!pathname) return { label: "En ligne", type: "idle" };

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
 * Detects running games by calling the Tauri command `detect_running_games`.
 * Returns the display info of the first detected game, or null if no game is running
 * or if not running in a Tauri environment.
 */
async function detectRunningGame() {
  const invoke = await getTauriInvoke();
  if (!invoke) return null;

  try {
    const processNames = Object.keys(DETECTABLE_GAMES);
    const result = await invoke("detect_running_games", { processNames });
    if (result && Array.isArray(result) && result.length > 0) {
      const key = result[0].toLowerCase().replace(/\.exe$/i, "").trim();
      return DETECTABLE_GAMES[key] || null;
    }
  } catch {
    // Not in Tauri environment or command not available — silently ignore
  }
  return null;
}

/**
 * Hook that tracks the user's presence and current activity by updating
 * `last_seen` and `current_activity` on the User entity.
 *
 * Activity priority:
 * 1. Custom status (if set by user)
 * 2. Detected game (via Tauri process detection)
 * 3. Route-based activity
 *
 * Updates every 30 seconds while the app is open, immediately when the tab
 * becomes visible again, and whenever the route changes.
 * Game detection runs every 60 seconds.
 */
export function usePresence() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const intervalRef = useRef(null);
  const gameDetectionRef = useRef(null);
  const lastActivityRef = useRef(null);
  const detectedGameRef = useRef(null);

  // Game detection loop — runs independently of route changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const detectGame = async () => {
      const game = await detectRunningGame();
      detectedGameRef.current = game;
    };

    detectGame();
    gameDetectionRef.current = setInterval(detectGame, GAME_DETECTION_INTERVAL);

    return () => {
      if (gameDetectionRef.current) clearInterval(gameDetectionRef.current);
    };
  }, [isAuthenticated]);

  // Presence update loop
  useEffect(() => {
    if (!isAuthenticated) return;

    const updatePresence = () => {
      // Priority: custom status > detected game > route-based activity
      let label, type;

      if (user?.custom_status) {
        label = user.custom_status;
        type = "custom";
      } else if (detectedGameRef.current) {
        label = `Joue à ${detectedGameRef.current.label}`;
        type = "gaming";
      } else {
        const routeActivity = getActivityFromPath(location.pathname);
        label = routeActivity.label;
        type = routeActivity.type;
      }

      const activityKey = label + "|" + type;
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
  }, [isAuthenticated, location.pathname, user?.custom_status]);
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
    custom: "✏️",
  };
  return icons[type] || icons.idle;
}