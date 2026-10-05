import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, AlertTriangle, Twitch as TwitchIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { consumeTwitchOAuthSession } from "@/lib/twitchOAuth";

export default function TwitchCallback() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const { state, redirectUri } = consumeTwitchOAuthSession();

    if (params.get("error")) {
      setError(params.get("error_description") || "Connexion Twitch annulée.");
      return;
    }
    const code = params.get("code");
    if (!code || !state || params.get("state") !== state) {
      setError("Session de connexion invalide ou expirée. Veuillez réessayer.");
      return;
    }

    base44.functions
      .invoke("twitchAuth", { action: "exchangeCode", code, redirectUri })
      .then(() => {
        queryClient.removeQueries({ queryKey: ["twitch"] });
        navigate("/twitch?tab=suivis&view=mychannel", { replace: true });
      })
      .catch((e) => setError(e?.response?.data?.error || "Échec de la connexion Twitch."));
  }, [navigate, queryClient]);

  return (
    <div className="min-h-screen bg-[#0a0714] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl bg-[#161321] border border-[#2a2a3e] p-8 text-center">
        {error ? (
          <>
            <AlertTriangle className="w-10 h-10 text-[#db2777] mx-auto mb-3" />
            <h1 className="text-lg font-bold mb-2">Connexion impossible</h1>
            <p className="text-sm text-[#a0a0b0] mb-6">{error}</p>
            <Link
              to="/twitch"
              className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-[#9146FF] hover:bg-[#7c2dda] text-sm font-bold transition-colors"
            >
              Retour à Twitch
            </Link>
          </>
        ) : (
          <>
            <TwitchIcon className="w-10 h-10 text-[#9146FF] mx-auto mb-3" />
            <h1 className="text-lg font-bold mb-2">Connexion à Twitch…</h1>
            <Loader2 className="w-6 h-6 animate-spin text-[#a0a0b0] mx-auto" />
          </>
        )}
      </div>
    </div>
  );
}