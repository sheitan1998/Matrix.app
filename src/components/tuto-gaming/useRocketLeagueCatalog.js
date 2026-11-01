import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  emptyRocketLeagueCatalog,
  ROCKET_LEAGUE_CATEGORY_LABELS,
} from '@/components/tuto-gaming/rocketLeagueCatalog';
import { DAILY_SHOP_CATEGORY_LABELS } from '@/components/tuto-gaming/rocketLeagueShopData';

const CATALOG_TIMEOUT_MS = 20_000;
let catalogPromise = null;
let catalogValue = null;

const ALL_CATEGORY_KEYS = [
  ...new Set([...Object.keys(ROCKET_LEAGUE_CATEGORY_LABELS), ...Object.keys(DAILY_SHOP_CATEGORY_LABELS)]),
];

function normalizeShopItem(raw) {
  const image = raw.image || raw.cardImage || '';
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    category: raw.category,
    rarity: raw.rarity,
    rarityColor: raw.rarityColor,
    price: raw.price,
    currency: raw.currency,
    image,
    cardImage: raw.cardImage || image,
    images: image ? [image] : [],
    paint: raw.paint,
    paintColor: raw.paintColor,
    section: raw.section,
    availableUntil: raw.availableUntil,
    soldOut: raw.soldOut,
    videoUrl: raw.videoUrl || null,
    variants: [],
    compatibleBodies: [],
    priceEstimated: false,
    source: 'itemshop.gg',
  };
}

function groupCatalog(items, metadata = {}) {
  return {
    items,
    garage: Object.fromEntries(
      ALL_CATEGORY_KEYS.map(category => [category, items.filter(item => item.category === category)]),
    ),
    ...metadata,
  };
}

function withTimeout(promise) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('catalog_timeout')), CATALOG_TIMEOUT_MS);
    promise.then(
      value => { clearTimeout(timeout); resolve(value); },
      error => { clearTimeout(timeout); reject(error); },
    );
  });
}

async function requestCatalog() {
  const result = await base44.functions.invoke('rocketLeagueApi', { action: 'getDailyShop' });
  const data = result?.data;
  if (!data || !Array.isArray(data.items)) throw new Error('catalog_malformed');
  const items = data.items.map(normalizeShopItem);
  if (!items.length) throw new Error('catalog_empty');
  return groupCatalog(items, {
    source: 'itemshop.gg',
    version: data.shopDate || null,
    fallbackReason: null,
    fetchedAt: data.updatedAt || new Date().toISOString(),
  });
}

function loadCatalog() {
  if (catalogValue) return Promise.resolve(catalogValue);
  if (!catalogPromise) {
    catalogPromise = withTimeout(requestCatalog())
      .then(value => { catalogValue = value; return value; })
      .finally(() => { catalogPromise = null; });
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
      .then(data => { if (active) setState({ data, loading: false, error: '' }); })
      .catch(() => {
        if (active) {
          setState({
            data: emptyRocketLeagueCatalog({ source: 'unavailable' }),
            loading: false,
            error: 'Le catalogue ne répond pas. Réessayez dans quelques instants.',
          });
        }
      });
    return () => { active = false; };
  }, [attempt]);

  const retry = useCallback(() => {
    catalogValue = null;
    catalogPromise = null;
    setAttempt(value => value + 1);
  }, []);

  return { ...state, retry };
}