import React, { useEffect, useMemo, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/lib/AuthContext";
import { safeReturnTo } from "@/lib/authReturnTo";
import { oauthService } from "@/lib/OAuthService";
import { getTauriInvoke } from "@/lib/tauriInvoke";

export default function OAuthCallback() {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings, checkUserAuth } = useAuth();
  const [error, setError] = useState("");
  const [isCustomExchangeComplete, setIsCustomExchangeComplete] = useState(false);
  const redirectTarget = useMemo(() => {
    const target = safeReturnTo();
    return target === "/oauth/callback" ? "/" : target;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const finalizeCallback = async () => {
      const callbackParams = oauthService.getOAuthCallbackParams(window.location.href);
      const storedSession = oauthService.getStoredOAuthSession();
      const hasStoredBase44Token = Boolean(localStorage.getItem("base44_access_token"));
      const isCustomOAuthFlow = Boolean(storedSession?.provider && storedSession?.codeVerifier);

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

      try {
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
              callbackError?.message ||
              "Impossible de finaliser la connexion OAuth."
          );
        }
      } finally {
        oauthService.clearOAuthSession();
      }
    };

    finalizeCallback();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canRedirectAfterCustomExchange =
      isCustomExchangeComplete && !isLoadingPublicSettings && !error;

    if (
      error ||
      isLoadingPublicSettings ||
      (!canRedirectAfterCustomExchange && (isLoadingAuth || !isAuthenticated))
    ) {
      return;
    }

    window.location.replace(redirectTarget);
  }, [
    error,
    isAuthenticated,
    isCustomExchangeComplete,
    isLoadingAuth,
    isLoadingPublicSettings,
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