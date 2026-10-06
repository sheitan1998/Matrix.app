import React, { useState } from "react";
import { KeyRound, Copy, Check, RefreshCw, Code2, ChevronDown, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const API_BASE = "https://matrix-hub.base44.app/functions/serverApi";

export default function ServerApiPanel({ server }) {
  const [apiKey, setApiKey] = useState(server.api_key || "");
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [openDocs, setOpenDocs] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success("Clé API copiée");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier la clé");
    }
  };

  const handleRegenerate = async () => {
    if (!confirm("Régénérer la clé API ? L'ancienne clé ne fonctionnera plus immédiatement.")) return;
    setRegenerating(true);
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "regenerateApiKey",
        serverAdId: server.id,
      });
      if (res.data?.api_key) {
        setApiKey(res.data.api_key);
        toast.success("Nouvelle clé API générée");
      } else {
        toast.error(res.data?.error || "Erreur");
      }
    } catch {
      toast.error("Erreur lors de la régénération");
    } finally {
      setRegenerating(false);
    }
  };

  const statsUrl = `${API_BASE}?action=stats&api_key=${apiKey}`;
  const checkVoteUrl = `${API_BASE}?action=check-vote&api_key=${apiKey}&pseudo=PSEUDO`;

  return (
    <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(138,79,255,0.15)", border: "1px solid rgba(138,79,255,0.3)" }}>
          <Code2 className="w-4 h-4 text-purple-400" />
        </div>
        <h2 className="text-xs font-black uppercase tracking-wider text-white">API & Webhooks</h2>
      </div>

      {/* API key */}
      <div className="mb-3">
        <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Clé API du serveur</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 h-9 px-2 rounded-lg" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(138,79,255,0.2)" }}>
            <KeyRound className="w-3.5 h-3.5 text-white/30 shrink-0" />
            <input
              readOnly
              value={apiKey ? `${apiKey.slice(0, 8)}••••••••••••••••` : "Aucune clé"}
              className="flex-1 bg-transparent text-[11px] text-white/70 font-mono outline-none"
            />
          </div>
          <button
            onClick={handleCopy}
            disabled={!apiKey}
            className="h-9 px-3 rounded-lg flex items-center gap-1 text-[10px] font-bold transition tap-sm disabled:opacity-40"
            style={{ background: "rgba(138,79,255,0.12)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copié" : "Copier"}</span>
          </button>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="h-9 px-3 rounded-lg flex items-center gap-1 text-[10px] font-bold transition tap-sm disabled:opacity-40"
            style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Régénérer</span>
          </button>
        </div>
        <p className="text-[9px] text-white/30 mt-1">Gardez cette clé secrète. Elle permet d'accéder aux statistiques et à la vérification des votes de votre serveur.</p>
      </div>

      {/* Documentation toggle */}
      <button
        onClick={() => setOpenDocs((v) => !v)}
        className="w-full flex items-center gap-1.5 text-[10px] font-bold text-white/50 hover:text-white/80 transition tap-sm py-1"
      >
        {openDocs ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        Documentation & intégration
      </button>

      {openDocs && (
        <div className="mt-2 space-y-3 text-[10px] text-white/60 leading-relaxed">
          <div>
            <p className="font-bold text-white/80 mb-1">1. Statistiques en temps réel</p>
            <p className="mb-1">Renvoie les votes du mois, les clics et le rang de votre serveur (dans son univers).</p>
            <pre className="rounded-lg p-2 overflow-x-auto text-[9px] font-mono text-purple-300" style={{ background: "rgba(0,0,0,0.4)" }}>{`GET ${statsUrl}`}</pre>
            <p className="mt-1 text-white/40">Réponse :</p>
            <pre className="rounded-lg p-2 overflow-x-auto text-[9px] font-mono text-emerald-300" style={{ background: "rgba(0,0,0,0.4)" }}>{`{
  "server": { "id": "...", "title": "...", "slug": "..." },
  "universe": "nexus",
  "votes_month": 12,
  "votes_total": 48,
  "clicks": 130,
  "clicks_month": 22,
  "rank": 3
}`}</pre>
          </div>

          <div>
            <p className="font-bold text-white/80 mb-1">2. Vérifier si un joueur a voté</p>
            <p className="mb-1">Idéal pour automatiser les récompenses en jeu (serveurs RP). Remplacez <span className="font-mono text-purple-300">PSEUDO</span> par le pseudo du joueur.</p>
            <pre className="rounded-lg p-2 overflow-x-auto text-[9px] font-mono text-purple-300" style={{ background: "rgba(0,0,0,0.4)" }}>{`GET ${checkVoteUrl}`}</pre>
            <p className="mt-1 text-white/40">Réponse :</p>
            <pre className="rounded-lg p-2 overflow-x-auto text-[9px] font-mono text-emerald-300" style={{ background: "rgba(0,0,0,0.4)" }}>{`{
  "pseudo": "pseudoDuJoueur",
  "has_voted": true,
  "last_voted_at": "2026-10-06T20:30:00.000Z"
}`}</pre>
          </div>

          <div>
            <p className="font-bold text-white/80 mb-1">Exemple JavaScript</p>
            <pre className="rounded-lg p-2 overflow-x-auto text-[9px] font-mono text-purple-300" style={{ background: "rgba(0,0,0,0.4)" }}>{`const res = await fetch(
  "${API_BASE}?action=check-vote" +
  "&api_key=VOTRE_CLE&pseudo=" + pseudo
);
const data = await res.json();
if (data.has_voted) {
  // accorder la récompense en jeu
}`}</pre>
          </div>

          <div>
            <p className="font-bold text-white/80 mb-1">Exemple PHP</p>
            <pre className="rounded-lg p-2 overflow-x-auto text-[9px] font-mono text-purple-300" style={{ background: "rgba(0,0,0,0.4)" }}>{`<?php
$url = "${API_BASE}?action=stats" .
  "&api_key=VOTRE_CLE";
$data = json_decode(file_get_contents($url), true);
echo $data["votes_month"]; // votes du mois
?>`}</pre>
          </div>

          <p className="text-white/40">Les requêtes sont publiques (aucune authentification utilisateur requise) mais sécurisées par votre clé API. Ne la partagez jamais publiquement.</p>
        </div>
      )}
    </div>
  );
}