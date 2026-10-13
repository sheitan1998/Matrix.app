import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Fetches vote counts for a batch of cosmetic IDs in one call.
export default function useVoteCounts(ids, enabled = true) {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    if (!enabled || !ids || ids.length === 0) return;
    let cancelled = false;
    base44.functions.invoke('fortniteApi', { action: 'getCosmeticVoteCounts', cosmetic_ids: ids })
      .then((res) => { if (!cancelled) setCounts(res.data || {}); })
      .catch(() => { if (!cancelled) setCounts({}); });
    return () => { cancelled = true; };
  }, [ids?.join(','), enabled]);

  return counts;
}