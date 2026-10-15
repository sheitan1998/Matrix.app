import { normalizeRocketRanks } from './rocketLeagueData.ts';

export const ROCKET_PLAYER_NOT_FOUND_MESSAGE = 'Joueur introuvable ou profil privé';
export const ROCKET_TRACKER_ERROR_MESSAGES = Object.freeze({
  missing_api_key: 'Le tracker Rocket League n’est pas configuré.',
  rate_limited: 'Le service de statistiques limite les requêtes. Réessayez dans quelques minutes.',
  not_found: ROCKET_PLAYER_NOT_FOUND_MESSAGE,
  private_or_forbidden: ROCKET_PLAYER_NOT_FOUND_MESSAGE,
  malformed_or_private_profile: ROCKET_PLAYER_NOT_FOUND_MESSAGE,
  invalid_request: 'Plateforme ou identifiant invalide.',
  timeout: 'Le service de statistiques ne répond pas pour le moment.',
  network_error: 'Le service de statistiques est temporairement indisponible.',
  upstream_error: 'Le service de statistiques est temporairement indisponible.',
  upstream_rejected: 'Le service de statistiques a refusé la requête.',
  malformed_response: 'Le service de statistiques a renvoyé une réponse inutilisable.',
  internal_error: 'Le service de statistiques est temporairement indisponible.',
});

export const ROCKET_PLATFORM_MAP = Object.freeze({
  epic: 'epic',
  steam: 'steam',
  psn: 'psn',
  xbox: 'xbl',
});

export function normalizeRocketPlatform(value) {
  const requested = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return ROCKET_PLATFORM_MAP[requested] || null;
}

export function normalizeRocketPlayerIdentifier(value) {
  if (typeof value !== 'string') return null;
  const identifier = value.trim();
  if (!identifier || identifier.length > 100 || /[\u0000-\u001f\u007f]/.test(identifier)) return null;
  return identifier;
}

function failure(code, upstreamStatus = null) {
  return {
    ok: false,
    error: {
      code,
      upstreamStatus,
      message: ROCKET_TRACKER_ERROR_MESSAGES[code] || ROCKET_TRACKER_ERROR_MESSAGES.upstream_error,
    },
  };
}

function statNumber(stats, candidates) {
  for (const key of candidates) {
    const stat = stats?.[key];
    const value = Number(stat?.value ?? stat);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

export function normalizeRocketOverview(stats) {
  const source = stats && typeof stats === 'object' ? stats : {};
  const details = Object.entries(source).flatMap(([key, stat]) => {
    if (!stat || typeof stat !== 'object') return [];
    const value = Number.isFinite(Number(stat.value)) ? Number(stat.value) : null;
    const displayValue = typeof stat.displayValue === 'string' ? stat.displayValue : value;
    if (displayValue === null || displayValue === undefined) return [];
    return [{
      key,
      displayName: typeof stat.displayName === 'string' ? stat.displayName : key.replace(/([A-Z])/g, ' $1').trim(),
      displayValue,
      value,
    }];
  });
  const wins = statNumber(source, ['wins']);
  const losses = statNumber(source, ['losses']);
  return {
    wins,
    losses,
    winLossRatio: wins !== null && losses !== null
      ? (losses === 0 ? wins : Number((wins / losses).toFixed(2)))
      : null,
    goals: statNumber(source, ['goals']),
    saves: statNumber(source, ['saves']),
    assists: statNumber(source, ['assists']),
    shots: statNumber(source, ['shots']),
    matchesPlayed: statNumber(source, ['matchesPlayed', 'matches']),
    mvp: statNumber(source, ['mVPs', 'mvps', 'mvp']),
    details,
  };
}

export async function requestRocketLeaguePlayerStats({
  platform,
  playerId,
  apiKey,
  fetchImpl = fetch,
  timeoutMs = 15000,
}) {
  const mappedPlatform = normalizeRocketPlatform(platform);
  const identifier = normalizeRocketPlayerIdentifier(playerId);
  if (!mappedPlatform || !identifier) return failure('invalid_request');
  if (typeof apiKey !== 'string' || !apiKey.trim()) return failure('missing_api_key');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetchImpl(
      `https://public-api.tracker.gg/v2/rocket-league/standard/profile/${mappedPlatform}/${encodeURIComponent(identifier)}`,
      {
        headers: {
          'TRN-Api-Key': apiKey,
          Accept: 'application/json',
        },
        signal: controller.signal,
      },
    );
  } catch (error) {
    return failure(error?.name === 'AbortError' ? 'timeout' : 'network_error');
  } finally {
    clearTimeout(timeout);
  }

  if (!response?.ok) {
    const status = Number.isInteger(response?.status) ? response.status : null;
    const code = status === 404
      ? 'not_found'
      : status === 401 || status === 403
        ? 'private_or_forbidden'
        : status === 429
          ? 'rate_limited'
          : status && status >= 500
            ? 'upstream_error'
            : 'upstream_rejected';
    return failure(code, status);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    return failure('malformed_response', response.status);
  }

  const trackerProfile = payload?.data;
  if (!trackerProfile?.platformInfo || !Array.isArray(trackerProfile.segments)) {
    return failure('malformed_or_private_profile', response.status);
  }

  return {
    ok: true,
    profile: {
      platform: trackerProfile.platformInfo.platformSlug || mappedPlatform,
      username: trackerProfile.platformInfo.platformUserHandle || identifier,
      avatar: typeof trackerProfile.platformInfo.avatarUrl === 'string'
        ? trackerProfile.platformInfo.avatarUrl
        : null,
      ranks: normalizeRocketRanks(trackerProfile.segments),
      overview: normalizeRocketOverview(
        trackerProfile.segments.find(segment => segment.type === 'overview')?.stats || {},
      ),
    },
  };
}
