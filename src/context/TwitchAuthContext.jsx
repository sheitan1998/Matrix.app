import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "twitch_access_token";
const TwitchAuthContext = createContext(null);

export function useTwitchAuth() {
  return useContext(TwitchAuthContext);
}

/**
 * TwitchAuthProvider — manages Twitch OAuth via the implicit grant flow.
 * The client_id is fetched from the backend (stored as TWITCH_CLIENT_ID secret).
 * The user token is persisted in localStorage; on mount, the URL hash is checked
 * for the OAuth callback (#access_token=...).
 */
export function TwitchAuthProvider({ children }) {
  const [userToken, setUserToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [twitchUser, setTwitchUser] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check for OAuth callback hash + fetch client_id from backend
  useEffect(() => {
    let mounted = true;

    // Check for OAuth callback in URL hash (implicit grant flow)
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      if (token) {
        localStorage.setItem(STORAGE_KEY, token);
        setUserToken(token);
        // Clean the URL
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }

    // Fetch client_id from backend
    base44.functions
      .invoke("twitchApi", { action: "getOAuthConfig" })
      .then((res) => {
        if (!mounted) return;
        setClientId(res.data?.data?.client_id || null);
      })
      .catch((e) => {
        console.error("[twitchAuth] getOAuthConfig failed:", e);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  // Fetch Twitch user profile when we have a token
  useEffect(() => {
    if (!userToken) {
      setTwitchUser(null);
      return;
    }
    let mounted = true;
    base44.functions
      .invoke("twitchApi", { action: "getUserInfo", userToken })
      .then((res) => {
        if (!mounted) return;
        const users = res.data?.data || [];
        if (users[0]) {
          setTwitchUser(users[0]);
        } else {
          // Token invalid — clear it
          localStorage.removeItem(STORAGE_KEY);
          setUserToken(null);
        }
      })
      .catch(() => {
        if (!mounted) return;
        localStorage.removeItem(STORAGE_KEY);
        setUserToken(null);
        setTwitchUser(null);
      });
    return () => { mounted = false; };
  }, [userToken]);

  const login = useCallback(() => {
    if (!clientId) {
      alert("Configuration Twitch manquante. Ajoutez TWITCH_CLIENT_ID et TWITCH_CLIENT_SECRET dans Dashboard → Settings → Environment Variables pour activer la connexion Twitch.");
      return;
    }
    const redirectUri = `${window.location.origin}/twitch`;
    const scope = "user:read:email user:read:follows";
    window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
  }, [clientId]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUserToken(null);
    setTwitchUser(null);
  }, []);

  return (
    <TwitchAuthContext.Provider
      value={{ userToken, twitchUser, isAuthenticated: !!userToken, loading, clientId, login, logout }}
    >
      {children}
    </TwitchAuthContext.Provider>
  );
}