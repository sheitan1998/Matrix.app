import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { SEED_GLOBAL_EXTENSIONS } from "@/lib/nexusSeeds";

/**
 * Fetches all NexusGlobalExtension records dynamically from the database.
 * Seeds defaults on first load if empty.
 * Subscribes to real-time changes so admin panel edits are reflected instantly.
 */
export function useNexusGlobalExtensions() {
  const qc = useQueryClient();

  useEffect(() => {
    const unsubscribe = base44.entities.NexusGlobalExtension.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["nexus-global-extensions"] });
    });
    return unsubscribe;
  }, [qc]);

  const { data: extensions = [], isLoading } = useQuery({
    queryKey: ["nexus-global-extensions"],
    queryFn: async () => {
      const res = await base44.entities.NexusGlobalExtension.filter({}, "sort_order", 200);
      let list = Array.isArray(res) ? res : res?.items || [];

      if (list.length === 0) {
        await base44.entities.NexusGlobalExtension.bulkCreate(SEED_GLOBAL_EXTENSIONS);
        const res2 = await base44.entities.NexusGlobalExtension.filter({}, "sort_order", 200);
        list = Array.isArray(res2) ? res2 : res2?.items || [];
      }

      return list;
    },
    staleTime: 0,
  });

  return { extensions, isLoading };
}