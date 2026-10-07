import React, { useState, useEffect, useCallback } from "react";
import { X, Loader2, Check, Zap, Clock, AlertCircle, Pause, Play, Power, Pencil, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import VoteAutoSlots, { MAX_SERVERS } from "./VoteAutoSlots";
import VoteAutoServerSearch from "./VoteAutoServerSearch";
import { formatRelative } from "@/lib/relativeTime";

export default function VoteAutoSetupModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // saved config + live stats (refreshed in background)
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]); // edit-only selection, never touched by background refresh
  const [pseudo, setPseudo] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const fetchStatus = useCallback(async () => {
    const res = await base44.functions.invoke("serverSearch", { action: "getVoteAutoStatus" });
    const data = res.data || res;
    setStatus(data);
    return data;
  }, []);

  useEffect(() => {
    fetchStatus()
      .then((data) => { if (!data.configured) setEditing(true); })
      .catch(() => setError("Erreur lors du chargement"))
      .finally(() => setLoading(false));
    // Live stats only (votes, last auto-vote) — the saved selection & its order never change here
    const interval = setInterval(() => fetchStatus().catch(() => {}), 30000);
    const unsub = base44.entities.ServerAd.subscribe((event) => {
      const d = event.data;
      if (event.type !== "update" || !d) return;
      setStatus((prev) => prev ? {
        ...prev,
        servers: (prev.servers || []).map((s) => s.id === d.id ? { ...s, votes_month: d.votes_month ?? s.votes_month } : s),
      } : prev);
    });
    return () => { clearInterval(interval); unsub(); };
  }, [fetchStatus]);

  const startEdit = () => {
    setDraft((status?.servers || []).filter((s) => !s.missing));
    setPseudo(status?.voter_pseudo || "");
    setError("");
    setEditing(true);
  };

  const addServer = (s) => {
    setError("");
    setDraft((prev) => (prev.some((x) => x.id === s.id) || prev.length >= MAX_SERVERS) ? prev : [...prev, s]);
  };

  const handleSave = async () => {
    if (draft.length === 0) { setError("Sélectionne au moins un serveur"); return; }
    if (!pseudo.trim()) { setError("Saisis ton pseudo"); return; }
    setBusy("save");
    setError("");
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "setupVoteAuto",
        serverAdIds: draft.map((s) => s.id),
        voterPseudo: pseudo.trim(),
      });
      if (res.data?.success) {
        await fetchStatus();
        setEditing(false);
        toast.success("Configuration enregistrée — le Vote Auto reste actif");
      } else {
        setError(res.data?.error || "Erreur");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Erreur lors de l'enregistrement");
    }
    setBusy("");
  };

  const handleTogglePause = async () => {
    setBusy("pause");
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "toggleVoteAutoPaused" });
      if (res.data?.success) {
        setStatus((prev) => ({ ...prev, paused: res.data.paused }));
        toast.success(res.data.paused ? "Vote Auto mis en pause" : "Vote Auto repris");
      }
    } catch { toast.error("Erreur"); }
    setBusy("");
  };

  const handleDisable = async () => {
    if (!confirm("Désactiver le Vote Auto ? Tes serveurs et ton pseudo seront effacés. L'abonnement reste actif.")) return;
    setBusy("disable");
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "clearVoteAutoConfig" });
      if (res.data?.success) {
        await fetchStatus();
        setDraft([]);
        setPseudo("");
        setEditing(true);
        toast.success("Vote Auto désactivé");
      }
    } catch { toast.error("Erreur"); }
    setBusy("");
  };

  const configured = !!status?.configured;
  const paused = !!status?.paused;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] flex flex-col" style={{ background: "#12091c", border: "1px solid rgba(138,79,255,0.3)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(138,79,255,0.2)", background: "linear-gradient(135deg, rgba(138,79,255,0.12), rgba(109,40,217,0.05))" }}>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: "#a855f7" }} />
            <h2 className="text-sm font-black tracking-wider uppercase text-white">Vote Auto</h2>
            {configured && !editing && (
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded" style={paused ? { background: "rgba(251,191,36,0.15)", color: "#fbbf24" } : { background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                {paused ? "EN PAUSE" : "ACTIF"}
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition tap-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#a855f7" }} /></div>
        ) : !status?.active ? (
          <div className="p-5 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 text-white/20" />
            <p className="text-xs text-white/50 mb-1">Abonnement Vote Auto inactif</p>
            <p className="text-[10px] text-white/30">Souscris à l'offre Vote Auto (4,99€/mois) pour configurer tes votes automatiques.</p>
          </div>
        ) : (
          <div className="p-5 space-y-4 overflow-y-auto scrollbar-thin">
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "rgba(138,79,255,0.08)", border: "1px solid rgba(138,79,255,0.2)" }}>
              <Clock className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
              <p className="flex-1 text-[10px] font-bold text-white">
                Vote toutes les {status.effective_cooldown_hours || 2}h par serveur {status.has_vip ? "(VIP)" : "(ajoute VIP pour 1h)"}
              </p>
              {status.last_run && <p className="text-[9px] font-bold" style={{ color: "#a855f7" }}>Dernier: {formatRelative(status.last_run)}</p>}
            </div>

            {!editing ? (
              <>
                <VoteAutoSlots servers={status.servers || []} />
                <p className="flex items-center gap-1.5 text-[10px] text-white/60"><User className="w-3 h-3" /> Pseudo : <span className="font-bold text-white">{status.voter_pseudo}</span></p>
                <p className="text-[9px] text-white/30">Ta configuration reste active en permanence. Elle ne change que si tu la modifies, la mets en pause ou la désactives.</p>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={startEdit} className="h-9 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 tap-sm" style={{ background: "rgba(138,79,255,0.15)", color: "#a855f7", border: "1px solid rgba(138,79,255,0.3)" }}>
                    <Pencil className="w-3.5 h-3.5" /> Modifier
                  </button>
                  <button onClick={handleTogglePause} disabled={!!busy} className="h-9 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 tap-sm disabled:opacity-50" style={paused ? { background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" } : { background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
                    {busy === "pause" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : paused ? <><Play className="w-3.5 h-3.5" /> Reprendre</> : <><Pause className="w-3.5 h-3.5" /> Pause</>}
                  </button>
                  <button onClick={handleDisable} disabled={!!busy} className="h-9 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 tap-sm disabled:opacity-50" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                    {busy === "disable" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Power className="w-3.5 h-3.5" /> Désactiver</>}
                  </button>
                </div>
              </>
            ) : (
              <>
                <VoteAutoSlots servers={draft} onRemove={(id) => setDraft((prev) => prev.filter((s) => s.id !== id))} />
                <VoteAutoServerSearch selectedIds={new Set(draft.map((s) => s.id))} maxed={draft.length >= MAX_SERVERS} onAdd={addServer} />
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">Pseudo (pour webhooks serveur RP) *</label>
                  <input type="text" maxLength={30} value={pseudo} onChange={(e) => { setPseudo(e.target.value); setError(""); }} placeholder="Ex: ProGamer123"
                    className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none" style={{ background: "rgba(138,79,255,0.05)", border: "1px solid rgba(138,79,255,0.2)" }} />
                </div>
                {error && <p className="text-[10px] text-red-400">{error}</p>}
                <div className="flex gap-2">
                  {configured && (
                    <button onClick={() => { setEditing(false); setError(""); }} className="h-10 px-4 rounded-lg text-xs font-bold text-white/60 tap-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      Annuler
                    </button>
                  )}
                  <button onClick={handleSave} disabled={busy === "save" || draft.length === 0 || !pseudo.trim()}
                    className="flex-1 h-10 rounded-lg text-xs font-black tracking-wider uppercase transition disabled:opacity-50 flex items-center justify-center gap-1.5 tap-sm"
                    style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)", color: "#fff", boxShadow: "0 0 15px rgba(138,79,255,0.3)" }}>
                    {busy === "save" ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</> : <><Check className="w-4 h-4" /> Enregistrer</>}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}