import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { callNexusEngine } from "@/lib/nexusEngineClient";

/**
 * Resolved permissions + extensions for the current user on a server, computed by the
 * Nexus engine from the dynamic registry. Refreshes live when the admin panel, the server
 * settings or the member's roles change.
 */
export function useServerAccess(serverId) {
  const qc = useQueryClient();
  const enabled = !!serverId && !String(serverId).startsWith("__");
  const queryKey = ["server-access", serverId];

  useEffect(() => {
    if (!enabled) return;
    const invalidate = () => qc.invalidateQueries({ queryKey: ["server-access", serverId] });
    const unsubs = [
      base44.entities.NexusPermission.subscribe(invalidate),
      base44.entities.NexusGlobalExtension.subscribe(invalidate),
      base44.entities.Server.subscribe((e) => { if (e.id === serverId) invalidate(); }),
      base44.entities.ServerMember.subscribe((e) => { if (!e.data || e.data.server_id === serverId) invalidate(); }),
    ];
    return () => unsubs.forEach((u) => u());
  }, [serverId, enabled, qc]);

  const { data } = useQuery({
    queryKey,
    queryFn: () => callNexusEngine("resolveAccess", { serverId }),
    enabled,
    staleTime: 30000,
  });

  const ready = !!data;
  const permsFor = (channelId) => (channelId && data?.channels?.[channelId]) || data?.permissions || {};

  return {
    ready,
    flags: data?.access || {},
    // Optimistic until resolved — the engine re-checks every action server-side.
    can: (key, channelId) => !ready || permsFor(channelId)[key] === true,
    canView: (channelId) => !ready || !data.channels?.[channelId] || data.channels[channelId].view !== false,
    extension: (key) => !ready || data.extensions?.[key] !== false,
  };
}