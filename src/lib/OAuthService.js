import { appParams, resolveFromUrl } from "@/lib/app-params";
import { getTauriInvoke } from "@/lib/tauriInvoke";

/**
 * Service pour gérer le flux OAuth dans une application Tauri desktop
 * Compatible avec Base44 SDK et les fournisseurs OAuth standard
 */
class OAuthService {
  constructor() {
    this.isDesktopApp = this.detectTauriApp();
    this.oauthState = null;
    this.oauthCodeVerifier = null;
  }

  getCallbackBaseUrl() {
    try {
      const resolvedUrl = resolveFromUrl(appParams.appBaseUrl) || window.location.href;
      return new URL(resolvedUrl).origin;
    } catch {
      return window.location.origin;
    }
  }

  normalizeRedirectUri(redirectUri = "/oauth/callback") {
    const rawValue = typeof redirectUri === "string" ? redirectUri.trim() : "";
    const baseUrl = this.getCallbackBaseUrl();
    const fallbackUrl = new URL("/oauth/callback", baseUrl).toString();

    if (!rawValue) {
      return fallbackUrl;
    }

    try {
      return new URL(rawValue, baseUrl).toString();
    } catch {
      return fallbackUrl;
    }
  }

  normalizeProviderName(providerName) {
    return typeof providerName === "string" ? providerName.trim().toLowerCase() : "";
  }

  normalizeScopes(scopes = []) {
    if (Array.isArray(scopes)) {
      return scopes.map((scope) => String(scope || "").trim()).filter(Boolean).join(" ");
    }

    if (typeof scopes === "string") {
      return scopes.trim();
    }

    return "";
  }

  getStoredOAuthSession() {
    const provider = this.normalizeProviderName(sessionStorage.getItem("oauth_provider"));
    const state = sessionStorage.getItem("oauth_state") || "";
    const codeVerifier = sessionStorage.getItem("oauth_code_verifier") || "";
    const redirectUri = this.normalizeRedirectUri(
      sessionStorage.getItem("oauth_redirect_uri") || "/oauth/callback"
    );

    if (!provider && !state && !codeVerifier) {
      return null;
    }

    return {
      provider,
      state,
      codeVerifier,
      redirectUri,
    };
  }

  /**
   * Détecte si l'app s'exécute dans Tauri
   */
  detectTauriApp() {
    try {
      return Boolean(window.__TAURI__ || window.__TAURI_INTERNALS__);
    } catch {
      return false;
    }
  }

