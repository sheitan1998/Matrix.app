import { GTA6_EXTRA_MEDIA } from '@/components/tuto-gaming/gta6/gta6ExtraMedia';
// Fail closed: neither a misplaced record nor another subject's media can enter a tab.
export function isolateGta6Items(items, type) {
  const ids = new Set();
  const names = new Set();
  return Object.freeze(items.filter(item => {
    const name = item.name?.trim().toLocaleLowerCase('fr');
    if (item.type !== type || !item.id || !name || ids.has(item.id) || names.has(name)) return false;
    ids.add(item.id); names.add(name); return true;
  }).map(item => {
    const gallery = [...new Set((item.media || []).filter(media => media.type === type && media.subjectId === item.id && /^https:\/\/(?:www\.rockstargames\.com|static\.wikia\.nocookie\.net)\//.test(media.url)).map(media => media.url))];
    return Object.freeze({ ...item, image: gallery[0] || null, gallery: Object.freeze(gallery) });
  }));
}
export function officialGta6Media(subjectId, type, files, source = 'rockstar') {
  const base = source === 'wiki' ? 'https://static.wikia.nocookie.net/gtawiki/images/' : 'https://www.rockstargames.com/VI/_next/static/media/';
  const extra = source === 'rockstar' && GTA6_EXTRA_MEDIA[subjectId]?.type === type ? GTA6_EXTRA_MEDIA[subjectId].files : [];
  return [...new Set([...files, ...extra])].map(file => Object.freeze({ subjectId, type, url: `${base}${file}`, source }));
}