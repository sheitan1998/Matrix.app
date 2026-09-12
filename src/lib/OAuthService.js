import { invoke } from "@tauri-apps/api/core";
import { appParams } from "@/lib/app-params";

const OAUTH_CALLBACK_EVENT = "oauth-callback";
const OAUTH_CALLBACK_PATH = "/oauth/callback";

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

  /**
   * Détecte si l'app s'exécute dans Tauri
   */
  detectTauriApp() {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      return (
        typeof window.__TAURI__ !== "undefined" ||
        window.location.protocol === "tauri:" ||
        window.location.hostname.endsWith(".localhost")
      );
    } catch {
      return false;
    }
  }

  getCallbackEventName() {
    return OAUTH_CALLBACK_EVENT;
  }

  normalizeReturnTo(returnTo = "/") {
    const url = new URL(returnTo, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}` || "/";
  }

  getAppRouteUrl(route = "/") {
    const normalizedRoute = this.normalizeReturnTo(route);

    if (!this.isDesktopApp) {
      return new URL(normalizedRoute, window.location.origin).toString();
    }

    const hashRoute = normalizedRoute === "/" ? "#/" : `#${normalizedRoute}`;
    return `${window.location.origin}/${hashRoute}`;
  }

  getDesktopCallbackUrl(returnTo = "/") {
    const callbackUrl = new URL(this.getAppRouteUrl(OAUTH_CALLBACK_PATH));
    callbackUrl.searchParams.set("returnTo", this.normalizeReturnTo(returnTo));
    return callbackUrl.toString();
  }

  buildBase44LoginUrl(returnTo = "/") {
    const redirectUrl = this.isDesktopApp
      ? this.getDesktopCallbackUrl(returnTo)
      : new URL(returnTo, window.location.origin).toString();

    return `${appParams.appBaseUrl}/login?from_url=${encodeURIComponent(
      redirectUrl
    )}`;
  }

  buildBase44ProviderUrl(providerName, returnTo = "/") {
    const redirectUrl = this.isDesktopApp
      ? this.getDesktopCallbackUrl(returnTo)
      : new URL(returnTo, window.location.origin).toString();

    const queryParams = new URLSearchParams({
      app_id: appParams.appId,
      from_url: redirectUrl,
    });

    const providerPath = providerName === "google" ? "" : `/${providerName}`;
    return `${appParams.appBaseUrl}/api/apps/auth${providerPath}/login?${queryParams.toString()}`;
  }

  async openDesktopAuthWindow(url) {
    if (!this.isDesktopApp) {
      window.location.href = url;
      return true;
    }

    await invoke("open_auth_window", { url });
    return true;
  }

  async startDesktopProviderAuth(providerName, returnTo = "/") {
    return this.openDesktopAuthWindow(
      this.buildBase44ProviderUrl(providerName, returnTo)
    );
  }

  async startDesktopLogin(returnTo = "/") {
    return this.openDesktopAuthWindow(this.buildBase44LoginUrl(returnTo));
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
  async startOAuthFlow(providerName, authUrl, clientId, redirectUri, scopes = []) {
    try {
      // Générer état et code verifier
      this.oauthState = this.generateRandomState();
      this.oauthCodeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(
        this.oauthCodeVerifier
      );

      // Stocker temporairement (sera validé au callback)
      sessionStorage.setItem("oauth_state", this.oauthState);
      sessionStorage.setItem("oauth_code_verifier", this.oauthCodeVerifier);
      sessionStorage.setItem("oauth_provider", providerName);

      // Construire l'URL d'autorisation
      const callbackUri = redirectUri || this.getDesktopCallbackUrl();
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUri,
        response_type: "code",
        scope: scopes.join(" ") || "openid profile email",
        state: this.oauthState,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });

      const fullAuthUrl = `${authUrl}?${params.toString()}`;

      // Si c'est une application Tauri, ouvrir dans le navigateur par défaut
      if (this.isDesktopApp) {
        await this.openDesktopAuthWindow(fullAuthUrl);
        console.log("✅ Fenêtre OAuth Tauri ouverte");
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
      const { params } = this.parseCallbackUrl(callbackUrl);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");

      // Vérifier les erreurs OAuth
      if (error) {
        const errorDescription = params.get("error_description");
        throw new Error(`OAuth Error: ${error} - ${errorDescription || ""}`);
      }

      if (!code) {
        throw new Error("Authorization code not found in callback");
      }

      // Valider l'état CSRF
      const savedState = sessionStorage.getItem("oauth_state");
      if (state !== savedState) {
        throw new Error("OAuth state mismatch - potential CSRF attack");
      }

      // Récupérer le code verifier
      const codeVerifier = sessionStorage.getItem("oauth_code_verifier");
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
    this.oauthState = null;
    this.oauthCodeVerifier = null;
  }

  /**
   * Vérifier si on est en train de revenir d'un OAuth callback
   */
  isOAuthCallback(callbackUrl = window.location.href) {
    const { params, callbackPath } = this.parseCallbackUrl(callbackUrl);
    return (
      callbackPath === OAUTH_CALLBACK_PATH ||
      params.has("access_token") ||
      params.has("error") ||
      (params.has("code") && params.has("state"))
    );
  }

  /**
   * Extraire les paramètres du callback depuis l'URL actuelle
   */
  getOAuthCallbackParams(callbackUrl = window.location.href) {
    if (!this.isOAuthCallback(callbackUrl)) return null;

    const { params } = this.parseCallbackUrl(callbackUrl);
    return {
      code: params.get("code"),
      state: params.get("state"),
      access_token: params.get("access_token"),
      is_new_user: params.get("is_new_user"),
      error: params.get("error"),
      error_description: params.get("error_description"),
      returnTo: params.get("returnTo") || "/",
    };
  }

  parseCallbackUrl(callbackUrl = window.location.href) {
    const url = new URL(callbackUrl);
    const params = new URLSearchParams(url.search);
    const rawHash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
    const [hashPath = "", hashSearch = ""] = rawHash.split("?");
    const callbackPath = hashPath
      ? `/${hashPath.replace(/^\/+/, "")}`
      : url.pathname;

    if (hashSearch) {
      const hashParams = new URLSearchParams(hashSearch);
      for (const [key, value] of hashParams.entries()) {
        params.set(key, value);
      }
    }

    return { url, params, callbackPath };
  }

  applyDesktopCallback(callbackUrl = window.location.href) {
    const callback = this.getOAuthCallbackParams(callbackUrl);
    if (!callback) {
      return null;
    }

    if (callback.access_token) {
      localStorage.setItem("base44_access_token", callback.access_token);
      localStorage.setItem("token", callback.access_token);
    }

    return {
      ...callback,
      redirectUrl: this.getAppRouteUrl(callback.returnTo || "/"),
    };
  }
}

export const oauthService = new OAuthService();
