import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FARMING_FALLBACK } from '@/components/tuto-gaming/farmingFallback';
import { FARMING_MOD_GROUPS } from '@/components/tuto-gaming/farmingModGroups';
import { cacheFarmingCatalog, readCachedFarmingCatalog } from '@/components/tuto-gaming/farmingModCatalog';

const OFFLINE = { categories: FARMING_MOD_GROUPS, firstPage: { items: FARMING_FALLBACK, nextCursor: null, source: 'reference' }, partial: true };
export default function useFarmingCatalog(category, search) {
  const catalog = useQuery({ queryKey: ['farming-catalog-v6'], staleTime: 3600000, retry: false,
    queryFn: async () => {
      try {
        const { data } = await base44.functions.invoke('farmingModApi', { action: 'getCatalog' });
        if (data.error) throw new Error(data.error);
        cacheFarmingCatalog(data);
        return data;
      } catch (error) { return { ...(readCachedFarmingCatalog() || OFFLINE), partial: true, apiError: error.message }; }
    },
  });
  const isAll = category === 'all' && !search;
  const query = useInfiniteQuery({ queryKey: ['farming-mods-v6', category, search], enabled: Boolean(catalog.data),
    initialPageParam: null, staleTime: 3600000, retry: false,
    initialData: () => isAll && catalog.data?.firstPage ? { pages: [catalog.data.firstPage], pageParams: [null] } : undefined,
    queryFn: async ({ pageParam }) => {
      const { data } = await base44.functions.invoke('farmingModApi', { action: 'getMods', category, search, cursor: pageParam });
      if (data.error) throw new Error(data.error);
      return data;
    },
    getNextPageParam: page => page.nextCursor || undefined,
  });
  const pages = query.data?.pages || (isAll && catalog.data ? [catalog.data.firstPage] : []);
  const seen = new Set();
  const items = pages.flatMap(page => page?.items || []).filter(item => {
    if ((category !== 'all' && item.categoryId !== category) || seen.has(String(item.id))) return false;
    seen.add(String(item.id)); return true;
  });
  return { ...query, items, categories: catalog.data?.categories || FARMING_MOD_GROUPS, offline: catalog.data?.partial || pages.some(page => page?.source === 'reference'), loading: catalog.isPending || (query.isPending && !items.length), refresh: async () => { await catalog.refetch(); await query.refetch(); } };
}