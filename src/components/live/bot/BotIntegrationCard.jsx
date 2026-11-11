import React from "react";
import { AlertTriangle, CheckCircle2, Loader2, MessageSquare, Power, Radio, Twitch, Unplug, Youtube } from "lucide-react";

const STATUS = {
  connected: { label: "Connecté", color: "#22c55e", icon: CheckCircle2 },
  connecting: { label: "Reconnexion…", color: "#eab308", icon: Loader2 },
  disconnected: { label: "Déconnecté", color: "#9ca3af", icon: Power },
  error: { label: "Erreur", color: "#ef4444", icon: AlertTriangle },
  stopped: { label: "Désactivé", color: "#9ca3af", icon: Power },
};

const PLATFORM_ICON = { twitch: Twitch, youtube: Youtube, discord: MessageSquare };

export default function BotIntegrationCard({ integration, busy, onEnable, onDisconnect, onRemove }) {
  const Icon = PLATFORM_ICON[integration.platform] || MessageSquare;
  const status = STATUS[integration.status] || STATUS.disconnected;
  const StatusIcon = status.icon;
  const lastSeen = integration.last_seen_at ? new Date(integration.last_seen_at).getTime() : 0;
  const stale = integration.enabled && lastSeen > 0 && Date.now() - lastSeen > 3 * 60 * 1000;
  const quotaPercent = integration.quota_limit > 0
    ? Math.min(100, Math.round(((integration.quota_used || 0) / integration.quota_limit) * 100))
    : 0;

  return (
    <section
      className="rounded-2xl p-4"
      style={{ background: "rgba(18,9,28,0.85)", border: "1px solid rgba(168,85,247,0.22)", boxShadow: "0 0 24px rgba(168,85,247,0.08)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.32)" }}
        >
          <Icon className="w-5 h-5" style={{ color: "#c084fc" }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white truncate">{integration.channel_name || "Chaîne"}</p>
          <p className="text-[10px] text-white/35 truncate">
            {integration.platform === "discord" ? "Serveur Discord" : `ID ${integration.channel_id}`}
            {integration.account_mode === "bot" && " · compte bot modérateur"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
            style={{ background: `${status.color}1f`, border: `1px solid ${status.color}55`, color: status.color }}
          >
            <StatusIcon className={`w-3 h-3 ${integration.status === "connecting" ? "animate-spin" : ""}`} />
            {status.label}
          </span>
          {integration.is_live && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.5)", color: "#f87171" }}>
              <Radio className="w-3 h-3" /> En ligne
            </span>
          )}
        </div>
      </div>

      {stale && (
        <p className="mt-3 text-[11px] px-2.5 py-2 rounded-lg" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.35)", color: "#fde68a" }}>
          Le bot ne répond plus : dernier signe de vie il y a plus de 3 minutes.
        </p>
      )}

      {integration.status === "error" && integration.last_error && (
        <p className="mt-3 text-[11px] px-2.5 py-2 rounded-lg break-words" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
          {integration.last_error}
        </p>
      )}

      {integration.platform === "youtube" && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
            <span>Quota YouTube du jour</span>
            <span className="font-mono text-white/60">{integration.quota_used || 0} / {integration.quota_limit || 10000} unités</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full" style={{ width: `${quotaPercent}%`, background: quotaPercent > 85 ? "#ef4444" : "linear-gradient(90deg,#a855f7,#22d3ee)" }} />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onEnable(!integration.enabled)}
          className="h-9 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition disabled:opacity-50 tap-sm"
          style={integration.enabled
            ? { background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.35)", color: "#4ade80" }
            : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
        >
          <Power className="w-3.5 h-3.5" /> {integration.enabled ? "Bot activé" : "Bot désactivé"}
        </button>

        {integration.platform !== "discord" && (
          <button
            type="button"
            disabled={busy}
            onClick={onDisconnect}
            className="h-9 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition disabled:opacity-50 tap-sm"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
          >
            <Unplug className="w-3.5 h-3.5" /> Déconnecter
          </button>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={onRemove}
          className="ml-auto h-9 px-3 rounded-xl text-[11px] font-bold transition disabled:opacity-50 tap-sm"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
        >
          Supprimer
        </button>
      </div>
    </section>
  );
}