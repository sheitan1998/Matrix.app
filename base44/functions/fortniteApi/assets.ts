const OFFICIAL_VIDEO_HOSTS = ['fortnite-api.com', 'fortniteapi.io', 'epicgames.com', 'fortnite.com'];

function directAssetUrl(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  return [value.url, value.src, value.video].find(candidate => typeof candidate === 'string') || '';
}

function officialVideoUrl(value) {
  const candidate = directAssetUrl(value).trim();
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    const officialHost = OFFICIAL_VIDEO_HOSTS.some(domain => host === domain || host.endsWith(`.${domain}`));
    return url.protocol === 'https:'
      && officialHost
      && ['.mp4', '.webm'].some(extension => url.pathname.toLowerCase().endsWith(extension))
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function directValues(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(directValues);
  if (!value || typeof value !== 'object') return [];
  return [
    value.url, value.src, value.video, value.videoUrl, value.gameplayVideo, value.animated,
    ...(Array.isArray(value.videos) ? value.videos.flatMap(directValues) : []),
  ].flatMap(directValues);
}

export function officialVideoUrls(item) {
  const displayAssets = [
    item.displayAsset, item.newDisplayAsset,
    ...(Array.isArray(item.displayAssets) ? item.displayAssets : []),
    ...(Array.isArray(item.newDisplayAssets) ? item.newDisplayAssets : []),
  ];
  const candidates = [
    item.showcaseVideo, item.video, item.gameplayItem, item.gameplayVideo,
    item.images?.animated, ...displayAssets.flatMap(directValues),
  ];
  return [...new Set(candidates.flatMap(directValues).map(officialVideoUrl).filter(Boolean))];
}

export function normalize(item) {
  const images = item.images || {};
  const videoCandidates = officialVideoUrls(item);
  return {
    id: item.id, name: item.name || item.title || 'Objet Fortnite', description: item.description || '',
    type: item.type?.value || item.type || (item.albumArt ? 'music' : 'item'),
    type_display: item.type?.displayValue || null, rarity: item.rarity?.value || 'common',
    rarity_display: item.rarity?.displayValue || item.rarity?.value || 'Common',
    image: images.featured || images.large || images.icon || item.albumArt || images.smallIcon || null,
    images: { featured: images.featured || images.large || item.albumArt || null, large: images.large || images.featured || null,
      icon: images.icon || images.small || null,
      smallIcon: images.smallIcon || null,
      animated: officialVideoUrl(images.animated) },
    video_candidates: videoCandidates,
    showcase_video: item.showcaseVideo || null,
    audio: typeof item.audio === 'string' && /^https:\/\//.test(item.audio) ? item.audio : null,
    series: item.series?.value || null, series_colors: item.series?.colors || [], series_image: item.series?.image || null,
    set_name: item.set?.value || null, set_display: item.set?.text || item.set?.displayValue || null,
    added: item.added?.date || item.added || null,
    season: item.introduction?.season || null, chapter: item.introduction?.chapter || null,
    artist: item.artist || null,
  };
}