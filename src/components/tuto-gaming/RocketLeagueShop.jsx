import React, { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import RocketLeagueShopCard from '@/components/tuto-gaming/RocketLeagueShopCard';
import RocketLeagueShopItemModal from '@/components/tuto-gaming/RocketLeagueShopItemModal';
import { DAILY_SHOP_FILTERS } from '@/components/tuto-gaming/rocketLeagueShopData';
import useRocketLeagueCatalog from './useRocketLeagueCatalog';

export default function RocketLeagueShop() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(120);
  const { data: catalog, loading, error, retry } = useRocketLeagueCatalog();
  const items = catalog?.items || [];

  const filteredItems = useMemo(() => {
    let list = category === 'all' ? items : items.filter(i => i.category === category);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter(i => `${i.name} ${i.type} ${i.rarity}`.toLowerCase().includes(q));
    return list;
  }, [items, category, query]);

  const displayed = filteredItems.slice(0, visibleCount);

  return (
    <section aria-labelledby="rocket-catalog-title" className="space-y-4">
      <div>
        <h2 id="rocket-catalog-title" className="text-xl font-bold">Catalogue</h2>
        <p className="text-xs text-muted-foreground">Données en temps réel via itemshop.gg</p>
      </div>

      {loading && (
        <p className="inline-flex rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground" role="status">
          Chargement du catalogue…
        </p>
      )}
      {items.length > 0 && !error && (
        <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground" role="status">
          {items.length} objets dans le catalogue (source: {catalog.source}).
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
        <span className="sr-only">Rechercher dans le catalogue</span>
        <input
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setVisibleCount(120); }}
          placeholder="Rechercher un objet"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </label>

      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrer le catalogue">
        {DAILY_SHOP_FILTERS.map(f => (
          <button
            type="button"
            key={f.id}
            onClick={() => { setCategory(f.id); setVisibleCount(120); }}
            aria-pressed={category === f.id}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${category === f.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {displayed.map(item => (
          <RocketLeagueShopCard key={item.id || item.name} item={item} onOpen={setSelectedItem} />
        ))}
      </div>

      {visibleCount < filteredItems.length && (
        <button
          type="button"
          onClick={() => setVisibleCount(v => v + 120)}
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