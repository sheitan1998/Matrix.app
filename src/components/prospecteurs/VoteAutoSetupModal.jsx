import React, { useState, useEffect } from "react";
import { X, Loader2, Check, Zap, Clock, Server as ServerIcon, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function VoteAutoSetupModal({ user, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [servers, setServers] = useState([]);
  const [status, setStatus] = useState(null);
  const [selectedServer, setSelectedServer] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        // Get vote auto status
        const statusRes = await base44.functions.invoke("serverSearch", { action: "getVoteAutoStatus" });
        const statusData = statusRes.data || statusRes;
        setStatus(statusData);
        if (statusData.voter_pseudo) setPseudo(statusData.voter_pseudo);
        if (statusData.server_id) setSelectedServer(statusData.server_id);

        // Get user's servers
        const serversRes = await base44.functions.invoke("serverSearch", { action: "getMyServers" });
        const serversData = serversRes.data || serversRes;
        const serverList = serversData.servers || serversData || [];
        setServers(serverList);
      } catch {
        setError("Erreur lors du chargement");
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!selectedServer) {
      setError("Veuillez sélectionner un serveur");
      return;
    }
    if (!pseudo.trim()) {
      setError("Veuillez saisir votre pseudo");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "setupVoteAuto",
        serverAdId: selectedServer,
        voterPseudo: pseudo.trim(),
      });
      if (res.data?.success) {
        toast.success("Vote Auto configuré !");
        onClose();
      } else {
        setError(res.data?.error || "Erreur");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Erreur lors de la configuration");
    }
    setSaving(false);
  };

  const isActive = status?.active;
  const cooldownHours = status?.effective_cooldown_hours || 2;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#12091c", border: "1px solid rgba(138,79,255,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(138,79,255,0.2)", background: "linear-gradient(135deg, rgba(138,79,255,0.12), rgba(109,40,217,0.05))" }}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: "#a855f7" }} />
            <h2 className="text-sm font-black tracking-wider uppercase text-white">Configuration Vote Auto</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition tap-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#a855f7" }} />
          </div>
        ) : !isActive ? (
          <div className="p-5 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 text-white/20" />
            <p className="text-xs text-white/50 mb-1">Abonnement Vote Auto inactif</p>
            <p className="text-[10px] text-white/30">
              Souscris à l'offre Vote Auto (4,99€/mois) pour configurer tes votes automatiques.
            </p>
            <button
              onClick={onClose}
              className="mt-4 h-9 px-5 rounded-lg text-xs font-bold text-white tap-sm"
              style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
            >
              Fermer
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Status badge */}
            <div
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{ background: "rgba(138,79,255,0.08)", border: "1px solid rgba(138,79,255,0.2)" }}
            >
              <Clock className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-white">
                  Cooldown: {cooldownHours}h {status?.has_vip ? "(VIP + Vote Auto)" : "(Vote Auto seul)"}
                </p>
                <p className="text-[9px] text-white/40">
                  {status?.has_vip
                    ? "VIP actif — vote toutes les 1 heure"
                    : "Vote toutes les 2 heures (ajoute VIP pour 1h)"}
                </p>
              </div>
            </div>

            {/* Server selection */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">
                Serveur à voter automatiquement
              </label>
              {servers.length === 0 ? (
                <div
                  className="p-3 rounded-lg text-center"
                  style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}
                >
                  <ServerIcon className="w-5 h-5 mx-auto mb-1 text-white/20" />
                  <p className="text-[10px] text-white/40">Tu n'as pas encore publié de serveur</p>
                </div>
              ) : (
                <select
                  value={selectedServer}
                  onChange={(e) => setSelectedServer(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg text-sm text-white outline-none"
                  style={{ background: "rgba(138,79,255,0.05)", border: "1px solid rgba(138,79,255,0.2)" }}
                >
                  <option value="">— Sélectionner —</option>
                  {servers.map((s) => (
                    <option key={s.id} value={s.id} style={{ background: "#12091c" }}>
                      {s.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Pseudo */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">
                Pseudo (pour webhooks serveur RP) *
              </label>
              <input
                type="text"
                maxLength={30}
                value={pseudo}
                onChange={(e) => { setPseudo(e.target.value); setError(""); }}
                placeholder="Ex: ProGamer123"
                className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
                style={{ background: "rgba(138,79,255,0.05)", border: "1px solid rgba(138,79,255,0.2)" }}
              />
              <p className="text-[9px] text-white/30 mt-1">
                Ce pseudo sera enregistré avec chaque vote automatique.
              </p>
            </div>

            {error && <p className="text-[10px] text-red-400">{error}</p>}

            {status?.configured && (
              <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "#22c55e" }}>
                <Check className="w-3 h-3" /> Vote Auto déjà configuré
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !selectedServer || !pseudo.trim()}
              className="w-full h-10 rounded-lg text-xs font-black tracking-wider uppercase transition disabled:opacity-50 flex items-center justify-center gap-1.5 tap-sm"
              style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)", color: "#fff", boxShadow: "0 0 15px rgba(138,79,255,0.3)" }}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</>
              ) : (
                <><Check className="w-4 h-4" /> Activer le Vote Auto</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}