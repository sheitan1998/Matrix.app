import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const REFRESH_MS = 60_000;
const BATCH_DELAY_MS = 60;
const BATCH_SIZE = 50;

// Regroupe les demandes de toutes les pastilles affichées en quelques appels (évite la limite de débit).
let pendingIds = new Map(); // id -> [resolve, ...]
let batchTimer = null;

const flushBatch = async () => {
  batchTimer = null;
  const entries = [...pendingIds.entries()];
  pendingIds = new Map();
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const slice = entries.slice(i, i + BATCH_SIZE);
    let statuses = {};
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "getLiveStatuses",
        serverAdIds: slice.map(([id]) => id),
      });
      statuses = res?.data?.statuses || {};
    } catch {
      statuses = {};
    }
    slice.forEach(([id, resolvers]) => resolvers.forEach((resolve) => resolve(statuses[id] || null)));
  }
};

const requestStatus = (id) =>
  new Promise((resolve) => {
    const list = pendingIds.get(id) || [];
    list.push(resolve);
    pendingIds.set(id, list);
    if (!batchTimer) batchTimer = setTimeout(flushBatch, BATCH_DELAY_MS);
  });

/** Compteur de joueurs en direct (ex. « 12/64 en ligne » ou « Hors ligne »). Sans rendu si aucune adresse n'est renseignée. */
export default function LiveStatusBadge({ server, className = "" }) {
  const enabled = !!server?.live_tracking_enabled || !!server?.ip;
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!enabled || !server?.id) return undefined;
    let active = true;
    const load = async () => {
      const next = await requestStatus(server.id);
      // En cas d'erreur réseau on garde la dernière valeur connue au lieu d'afficher « Hors ligne ».
      if (active && next) setStatus(next);
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
