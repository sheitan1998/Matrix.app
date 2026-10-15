import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useFortniteCatalog(action, { query = '', type = 'all', enabled = true } = {}) {
  const [term, setTerm] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);
  const result = useInfiniteQuery({
    queryKey: ['fortniteCatalog', action, term, type],
    enabled,
    initialPageParam: 1,
    staleTime: 60 * 60 * 1000,
    retry: false,
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await base44.functions.invoke('fortniteApi', { action, query: term, type, page: pageParam, limit: 24 });
      if (signal.aborted) throw new DOMException('Requête remplacée', 'AbortError');
      if (data.error) throw new Error(data.error);
      return data;
    },
    getNextPageParam: page => page.has_more ? page.next_page : undefined,
  });
  return {
    items: result.data?.pages.flatMap(page => page.items || page.entries || []) || [],
    total: result.data?.pages[0]?.total || 0,
    date: result.data?.pages[0]?.date,
    loading: enabled && result.isPending,
    loadingMore: result.isFetchingNextPage,
    hasMore: !!result.hasNextPage,
    loadMore: () => !result.isFetchingNextPage && result.fetchNextPage(),
    error: result.error,
  };
}