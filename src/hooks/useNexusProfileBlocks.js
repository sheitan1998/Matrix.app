import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { SEED_PROFILE_BLOCKS } from "@/lib/nexusSeeds";

/**
 * Fetches all NexusProfileBlock records dynamically from the database.
 * Seeds defaults on first load if empty.
 * Subscribes to real-time changes so admin panel edits are reflected instantly.
 */
export function useNexusProfileBlocks() {
  const qc = useQueryClient();

  useEffect(() => {
    const unsubscribe = base44.entities.NexusProfileBlock.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["nexus-profile-blocks"] });
    });
    return unsubscribe;
  }, [qc]);

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["nexus-profile-blocks"],
    queryFn: async () => {
      const res = await base44.entities.NexusProfileBlock.filter({}, "sort_order", 200);
      let list = Array.isArray(res) ? res : res?.items || [];

      if (list.length === 0) {
        await base44.entities.NexusProfileBlock.bulkCreate(SEED_PROFILE_BLOCKS);
        const res2 = await base44.entities.NexusProfileBlock.filter({}, "sort_order", 200);
        list = Array.isArray(res2) ? res2 : res2?.items || [];
      }

      return list;
    },
    staleTime: 0,
  });

  return { blocks, isLoading };
}