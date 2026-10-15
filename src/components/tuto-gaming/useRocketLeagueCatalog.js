import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  emptyRocketLeagueCatalog,
  ROCKET_LEAGUE_CATEGORY_LABELS,
} from '@/components/tuto-gaming/rocketLeagueCatalog';

const CATALOG_TIMEOUT_MS = 20_000;
let catalogPromise = null;
let catalogValue = null;

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

function withTimeout(promise) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('catalog_timeout')), CATALOG_TIMEOUT_MS);
    promise.then(
      value => {
        clearTimeout(timeout);
        resolve(value);
      },
      error => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

async function requestCatalog() {
  const items = [];
  let page = 1;
  let response;
  do {
    const result = await base44.functions.invoke('rocketLeagueApi', {
      action: 'getGarageCatalog',
      page,
      limit: 5000,
    });
    response = result?.data;
    if (!response || !Array.isArray(response.items)) throw new Error('catalog_malformed');
    items.push(...response.items);
    page += 1;
  } while (response.hasMore && page <= 4);
  if (!items.length) throw new Error('catalog_empty');
  return groupCatalog(items, {
    source: response.source,
    version: response.version,
    fallbackReason: response.fallbackReason,
    fetchedAt: response.fetchedAt,
  });
}

function loadCatalog() {
  if (catalogValue) return Promise.resolve(catalogValue);
  if (!catalogPromise) {
    catalogPromise = withTimeout(requestCatalog())
      .then(value => {
        catalogValue = value;
        return value;
      })
      .finally(() => {
        catalogPromise = null;
      });
  }
  return catalogPromise;
}

export default function useRocketLeagueCatalog() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(() => ({
    data: catalogValue,
    loading: !catalogValue,
    error: '',
  }));

  useEffect(() => {
    let active = true;
    setState(current => ({ ...current, loading: true, error: '' }));
    loadCatalog()
      .then(data => {
        if (active) setState({ data, loading: false, error: '' });
      })
      .catch(() => {
        if (active) {
          setState({
            data: emptyRocketLeagueCatalog({ source: 'unavailable' }),
            loading: false,
            error: 'Le catalogue ne répond pas. Réessayez dans quelques instants.',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    catalogValue = null;
    catalogPromise = null;
    setAttempt(value => value + 1);
  }, []);

  return { ...state, retry };
}
