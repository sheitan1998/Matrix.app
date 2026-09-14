import React, { useEffect, useMemo, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/lib/AuthContext";
import { safeReturnTo } from "@/lib/authReturnTo";
import { oauthService } from "@/lib/OAuthService";

export default function OAuthCallback() {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const [error, setError] = useState("");
  const redirectTarget = useMemo(() => {
    const target = safeReturnTo();
    return target === "/oauth/callback" ? "/" : target;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const finalizeCallback = async () => {
      const callbackParams = oauthService.getOAuthCallbackParams(window.location.href);
      const hasStoredBase44Token = Boolean(localStorage.getItem("base44_access_token"));

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

      try {
        const { code, state } = await oauthService.handleOAuthCallback(window.location.href);
        // Invoke direct via l'API interne Tauri v2 — évite la dépendance npm @tauri-apps/api
        if (oauthService.isDesktopApp && code && typeof window.__TAURI_INTERNALS__?.invoke === "function") {
          await window.__TAURI_INTERNALS__.invoke("handle_oauth_callback", { code, state });
        }
      } catch (callbackError) {
        if (!cancelled) {
          setError(callbackError.message || "Impossible de finaliser la connexion OAuth.");
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
    if (error || isLoadingAuth || isLoadingPublicSettings || !isAuthenticated) {
      return;
    }

    window.location.replace(redirectTarget);
  }, [error, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, redirectTarget]);

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