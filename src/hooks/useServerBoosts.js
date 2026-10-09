import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Shared hook for server boost data.
 * Uses react-query so ServerBoostButton (header) and ServerBoostsPanel (settings)
 * share the same cache — when one refetches, the other updates instantly.
 *
 * The backend (getServerBoosts) also resyncs the server.boosts counter,
 * so this hook always returns the exact number of active, non-expired boosts.
 */
export function useServerBoosts(serverId, initialBoosts = 0) {
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["server-boosts", serverId],
    queryFn: async () => {
      if (!serverId) return { boosts: [], server_boosts: 0, legacy_count: 0 };
      const res = await base44.functions.invoke("serverSearch", {
        action: "getServerBoosts",
        serverId,
      });
      return res || { boosts: [], server_boosts: 0, legacy_count: 0 };
    },
    enabled: !!serverId,
    refetchInterval: 60000, // auto-refresh every 60s to catch expirations
    staleTime: 0,
    initialData: serverId
      ? { boosts: [], server_boosts: initialBoosts, legacy_count: 0 }
      : undefined,
  });

  const activeCount = data?.server_boosts || 0;
  const boosts = data?.boosts || [];
  const legacyCount = data?.legacy_count || 0;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["server-boosts", serverId] });

  return { activeCount, boosts, legacyCount, loading: isLoading, refetch, invalidate };
}

/**
 * Notifies the parent when the active boost count (from the server) differs
 * from the stale `server.boosts` value, so the parent can update its state
 * and the global counter stays in sync with the panel.
 */
export function useBoostCountSync(serverBoosts, activeCount, flashBoosts, onBoosted) {
  const onBoostedRef = useRef(onBoosted);
  onBoostedRef.current = onBoosted;
  const flashRef = useRef(flashBoosts);
  flashRef.current = flashBoosts;

  useEffect(() => {
    if (activeCount != null && activeCount !== serverBoosts) {
      onBoostedRef.current?.(activeCount, flashRef.current);
    }
  }, [activeCount, serverBoosts]);
}