import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";

const YOUTUBE_SCOPE = "https://www.googleapis.com/auth/youtube.readonly";
const TOKEN_KEY = "yt_oauth_token";
const CHANNELS_KEY = "yt_channels";
const SELECTED_KEY = "yt_selected_channel";

let gisPromise = null;
function loadGIS() {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve(window.google);
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.google);
    s.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(s);
  });
  return gisPromise;
}

function mapChannelOAuth(item) {
  const sn = item.snippet || {};
  const st = item.statistics || {};
  return {
    id: item.id,
    name: sn.title || "",
    description: sn.description || "",
    avatar_url:
      sn.thumbnails?.high?.url ||
      sn.thumbnails?.medium?.url ||
      sn.thumbnails?.default?.url ||
      "",
    subscribers_count: parseInt(st.subscriberCount || "0"),
    total_views: parseInt(st.viewCount || "0"),
    video_count: parseInt(st.videoCount || "0"),
    handle: sn.customUrl ? `@${sn.customUrl}` : "",
    _source: "youtube_oauth",
  };
}

/**
 * Hook to manage Google OAuth for the YouTube universe only.
 * The Google OAuth Client ID is fetched from the backend (stored as a secret).
 * Uses Google Identity Services (GIS) token client with the official
 * youtube.readonly scope. Fetches the user's channel(s) via YouTube Data API v3.
 */
export function useYouTubeAuth() {
  const [clientId, setClientId] = useState(null);
  const [clientIdLoaded, setClientIdLoaded] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [channels, setChannels] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CHANNELS_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [selectedId, setSelectedId] = useState(() => localStorage.getItem(SELECTED_KEY));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const tokenClientRef = useRef(null);

  const selectedChannel =
    channels.find((c) => c.id === selectedId) || channels[0] || null;

  // Fetch the Google OAuth Client ID from the backend (stored as GOOGLE_CLIENT_ID secret)
  useEffect(() => {
    base44.functions
      .invoke("youtubeApi", { action: "getOAuthConfig" })
      .then((res) => {
        const id = res.data?.data?.client_id || null;
        setClientId(id);
        if (!id) setError("Client ID OAuth introuvable côté serveur.");
      })
      .catch((e) => {
        console.error("[useYouTubeAuth] getOAuthConfig failed:", e?.response?.data || e);
        setError(e?.response?.data?.error || "Impossible de charger la configuration OAuth.");
        setClientId(null);
      })
      .finally(() => setClientIdLoaded(true));
  }, []);

  // Persist token / channels / selected
  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);
  useEffect(() => {
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
  }, [channels]);
  useEffect(() => {
    if (selectedId) localStorage.setItem(SELECTED_KEY, selectedId);
    else localStorage.removeItem(SELECTED_KEY);
  }, [selectedId]);

  // Fetch the user's channel(s): mine=true (personal) + managedByMe=true (brand channels)
  const fetchChannels = useCallback(async (tk) => {
    const headers = { Authorization: `Bearer ${tk}` };
    const fetchPart = async (param) => {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&${param}=true`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`YouTube API ${res.status}`);
      const data = await res.json();
      return (data.items || []).map(mapChannelOAuth);
    };
    let mine = [];
    let managed = [];
    try {
      mine = await fetchPart("mine");
    } catch {
      /* mine may be empty */
    }
    try {
      managed = await fetchPart("managedByMe");
    } catch {
      /* managedByMe may be empty */
    }
    const seen = new Set();
    return [...mine, ...managed].filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, []);

  // Initialize the GIS token client once the Client ID is available
  useEffect(() => {
    if (!clientId) return;
    let mounted = true;
    loadGIS()
      .then((google) => {
        if (!mounted) return;
        tokenClientRef.current = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: YOUTUBE_SCOPE,
          callback: async (response) => {
            if (response.error) {
              setError(response.error);
              return;
            }
            const tk = response.access_token;
            setToken(tk);
            setError(null);
            setLoading(true);
            try {
              const chs = await fetchChannels(tk);
              setChannels(chs);
              if (chs.length > 0) {
                setSelectedId((prev) =>
                  chs.find((c) => c.id === prev) ? prev : chs[0].id
                );
              }
            } catch (e) {
              setError(e.message);
            } finally {
              setLoading(false);
            }
          },
        });
      })
      .catch((e) => setError(e.message));
    return () => {
      mounted = false;
    };
  }, [clientId, fetchChannels]);

  // Validate the stored token on mount — refresh channels or clear if expired
  useEffect(() => {
    if (!token) return;
    let mounted = true;
    setLoading(true);
    fetchChannels(token)
      .then((chs) => {
        if (!mounted) return;
        if (chs.length === 0) {
          setToken(null);
          setChannels([]);
        } else {
          setChannels(chs);
          setSelectedId((prev) =>
            chs.find((c) => c.id === prev) ? prev : chs[0].id
          );
        }
      })
      .catch(() => {
        if (!mounted) return;
        setToken(null);
        setChannels([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(() => {
    if (!clientId) {
      setError("Configuration OAuth manquante. Vérifiez le secret GOOGLE_CLIENT_ID.");
      return;
    }
    if (!tokenClientRef.current) {
      setError("Google OAuth non initialisé. Vérifiez l'origine JavaScript autorisée dans Google Cloud Console.");
      return;
    }
    setError(null);
    tokenClientRef.current.requestAccessToken({ prompt: "consent" });
  }, [clientId]);

  const logout = useCallback(async () => {
    if (token) {
      try {
        const google = await loadGIS();
        google.accounts.oauth2.revoke(token, () => {});
      } catch {
        /* ignore */
      }
    }
    setToken(null);
    setChannels([]);
    setSelectedId(null);
    setError(null);
  }, [token]);

  const switchChannel = useCallback((id) => setSelectedId(id), []);

  return {
    token,
    channels,
    selectedChannel,
    selectedId,
    loading,
    error,
    login,
    logout,
    switchChannel,
    clientIdConfigured: !!clientId,
    clientIdLoading: !clientIdLoaded,
  };
}