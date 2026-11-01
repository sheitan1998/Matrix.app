import React, { useState, useMemo } from 'react';
import { RefreshCw, Calendar, Clock } from 'lucide-react';
import RocketLeagueShopCard from './RocketLeagueShopCard';
import RocketLeagueShopItemModal from './RocketLeagueShopItemModal';
import { DAILY_SHOP_FILTERS } from './rocketLeagueShopData';
import useRocketLeagueDailyShop from './useRocketLeagueDailyShop';

export default function RocketLeagueDailyShop() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(60);
  const { data, loading, error, retry } = useRocketLeagueDailyShop();

  const shop = data || { items: [] };
  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    let items = category === 'all' ? shop.items : shop.items.filter(i => i.category === category);
    if (normalizedQuery) {
      items = items.filter(i => `${i.name} ${i.type} ${i.rarity}`.toLowerCase().includes(normalizedQuery));
    }
    return items;
  }, [shop.items, category, normalizedQuery]);

  const items = filteredItems.slice(0, visibleCount);
  const shopDate = shop.shopDate ? new Date(shop.shopDate).toLocaleDateString('fr-FR') : null;
  const expiresAt = shop.expiresAt ? new Date(shop.expiresAt).toLocaleString('fr-FR', { timeStyle: 'short' }) : null;

  return (
    <section aria-labelledby="rocket-daily-shop-title" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="rocket-daily-shop-title" className="text-xl font-bold">Boutique du jour</h2>
          <p className="text-xs text-muted-foreground">Données en temps réel via itemshop.gg</p>
        </div>
        {shopDate && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
              <Calendar className="h-3 w-3" /> {shopDate}
            </span>
            {expiresAt && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                <Clock className="h-3 w-3" /> Reset {expiresAt}
              </span>
            )}
          </div>
        )}
      </div>

      {loading && (
        <p className="inline-flex rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground" role="status">
          Chargement de la boutique…
        </p>
      )}
      {shop.items.length > 0 && !error && (
        <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground" role="status">
          {shop.itemCount || shop.items.length} objets dans la boutique du jour (source: {shop.source}).
        </p>
      )}
      {error && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-destructive" role="alert">
          <p>{error}</p>
          <button type="button" onClick={retry} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2">
            <RefreshCw className="h-4 w-4" /> Réessayer
          </button>
        </div>
      )}

      <label className="block">
        <span className="sr-only">Rechercher un objet</span>
        <input
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setVisibleCount(60); }}
          placeholder="Rechercher un objet, véhicule, roues…"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </label>

      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrer la boutique">
        {DAILY_SHOP_FILTERS.map(f => (
          <button
            type="button"
            key={f.id}
            onClick={() => { setCategory(f.id); setVisibleCount(60); }}
            aria-pressed={category === f.id}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${category === f.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map(item => (
          <RocketLeagueShopCard key={item.id || item.name} item={item} onOpen={setSelectedItem} />
        ))}
      </div>

      {visibleCount < filteredItems.length && (
        <button
          type="button"
          onClick={() => setVisibleCount(v => v + 60)}
          className="rounded-lg border px-4 py-2 text-sm font-semibold"
        >
          Afficher plus ({filteredItems.length - visibleCount} restants)
        </button>
      )}
      {!loading && !error && filteredItems.length === 0 && (
        <p className="rounded-xl border p-4 text-sm text-muted-foreground">Aucun objet dans cette catégorie.</p>
      )}

      {selectedItem && <RocketLeagueShopItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </section>
  );
}