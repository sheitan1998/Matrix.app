import { normalizeRocketRanks } from './rocketLeagueData.ts';

export const ROCKET_PLAYER_NOT_FOUND_MESSAGE = 'Joueur introuvable ou profil privé';

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
      message: ROCKET_PLAYER_NOT_FOUND_MESSAGE,
    },
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
      overview: trackerProfile.segments.find(segment => segment.type === 'overview')?.stats || {},
    },
  };
}
