import { invoke } from "@tauri-apps/api/core";

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
    try {
      return typeof window.__TAURI__ !== "undefined";
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
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scopes.join(" ") || "openid profile email",
        state: this.oauthState,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });

      const fullAuthUrl = `${authUrl}?${params.toString()}`;

      // Si c'est une application Tauri, ouvrir dans le navigateur par défaut
      if (this.isDesktopApp) {
        await invoke("open_auth_window", { url: fullAuthUrl });
        console.log("✅ OAuth popup ouvert dans le navigateur (Tauri)");
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
      const url = new URL(callbackUrl);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      // Vérifier les erreurs OAuth
      if (error) {
        const errorDescription = url.searchParams.get("error_description");
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
  isOAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    return params.has("code") && params.has("state");
  }

  /**
   * Extraire les paramètres du callback depuis l'URL actuelle
   */
  getOAuthCallbackParams() {
    if (!this.isOAuthCallback()) return null;

    const params = new URLSearchParams(window.location.search);
    return {
      code: params.get("code"),
      state: params.get("state"),
      error: params.get("error"),
      error_description: params.get("error_description"),
    };
  }
}

export const oauthService = new OAuthService();
