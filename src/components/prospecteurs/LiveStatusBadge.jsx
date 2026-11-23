import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const REFRESH_MS = 60_000;

/** Compteur de joueurs en direct (ex. « 12/64 en ligne » ou « Hors ligne »). Sans rendu si le suivi est désactivé. */
export default function LiveStatusBadge({ server, className = "" }) {
  const enabled = !!server?.live_tracking_enabled && !!server?.ip;
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!enabled || !server?.id) return undefined;
    let active = true;
    const load = async () => {
      try {
        const res = await base44.functions.invoke("serverSearch", {
          action: "getLiveStatus",
          serverAdId: server.id,
        });
        if (active && res?.data && !res.data.error) setStatus(res.data);
      } catch {
        if (active) setStatus((prev) => prev || { enabled: true, online: false });
      }
    };
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [enabled, server?.id]);

  if (!enabled || !status || status.enabled === false) return null;

  const online = !!status.online;
  const color = online ? "#22c55e" : "#ef4444";
  const showCount = online && status.max > 0;
  const label = !online
    ? "Hors ligne"
    : showCount
      ? `${status.players}/${status.max} en ligne`
      : status.players > 0
        ? `${status.players} en ligne`
        : "En ligne";

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${className}`}
      style={{ background: `${color}1f`, color, border: `1px solid ${color}55`, boxShadow: `0 0 8px ${color}40` }}
      title={online ? "Serveur en ligne" : "Serveur injoignable"}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
