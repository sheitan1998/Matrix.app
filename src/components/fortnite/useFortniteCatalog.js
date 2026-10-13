import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useFortniteCatalog(action, { query = '', type = 'all', enabled = true } = {}) {
  const result = useInfiniteQuery({
    queryKey: ['fortniteCatalog', action, query, type],
    enabled,
    initialPageParam: 1,
    staleTime: 60 * 60 * 1000,
    retry: false,
    queryFn: async ({ pageParam }) => {
      const { data } = await base44.functions.invoke('fortniteApi', { action, query, type, page: pageParam, limit: 24 });
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
    loadMore: () => result.fetchNextPage(),
    error: result.error,
  };
}