import { modText } from './farmingModDetails.ts';

export const FARMING_CATALOG_CATEGORIES = [
  { id: 'tractors', label: 'Tracteurs', filter: 'tractors' },
  { id: 'trailers', label: 'Remorques', filter: 'trailers' },
  { id: 'harvesters', label: 'Moissonneuses', filter: 'harvesters' },
  { id: 'tillage', label: 'Outils du sol', filter: 'plows' },
  { id: 'maps', label: 'Cartes', filter: 'mapEurope' },
  { id: 'seeding', label: 'Semis et plantation', filter: 'seeders' },
  { id: 'grassland', label: 'Fenaison', filter: 'mowers' },
  { id: 'buildings', label: 'Bâtiments', filter: 'farmBuildings' },
] as const;

export const ALLOWED_MODHUB_FILTERS = new Set([
  'latest',
  'mostDownloaded',
  ...FARMING_CATALOG_CATEGORIES.map(category => category.filter),
]);

export function parseCatalogPage(html: string, categoryId = 'all') {
  const mods = [];
  const blocks = html.split('class="mod-item"');
  for (let index = 1; index < blocks.length; index += 1) {
    const block = blocks[index].slice(0, 2500);
    const id = block.match(/mod_id=(\d+)/)?.[1];
    if (!id) continue;
    const img = block.match(/src="(https:\/\/cdn\d+\.giants-software\.com\/modHub\/storage\/[^"]*iconBig\.(?:jpg|png))"/i)?.[1] || null;
    const rating = block.match(/([\d.]+)&nbsp;\((\d+)\)/);
    mods.push({
      id,
      title: modText(block.match(/<h4>([\s\S]*?)<\/h4>/i)?.[1] || 'Mod FS25'),
      author: modText(block.match(/By:\s*([^<]+)/i)?.[1] || 'Inconnu'),
      img,
      images: [],
      rating: Number(rating?.[1]) || 0,
      votes: Number(rating?.[2]) || 0,
      categoryId,
      downloadUrl: null,
      detailUrl: `https://www.farming-simulator.com/mod.php?mod_id=${id}&title=fs2025`,
      source: 'live',
    });
  }
  return mods;
}

export function hasNextCatalogPage(html: string, page: number) {
  return [...html.matchAll(/href="[^"]*(?:&|&amp;)page=(\d+)[^"]*"/g)]
    .some(match => Number(match[1]) === page);
}
