import React, { useEffect, useMemo, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/lib/AuthContext";
import { safeReturnTo } from "@/lib/authReturnTo";
import { oauthService } from "@/lib/OAuthService";
import { getTauriInvoke } from "@/lib/tauriInvoke";

const DESKTOP_OAUTH_STATE_PREFIX = "desktop_";
const DESKTOP_OAUTH_DEEP_LINK_BASE = "matrix://oauth/callback";

export default function OAuthCallback() {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings, checkUserAuth } = useAuth();
  const [error, setError] = useState("");
  const [desktopDeepLink, setDesktopDeepLink] = useState("");
  const [isCustomExchangeComplete, setIsCustomExchangeComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const redirectTarget = useMemo(() => {
    const urlTarget = safeReturnTo();
    if (urlTarget !== "/" && urlTarget !== "/oauth/callback") {
      return urlTarget;
    }
    const stored = sessionStorage.getItem("oauth_return_to");
    if (stored && stored !== "/oauth/callback") {
      return stored;
    }
    return "/";
  }, []);

  useEffect(() => {
    let cancelled = false;

    const finalizeCallback = async () => {
      setIsProcessing(true);
      try {
        const callbackParams = oauthService.getOAuthCallbackParams(window.location.href);
        const storedSession = oauthService.getStoredOAuthSession();
        const hasStoredBase44Token = Boolean(localStorage.getItem("base44_access_token"));
        const isCustomOAuthFlow = Boolean(storedSession?.provider && storedSession?.codeVerifier);
        const isDesktopCallbackInBrowser =
          !oauthService.isDesktopApp &&
          Boolean(callbackParams?.code || callbackParams?.error) &&
          typeof callbackParams?.state === "string" &&
          callbackParams.state.startsWith(DESKTOP_OAUTH_STATE_PREFIX);

        if (isDesktopCallbackInBrowser) {
          const deepLink = new URL(DESKTOP_OAUTH_DEEP_LINK_BASE);
          if (callbackParams?.code) deepLink.searchParams.set("code", callbackParams.code);
          if (callbackParams?.state) deepLink.searchParams.set("state", callbackParams.state);
          if (callbackParams?.error) deepLink.searchParams.set("error", callbackParams.error);
          if (callbackParams?.error_description) {
            deepLink.searchParams.set("error_description", callbackParams.error_description);
          }
          setDesktopDeepLink(deepLink.toString());
          return;
        }

        if (callbackParams?.error) {
          const description = callbackParams.error_description;
          if (!cancelled) {
            setError(description || "La connexion OAuth a été annulée ou a échoué.");
          }
          oauthService.clearOAuthSession();
          return;
        }

        if (!callbackParams) {
          if (!hasStoredBase44Token && !cancelled) {
            setError("Le retour OAuth est incomplet ou invalide.");
          }
          return;
        }

        if (!callbackParams.code) {
          oauthService.clearOAuthSession();
          return;
        }

        if (!isCustomOAuthFlow) {
          return;
        }

        const { code, state, codeVerifier } = await oauthService.handleOAuthCallback(
          window.location.href
        );
        const exchangeResponse = await base44.functions.invoke("oauthExchange", {
          provider: storedSession.provider,
          code,
          codeVerifier,
          redirectUri: storedSession.redirectUri,
        });
        const exchangeData = exchangeResponse?.data?.data;

        if (!exchangeData?.access_token) {
          throw new Error("Le serveur OAuth n'a pas retourné de jeton d'accès.");
        }

        if (typeof base44.auth?.setToken === "function") {
          base44.auth.setToken(exchangeData.access_token);
        }

        await checkUserAuth().catch(() => {});

        if (oauthService.isDesktopApp && code) {
          const invoke = await getTauriInvoke();
          if (invoke) {
            await invoke("handle_oauth_callback", { code, state });
          }
        }

        if (!cancelled) {
          setIsCustomExchangeComplete(true);
        }
      } catch (callbackError) {
        if (!cancelled) {
          setError(
            callbackError?.response?.data?.provider_message ||
              callbackError?.response?.data?.error ||
              callbackError?.response?.data?.error_description ||
              callbackError?.message ||
              "Impossible de finaliser la connexion OAuth."
          );
        }
      } finally {
        oauthService.clearOAuthSession();
        sessionStorage.removeItem("oauth_return_to");
        if (!cancelled) {
          setIsProcessing(false);
        }
      }
    };

    finalizeCallback();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Don't redirect while there's an error (error UI is shown instead)
    if (error) return;

    // Wait for public settings to be loaded
    if (isLoadingPublicSettings) return;

    // Redirect once the custom token exchange is complete
    if (isCustomExchangeComplete) {
      window.location.replace(redirectTarget);
      return;
    }

    // Redirect if the user is already authenticated (e.g. from a previous
    // session or the SDK's loginWithProvider handled the callback)
    if (!isLoadingAuth && isAuthenticated) {
      window.location.replace(redirectTarget);
      return;
    }

    // If processing is done and the user is still not authenticated, redirect
    // to login to avoid being stuck on the loading screen forever.
    if (!isProcessing && !isLoadingAuth && !isAuthenticated) {
      window.location.replace("/login");
      return;
    }
  }, [
    error,
    isAuthenticated,
    isCustomExchangeComplete,
    isLoadingAuth,
    isLoadingPublicSettings,
    isProcessing,
    redirectTarget,
  ]);

  if (error) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Connexion impossible"
        subtitle="Le retour OAuth n'a pas pu être finalisé."
      >
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      </AuthLayout>
    );
  }

  if (desktopDeepLink) {
    return (
      <AuthLayout
        icon={Loader2}
        title="Continuer dans Matrix"
        subtitle="L’authentification est terminée dans le navigateur."
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Ouvrez maintenant l’application Matrix pour terminer la connexion.
          </p>
          <a
            href={desktopDeepLink}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Revenir dans Matrix
          </a>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Loader2}
      title="Connexion en cours"
      subtitle="Finalisation de votre authentification…"
    >
      <div className="flex items-center justify-center py-6 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
        Redirection…
      </div>
    </AuthLayout>
  );
}