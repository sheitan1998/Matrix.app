import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Hook to invoke the Twitch Helix API backend function.
 * Returns mapped data matching normalized Twitch shapes (stream, channel, category, user).
 * Falls back to [] / null on error (key missing, quota, network).
 */
export function useTwitch(action, params = {}, options = {}) {
  return useQuery({
    queryKey: ["twitch", action, JSON.stringify(params)],
    queryFn: async () => {
      const res = await base44.functions.invoke("twitchApi", { action, ...params });
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
    retry: 1,
    ...options,
  });
}

/** Direct invoke (for use inside event handlers or non-query contexts) */
export async function fetchTwitch(action, params = {}) {
  try {
    const res = await base44.functions.invoke("twitchApi", { action, ...params });
    return res.data?.data || [];
  } catch (e) {
    console.error(`[fetchTwitch] ${action} failed:`, e?.response?.data || e?.message || e);
    return [];
  }
}