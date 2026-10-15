import { normalize } from './assets.ts';

export function shopOffers(data) {
  return data.entries.map(entry => {
    const content = [...(entry.brItems || []), ...(entry.tracks || []), ...(entry.instruments || []), ...(entry.cars || [])];
    const included = [...new Map(content.map(item => [item.id, normalize(item)])).values()];
    const main = included[0];
    if (!main) return null;
    const layout = entry.layout || {};
    const image = entry.bundle?.image || entry.newDisplayAsset?.renderImages?.[0]?.image || main.image;
    return {
      ...main, name: entry.bundle?.name || main.name, image,
      images: { ...main.images, featured: image }, included_items: included,
      price: entry.finalPrice ?? entry.regularPrice ?? null, regular_price: entry.regularPrice ?? null,
      offer_id: entry.offerId, vbuck_icon: data.vbuckIcon, in_date: entry.inDate, out_date: entry.outDate,
      layout: layout.name || 'Autres offres', section_id: layout.id || entry.layoutId?.split('.')[0] || 'other',
      section_category: layout.category || null, layout_rank: layout.rank ?? -1, layout_index: layout.index ?? 9999,
      display_type: layout.displayType || 'tileGrid', section_textures: layout.textureMetadata || [],
      section_text: layout.textMetadata || [], shop_colors: entry.colors || null,
      display_assets: [entry.displayAsset, entry.newDisplayAsset, ...(entry.displayAssets || [])].filter(Boolean),
      tile_size: entry.tileSize || 'Size_1_x_1', sort_priority: entry.sortPriority ?? 0,
      banner: entry.banner?.value || null, is_bundle: !!entry.bundle,
    };
  }).filter(Boolean).sort((a, b) => b.layout_rank - a.layout_rank || a.layout_index - b.layout_index || a.section_id.localeCompare(b.section_id) || b.sort_priority - a.sort_priority);
}