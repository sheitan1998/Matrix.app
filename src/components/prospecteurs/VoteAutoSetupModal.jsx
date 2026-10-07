import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, Check, Zap, Clock, Search, AlertCircle, Pause, Play, Trash2, Power, Activity } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const MAX_SERVERS = 3;

function formatRelative(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h}h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export default function VoteAutoSetupModal({ user, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [status, setStatus] = useState(null);
  const [selected, setSelected] = useState([]);
  const [pseudo, setPseudo] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  const loadStatus = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const statusRes = await base44.functions.invoke("serverSearch", { action: "getVoteAutoStatus" });
      const statusData = statusRes.data || statusRes;
      setStatus(statusData);
      if (statusData.voter_pseudo) setPseudo(statusData.voter_pseudo);
      if (Array.isArray(statusData.servers)) setSelected(statusData.servers);
    } catch { /* silent */ }
    if (!silent) setLoading(false);
  };

  useEffect(() => { loadStatus(); }, []);

  // Poll every 30s for real-time updates (last auto-vote timestamp, counters)
  useEffect(() => {
    const interval = setInterval(() => loadStatus(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // Realtime subscription: update server counters instantly when the cron fires
  useEffect(() => {
    const unsub = base44.entities.ServerAd.subscribe((event) => {
      if (event.type === "update" && event.data) {
        const d = event.data;
        setSelected((prev) => prev.map((s) =>
          s.id === d.id ? { ...s, votes_month: d.votes_month ?? s.votes_month, votes: d.votes ?? s.votes } : s
        ));
      }
    });
    return unsub;
  }, []);

  // Live search (debounced 250ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) { setResults([]); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await base44.functions.invoke("serverSearch", { action: "searchServers", query: q });
        setResults((res.data || res).servers || []);
      } catch { setResults([]); }
      setSearching(false);
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const selectedIds = new Set(selected.map((s) => s.id));

  const addServer = (s) => {
    setError("");
    setSelected((prev) => {
      if (prev.find((x) => x.id === s.id)) return prev;
      if (prev.length >= MAX_SERVERS) { setError(`Maximum ${MAX_SERVERS} serveurs — retire-en un d'abord`); return prev; }
      return [...prev, s];
    });
  };

  const removeServer = (id) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
    setError("");
  };

  const handleSave = async () => {
    if (selected.length === 0) { setError("Veuillez sélectionner au moins un serveur"); return; }
    if (!pseudo.trim()) { setError("Veuillez saisir votre pseudo"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "setupVoteAuto",
        serverAdIds: selected.map((s) => s.id),
        voterPseudo: pseudo.trim(),
      });
      if (res.data?.success) {
        toast.success("Vote Auto configuré !");
        await loadStatus(true);
      } else {
        setError(res.data?.error || "Erreur");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Erreur lors de la configuration");
    }
    setSaving(false);
  };

  const handleTogglePause = async () => {
    setToggling(true);
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "toggleVoteAutoPaused" });
      if (res.data?.success) {
        setStatus((prev) => ({ ...prev, paused: res.data.paused }));
        toast.success(res.data.paused ? "Vote Auto mis en pause" : "Vote Auto repris");
      } else {
        setError(res.data?.error || "Erreur");
      }
    } catch { toast.error("Erreur"); }
    setToggling(false);
  };

  const handleDisable = async () => {
    if (!confirm("Désactiver le Vote Auto ? Vos 3 serveurs et votre pseudo seront effacés. L'abonnement reste actif.")) return;
    setSaving(true);
    setError("");
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "clearVoteAutoConfig" });
      if (res.data?.success) {
        setSelected([]);
        setPseudo("");
        toast.success("Vote Auto désactivé");
        await loadStatus(true);
      }
    } catch { toast.error("Erreur"); }
    setSaving(false);
  };

  const isActive = status?.active;
  const paused = status?.paused;
  const cooldownHours = status?.effective_cooldown_hours || 2;
  const lastRun = status?.last_run;

  // Build 3 slots (filled + empty placeholders)
  const slots = [...selected];
  while (slots.length < MAX_SERVERS) slots.push(null);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: "#12091c", border: "1px solid rgba(138,79,255,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(138,79,255,0.2)", background: "linear-gradient(135deg, rgba(138,79,255,0.12), rgba(109,40,217,0.05))" }}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: "#a855f7" }} />
            <h2 className="text-sm font-black tracking-wider uppercase text-white">Vote Auto</h2>
            {paused && (
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
                EN PAUSE
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition tap-sm">
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
            <p className="text-[10px] text-white/30">Souscris à l'offre Vote Auto (4,99€/mois) pour configurer tes votes automatiques.</p>
            <button onClick={onClose} className="mt-4 h-9 px-5 rounded-lg text-xs font-bold text-white tap-sm" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
              Fermer
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4 overflow-y-auto scrollbar-thin">
            {/* Status + cooldown */}
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "rgba(138,79,255,0.08)", border: "1px solid rgba(138,79,255,0.2)" }}>
              <Clock className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-white">
                  Cooldown: {cooldownHours}h par serveur {status?.has_vip ? "(VIP + Vote Auto)" : "(Vote Auto)"}
                </p>
                <p className="text-[9px] text-white/40">
                  {status?.has_vip ? "VIP actif — vote toutes les 1 heure" : "Vote toutes les 2 heures (ajoute VIP pour 1h)"}
                </p>
              </div>
              {lastRun && (
                <div className="text-right">
                  <p className="text-[8px] text-white/30 uppercase">Dernier vote auto</p>
                  <p className="text-[9px] font-bold" style={{ color: "#a855f7" }}>{formatRelative(lastRun)}</p>
                </div>
              )}
            </div>

            {/* 3 slots */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/40">Mes 3 serveurs</label>
                <span className="text-[9px] font-bold" style={{ color: selected.length >= MAX_SERVERS ? "#ef4444" : "#a855f7" }}>
                  {selected.length}/{MAX_SERVERS}
                </span>
              </div>
              <div className="space-y-1.5">
                {slots.map((s, i) => s ? (
                  <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(138,79,255,0.12)", border: "1px solid rgba(138,79,255,0.35)" }}>
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black shrink-0" style={{ background: "rgba(138,79,255,0.3)", color: "#a855f7" }}>{i + 1}</span>
                    <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-black text-white shrink-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}>
                      {(s.logo_url || s.profile_image) ? <img src={s.logo_url || s.profile_image} alt="" className="w-full h-full object-cover" /> : (s.title || "S")[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{s.title}</p>
                      <div className="flex items-center gap-1.5 text-[9px] text-white/40">
                        <span className="flex items-center gap-0.5"><Activity className="w-2.5 h-2.5" />{s.votes_month || 0} votes/mois</span>
                        {s.last_auto_voted_at && <span style={{ color: "#a855f7" }}>• voté {formatRelative(s.last_auto_voted_at)}</span>}
                      </div>
                    </div>
                    <button onClick={() => removeServer(s.id)} className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-red-400 transition tap-sm" title="Retirer ce serveur">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div key={`empty-${i}`} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(138,79,255,0.03)", border: "1px dashed rgba(138,79,255,0.2)" }}>
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black shrink-0 text-white/20">{i + 1}</span>
                    <div className="w-7 h-7 rounded flex items-center justify-center text-white/20 shrink-0" style={{ background: "rgba(138,79,255,0.05)" }}>
                      <Search className="w-3 h-3" />
                    </div>
                    <p className="text-[10px] text-white/30 flex-1">Slot libre — recherche un serveur ci-dessous</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Server search */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">
                Rechercher un serveur (nom, jeu...)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex: Nexus, Discord, Farming..."
                  className="w-full h-10 pl-9 pr-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
                  style={{ background: "rgba(138,79,255,0.05)", border: "1px solid rgba(138,79,255,0.2)" }}
                />
                {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-white/30" />}
              </div>
              {query.trim() && (
                <div className="mt-1.5 space-y-1 max-h-44 overflow-y-auto scrollbar-thin">
                  {results.length === 0 ? (
                    <p className="text-[10px] text-white/30 text-center py-2">Aucun serveur trouvé</p>
                  ) : (
                    results.map((s) => {
                      const isSelected = selectedIds.has(s.id);
                      const isMaxed = !isSelected && selected.length >= MAX_SERVERS;
                      const logoUrl = s.logo_url || s.profile_image;
                      return (
                        <button
                          key={s.id}
                          onClick={() => addServer(s)}
                          disabled={isSelected || isMaxed}
                          className="w-full flex items-center gap-2 p-2 rounded-lg transition tap-sm"
                          style={{
                            background: isSelected ? "rgba(34,197,94,0.08)" : "rgba(138,79,255,0.04)",
                            border: isSelected ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(138,79,255,0.1)",
                            opacity: isMaxed ? 0.4 : 1,
                          }}
                        >
                          <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black text-white shrink-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}>
                            {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-cover" /> : (s.title || "S")[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-white truncate flex-1 text-left">{s.title}</span>
                          {s.game && <span className="text-[9px] text-white/40 truncate">{s.game}</span>}
                          {isSelected ? <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "#22c55e" }} /> : <span className="text-[9px] text-white/30 shrink-0">+ Ajouter</span>}
                        </button>
                      );
                    })
                  )}
                </div>
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
              <p className="text-[9px] text-white/30 mt-1">Ce pseudo sera enregistré avec chaque vote automatique.</p>
            </div>

            {error && <p className="text-[10px] text-red-400">{error}</p>}

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleSave}
                disabled={saving || selected.length === 0 || !pseudo.trim()}
                className="w-full h-10 rounded-lg text-xs font-black tracking-wider uppercase transition disabled:opacity-50 flex items-center justify-center gap-1.5 tap-sm"
                style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)", color: "#fff", boxShadow: "0 0 15px rgba(138,79,255,0.3)" }}
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</> : <><Check className="w-4 h-4" /> Enregistrer la configuration</>}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleTogglePause}
                  disabled={toggling}
                  className="h-9 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1.5 tap-sm disabled:opacity-50"
                  style={{ background: paused ? "rgba(34,197,94,0.12)" : "rgba(251,191,36,0.12)", color: paused ? "#22c55e" : "#fbbf24", border: `1px solid ${paused ? "rgba(34,197,94,0.25)" : "rgba(251,191,36,0.25)"}` }}
                >
                  {toggling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : paused ? <><Play className="w-3.5 h-3.5" /> Reprendre</> : <><Pause className="w-3.5 h-3.5" /> Pause</>}
                </button>
                <button
                  onClick={handleDisable}
                  disabled={saving}
                  className="h-9 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1.5 tap-sm disabled:opacity-50"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}
                >
                  <Power className="w-3.5 h-3.5" /> Désactiver
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}