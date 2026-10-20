import React, { useMemo, useState } from 'react';
import RocketLeagueImage from './RocketLeagueImage';
import RocketLeagueVariantSelector from './RocketLeagueVariantSelector';
import { activeRocketLeagueVariant, rocketLeagueVariantView } from './rocketLeagueVariants';

export default function RocketLeagueCatalogCard({ item, onOpen }) {
  const initial = activeRocketLeagueVariant(item, 'paint-original')?.paint_id;
  const [paintId, setPaintId] = useState(initial);
  const view = useMemo(() => rocketLeagueVariantView(item, paintId), [item, paintId]);
  return (
    <article className="overflow-hidden rounded-xl border bg-card transition hover:border-primary">
      <button
        type="button"
        onClick={() => onOpen(view)}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <RocketLeagueImage
          src={view.image}
          sources={view.images}
          alt={view.name}
          fallbackLabel={view.name}
          fallbackCategory={view.category}
          fallbackRarity={view.rarity}
          fallbackPrice={view.price}
          fallbackPriceEstimated={view.priceEstimated}
          className="aspect-square w-full p-2"
        />
        <span className="block space-y-1 p-3">
          <span className="block text-sm font-bold">{view.name}</span>
          <span className="block text-xs text-muted-foreground">{view.type}</span>
          <span className="block text-xs text-primary">{view.rarity}</span>
          <span className="block text-xs text-muted-foreground">
            {view.priceEstimated ? 'Prix catalogue estimé' : 'Prix fourni'} : {view.price} crédits
          </span>
        </span>
      </button>
      <div className="px-3 pb-3">
        <RocketLeagueVariantSelector
          variants={item.variants}
          value={view.activePaintId}
          onChange={setPaintId}
        />
      </div>
    </article>
  );
}
