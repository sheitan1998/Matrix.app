import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useVoteCounts(ids, enabled = true) {
  const result = useQuery({
    queryKey: ['fortniteVotes', (ids || []).join(',')], enabled: enabled && !!ids?.length, staleTime: 30000, retry: false,
    queryFn: async () => {
      const counts = {};
      for (let index = 0; index < ids.length; index += 250) {
        const { data } = await base44.functions.invoke('fortniteApi', { action: 'getCosmeticVoteCounts', cosmetic_ids: ids.slice(index, index + 250) });
        Object.assign(counts, data);
      }
      return counts;
    },
  });
  return result.data || null;
}