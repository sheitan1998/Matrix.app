import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Hook to invoke the YouTube Data API v3 backend function.
 * Returns mapped data matching the app's entity shapes (Video, Channel, Comment).
 * Falls back to [] on error (quota, key missing, network).
 */
export function useYouTube(action, params = {}, options = {}) {
  return useQuery({
    queryKey: ["youtube", action, JSON.stringify(params)],
    queryFn: async () => {
      const res = await base44.functions.invoke("youtubeApi", { action, ...params });
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
    retry: 1,
    ...options,
  });
}

/** Direct invoke (for use inside other queryFn callbacks that merge local + YouTube data) */
export async function fetchYouTube(action, params = {}) {
  try {
    const res = await base44.functions.invoke("youtubeApi", { action, ...params });
    const result = res.data?.data || [];
    console.log(`[fetchYouTube] ${action}: ${Array.isArray(result) ? result.length : 1} items`);
    return result;
  } catch (e) {
    console.error(`[fetchYouTube] ${action} failed:`, e?.response?.data || e?.message || e);
    return [];
  }
}

/** Merge YouTube + local arrays, deduplicating by id, YouTube first */
export function mergeYouTubeLocal(yt, local) {
  const seen = new Set();
  return [...(yt || []), ...(local || [])].filter(v => {
    if (!v?.id || seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
}