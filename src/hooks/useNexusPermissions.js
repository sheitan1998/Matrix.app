import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SEED_PERMISSIONS } from "@/lib/nexusSeeds";

// Re-export for backwards compatibility
export { SEED_PERMISSIONS };

/**
 * Fetches all NexusPermission records dynamically from the database.
 * Seeds defaults on first load if empty.
 * Returns permissions grouped by category — same shape as the old hardcoded PERMISSION_CATEGORIES.
 */
export function useNexusPermissions() {
  const qc = useQueryClient();

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["nexus-permissions"],
    queryFn: async () => {
      const res = await base44.entities.NexusPermission.filter({}, "sort_order", 200);
      let list = Array.isArray(res) ? res : res?.items || [];

      if (list.length === 0) {
        await base44.entities.NexusPermission.bulkCreate(SEED_PERMISSIONS);
        const res2 = await base44.entities.NexusPermission.filter({}, "sort_order", 200);
        list = Array.isArray(res2) ? res2 : res2?.items || [];
      }

      return list;
    },
    staleTime: 30000,
  });

  // Group by category, same shape as PERMISSION_CATEGORIES
  const categoryMap = {};
  for (const p of permissions) {
    const cat = p.category || "Général";
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(p);
  }

  const permissionCategories = Object.entries(categoryMap).map(([title, perms]) => ({
    title,
    permissions: perms.map((p) => ({
      key: p.key,
      label: p.label,
      default: p.default_value,
      highlight: p.highlight,
    })),
  }));

  // Flat defaults map
  const permDefaults = {};
  for (const p of permissions) {
    permDefaults[p.key] = p.default_value;
  }

  return { permissions, permissionCategories, permDefaults, isLoading };
}