import { useEffect, useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useFortniteMaps(search, category) {
  const client = useQueryClient();
  const [term, setTerm] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setTerm(search), 200);
    return () => clearTimeout(timer);
  }, [search]);
  const result = useInfiniteQuery({
    queryKey: ['fortniteMaps', term, category],
    initialPageParam: null,
    staleTime: 900000,
    refetchInterval: 900000,
    retry: false,
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await base44.functions.invoke('fortniteApi', {
        action: 'getMaps', search: term, category, cursor: pageParam, limit: 24,
      });
      if (signal.aborted) throw new DOMException('Requête remplacée', 'AbortError');
      if (data.error) throw new Error(data.error);
      return data;
    },
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined,
  });
  useEffect(() => base44.entities.FortniteMap.subscribe(() => {
    client.invalidateQueries({ queryKey: ['fortniteMaps'] });
  }), [client]);
  return {
    maps: result.data?.pages.flatMap(page => page.items) || [],
    total: result.data?.pages[0]?.total || 0,
    loading: result.isPending,
    error: result.error,
    hasMore: !!result.hasNextPage,
    loadingMore: result.isFetchingNextPage,
    loadMore: () => !result.isFetchingNextPage && result.fetchNextPage(),
    refresh: () => client.invalidateQueries({ queryKey: ['fortniteMaps'] }),
  };
}