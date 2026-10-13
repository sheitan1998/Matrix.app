import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useFortniteDetail(item) {
  const details = useQuery({
    queryKey: ['fortniteDetail', item?.id], enabled: !!item?.id, staleTime: 3600000, retry: false,
    queryFn: async () => (await base44.functions.invoke('fortniteApi', { action: 'getCosmeticDetails', id: item.id })).data,
  });
  const full = item ? { ...item, ...details.data, name: item.name, image: item.image || details.data?.image,
    images: item.images || details.data?.images } : null;
  const setName = full?.set_name || full?.series;
  const set = useQuery({
    queryKey: ['fortniteSet', setName], enabled: !!setName, staleTime: 3600000, retry: false,
    queryFn: async () => (await base44.functions.invoke('fortniteApi', { action: 'getSetItems', set: setName })).data,
  });
  const votes = useQuery({
    queryKey: ['fortniteVotes', item?.id], enabled: !!item?.id, staleTime: 30000, retry: false,
    queryFn: async () => (await base44.functions.invoke('fortniteApi', { action: 'getCosmeticVoteCounts', cosmetic_ids: [item.id] })).data,
  });
  return { full, loading: details.isPending, error: details.error, setItems: set.data || [], counts: votes.data?.[item?.id] || null };
}