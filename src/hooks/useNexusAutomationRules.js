import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { SEED_AUTOMATION_RULES } from "@/lib/nexusSeeds";

/**
 * Fetches all NexusAutomationRule records dynamically from the database.
 * Seeds defaults on first load if empty.
 * Subscribes to real-time changes so admin panel edits are reflected instantly in server settings.
 */
export function useNexusAutomationRules() {
  const qc = useQueryClient();

  useEffect(() => {
    const unsubscribe = base44.entities.NexusAutomationRule.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["nexus-automation-rules"] });
    });
    return unsubscribe;
  }, [qc]);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["nexus-automation-rules"],
    queryFn: async () => {
      const res = await base44.entities.NexusAutomationRule.filter({}, "sort_order", 200);
      let list = Array.isArray(res) ? res : res?.items || [];

      if (list.length === 0) {
        await base44.entities.NexusAutomationRule.bulkCreate(SEED_AUTOMATION_RULES);
        const res2 = await base44.entities.NexusAutomationRule.filter({}, "sort_order", 200);
        list = Array.isArray(res2) ? res2 : res2?.items || [];
      }

      return list;
    },
    staleTime: 0,
  });

  return { rules, isLoading };
}