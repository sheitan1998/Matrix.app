import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useVoice } from "@/context/VoiceContext";

/**
 * Live voice rooms of a server (initial fetch + realtime updates) and the set of
 * lower-cased emails currently speaking. The local user's own speaking state comes
 * straight from the microphone analysis, so their ring reacts instantly.
 */
export function useServerVoice(serverId) {
  const qc = useQueryClient();
  const { connected, user, localSpeaking } = useVoice();

  const { data: rooms = [] } = useQuery({
    queryKey: ["voice-rooms-server", serverId],
    queryFn: async () => {
      const res = await base44.entities.VoiceRoom.filter({ server_id: serverId }, "-created_date", 50);
      return Array.isArray(res) ? res : res?.items || [];
    },
    enabled: !!serverId,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!serverId) return;
    const key = ["voice-rooms-server", serverId];
    return base44.entities.VoiceRoom.subscribe((event) => {
      if (event.type === "delete") {
        const id = event.id || event.data?.id;
        qc.setQueryData(key, (prev = []) => prev.filter((r) => r.id !== id));
        return;
      }
      const room = event.data;
      if (!room || room.server_id !== serverId) return;
      qc.setQueryData(key, (prev = []) =>
        prev.some((r) => r.id === room.id)
          ? prev.map((r) => (r.id === room.id ? room : r))
          : [room, ...prev]
      );
    });
  }, [serverId, qc]);

  const speakingEmails = useMemo(() => {
    const set = new Set();
    rooms.forEach((r) =>
      (r.participants || []).forEach((p) => {
        if (p.speaking && p.micOn !== false && p.email) set.add(p.email.toLowerCase());
      })
    );
    const me = user?.email?.toLowerCase();
    if (connected && me) {
      if (localSpeaking) set.add(me);
      else set.delete(me);
    }
    return set;
  }, [rooms, connected, user, localSpeaking]);

  return { rooms, speakingEmails };
}