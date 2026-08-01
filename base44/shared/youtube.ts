// base44/shared/youtube.ts — Shared YouTube Data API v3 helpers
// All public-data read endpoints mapped to the app's entity shapes (Video, Channel, Comment, Short).

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

/** ISO 8601 duration (PT#H#M#S) → "M:SS" or "H:MM:SS" */
export function parseDuration(iso) {
  if (!iso) return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const h = parseInt(m[1] || "0");
  const min = parseInt(m[2] || "0");
  const s = parseInt(m[3] || "0");
  if (h > 0) return `${h}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${min}:${String(s).padStart(2, "0")}`;
}

/** search.list item → Video entity shape (no stats) */
export function mapSearchVideo(item) {
  const sn = item.snippet || {};
  return {
    id: item.id?.videoId || item.id,
    title: sn.title || "",
    thumbnail_url: sn.thumbnails?.high?.url || sn.thumbnails?.medium?.url || sn.thumbnails?.default?.url || "",
    channel_name: sn.channelTitle || "",
    channel_id: sn.channelId || "",
    channel_avatar: "",
    description: sn.description || "",
    created_date: sn.publishedAt || new Date().toISOString(),
    views: 0, likes: 0, dislikes: 0,
    duration: "",
    is_live: sn.liveBroadcastContent === "live",
    viewers_count: 0,
    category: "other",
    tags: [],
    video_url: "",
    _source: "youtube",
  };
}

/** videos.list item (with snippet,statistics,contentDetails) → Video entity shape */
export function mapVideoWithStats(item) {
  const sn = item.snippet || {};
  const st = item.statistics || {};
  const cd = item.contentDetails || {};
  const lsd = item.liveStreamingDetails || {};
  return {
    id: item.id,
    title: sn.title || "",
    thumbnail_url: sn.thumbnails?.high?.url || sn.thumbnails?.medium?.url || sn.thumbnails?.default?.url || "",
    channel_name: sn.channelTitle || "",
    channel_id: sn.channelId || "",
    channel_avatar: "",
    description: sn.description || "",
    created_date: sn.publishedAt || new Date().toISOString(),
    views: parseInt(st.viewCount || "0"),
    likes: parseInt(st.likeCount || "0"),
    dislikes: 0,
    comments_count: parseInt(st.commentCount || "0"),
    duration: parseDuration(cd.duration || ""),
    is_live: sn.liveBroadcastContent === "live",
    viewers_count: parseInt(lsd.concurrentViewers || "0"),
    category: sn.categoryId || "other",
    tags: sn.tags || [],
    video_url: "",
    embeddable: cd.embeddable !== false,
    _source: "youtube",
  };
}

/** channels.list item → Channel entity shape */
export function mapChannel(item) {
  const sn = item.snippet || {};
  const st = item.statistics || {};
  return {
    id: item.id,
    name: sn.title || "",
    handle: `@${sn.customUrl || item.id}`,
    description: sn.description || "",
    avatar_url: sn.thumbnails?.high?.url || sn.thumbnails?.medium?.url || sn.thumbnails?.default?.url || "",
    banner_url: sn.thumbnails?.high?.url || "",
    owner_email: "",
    subscribers_count: parseInt(st.subscriberCount || "0"),
    verified: false,
    total_views: parseInt(st.viewCount || "0"),
    trix_received: 0,
    video_count: parseInt(st.videoCount || "0"),
    _source: "youtube",
  };
}

/** commentThreads.list item → Comment entity shape */
export function mapComment(item) {
  const top = item.snippet?.topLevelComment?.snippet || {};
  return {
    id: item.id,
    video_id: item.snippet?.videoId || "",
    author_email: "",
    author_name: top.authorDisplayName || "",
    author_avatar: top.authorProfileImageUrl || "",
    content: top.textDisplay || top.textOriginal || "",
    likes: parseInt(top.likeCount || "0"),
    is_premium: false,
    created_date: top.publishedAt || new Date().toISOString(),
    _source: "youtube",
  };
}

/** search.list item (type=channel) → Channel entity shape (lightweight) */
export function mapSearchChannel(item) {
  const sn = item.snippet || {};
  return {
    id: item.id?.channelId || sn.channelId,
    name: sn.title || "",
    handle: `@${sn.title || ""}`,
    description: sn.description || "",
    avatar_url: sn.thumbnails?.high?.url || sn.thumbnails?.medium?.url || sn.thumbnails?.default?.url || "",
    banner_url: "",
    owner_email: "",
    subscribers_count: 0,
    verified: false,
    total_views: 0,
    trix_received: 0,
    _source: "youtube",
  };
}

/** Centralized fetch wrapper with error handling */
export async function youtubeFetch(endpoint, params, apiKey) {
  const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  });
  url.searchParams.set("key", apiKey);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    return { _error: true, status: res.status, message: errBody.error?.message || `YouTube API ${res.status}` };
  }
  return await res.json();
}

/** Fetch full video stats for a list of video IDs (batched) */
export async function fetchVideoStats(ids, apiKey) {
  if (!ids || ids.length === 0) return [];
  const chunks = [];
  for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));
  const results = [];
  for (const chunk of chunks) {
    const data = await youtubeFetch("videos", {
      part: "snippet,statistics,contentDetails,liveStreamingDetails",
      id: chunk.join(","),
      maxResults: chunk.length,
    }, apiKey);
    if (data._error) continue;
    results.push(...(data.items || []).map(mapVideoWithStats));
  }
  return results;
}