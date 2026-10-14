import { createApiCache, dataResponse } from "../../shared/apiCache.ts";
import { modText } from "../../shared/farmingModDetails.ts";
import { getGiantsMod, probeGiantsDownload } from "../../shared/giantsMedia.ts";

const CACHE_TTL = 60 * 60 * 1000;
const { getCached: rawGetCached, setCached } = createApiCache(80);
function getCached(key) { return rawGetCached(key, CACHE_TTL); }

const CATEGORIES = ['all', 'tractors', 'tools', 'maps', 'trailers', 'combines', 'trucks', 'placeables'];

function fixImgUrl(img) {
  if (!img) return null;
  return /^https:\/\/cdn\d+\.giants-software\.com\/modHub\/storage\//i.test(img) ? img : null;
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

      const cacheKey = `mods:v2:${page}:${limit}:${filter}:${category}`;
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
          title: modText(titleMatch?.[1] || 'Mod FS25'),
          author: modText(authorMatch?.[1] || 'Inconnu'),
          img: fixImgUrl(imgMatch?.[1] || null),
          rating: parseFloat(ratingMatch?.[1]) || 0,
          votes: parseInt(ratingMatch?.[2]) || 0,
          downloadUrl: null,
          detailUrl: `https://www.farming-simulator.com/mod.php?mod_id=${id}&title=fs2025`,
        });
      }

      const result = {
        items: mods.slice(0, limit),
        total: mods.length,
        page,
        has_more: [...html.matchAll(/href="[^"]*(?:&|&amp;)page=(\d+)[^"]*"/g)].some(match => Number(match[1]) === page),
        source: 'live',
        cached_at: new Date().toISOString(),
      };
      setCached(cacheKey, result);
      return dataResponse(result);
    }

    if (action === 'getModDetails') {
      return dataResponse(await getGiantsMod(body.modId));
    }

    if (action === 'prepareDownload') {
      const modId = String(body.modId || '');
      const file = await probeGiantsDownload(modId);
      const appUrl = req.headers.get('X-Base44-App-Url');
      if (!appUrl) return Response.json({ error: 'Adresse de téléchargement interne indisponible.' }, { status: 503 });
      const endpoint = new URL('/functions/fs25Download', new URL(appUrl).origin).href;
      return Response.json({ filename: file.filename, size: file.size, endpoint, modId });
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}