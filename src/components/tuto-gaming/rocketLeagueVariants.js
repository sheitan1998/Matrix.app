export function activeRocketLeagueVariant(item, paintId) {
  const variants = Array.isArray(item?.variants) ? item.variants : [];
  return variants.find(variant => variant.paint_id === paintId)
    || variants.find(variant => variant.paint_id === 'paint-original')
    || variants[0]
    || null;
}

export function rocketLeagueVariantView(item, paintId) {
  const variant = activeRocketLeagueVariant(item, paintId);
  if (!item || !variant) return item || null;
  const painted = variant.paint_id !== 'paint-original';
  return {
    ...item,
    activePaintId: variant.paint_id,
    name: painted ? `${item.name} - ${variant.color_name}` : item.name,
    image: variant.image_url,
    images: variant.image_url ? [variant.image_url] : [],
    price: variant.estimated_credits,
    priceEstimated: variant.priceEstimated,
    paint: variant.color_name,
    accent: variant.color_hex,
  };
}

export function migrateRocketPaintSelection(item, paintId) {
  if (!item) return paintId || 'paint-original';
  return activeRocketLeagueVariant(item, paintId)?.paint_id || 'paint-original';
}
