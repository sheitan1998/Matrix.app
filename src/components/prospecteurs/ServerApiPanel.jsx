import React, { useState, useEffect } from "react";
import { KeyRound, Copy, Check, RefreshCw, Code2, ChevronDown, ChevronRight, Webhook, Loader2, Clock, User, Activity, Send, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import RecentVotesHistory from "@/components/prospecteurs/RecentVotesHistory";

const API_BASE = "https://matrix-hub.base44.app/functions/serverApi";

export default function ServerApiPanel({ server }) {
  const [apiKey, setApiKey] = useState(server.api_key || "");
  const [webhookUrl, setWebhookUrl] = useState(server.webhook_url || "");
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [openDocs, setOpenDocs] = useState(false);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    setApiKey(server.api_key || "");
    setWebhookUrl(server.webhook_url || "");
  }, [server]);

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

  const handleSaveWebhook = async () => {
    const url = webhookUrl.trim();
    if (url && !url.startsWith("https://")) {
      toast.error("L'URL doit commencer par https://");
      return;
    }
    setSavingWebhook(true);
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "setWebhookUrl",
        serverAdId: server.id,
        webhookUrl: url,
      });
      if (res.data?.success) {
        toast.success(url ? "Webhook configuré" : "Webhook supprimé");
        setWebhookUrl(url);
      } else {
        toast.error(res.data?.error || "Erreur");
      }
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSavingWebhook(false);
    }
  };


  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setTestResult(null);
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "testWebhook",
        serverAdId: server.id,
      });
      const data = res.data || res;
      if (data.success !== undefined) {
        setTestResult(data);
        if (data.success) {
          toast.success(`Webhook ${data.status} ${data.statusText || ""}`);
        } else {
          toast.error(data.error || "Webhook injoignable");
        }
      }
    } catch {
      toast.error("Erreur lors du test");
    } finally {
      setTestingWebhook(false);
    }
  };

  const statsUrl = `${API_BASE}?action=stats&api_key=${apiKey}`;
  const checkVoteUrl = `${API_BASE}?action=check-vote&api_key=${apiKey}&pseudo=PSEUDO`;

  return (
    <div className="mt-4 rounded-xl p-4 space-y-4" style={{ background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" }}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(138,79,255,0.15)", border: "1px solid rgba(138,79,255,0.3)" }}>
          <Code2 className="w-4 h-4 text-purple-400" />
        </div>
        <h2 className="text-xs font-black uppercase tracking-wider text-white">API & Webhooks</h2>
      </div>

      {/* API key */}
      <div>
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
        <p className="text-[9px] text-white/30 mt-1">Gardez cette clé secrète. Elle sert aussi de token de sécurité pour les webhooks.</p>
      </div>

      {/* Webhook URL */}
      <div>
        <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block flex items-center gap-1">
          <Webhook className="w-3 h-3" /> URL de Postback (Webhook)
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 h-9 px-2 rounded-lg" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(138,79,255,0.2)" }}>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://monserveur-rp.com/api/matrix-listener.php"
              className="flex-1 bg-transparent text-[11px] text-white/70 placeholder:text-white/20 outline-none"
            />
          </div>
          <button
            onClick={handleSaveWebhook}
            disabled={savingWebhook}
            className="h-9 px-3 rounded-lg flex items-center gap-1 text-[10px] font-bold transition tap-sm disabled:opacity-40"
            style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            {savingWebhook ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>{savingWebhook ? "..." : "Sauver"}</span>
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <button
            onClick={handleTestWebhook}
            disabled={testingWebhook || !webhookUrl}
            className="h-8 px-3 rounded-lg flex items-center gap-1 text-[10px] font-bold transition tap-sm disabled:opacity-40"
            style={{ background: "rgba(138,79,255,0.12)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.2)" }}
          >
            {testingWebhook ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Tester le webhook
          </button>
          {testResult && (
            <span
              className="text-[9px] font-bold flex items-center gap-1"
              style={{ color: testResult.success ? "#22c55e" : "#ef4444" }}
            >
              {testResult.success ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {testResult.success ? `HTTP ${testResult.status}` : (testResult.error || "Échec")}
            </span>
          )}
        </div>
        <p className="text-[9px] text-white/30 mt-1">
          À chaque vote, MATRIX envoie un POST signé vers cette URL avec le pseudo du votant et un en-tête <span className="font-mono text-purple-300">X-Matrix-Signature</span>. Laissez vide pour désactiver.
        </p>
      </div>

      {/* Recent votes history (paginated, permanent) */}
      <RecentVotesHistory serverId={server.id} />

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
            <p className="mb-1">Renvoie les votes du mois, les clics et le rang de votre serveur.</p>
            <pre className="rounded-lg p-2 overflow-x-auto text-[9px] font-mono text-purple-300" style={{ background: "rgba(0,0,0,0.4)" }}>{`GET ${statsUrl}`}</pre>
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
            <p className="font-bold text-white/80 mb-1">3. Webhook (Postback URL) — Récompenses en temps réel</p>
            <p className="mb-1">
              Configurez votre URL de webhook ci-dessus. À chaque vote validé par un joueur, MATRIX envoie une requête
              <span className="font-mono text-purple-300"> POST </span>
              vers votre URL avec les données suivantes :
            </p>
            <pre className="rounded-lg p-2 overflow-x-auto text-[9px] font-mono text-emerald-300" style={{ background: "rgba(0,0,0,0.4)" }}>{`POST https://monserveur-rp.com/api/matrix-listener.php
Content-Type: application/json
X-Matrix-Signature: <signature_hmac_sha256>

{
  "pseudo": "PseudoDuJoueur",
  "server_id": "ID_DU_SERVEUR",
  "timestamp": "2026-10-06T23:30:00.000Z"
}`}</pre>
            <p className="mt-1 mb-1">
              L'en-tête <span className="font-mono text-purple-300">X-Matrix-Signature</span> contient la signature HMAC-SHA256
              du corps JSON, calculée avec votre clé API comme secret. Vérifiez-la côté serveur pour empêcher toute
              injection de faux votes.
            </p>
            <p className="font-bold text-white/70 mt-2 mb-1">Exemple PHP (listener avec vérification HMAC) :</p>
            <pre className="rounded-lg p-2 overflow-x-auto text-[9px] font-mono text-purple-300" style={{ background: "rgba(0,0,0,0.4)" }}>{`<?php
$body = file_get_contents("php://input");
$sentSig = $_SERVER["HTTP_X_MATRIX_SIGNATURE"] ?? "";
$apiKey = "VOTRE_CLE_API";

// Vérifier la signature HMAC-SHA256
$expectedSig = hash_hmac("sha256", $body, $apiKey);
if (!hash_equals($expectedSig, $sentSig)) {
  http_response_code(403);
  exit("Signature invalide");
}

$data = json_decode($body, true);
$pseudo = $data["pseudo"];

// TODO: accorder la récompense en jeu
grantReward($pseudo, 500);

http_response_code(200);
echo "OK";`}</pre>
            <p className="mt-1 text-white/40">
              Le webhook est envoyé en fire-and-forget avec un timeout de 5 secondes. Utilisez le bouton "Tester le webhook"
              ci-dessus pour valider votre endpoint. Les votes automatiques (Vote Auto) déclenchent aussi le webhook.
            </p>
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
            <p className="font-bold text-white/80 mb-1">Exemple PHP (statistiques)</p>
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