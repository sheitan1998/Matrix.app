import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const PRESENCE_UPDATE_INTERVAL = 30 * 1000; // 30 seconds
const VISIBILITY_UPDATE_DELAY = 2000; // 2 seconds after tab becomes visible

/**
 * Hook that tracks the user's presence by updating `last_seen` on the User entity.
 * Updates every 30 seconds while the app is open, and immediately when the tab becomes visible again.
 */
export function usePresence() {
  const { isAuthenticated } = useAuth();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const updatePresence = () => {
      base44.auth
        .updateMe({ last_seen: new Date().toISOString() })
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
  }, [isAuthenticated]);
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