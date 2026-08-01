// base44/shared/twitch.ts — Shared Twitch Helix API helpers
// Maps Twitch API responses to the app's normalized entity shapes.

const TWITCH_API_BASE = "https://api.twitch.tv/helix";
const TWITCH_OAUTH_BASE = "https://id.twitch.tv/oauth2";

/** Get app access token for server-to-server API calls */
export async function getAppAccessToken(clientId, clientSecret) {
  const res = await fetch(
    `${TWITCH_OAUTH_BASE}/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { _error: true, status: res.status, message: err.message || `Twitch OAuth token failed: ${res.status}` };
  }
  const data = await res.json();
  return data.access_token;
}

/** Centralized Twitch Helix API fetch with error handling */
export async function twitchFetch(endpoint, params, accessToken, clientId) {
  const url = new URL(`${TWITCH_API_BASE}/${endpoint}`);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) {
      v.forEach((item) => url.searchParams.append(k, String(item)));
    } else {
      url.searchParams.set(k, String(v));
    }
  });
  const res = await fetch(url.toString(), {
    headers: {
      "Client-Id": clientId,
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { _error: true, status: res.status, message: err.message || `Twitch API ${res.status}` };
  }
  return await res.json();
}

/** streams → normalized stream object */
export function mapStream(stream) {
  return {
    id: stream.id,
    user_id: stream.user_id,
    user_login: stream.user_login,
    user_name: stream.user_name,
    title: stream.title || "",
    game_id: stream.game_id || "",
    game_name: stream.game_name || "",
    viewer_count: stream.viewer_count || 0,
    started_at: stream.started_at || "",
    thumbnail_url: (stream.thumbnail_url || "").replace("{width}", "440").replace("{height}", "248"),
    is_live: stream.type === "live",
    language: stream.language || "",
    tags: stream.tags || [],
    _source: "twitch",
  };
}

/** search/channels → normalized channel object */
export function mapChannel(channel) {
  return {
    id: channel.id,
    user_login: channel.broadcaster_login,
    user_name: channel.display_name,
    game_id: channel.game_id || "",
    game_name: channel.game_name || "",
    title: channel.title || "",
    thumbnail_url: channel.thumbnail_url || "",
    is_live: channel.is_live,
    _source: "twitch",
  };
}

/** games/top or search/categories → normalized category object */
export function mapCategory(game) {
  return {
    id: game.id,
    name: game.name,
    box_art_url: (game.box_art_url || "").replace("{width}", "285").replace("{height}", "380"),
    igdb_id: game.igdb_id || "",
    _source: "twitch",
  };
}

/** users → normalized user object */
export function mapUser(user) {
  return {
    id: user.id,
    login: user.login,
    display_name: user.display_name,
    description: user.description || "",
    profile_image_url: user.profile_image_url || "",
    offline_image_url: user.offline_image_url || "",
    view_count: user.view_count || 0,
    created_at: user.created_at || "",
    broadcaster_type: user.broadcaster_type || "",
    _source: "twitch",
  };
}