  /**
   * Génère un état aléatoire pour la sécurité OAuth (CSRF protection)
   */
  generateRandomState() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  /**
   * Génère un code verifier pour PKCE (RFC 7636)
   */
  generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const binaryString = String.fromCharCode.apply(null, array);
    return btoa(binaryString)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  /**
   * Génère le code challenge à partir du verifier (PKCE)
   */
  async generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    return hashBase64;
  }

  /**
   * Démarre le flux d'authentification OAuth
   * Dans Tauri, ouvre le popup dans le navigateur par défaut
   */
  async startOAuthFlow(
    providerName,
    authUrl,
    clientId,
    redirectUri,
    scopes = [],
    authorizationParams = {}
  ) {
    try {
      const normalizedProvider = this.normalizeProviderName(providerName);
      const normalizedAuthUrl = typeof authUrl === "string" ? authUrl.trim() : "";
      const normalizedClientId = typeof clientId === "string" ? clientId.trim() : "";
      const normalizedRedirectUri = this.normalizeRedirectUri(redirectUri);
      const normalizedScopes = this.normalizeScopes(scopes) || "openid profile email";

      if (!normalizedProvider) {
        throw new Error("OAuth provider is required");
      }

      if (!normalizedAuthUrl) {
        throw new Error("OAuth authorization URL is required");
      }

      if (!normalizedClientId) {
        throw new Error("OAuth client_id is required");
      }

      // Générer état et code verifier
      this.oauthState = this.generateRandomState();
      this.oauthCodeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(
        this.oauthCodeVerifier
      );

      // Stocker temporairement (sera validé au callback)
      sessionStorage.setItem("oauth_state", this.oauthState);
      sessionStorage.setItem("oauth_code_verifier", this.oauthCodeVerifier);
      sessionStorage.setItem("oauth_provider", normalizedProvider);
      sessionStorage.setItem("oauth_redirect_uri", normalizedRedirectUri);

      // Construire l'URL d'autorisation
      const params = new URLSearchParams({
        client_id: normalizedClientId,
        redirect_uri: normalizedRedirectUri,
        response_type: "code",
        scope: normalizedScopes,
        state: this.oauthState,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });

      Object.entries(authorizationParams || {}).forEach(([key, value]) => {
        const normalizedKey = String(key || "").trim();
        const normalizedValue = typeof value === "string" ? value.trim() : value;
        if (!normalizedKey || normalizedValue === undefined || normalizedValue === null || normalizedValue === "") {
          return;
        }
        params.set(normalizedKey, String(normalizedValue));
      });

      const fullAuthUrl = `${normalizedAuthUrl}?${params.toString()}`;

      // Si c'est une application Tauri, ouvrir dans le navigateur par défaut
      if (this.isDesktopApp) {
        const invoke = await getTauriInvoke();
        if (invoke) {
          await invoke("open_auth_window", { url: fullAuthUrl });
          console.log("✅ OAuth popup ouvert dans le navigateur (Tauri)");
        } else {
          window.open(fullAuthUrl, "oauth_popup", "width=500,height=600");
        }
      } else {
        // Sinon, ouvrir un popup standard
        window.open(fullAuthUrl, "oauth_popup", "width=500,height=600");
        console.log("✅ OAuth popup ouvert (Browser)");
      }

      return true;
    } catch (error) {
      console.error("❌ Erreur lors du démarrage du flux OAuth:", error);
      throw new Error(`OAuth flow failed: ${error.message}`);
    }
  }

  /**
   * Traiter le callback OAuth reçu via l'URL
   */
  async handleOAuthCallback(callbackUrl) {
    try {
      const params = this.getOAuthCallbackParams(callbackUrl);
      const code = params?.code;
      const state = params?.state;
      const error = params?.error;

      // Vérifier les erreurs OAuth
      if (error) {
        const errorDescription = params?.error_description;
        throw new Error(`OAuth Error: ${error} - ${errorDescription || ""}`);
      }

      if (!code) {
        throw new Error("Authorization code not found in callback");
      }

      // Valider l'état CSRF
      const storedSession = this.getStoredOAuthSession();
      const savedState = storedSession?.state || "";
      if (state !== savedState) {
        throw new Error("OAuth state mismatch - potential CSRF attack");
      }

      // Récupérer le code verifier
      const codeVerifier = storedSession?.codeVerifier || "";
      if (!codeVerifier) {
        throw new Error("Code verifier not found");
      }

      console.log("✅ Callback OAuth validé");
      return { code, state, codeVerifier };
    } catch (error) {
      console.error("❌ Erreur validation callback OAuth:", error);
      throw error;
    }
  }

  /**
   * Nettoyer les données OAuth stockées
   */
  clearOAuthSession() {
    sessionStorage.removeItem("oauth_state");
    sessionStorage.removeItem("oauth_code_verifier");
    sessionStorage.removeItem("oauth_provider");
    sessionStorage.removeItem("oauth_redirect_uri");
    this.oauthState = null;
    this.oauthCodeVerifier = null;
  }

  /**
   * Vérifier si on est en train de revenir d'un OAuth callback
   */
  isOAuthCallback(callbackUrl = window.location.href) {
    const params = this.getOAuthCallbackParams(callbackUrl);
    return Boolean(params?.error || params?.access_token || params?.code || params?.state);
  }

  /**
   * Extraire les paramètres du callback depuis l'URL actuelle
   */
  getOAuthCallbackParams(callbackUrl = window.location.href) {
    const url = new URL(callbackUrl);
    const hashParams = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : "");
    const readParam = (key) => url.searchParams.get(key) ?? hashParams.get(key);
    const params = {
      code: readParam("code"),
      state: readParam("state"),
      error: readParam("error"),
      error_description: readParam("error_description"),
      access_token: readParam("access_token"),
      token_type: readParam("token_type"),
    };

    if (!params.code && !params.state && !params.error && !params.access_token) {
      return null;
    }

    return {
      code: params.code,
      state: params.state,
      error: params.error,
      error_description: params.error_description,
      access_token: params.access_token,
      token_type: params.token_type,
    };
  }
}

export const oauthService = new OAuthService();