import React from "react";
import { Radio, RefreshCw, Unplug, Twitch, Youtube, Hash } from "lucide-react";

const PLATFORM_ICON = { twitch: Twitch, youtube: Youtube, discord: Hash };
const ACCENT = { twitch: "#a855f7", youtube: "#ef4444", discord: "#818cf8" };

export default function BotConnectionCard({ integration, subtitle, onDisconnect, onRefreshLive, refreshing, extra }) {
  const Icon = PLATFORM_ICON[integration.platform] || Hash;
  const accent = ACCENT[integration.platform] || "#a855f7";
  const connected = integration.status === "connected";
  const tokenLabel = connected ? "Jeton actif" : integration.status === "error" ? "Jeton en erreur" : "En attente du worker";

  return (
    <section className="rounded-2xl p-4" style={{ background: "rgba(18,9,28,0.85)", border: "1px solid rgba(168,85,247,0.22)", boxShadow: "0 0 24px rgba(168,85,247,0.08)" }}>
      <div className="flex items-center gap-3">
        {integration.channel_avatar_url ? (
          <img
            src={integration.channel_avatar_url}
            alt={integration.channel_name || "Chaîne"}
            className="w-11 h-11 rounded-xl object-cover shrink-0"
            style={{ border: `1px solid ${accent}55` }}
          />
        ) : (
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}22`, border: `1px solid ${accent}55` }}>
            <Icon className="w-5 h-5" style={{ color: accent }} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white truncate">{integration.channel_name || "Chaîne"}</p>
          <p className="text-[10px] text-white/35 truncate">{subtitle}</p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {integration.is_live && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.5)", color: "#f87171" }}>
              <Radio className="w-3 h-3 animate-live-pulse" /> Live détecté
            </span>
          )}
          <span
            className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
            style={connected
              ? { background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80" }
              : { background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.4)", color: "#fbbf24" }}
          >
            {tokenLabel}
          </span>
        </div>
      </div>

      {integration.last_error && (
        <p className="mt-3 text-[11px] px-2.5 py-2 rounded-lg break-words" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
          {integration.last_error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {onRefreshLive && (
          <button
            type="button"
            onClick={onRefreshLive}
            disabled={refreshing}
            className="h-9 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition disabled:opacity-50 tap-sm"
            style={{ background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.35)", color: "#d8b4fe" }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} /> Actualiser le live
          </button>
        )}
        {extra}
        {onDisconnect && (
          <button
            type="button"
            onClick={onDisconnect}
            className="h-9 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition tap-sm"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
          >
            <Unplug className="w-3.5 h-3.5" /> Déconnecter
          </button>
        )}
      </div>
    </section>
  );
}