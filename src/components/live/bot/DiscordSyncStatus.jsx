import React from "react";
import { CheckCircle2, Clock, CloudOff } from "lucide-react";

const TONES = {
  synced: { color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.35)" },
  waiting: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.35)" },
  offline: { color: "rgba(255,255,255,0.45)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.12)" },
};

// Indicateur de synchronisation Discord : worker en ligne et file d'actions vide.
export default function DiscordSyncStatus({ pending = [], lastSeenAt, guildId }) {
  const waiting = pending.length > 0;
  const worker = !!lastSeenAt && Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000;

  if (!guildId) return null;

  const tone = waiting ? "waiting" : worker ? "synced" : "offline";
  const style = TONES[tone];
  const Icon = waiting ? Clock : worker ? CheckCircle2 : CloudOff;
  const label = waiting
    ? `En attente d'envoi… (${pending.length} action${pending.length > 1 ? "s" : ""} en file)`
    : worker
      ? "Synchronisé avec le serveur Discord"
      : "Réglages enregistrés — worker hors ligne";

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-xl px-3 py-2"
      style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.color }}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="text-[11px] font-bold">{label}</span>
      {lastSeenAt && <span className="text-[10px] opacity-70">dernière synchro {new Date(lastSeenAt).toLocaleTimeString("fr-FR")}</span>}
    </div>
  );
}