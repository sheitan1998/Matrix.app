import { useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";

const COOLDOWN_MINUTES = 30;
const COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000;

function getStorageKey(contentType, contentId) {
  return `mt_view_${contentType}_${contentId}`;
}

/**
 * Hook for tracking publication views with basic anti-spam protection.
 *
 * A view is counted once per content per user session (in-memory Set) and at most
 * once every COOLDOWN_MINUTES minutes per browser (localStorage timestamp).
 * When a valid new view is registered, the entity's `views` field is atomically
 * incremented via $inc (no read-modify-write race condition).
 *
 * @returns {{ trackView: (contentType: string, contentId: string, entityName: string) => void }}
 */
export function useViewTracker() {
  const tracked = useRef(new Set());

  const trackView = useCallback((contentType, contentId, entityName) => {
    if (!contentType || !contentId || !entityName) return;

    const memKey = `${contentType}:${contentId}`;
    if (tracked.current.has(memKey)) return;

    const lsKey = getStorageKey(contentType, contentId);
    try {
      const last = localStorage.getItem(lsKey);
      if (last) {
        const elapsed = Date.now() - parseInt(last, 10);
        if (elapsed < COOLDOWN_MS) return;
      }
    } catch {
      /* localStorage unavailable — proceed without cooldown */
    }

    tracked.current.add(memKey);
    try {
      localStorage.setItem(lsKey, Date.now().toString());
    } catch {
      /* silent */
    }

    base44.entities[entityName]
      .updateMany({ id: contentId }, { $inc: { views: 1 } })
      .catch(() => {});
  }, []);

  return { trackView };
}