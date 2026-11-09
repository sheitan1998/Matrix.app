// base44/shared/creatorMeta.ts — Résolution des visuels d'une chaîne YouTube / Twitch
// à partir de son URL (logo, bannière, nom, description).

import { getAppAccessToken, twitchFetch } from "./twitch.ts";

const YT_API = "https://www.googleapis.com/youtube/v3";
const MAX_DESCRIPTION = 500;

const clean = (value: string) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

function toUrl(input: string) {
  const raw = String(input || "").trim();
  if (!raw) return null;
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
}

/** /@handle, /channel/UC..., /user/name, /c/name → source YouTube */
export function parseYouTubeSource(input: string) {
  const url = toUrl(input);
  if (!url) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "channel" && parts[1]) return { type: "id", value: parts[1] };
  if (parts[0] === "user" && parts[1]) return { type: "user", value: parts[1] };
  if (parts[0] === "c" && parts[1]) return { type: "search", value: parts[1] };
  if (parts[0]?.startsWith("@")) return { type: "handle", value: parts[0] };
  return parts[0] ? { type: "search", value: parts[0] } : null;
}

/** twitch.tv/<login> → login (ignore les pages réservées) */
export function parseTwitchLogin(input: string) {
  const url = toUrl(input);
  if (!url) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const login = parts[0] || "";
  const reserved = [
    "directory", "videos", "search", "settings", "subscriptions",
    "inventory", "wallet", "drops", "downloads", "turbo",
  ];
  if (!login || reserved.includes(login.toLowerCase())) return null;
  return login;
}

async function getJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

/** Métadonnées d'une chaîne YouTube (API officielle, repli oEmbed). */
export async function fetchYouTubeMeta(input: string, apiKey?: string) {
  const source = parseYouTubeSource(input);
  if (!source) return null;

  if (apiKey) {
    const base = `${YT_API}/channels?part=snippet,brandingSettings&key=${encodeURIComponent(apiKey)}`;
    let data: any = null;

    if (source.type === "id") {
      data = await getJson(`${base}&id=${encodeURIComponent(source.value)}`);
    } else if (source.type === "handle") {
      data = await getJson(`${base}&forHandle=${encodeURIComponent(source.value)}`);
    } else if (source.type === "user") {
      data = await getJson(`${base}&forUsername=${encodeURIComponent(source.value)}`);
    }

    if (!data?.items?.length && source.value) {
      const search = await getJson(
        `${YT_API}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(source.value)}&key=${encodeURIComponent(apiKey)}`
      );
      const channelId = search?.items?.[0]?.id?.channelId || search?.items?.[0]?.snippet?.channelId;
      if (channelId) data = await getJson(`${base}&id=${encodeURIComponent(channelId)}`);
    }

    const channel = data?.items?.[0];
    if (channel) {
      const snippet = channel.snippet || {};
      const banner = String(channel.brandingSettings?.image?.bannerExternalUrl || "");
      return {
        platform: "youtube",
        name: clean(snippet.title),
        avatar_url: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || "",
        banner_url: banner ? (banner.includes("=") ? banner : `${banner}=w1707`) : "",
        description: clean(snippet.description).slice(0, MAX_DESCRIPTION),
      };
    }
  }

  // Repli : oEmbed (titre + miniature) quand l'API n'est pas disponible.
  const url = toUrl(input);
  if (!url) return null;
  const path = url.pathname.split("/").filter(Boolean).join("/");
  const normalized = url.pathname.startsWith("/channel/")
    ? `https://www.youtube.com/channel/${url.pathname.split("/")[2]}`
    : `https://www.youtube.com/${path}`;
  const oembed = await getJson(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(normalized)}`);
  if (!oembed) return null;
  return {
    platform: "youtube",
    name: clean(oembed.title),
    avatar_url: oembed.thumbnail_url || "",
    banner_url: "",
    description: "",
  };
}

/** Métadonnées d'une chaîne Twitch (Helix users). */
export async function fetchTwitchMeta(input: string, clientId?: string, clientSecret?: string) {
  const login = parseTwitchLogin(input);
  if (!login || !clientId || !clientSecret) return null;

  const token = await getAppAccessToken(clientId, clientSecret);
  if (typeof token !== "string") return null;

  const res: any = await twitchFetch("users", { login }, token, clientId);
  const user = res?.data?.[0];
  if (!user) return null;

  return {
    platform: "twitch",
    name: clean(user.display_name),
    avatar_url: user.profile_image_url || "",
    banner_url: user.offline_image_url || "",
    description: clean(user.description).slice(0, MAX_DESCRIPTION),
  };
}

export async function resolveChannelMeta(url: string, platform: string) {
  if (platform === "twitch") {
    return fetchTwitchMeta(url, process.env.TWITCH_CLIENT_ID, process.env.TWITCH_CLIENT_SECRET);
  }
  if (platform === "youtube") {
    return fetchYouTubeMeta(url, process.env.YOUTUBE_API_KEY);
  }
  // TikTok et Instagram n'exposent pas ces visuels publiquement : leurs cartes
  // utilisent l'habillage Matrix (dégradé néon + initiale).
  return null;
}