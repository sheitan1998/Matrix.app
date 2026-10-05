import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { startTwitchLogin } from "@/lib/twitchOAuth";

const LEGACY_STORAGE_KEY = "twitch_access_token";
const SESSION_REFRESH_MS = 30 * 60 * 1000;
const TwitchAuthContext = createContext(null);

export function useTwitchAuth() {
  return useContext(TwitchAuthContext);
}

/**
 * TwitchAuthProvider — Authorization Code Flow.
 * Tokens (access + refresh) live server-side; the backend returns a valid access token
 * (refreshed when needed) and the Twitch profile (/users) for the logged-in MATRIX user.
 */
export function TwitchAuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [twitchUser, setTwitchUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const res = await base44.functions.invoke("twitchAuth", { action: "getSession" });
    if (res.data?.connected) {
      setUserToken(res.data.access_token);
      setTwitchUser(res.data.user);
    } else {
      setUserToken(null);
      setTwitchUser(null);
    }
  }, []);

  useEffect(() => {
    // Drop any token left by the old implicit flow
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    loadSession()
      .catch((e) => console.error("[twitchAuth] getSession failed:", e))
      .finally(() => setLoading(false));
    const id = setInterval(() => loadSession().catch(() => {}), SESSION_REFRESH_MS);
    return () => clearInterval(id);
  }, [loadSession]);

  const login = useCallback(() => {
    startTwitchLogin().catch((e) => {
      toast.error(e?.response?.data?.error || e?.message || "Connexion Twitch impossible.");
    });
  }, []);

  const logout = useCallback(async () => {
    setUserToken(null);
    setTwitchUser(null);
    await base44.functions.invoke("twitchAuth", { action: "disconnect" });
  }, []);

  return (
    <TwitchAuthContext.Provider
      value={{ userToken, twitchUser, isAuthenticated: !!userToken && !!twitchUser, loading, login, logout }}
    >
      {children}
    </TwitchAuthContext.Provider>
  );
}