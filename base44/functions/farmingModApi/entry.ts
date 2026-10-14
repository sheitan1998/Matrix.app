import { createApiCache, dataResponse } from "../../shared/apiCache.ts";

const CACHE_TTL = 60 * 60 * 1000;
const { getCached: rawGetCached, setCached } = createApiCache(80);
function getCached(key) { return rawGetCached(key, CACHE_TTL); }

const CATEGORIES = ['all', 'tractors', 'tools', 'maps', 'trailers', 'combines', 'trucks', 'placeables'];

function fixImgUrl(img) {
  if (!img) return null;
  return img.replace(/^https?:\/\/cdn\d+\.giants-software\.com/, 'https://cdn40.giants-software.com');
}

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'getMods') {
      const page = Math.max(1, Number(body.page) || 1);
      const limit = Math.min(24, Math.max(1, Number(body.limit) || 24));
      const filter = String(body.filter || 'latest');
      const category = String(body.category || 'all');

      const cacheKey = `mods:${page}:${limit}:${filter}:${category}`;
      const cached = getCached(cacheKey);
      if (cached) return dataResponse(cached);

      const url = `https://www.farming-simulator.com/mods.php?title=fs2025&filter=${encodeURIComponent(filter)}&page=${page - 1}`;
      const res = await fetch(url, {
        headers: { Accept: 'text/html', 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`GIANTS ModHub (${res.status})`);
      const html = await res.text();

      const mods = [];
      const blocks = html.split('class="mod-item"');
      for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i].slice(0, 2000);
        const idMatch = block.match(/mod_id=(\d+)/);
        if (!idMatch) continue;
        const id = idMatch[1];
        const imgMatch = block.match(/src="(https:\/\/cdn\d+\.giants-software\.com\/modHub\/storage\/[^"]*iconBig\.jpg)"/);
        const titleMatch = block.match(/<h4>([^<]+)<\/h4>/);
        const authorMatch = block.match(/By:\s*([^<]+)/);
        const ratingMatch = block.match(/([\d.]+)&nbsp;\((\d+)\)/);
        mods.push({
          id,
          title: titleMatch?.[1]?.trim() || 'Mod FS25',
          author: authorMatch?.[1]?.trim() || 'Inconnu',
          img: fixImgUrl(imgMatch?.[1] || `https://cdn40.giants-software.com/modHub/storage/${id.padStart(8, '0')}/iconBig.jpg`),
          rating: parseFloat(ratingMatch?.[1]) || 0,
          votes: parseInt(ratingMatch?.[2]) || 0,
          downloadUrl: `https://www.farming-simulator.com/mod.php?mod_id=${id}&title=fs2025`,
          detailUrl: `https://www.farming-simulator.com/mod.php?mod_id=${id}&title=fs2025`,
        });
      }

      const result = {
        items: mods.slice(0, limit),
        total: mods.length,
        page,
        has_more: mods.length >= limit,
        cached_at: new Date().toISOString(),
      };
      setCached(cacheKey, result);
      return dataResponse(result);
    }

    if (action === 'getModDetails') {
      const modId = String(body.modId || '').trim();
      if (!modId) return Response.json({ error: 'modId requis' }, { status: 400 });

      const cacheKey = `mod:${modId}`;
      const cached = getCached(cacheKey);
      if (cached) return dataResponse(cached);

      const res = await fetch(`https://www.farming-simulator.com/mod.php?mod_id=${modId}&title=fs2025`, {
        headers: { Accept: 'text/html', 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`GIANTS ModHub (${res.status})`);
      const html = await res.text();

      const titleMatch = html.match(/<h2 class="column title-label">([^<]+)<\/h2>/);
      const descMatch = html.match(/medium-12 large-8 columns">[\s\S]*?<div class="top-line">([\s\S]*?)<\/div>/);
      const authorMatch = html.match(/<b>Author<\/b><\/div>\s*<div class="table-cell"><a[^>]*>([^<]+)<\/a>/);
      const brandMatch = html.match(/<b>Manufacturer<\/b><\/div>\s*<div class="table-cell">([^<]+)<\/div>/);
      const categoryMatch = html.match(/<b>Category<\/b><\/div>\s*<div class="table-cell"><a[^>]*>([^<]+)<\/a>/);
      const sizeMatch = html.match(/<b>Size<\/b><\/div>\s*<div class="table-cell">([^<]+)<\/div>/);
      const versionMatch = html.match(/<b>Version<\/b><\/div>\s*<div class="table-cell">([^<]+)<\/div>/);
      const ratingMatch = html.match(/([\d.]+)&nbsp;\((\d+)\)/);
      const imgMatch = html.match(/src="(https:\/\/cdn\d+\.giants-software\.com\/modHub\/storage\/[^"]*screenshot0\.jpg)"/);
      const dlMatch = html.match(/href="(https:\/\/cdn\d+\.giants-software\.com\/modHub\/storage\/[^"]*\.zip)"[^>]*>DOWNLOAD/i);
      const priceMatch = html.match(/<b>Price<\/b><\/div>\s*<div class="table-cell">([^<]+)<\/div>/i);
      const powerMatch = html.match(/<b>Puissance<\/b><\/div>\s*<div class="table-cell">([^<]+)<\/div>/i) || html.match(/<b>Power<\/b><\/div>\s*<div class="table-cell">([^<]+)<\/div>/i);
      const speedMatch = html.match(/<b>Vitesse<\/b><\/div>\s*<div class="table-cell">([^<]+)<\/div>/i) || html.match(/<b>Speed<\/b><\/div>\s*<div class="table-cell">([^<]+)<\/div>/i);

      const result = {
        id: modId,
        title: titleMatch?.[1]?.trim() || 'Mod FS25',
        author: authorMatch?.[1]?.trim() || 'Inconnu',
        brand: brandMatch?.[1]?.trim() || '',
        category: categoryMatch?.[1]?.trim() || '',
        description: descMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || '',
        img: fixImgUrl(imgMatch?.[1] || `https://cdn40.giants-software.com/modHub/storage/${modId.padStart(8, '0')}/iconBig.jpg`),
        rating: parseFloat(ratingMatch?.[1]) || 0,
        votes: parseInt(ratingMatch?.[2]) || 0,
        size: sizeMatch?.[1]?.trim() || '',
        version: versionMatch?.[1]?.trim() || '',
        price: priceMatch?.[1]?.trim() || '',
        power: powerMatch?.[1]?.trim() || '',
        speed: speedMatch?.[1]?.trim() || '',
        downloadUrl: dlMatch?.[1] || `https://www.farming-simulator.com/mod.php?mod_id=${modId}&title=fs2025`,
      };
      setCached(cacheKey, result);
      return dataResponse(result);
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}