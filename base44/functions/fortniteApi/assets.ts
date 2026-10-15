export function normalize(item) {
  const images = item.images || {};
  return {
    id: item.id, name: item.name || item.title || 'Objet Fortnite', description: item.description || '',
    type: item.type?.value || item.type || (item.albumArt ? 'music' : 'item'),
    type_display: item.type?.displayValue || null, rarity: item.rarity?.value || 'common',
    rarity_display: item.rarity?.displayValue || item.rarity?.value || 'Common',
    image: images.featured || images.large || images.icon || item.albumArt || images.smallIcon || null,
    images: { featured: images.featured || images.large || item.albumArt || null, large: images.large || images.featured || null,
      icon: images.icon || images.small || null,
      smallIcon: images.smallIcon || null,
      animated: typeof images.animated === 'string' && /^https:\/\//.test(images.animated) ? images.animated : null },
    video: typeof item.video === 'string' && /^https:\/\//.test(item.video) ? item.video : null,
    audio: typeof item.audio === 'string' && /^https:\/\//.test(item.audio) ? item.audio : null,
    series: item.series?.value || null, series_colors: item.series?.colors || [],
    set_name: item.set?.value || null, set_display: item.set?.text || item.set?.displayValue || null,
    added: item.added?.date || item.added || null,
    season: item.introduction?.season || null, chapter: item.introduction?.chapter || null,
    artist: item.artist || null,
  };
}