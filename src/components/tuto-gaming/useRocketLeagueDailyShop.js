import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const SHOP_TIMEOUT_MS = 20_000;
let shopPromise = null;
let shopValue = null;

function withTimeout(promise) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('shop_timeout')), SHOP_TIMEOUT_MS);
    promise.then(
      value => { clearTimeout(timeout); resolve(value); },
      error => { clearTimeout(timeout); reject(error); },
    );
  });
}

async function requestShop() {
  const result = await base44.functions.invoke('rocketLeagueApi', { action: 'getDailyShop' });
  const data = result?.data;
  if (!data || !Array.isArray(data.items)) throw new Error('shop_malformed');
  return data;
}

function loadShop() {
  if (shopValue) return Promise.resolve(shopValue);
  if (!shopPromise) {
    shopPromise = withTimeout(requestShop())
      .then(value => { shopValue = value; return value; })
      .finally(() => { shopPromise = null; });
  }
  return shopPromise;
}

export default function useRocketLeagueDailyShop() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(() => ({
    data: shopValue,
    loading: !shopValue,
    error: '',
  }));

  useEffect(() => {
    let active = true;
    setState(current => ({ ...current, loading: true, error: '' }));
    loadShop()
      .then(data => { if (active) setState({ data, loading: false, error: '' }); })
      .catch(() => {
        if (active) setState({ data: { items: [], source: 'unavailable' }, loading: false, error: 'La boutique du jour ne répond pas. Réessayez dans quelques instants.' });
      });
    return () => { active = false; };
  }, [attempt]);

  const retry = useCallback(() => {
    shopValue = null;
    shopPromise = null;
    setAttempt(value => value + 1);
  }, []);

  return { ...state, retry };
}