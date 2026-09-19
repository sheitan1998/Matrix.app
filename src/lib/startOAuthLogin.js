import { base44 } from "@/api/base44Client";
import { oauthService } from "@/lib/OAuthService";

const DEFAULT_OAUTH_CALLBACK_PATH = "/oauth/callback";

export async function startOAuthLogin(providerName, redirectPath = DEFAULT_OAUTH_CALLBACK_PATH) {
  const provider = typeof providerName === "string" ? providerName.trim().toLowerCase() : "";

  if (!provider) {
    throw new Error("OAuth provider is required.");
  }

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
