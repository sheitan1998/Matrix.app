import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  getLocalRocketLeagueCatalog,
  ROCKET_LEAGUE_CATEGORY_LABELS,
} from '../../../base44/shared/rocketLeagueCatalog';

function groupCatalog(items, metadata = {}) {
  return {
    items,
    garage: Object.fromEntries(Object.keys(ROCKET_LEAGUE_CATEGORY_LABELS).map(category => [
      category,
      items.filter(item => item.category === category),
    ])),
    ...metadata,
  };
}

export default function useRocketLeagueCatalog() {
  const [state, setState] = useState({ data: null, loading: true, error: '' });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const items = [];
        let page = 1;
        let response;
        do {
          const result = await base44.functions.invoke('rocketLeagueApi', {
            action: 'getGarageCatalog',
            page,
            limit: 100,
          });
          response = result?.data;
          if (!response || !Array.isArray(response.items)) throw new Error('Réponse de catalogue invalide.');
          items.push(...response.items);
          page += 1;
        } while (response.hasMore && page <= 100);
        if (!items.length) throw new Error('Le catalogue est vide.');
        if (active) {
          setState({
            data: groupCatalog(items, {
              source: response.source,
              fallbackReason: response.fallbackReason,
              fetchedAt: response.fetchedAt,
            }),
            loading: false,
            error: '',
          });
        }
      } catch {
        if (active) {
          setState({
            data: getLocalRocketLeagueCatalog(),
            loading: false,
            error: 'Le catalogue en ligne est indisponible. Le catalogue intégré est affiché.',
          });
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return state;
}
