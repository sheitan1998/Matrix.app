export const DAILY_SHOP_CATEGORY_LABELS = {
  body: 'Voitures / Châssis',
  wheels: 'Roues',
  decal: 'Stickers',
  goalExplosion: 'Explosions de but',
  boost: 'Boosts',
  topper: 'Toppers',
  antenna: 'Antennes',
  banner: 'Bannières',
};

export const DAILY_SHOP_FILTERS = [
  { id: 'all', label: 'Tout' },
  { id: 'body', label: 'Voitures / Châssis' },
  { id: 'wheels', label: 'Roues' },
  { id: 'decal', label: 'Stickers' },
  { id: 'boost', label: 'Boosts' },
  { id: 'goalExplosion', label: 'Explosions de but' },
];

export function rarityNeon(rarityName, apiColor) {
  const key = String(rarityName || '').toLowerCase();
  if (key.includes('black market')) return { color: '#FFD700', glow: 'rgba(255,215,0,0.6)', label: 'Black Market' };
  if (key.includes('exotic')) return { color: '#a855f7', glow: 'rgba(168,85,247,0.6)', label: 'Exotic' };
  if (key.includes('import')) return { color: '#ff0066', glow: 'rgba(255,0,102,0.6)', label: 'Import' };
  if (key.includes('very rare')) return { color: '#3b82f6', glow: 'rgba(59,130,246,0.6)', label: 'Very Rare' };
  if (key.includes('limited')) return { color: '#f08d3a', glow: 'rgba(240,141,58,0.6)', label: 'Limited' };
  if (key.includes('rare')) return { color: '#3b82f6', glow: 'rgba(59,130,246,0.5)', label: 'Rare' };
  if (key.includes('common')) return { color: '#94a3b8', glow: 'rgba(148,163,184,0.4)', label: 'Common' };
  if (apiColor) return { color: apiColor, glow: `${apiColor}99`, label: rarityName };
  return { color: '#94a3b8', glow: 'rgba(148,163,184,0.4)', label: rarityName || 'Standard' };
}