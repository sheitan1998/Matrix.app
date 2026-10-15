import { cached } from './cache.ts';

const RESOLVER_URL = 'https://fortnite.gg/api/item';
const COMMUNITY_CDN_HOST = 'fnggcdn.com';
const COSMETIC_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,199}$/;
const NUMERIC_ID_RE = /^\d{1,12}$/;

export function normalizeCosmeticId(value) {
  const id = typeof value === 'string' ? value.trim() : '';
  return COSMETIC_ID_RE.test(id) && !id.includes('..') ? id : '';
}

function communitySources(numericId) {
  if (!NUMERIC_ID_RE.test(numericId)) return [];
  return [
    `https://${COMMUNITY_CDN_HOST}/items/${numericId}/video-sd.mp4`,
    `https://${COMMUNITY_CDN_HOST}/items/${numericId}/video.mp4`,
  ];
}

export async function resolveCommunityMedia(value) {
  const cosmeticId = normalizeCosmeticId(value);
  if (!cosmeticId) return null;
  return await cached(`fngg:${cosmeticId.toLowerCase()}`, 24 * 60 * 60 * 1000, async () => {
    const url = new URL(RESOLVER_URL);
    url.searchParams.set('id', cosmeticId);
    const response = await fetch(url, { headers: { Accept: 'text/plain' }, signal: AbortSignal.timeout(6000) });
    if (!response.ok) return null;
    const numericId = (await response.text()).trim();
    const sources = communitySources(numericId);
    return sources.length ? { cosmetic_id: cosmeticId, numeric_id: numericId, sources } : null;
  });
}
