const RANKED_MODES = [
  { ids: [10], label: '1v1', pattern: /duel|1v1/i },
  { ids: [11], label: '2v2', pattern: /double|2v2/i },
  { ids: [13], label: '3v3', pattern: /standard|3v3/i },
  { ids: [34], label: 'Tournois', pattern: /tournament|tournoi/i },
];

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function text(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function seasonValue(segment) {
  return finiteNumber(segment?.attributes?.season)
    ?? finiteNumber(segment?.metadata?.season)
    ?? null;
}

export function normalizeRocketRanks(segments) {
  const ranked = Array.isArray(segments)
    ? segments.filter(segment => ['playlist', 'RankedSeason', 'ranked'].includes(segment?.type))
    : [];
  return RANKED_MODES.flatMap(mode => {
    const matches = ranked
      .filter(segment => (
        mode.ids.includes(Number(segment?.attributes?.playlistId))
        || mode.pattern.test(String(segment?.metadata?.name || ''))
      ))
      .sort((a, b) => (seasonValue(b) ?? -1) - (seasonValue(a) ?? -1));
    const segment = matches[0];
    if (!segment) return [];
    const stats = segment.stats || {};
    return [{
      playlist: mode.label,
      tier: text(stats.tier?.metadata?.name)
        || text(stats.rating?.metadata?.rankName)
        || text(segment.metadata?.rankName),
      division: text(stats.division?.metadata?.name)
        || text(segment.metadata?.divisionName),
      rating: finiteNumber(stats.rating?.value),
      season: seasonValue(segment),
      matchesPlayed: finiteNumber(stats.matchesPlayed?.value),
      wins: finiteNumber(stats.wins?.value),
    }];
  });
}
