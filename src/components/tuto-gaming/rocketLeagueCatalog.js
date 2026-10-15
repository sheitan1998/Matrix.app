export const ROCKET_LEAGUE_CATEGORY_LABELS = {
  body: 'Carrosseries',
  paint: 'Couleurs',
  wheels: 'Roues',
  decal: 'Stickers',
  goalExplosion: 'Explosions de but',
};

export function emptyRocketLeagueCatalog(metadata = {}) {
  return {
    items: [],
    garage: Object.fromEntries(
      Object.keys(ROCKET_LEAGUE_CATEGORY_LABELS).map(category => [category, []]),
    ),
    ...metadata,
  };
}
