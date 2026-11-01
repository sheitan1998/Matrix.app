import { modText } from './farmingModDetails.ts';
import { extractGiantsImages } from './farmingDelivery.ts';

export { FARMING_CATALOG_CATEGORIES, ALLOWED_MODHUB_FILTERS } from './farmingCategories.ts';

export function parseCatalogPage(html: string, categoryId = 'all') {
  const mods = [];
  const seen = new Set();
  const blocks = html.split(/class=["'][^"']*\bmod-item\b(?!__)[^"']*["']/i);
  for (let index = 1; index < blocks.length; index += 1) {
    const block = blocks[index];
    const id = block.match(/mod_id=(\d+)/)?.[1];
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const img = extractGiantsImages(block, id, 'icon')[0] || null;
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