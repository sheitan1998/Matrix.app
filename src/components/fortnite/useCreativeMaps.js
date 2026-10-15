import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useCreativeMaps(search, category, mode) {
  const [term, setTerm] = useState(search);
  useEffect(() => { const timer = setTimeout(() => setTerm(search), 350); return () => clearTimeout(timer); }, [search]);
  const result = useInfiniteQuery({
    queryKey: ['fortniteCreative', term, category, mode], initialPageParam: null,
    staleTime: 900000, refetchInterval: 900000, retry: false,
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await base44.functions.invoke('fortniteApi', { action: 'getCreativeMaps', search: term, category, mode, cursor: pageParam });
      if (signal.aborted) throw new DOMException('Requête remplacée', 'AbortError');
      if (data.error) throw new Error(data.error);
      return data;
    },
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined,
  });
  const pages = result.data?.pages || [];
  const maps = [...new Map(pages.flatMap(page => page.items || []).map(map => [map.map_code, map])).values()];
  return { maps, loading: result.isPending, error: result.error, cachedAt: pages[0]?.cached_at,
    hasMore: !!result.hasNextPage, loadingMore: result.isFetchingNextPage,
    loadMore: () => !result.isFetchingNextPage && result.fetchNextPage(), retry: () => result.refetch() };
}