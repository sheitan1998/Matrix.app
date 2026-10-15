import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { normalizeFortniteMapCode } from "@/lib/fortniteRoutes";

export default function useFortniteMapDetail(value, initialMap = null) {
  const code = normalizeFortniteMapCode(value);
  const hasInitialMap = initialMap?.map_code === code;
  const result = useQuery({
    queryKey: ["fortniteMapDetail", code],
    enabled: !!code && !hasInitialMap,
    staleTime: 15 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      const { data } = await base44.functions.invoke("fortniteApi", { action: "getMapDetails", code });
      if (data?.error) throw new Error(data.error);
      if (!data) throw new Error("Carte Fortnite introuvable");
      return data;
    },
  });

  return {
    map: hasInitialMap ? initialMap : (result.data || null),
    loading: !!code && !hasInitialMap && result.isPending,
    error: result.error,
  };
}
