import React, { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Brain, HardDrive, Loader2, Lock, Trash2 } from "lucide-react";

const STATE_TEXT = {
  not_configured: "Bientôt disponible : le connecteur n'est pas encore configuré.",
  upgrade_required: "Inclus à partir de Matrix Plus.",
  reauth_required: "La connexion a expiré : reconnecte ton compte Google.",
  pending_review: "Application Google en attente de validation : seuls les comptes testeurs peuvent se connecter.",
  disconnected: "Donne à Matrix AI un accès en lecture seule à tes fichiers Drive.",
};

const errorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.response?.data?.error || fallback;

export default function AiConnectorsPanel({ quota, refreshToken = 0, onUpgrade, onMemoryToggled }) {
  const [connector, setConnector] = useState(null);
  const [busy, setBusy] = useState(false);
  const [memories, setMemories] = useState([]);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const memoryEligible = Boolean(quota?.features?.memory);
  const memoryEnabled = Boolean(quota?.memory_enabled);

  const loadConnector = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("aiConnectors", { action: "status" });
      setConnector(res.data?.connectors?.[0] || null);
    } catch {
      setConnector(null);
    }
  }, []);

  const loadMemories = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("matrixAi", { action: "memory_list" });
      setMemories(res.data?.memories || []);
    } catch {
      setMemories([]);
    }
  }, []);

  useEffect(() => {
    loadConnector();
  }, [loadConnector, refreshToken, quota?.plan_tier]);

  useEffect(() => {
    if (memoryOpen) loadMemories();
  }, [memoryOpen, loadMemories]);

  const connect = async () => {
    setBusy(true);
    try {
      const res = await base44.functions.invoke("aiConnectors", { action: "connect" });
      if (res.data?.auth_url) {
        window.location.href = res.data.auth_url;
        return;
      }
      toast.error("Connexion Google indisponible");
    } catch (err) {
      toast.error(errorMessage(err, "Connexion Google indisponible"));
      loadConnector();
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      const res = await base44.functions.invoke("aiConnectors", { action: "disconnect" });
      setConnector(res.data?.connector || null);
      toast.success("Google Drive déconnecté");
    } catch (err) {
      toast.error(errorMessage(err, "Impossible de déconnecter Google Drive"));
    } finally {
      setBusy(false);
    }
  };

  const toggleMemory = async () => {
    try {
      const res = await base44.functions.invoke("matrixAi", { action: "memory_toggle", enabled: !memoryEnabled });
      onMemoryToggled?.(Boolean(res.data?.enabled));
    } catch (err) {
      toast.error(errorMessage(err, "Impossible de modifier la mémoire"));
    }
  };

  const deleteMemory = async (memory) => {
    try {
      await base44.functions.invoke("matrixAi", { action: "memory_delete", memory_id: memory.id });
      setMemories((prev) => prev.filter((item) => item.id !== memory.id));
    } catch {
      toast.error("Impossible de supprimer ce souvenir");
    }
  };

  const clearMemories = async () => {
    try {
      await base44.functions.invoke("matrixAi", { action: "memory_clear" });
      setMemories([]);
      toast.success("Mémoire effacée");
    } catch {
      toast.error("Impossible d'effacer la mémoire");
    }
  };

  const state = connector?.state || "disconnected";
  const canConnect = state === "disconnected" || state === "pending_review" || state === "reauth_required";
  const card = { background: "rgba(138,79,255,0.07)", border: "1px solid rgba(138,79,255,0.2)" };

  return (
    <div className="px-3 pt-2 space-y-2" style={{ borderTop: "1px solid rgba(138,79,255,0.12)" }}>
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35 pt-1">Connecteurs & mémoire</p>

      <div className="rounded-xl p-2.5 space-y-1.5" style={card}>
        <div className="flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5" style={{ color: "#c4b5fd" }} />
          <span className="text-[11px] font-bold text-white/80">Google Drive</span>
          {state === "connected" && (
            <span className="ml-auto text-[9px] font-black text-emerald-400">Connecté</span>
          )}
          {state === "upgrade_required" && <Lock className="ml-auto w-3 h-3 text-white/30" />}
        </div>
        <p className="text-[9px] text-white/40 leading-snug">
          {state === "connected"
            ? `Compte : ${connector?.account_email || "Google"} — accès en lecture seule.`
            : STATE_TEXT[state] || STATE_TEXT.disconnected}
        </p>
        {state === "connected" && (
          <button
            onClick={disconnect}
            disabled={busy}
            className="h-7 px-2.5 rounded-lg text-[10px] font-black text-red-300 disabled:opacity-50 tap-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : "Déconnecter"}
          </button>
        )}
        {canConnect && (
          <button
            onClick={connect}
            disabled={busy}
            className="h-7 px-2.5 rounded-lg text-[10px] font-black text-white disabled:opacity-50 tap-sm"
            style={{ background: "linear-gradient(135deg, #8a4fff, #6d28d9)" }}
          >
            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : state === "reauth_required" ? "Reconnecter" : "Connecter"}
          </button>
        )}
        {state === "upgrade_required" && (
          <button
            onClick={onUpgrade}
            className="h-7 px-2.5 rounded-lg text-[10px] font-black text-white tap-sm"
            style={{ background: "linear-gradient(135deg, #8a4fff, #6d28d9)" }}
          >
            Passer à Matrix Plus
          </button>
        )}
      </div>

      <div className="rounded-xl p-2.5 space-y-1.5" style={card}>
        <div className="flex items-center gap-2">
          <Brain className="w-3.5 h-3.5" style={{ color: "#c4b5fd" }} />
          <span className="text-[11px] font-bold text-white/80">Mémoire des discussions</span>
          {memoryEligible ? (
            <button
              onClick={toggleMemory}
              role="switch"
              aria-checked={memoryEnabled}
              aria-label="Activer la mémoire"
              className="ml-auto w-8 h-[18px] rounded-full relative transition"
              style={{ background: memoryEnabled ? "#8a4fff" : "rgba(255,255,255,0.15)" }}
            >
              <span
                className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all"
                style={{ left: memoryEnabled ? "16px" : "2px" }}
              />
            </button>
          ) : (
            <Lock className="ml-auto w-3 h-3 text-white/30" />
          )}
        </div>
        <p className="text-[9px] text-white/40 leading-snug">
          {memoryEligible
            ? "Matrix AI retient tes préférences d'une discussion à l'autre. Tu peux tout effacer à tout moment."
            : "Mémoire persistante incluse à partir de Matrix Plus."}
        </p>
        {memoryEligible ? (
          <button
            onClick={() => setMemoryOpen((open) => !open)}
            className="text-[10px] font-bold text-white/60 hover:text-white tap-sm"
          >
            {memoryOpen ? "Masquer les souvenirs" : "Voir mes souvenirs"}
          </button>
        ) : (
          <button
            onClick={onUpgrade}
            className="h-7 px-2.5 rounded-lg text-[10px] font-black text-white tap-sm"
            style={{ background: "linear-gradient(135deg, #8a4fff, #6d28d9)" }}
          >
            Passer à Matrix Plus
          </button>
        )}
        {memoryEligible && memoryOpen && (
          <div className="space-y-1">
            {memories.length === 0 ? (
              <p className="text-[9px] text-white/30">Aucun souvenir pour le moment.</p>
            ) : (
              <>
                {memories.map((memory) => (
                  <div key={memory.id} className="flex items-start gap-1.5">
                    <p className="flex-1 text-[10px] text-white/60 leading-snug">{memory.content}</p>
                    <button
                      onClick={() => deleteMemory(memory)}
                      className="text-white/30 hover:text-red-400 tap-sm"
                      aria-label="Supprimer ce souvenir"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={clearMemories} className="text-[10px] font-bold text-red-300 tap-sm">
                  Tout effacer
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
