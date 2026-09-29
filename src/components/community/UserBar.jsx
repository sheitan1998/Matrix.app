import React, { useState, useEffect } from "react";
import { Mic, MicOff, Headphones, HeadphoneOff, Settings, Pencil, X, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { stripPseudoTag } from "@/lib/format";
import { toast } from "sonner";
import { isUserOnline, getActivityIcon } from "@/hooks/usePresence";
import UserSettingsModal from "@/components/profile/UserSettingsModal";

const QUICK_STATUSES = [
  { label: "En ligne", value: "", icon: "🟢" },
  { label: "Absent", value: "Absent", icon: "🌙" },
  { label: "Ne pas déranger", value: "Ne pas déranger", icon: "🔴" },
  { label: "Occupé", value: "Occupé(e)", icon: "⛔" },
];

export default function UserBar({ user, progress, rank, onOpenProfile }) {
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [showStatusEditor, setShowStatusEditor] = useState(false);
  const [customStatus, setCustomStatus] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const displayName = stripPseudoTag(user?.full_name) || user?.email?.split("@")[0] || "Utilisateur";
  const online = isUserOnline(user?.last_seen);
  const activity = user?.current_activity;
  const activityType = user?.current_activity_type || "idle";
  const hasCustomStatus = !!user?.custom_status;

  useEffect(() => {
    if (user?.custom_status) setCustomStatus(user.custom_status);
  }, [user?.custom_status]);

  const saveCustomStatus = async () => {
    setSavingStatus(true);
    try {
      await base44.auth.updateMe({ custom_status: customStatus.trim() || null });
      toast.success(customStatus.trim() ? "Statut personnalisé défini" : "Statut personnalisé effacé");
      setShowStatusEditor(false);
    } catch {
      toast.error("Erreur lors de la mise à jour du statut");
    }
    setSavingStatus(false);
  };

  const clearCustomStatus = async () => {
    setSavingStatus(true);
    try {
      await base44.auth.updateMe({ custom_status: null });
      setCustomStatus("");
      toast.success("Statut effacé");
    } catch {
      toast.error("Erreur");
    }
    setSavingStatus(false);
  };

  return (
    <div className="shrink-0 relative" style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      {showStatusEditor && (
        <div className="absolute bottom-full left-0 right-0 mb-1 p-3 rounded-t-xl z-50" style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.2)", borderBottom: "none" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/60">Statut personnalisé</span>
            <button onClick={() => setShowStatusEditor(false)} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 transition tap-sm">
              <X className="w-3 h-3 text-white/40" />
            </button>
          </div>
          <input
            value={customStatus}
            onChange={(e) => setCustomStatus(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveCustomStatus(); } }}
            placeholder="Définir un statut..."
            maxLength={80}
            autoFocus
            className="w-full px-3 py-2 rounded-lg text-xs text-white placeholder:text-white/30 outline-none mb-2"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
          />
          <div className="flex flex-wrap gap-1 mb-2">
            {QUICK_STATUSES.map((qs) => (
              <button
                key={qs.label}
                onClick={() => setCustomStatus(qs.value)}
                className="px-2 py-1 rounded-md text-[10px] font-semibold transition hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)" }}
              >
                {qs.icon} {qs.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {hasCustomStatus && (
              <button
                onClick={clearCustomStatus}
                disabled={savingStatus}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition hover:opacity-80 tap-sm"
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <Trash2 className="w-3 h-3 inline mr-1" /> Effacer
              </button>
            )}
            <button
              onClick={saveCustomStatus}
              disabled={savingStatus}
              className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-white transition hover:opacity-80 tap-sm"
              style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 px-2 py-1.5">
        <button onClick={onOpenProfile} className="flex items-center gap-2 flex-1 min-w-0 px-1.5 py-1 rounded-lg hover:bg-white/5 transition">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden" style={{ border: rank ? `1.5px solid ${rank.color}40` : "1.5px solid rgba(255,255,255,0.1)" }}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-secondary">{displayName?.[0]?.toUpperCase()}</div>
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2" style={{ background: online ? "#22C55E" : "#6b7280", borderColor: "rgba(0,0,0,0.3)" }} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold text-white truncate leading-tight">{displayName}</p>
            <p className="text-[10px] truncate leading-tight flex items-center gap-0.5" style={{ color: hasCustomStatus ? "#c084fc" : (rank?.color || "rgba(255,255,255,0.4)") }}>
              {hasCustomStatus ? (
                <>
                  <span className="text-[9px]">{getActivityIcon("custom")}</span>
                  <span className="truncate">{user.custom_status}</span>
                </>
              ) : online && activity ? (
                <>
                  <span className="text-[9px]">{getActivityIcon(activityType)}</span>
                  <span className="truncate">{activity}</span>
                </>
              ) : (
                <span>{rank ? `${rank.icon} Niv. ${progress?.level || 1}` : "Hors ligne"}</span>
              )}
            </p>
          </div>
        </button>
        <button
          onClick={() => setShowStatusEditor(!showStatusEditor)}
          className="w-7 h-7 rounded-md flex items-center justify-center transition hover:bg-white/10 shrink-0 tap-sm"
          style={{ background: showStatusEditor ? "rgba(168,85,247,0.15)" : "transparent" }}
          title="Personnaliser le statut"
        >
          <Pencil className="w-3 h-3 text-white/60" />
        </button>
        <button
          onClick={() => setMuted(!muted)}
          className="w-7 h-7 rounded-md flex items-center justify-center transition hover:bg-white/10 shrink-0 tap-sm"
          style={{ background: muted ? "rgba(239,68,68,0.15)" : "transparent" }}
          title={muted ? "Activer le micro" : "Couper le micro"}
        >
          {muted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-white/60" />}
        </button>
        <button
          onClick={() => setDeafened(!deafened)}
          className="w-7 h-7 rounded-md flex items-center justify-center transition hover:bg-white/10 shrink-0 tap-sm"
          style={{ background: deafened ? "rgba(239,68,68,0.15)" : "transparent" }}
          title={deafened ? "Activer le son" : "Couper le son"}
        >
          {deafened ? <HeadphoneOff className="w-3.5 h-3.5 text-red-400" /> : <Headphones className="w-3.5 h-3.5 text-white/60" />}
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="w-7 h-7 rounded-md flex items-center justify-center transition hover:bg-white/10 shrink-0 tap-sm"
          title="Paramètres du compte"
        >
          <Settings className="w-3.5 h-3.5 text-white/60" />
        </button>
      </div>

      <UserSettingsModal open={showSettings} onClose={() => setShowSettings(false)} user={user} />
    </div>
  );
}