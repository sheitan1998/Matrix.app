import { base44 } from "@/api/base44Client";
import { CANONICAL_APP_ORIGIN } from "@/lib/canonicalOrigin";
import { oauthService } from "@/lib/OAuthService";

export const TWITCH_CALLBACK_PATH = "/auth/twitch/callback";
const ALLOWED_ORIGINS = ["https://matrix-hub.app", "https://www.matrix-hub.app", "https://matrix-hub.base44.app"];
const STATE_KEY = "twitch_oauth_state";
const REDIRECT_KEY = "twitch_oauth_redirect";

/** Callback on the same origin as the current session (keeps the MATRIX login), canonical on desktop. */
function getTwitchRedirectUri() {
  const origin = !oauthService.isDesktopApp && ALLOWED_ORIGINS.includes(window.location.origin)
    ? window.location.origin
    : CANONICAL_APP_ORIGIN;
  return origin + TWITCH_CALLBACK_PATH;
}

/** Starts the Authorization Code Flow: same-tab redirect on web, embedded window on desktop. */
export async function startTwitchLogin() {
  const state = oauthService.generateRandomState();
  const redirectUri = getTwitchRedirectUri();
  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(REDIRECT_KEY, redirectUri);

  const res = await base44.functions.invoke("twitchAuth", { action: "getAuthUrl", redirectUri, state });
  const url = res.data?.url;
  if (!url) throw new Error(res.data?.error || "Impossible de démarrer la connexion Twitch.");

  if (oauthService.isDesktopApp) {
    const opened = await oauthService.openAuthInWebviewWindow(url);
    if (!opened) throw new Error("Impossible d'ouvrir la fenêtre de connexion Twitch.");
    return;
  }
  window.location.assign(url);
}

/** Reads and clears the pending OAuth state saved before the redirect. */
export function consumeTwitchOAuthSession() {
  const state = sessionStorage.getItem(STATE_KEY) || "";
  const redirectUri = sessionStorage.getItem(REDIRECT_KEY) || getTwitchRedirectUri();
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(REDIRECT_KEY);
  return { state, redirectUri };
}