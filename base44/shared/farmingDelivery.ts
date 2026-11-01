// Preserve the exact official host, storage directory and filename for each mod.
export function extractGiantsImages(html, modId, kind = 'all') {
  const name = kind === 'icon' ? 'iconBig' : kind === 'screenshots' ? 'screenshot\\d+' : '(?:iconBig|screenshot\\d+)';
  const path = new RegExp(`^/modHub/storage/${String(modId).padStart(8, '0')}/${name}\\.(?:jpe?g|png|webp)$`, 'i');
  const images = new Set();
  for (const match of html.matchAll(/(?:\bsrc|\bdata-src|\bhref)\s*=\s*["']([^"']+)["']/gi)) {
    const value = match[1].replace(/&amp;/g, '&');
    if (!/^(?:https:)?\/\//i.test(value)) continue;
    const url = new URL(value, 'https://www.farming-simulator.com/');
    if (url.protocol === 'https:' && /^cdn\d{1,3}\.giants-software\.com$/i.test(url.hostname) && !url.username && !url.password && !url.port && path.test(url.pathname)) images.add(url.href);
  }
  return [...images];
}

export function farmingDownloadEndpoint(req) {
  const origin = req.headers.get('X-Base44-App-Url') || 'https://matrix-hub.base44.app';
  return new URL('/functions/fs25Download', origin).href;
}

export function farmingPublicMod(req, mod) {
  const endpoint = farmingDownloadEndpoint(req);
  const imageUrl = value => {
    if (!value) return null;
    const url = new URL('/functions/proxyImage', endpoint);
    url.searchParams.set('url', value);
    return url.href;
  };
  // The CDN requires an official Referer. Only these small images are buffered and cached.
  return {
    ...mod,
    officialImg: mod.img,
    img: imageUrl(mod.img),
    hdImg: imageUrl(mod.hdImg),
    images: (mod.images || []).map(imageUrl),
    downloadEndpoint: endpoint,
  };
}