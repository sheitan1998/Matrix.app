import React, { useEffect, useMemo, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
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
      const params = new URLSearchParams(window.location.search);
      const providerError = params.get("error");

      if (providerError) {
        const description = params.get("error_description");
        if (!cancelled) {
          setError(description || "La connexion OAuth a été annulée ou a échoué.");
        }
        return;
      }

      if (!oauthService.isOAuthCallback()) {
        return;
      }

      try {
        const { code, state } = await oauthService.handleOAuthCallback(window.location.href);
        if (oauthService.isDesktopApp) {
          await invoke("handle_oauth_callback", { code, state });
        }
        oauthService.clearOAuthSession();
      } catch (callbackError) {
        if (!cancelled) {
          setError(callbackError.message || "Impossible de finaliser la connexion OAuth.");
        }
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

  useEffect(() => {
    if (error || isLoadingAuth || isLoadingPublicSettings || isAuthenticated) {
      return;
    }

    setError("Aucune session n'a pu être créée après le retour OAuth.");
  }, [error, isAuthenticated, isLoadingAuth, isLoadingPublicSettings]);

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
