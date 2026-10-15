import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import RocketLeagueImage from '@/components/tuto-gaming/RocketLeagueImage';
import RocketItemModal from '@/components/tuto-gaming/RocketItemModal';
import { ROCKET_LEAGUE_CATEGORY_LABELS } from '@/components/tuto-gaming/rocketLeagueCatalog';
import useRocketLeagueCatalog from './useRocketLeagueCatalog';

export default function RocketLeagueShop() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(120);
  const { data, loading, error, retry } = useRocketLeagueCatalog();
  const catalog = data || { items: [] };
  const categoryItems = category === 'all'
    ? catalog.items
    : catalog.items.filter(item => item.category === category);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = normalizedQuery
    ? categoryItems.filter(item => `${item.name} ${item.type} ${item.rarity}`.toLowerCase().includes(normalizedQuery))
    : categoryItems;
  const items = filteredItems.slice(0, visibleCount);

  return (
    <section aria-labelledby="rocket-shop-title" className="space-y-4">
      <h2 id="rocket-shop-title" className="text-xl font-bold">Boutique du jour</h2>
      {loading && (
        <p className="inline-flex rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground" role="status">
          Chargement du catalogue…
        </p>
      )}
      {catalog.items.length > 0 && (
        <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground" role="status">
          {catalog.source === 'bakkesmod'
            ? `Catalogue BakkesMod configuré chargé (${catalog.items.length} objets).`
            : `Snapshot communautaire v${catalog.version || 'inconnue'} chargé (${catalog.items.length} objets).`}
        </p>
      )}
      {error && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-destructive" role="alert">
          <p>{error}</p>
          <button type="button" onClick={retry} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2">
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Réessayer
          </button>
        </div>
      )}
      <label className="block">
        <span className="sr-only">Rechercher dans le catalogue</span>
        <input
          type="search"
          value={query}
          onChange={event => {
            setQuery(event.target.value);
            setVisibleCount(120);
          }}
          placeholder="Rechercher un objet"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </label>
      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrer la boutique">
        {[['all', 'Tout'], ...Object.entries(ROCKET_LEAGUE_CATEGORY_LABELS)].map(([id, label]) => (
          <button
            type="button"
            key={id}
            onClick={() => {
              setCategory(id);
              setVisibleCount(120);
            }}
            aria-pressed={category === id}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${category === id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map(item => (
          <button
            type="button"
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="overflow-hidden rounded-xl border bg-card text-left transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RocketLeagueImage
              src={item.image}
              sources={item.images}
              alt={item.name}
              fallbackLabel={item.name}
              fallbackCategory={item.category}
              fallbackRarity={item.rarity}
              fallbackPrice={item.price}
              fallbackPriceEstimated={item.priceEstimated}
              className="aspect-square w-full p-2"
            />
            <span className="block space-y-1 p-3">
              <span className="block text-sm font-bold">{item.name}</span>
              <span className="block text-xs text-muted-foreground">{item.type}</span>
              <span className="block text-xs text-primary">{item.rarity}</span>
              <span className="block text-xs text-muted-foreground">
                {item.priceEstimated ? 'Prix catalogue estimé' : 'Prix fourni'} : {item.price} crédits
              </span>
              <span className="mt-2 block text-xs">Voir dans MATRIX</span>
            </span>
          </button>
        ))}
      </div>
      {visibleCount < filteredItems.length && (
        <button
          type="button"
          onClick={() => setVisibleCount(value => value + 120)}
          className="rounded-lg border px-4 py-2 text-sm font-semibold"
        >
          Afficher plus ({filteredItems.length - visibleCount} restants)
        </button>
      )}
      {!loading && !error && filteredItems.length === 0 && (
        <p className="rounded-xl border p-4 text-sm text-muted-foreground">Aucun objet dans cette catégorie.</p>
      )}
      {selectedItem && <RocketItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </section>
  );
}