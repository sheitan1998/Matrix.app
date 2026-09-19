import { base44 } from "@/api/base44Client";
import { oauthService } from "@/lib/OAuthService";

const DEFAULT_OAUTH_CALLBACK_PATH = "/oauth/callback";

function isTauriApp() {
  try {
    return Boolean(window.__TAURI__ || window.__TAURI_INTERNALS__);
  } catch {
    return false;
  }
}

export async function startOAuthLogin(providerName, redirectPath = DEFAULT_OAUTH_CALLBACK_PATH) {
  const provider = typeof providerName === "string" ? providerName.trim().toLowerCase() : "";

  if (!provider) {
    throw new Error("OAuth provider is required.");
  }

  // On the web, use the SDK's built-in loginWithProvider which handles the
  // entire OAuth flow including session creation and token exchange with the
  // Base44 platform. The custom oauthExchange flow only returns provider
  // tokens (e.g. Google access_token), not Base44 session tokens, which
  // causes base44.auth.me() to fail with 401 and leaves the callback stuck.
  if (!isTauriApp()) {
    const returnUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem("oauth_return_to", returnUrl);
    await base44.auth.loginWithProvider(provider, returnUrl);
    return;
  }

  // In Tauri desktop, use the custom OAuth flow with the system browser
  // and deep-link callback, since loginWithProvider's popup/redirect doesn't
  // work in the webview.
  const response = await base44.functions.invoke("oauthExchange", {
    action: "getOAuthConfig",
    provider,
  });

  const oauthConfig = response?.data?.data;
  if (!oauthConfig?.client_id || !oauthConfig?.authorization_url) {
    throw new Error("La configuration OAuth du fournisseur est introuvable ou incomplète.");
  }

  return oauthService.startOAuthFlow(
    provider,
    oauthConfig.authorization_url,
    oauthConfig.client_id,
    oauthConfig.redirect_uri || redirectPath,
    oauthConfig.scopes || [],
    oauthConfig.authorization_params || {}
  );
}