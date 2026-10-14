import { createApiCache, dataResponse } from "../../shared/apiCache.ts";

const CACHE_TTL = 60 * 60 * 1000;
const { getCached: rawGetCached, setCached } = createApiCache(60);
function getCached(key) { return rawGetCached(key, CACHE_TTL); }

const CATEGORIES = ['all', 'tractors', 'tools', 'maps', 'trailers', 'combines', 'trucks', 'placeables'];

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

      // Parse mod cards from HTML
      const mods = [];
      const modRegex = /mod_id=(\d+)[^>]*title=fs2025[^>]*>[\s\S]*?src="(https:\/\/cdn\d+\.giants-software\.com\/modHub\/storage\/[^"]*iconBig\.jpg)"[^>]*>[\s\S]*?<h\d[^>]*>([^<]+)<\/h\d>[\s\S]*?By:\s*([^<\n]+?)[\s\S]*?(\d+\.?\d*)\s*\((\d+)\)/gi;
      let match;
      while ((match = modRegex.exec(html)) !== null) {
        const modId = match[1];
        const img = match[2];
        const title = match[3].trim();
        const author = match[4].trim();
        const rating = parseFloat(match[5]) || 0;
        const votes = parseInt(match[6]) || 0;

        mods.push({
          id: modId,
          title,
          author,
          img,
          rating,
          votes,
          downloadUrl: `https://www.farming-simulator.com/mod.php?mod_id=${modId}&title=fs2025`,
          detailUrl: `https://www.farming-simulator.com/mod.php?mod_id=${modId}&title=fs2025`,
        });
      }

      // Fallback: simpler regex if main parser finds nothing
      if (mods.length === 0) {
        const simpleRegex = /mod_id=(\d+)&title=fs2025[^"]*"[^>]*>[\s\S]*?src="(https:\/\/cdn\d+\.giants-software\.com\/[^"]*iconBig\.jpg)"/gi;
        while ((match = simpleRegex.exec(html)) !== null) {
          mods.push({
            id: match[1],
            title: 'Mod FS25',
            author: 'Inconnu',
            img: match[2],
            rating: 0,
            votes: 0,
            downloadUrl: `https://www.farming-simulator.com/mod.php?mod_id=${match[1]}&title=fs2025`,
            detailUrl: `https://www.farming-simulator.com/mod.php?mod_id=${match[1]}&title=fs2025`,
          });
        }
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

      // Extract mod details
      const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
      const authorMatch = html.match(/By:\s*([^<\n]+)/);
      const descMatch = html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      const imgMatch = html.match(/src="(https:\/\/cdn\d+\.giants-software\.com\/modHub\/storage\/[^"]*\.(?:jpg|png))"/);
      const priceMatch = html.match(/(?:price|prix)[^:]*:\s*([^\n<]+)/i);
      const powerMatch = html.match(/(?:power|puissance|CV)[^:]*:\s*(\d+)/i);

      const result = {
        id: modId,
        title: titleMatch?.[1]?.trim() || 'Mod FS25',
        author: authorMatch?.[1]?.trim() || 'Inconnu',
        description: descMatch?.[1]?.trim() || '',
        img: imgMatch?.[1] || null,
        price: priceMatch?.[1]?.trim() || '',
        power: powerMatch?.[1] ? `${powerMatch[1]} CV` : '',
        downloadUrl: `https://www.farming-simulator.com/mod.php?mod_id=${modId}&title=fs2025`,
      };
      setCached(cacheKey, result);
      return dataResponse(result);
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}