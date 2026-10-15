import React, { useMemo, useState } from 'react';
import RocketLeagueImage from '@/components/tuto-gaming/RocketLeagueImage';
import RocketItemModal from '@/components/tuto-gaming/RocketItemModal';
import {
  getLocalRocketLeagueCatalog,
  ROCKET_LEAGUE_CATEGORY_LABELS,
} from '../../../base44/shared/rocketLeagueCatalog';

export default function RocketLeagueShop() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [category, setCategory] = useState('all');
  const data = useMemo(getLocalRocketLeagueCatalog, []);
  const items = category === 'all'
    ? data.items
    : data.items.filter(item => item.category === category);

  return (
    <section aria-labelledby="rocket-shop-title" className="space-y-4">
      <h2 id="rocket-shop-title" className="text-xl font-bold">Boutique du jour</h2>
      <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground" role="status">
        Catalogue local disponible instantanément, même lorsque Tracker Network est indisponible.
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrer la boutique">
        {[['all', 'Tout'], ...Object.entries(ROCKET_LEAGUE_CATEGORY_LABELS)].map(([id, label]) => (
          <button
            type="button"
            key={id}
            onClick={() => setCategory(id)}
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
              alt={item.name}
              fallbackLabel={item.name}
              accent={item.accent}
              className="aspect-square w-full p-2"
            />
            <span className="block space-y-1 p-3">
              <span className="block text-sm font-bold">{item.name}</span>
              <span className="block text-xs text-muted-foreground">{item.type}</span>
              <span className="block text-xs text-primary">{item.rarity}</span>
              <span className="block text-xs text-muted-foreground">{item.price} crédits</span>
              <span className="mt-2 block text-xs">Voir dans MATRIX</span>
            </span>
          </button>
        ))}
      </div>
      {selectedItem && <RocketItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </section>
  );
}