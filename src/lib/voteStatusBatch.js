import { base44 } from "@/api/base44Client";

const BATCH_DELAY_MS = 60;
const BATCH_SIZE = 100;

// Regroupe les demandes de statut de vote de toutes les cartes affichées
// en un seul appel réseau (évite de saturer la limite de débit de l'API).
let pending = new Map(); // id -> [resolve, ...]
let batchTimer = null;

const flush = async () => {
  batchTimer = null;
  const entries = [...pending.entries()];
  pending = new Map();

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const slice = entries.slice(i, i + BATCH_SIZE);
    let statuses = {};
    try {
      const res = await base44.functions.invoke("serverVoteStatus", {
        serverAdIds: slice.map(([id]) => id),
      });
      statuses = res?.data?.statuses || {};
    } catch {
      statuses = {};
    }
    slice.forEach(([id, resolvers]) =>
      resolvers.forEach((resolve) => resolve(statuses[id] || null))
    );
  }
};

/** Statut de vote d'un serveur : { canVote, remainingTime } — mutualisé entre les cartes. */
export const requestVoteStatus = (id) =>
  new Promise((resolve) => {
    const list = pending.get(id) || [];
    list.push(resolve);
    pending.set(id, list);
    if (!batchTimer) batchTimer = setTimeout(flush, BATCH_DELAY_MS);
  });