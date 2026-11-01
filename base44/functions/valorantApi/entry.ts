import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { createApiCache, dataResponse } from "../../shared/apiCache.ts";

const { getCached, setCached, purgeAll } = createApiCache(30);
const CACHE_PREFIX = 'val:';
function get(key, ttlMin) { return getCached(CACHE_PREFIX + key, ttlMin * 60 * 1000); }
function set(key, data) { setCached(CACHE_PREFIX + key, data); }

const API_BASE = "https://valorant-api.com/v1";
const LANG = "fr-FR";

async function fetchValorant(path, cacheKey, ttlMin = 60) {
  const cached = get(cacheKey, ttlMin);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}${path}&language=${LANG}`, {
    signal: AbortSignal.timeout(15000),
    headers: { "Accept": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Valorant API error (${res.status}): ${text}`);
  }

  const payload = await res.json();
  const data = payload?.data || [];
  set(cacheKey, data);
  return data;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "getAgents") {
      const agents = await fetchValorant("/agents?isPlayableCharacter=true", "agents", 120);
      return dataResponse(agents, 3600);
    }

    if (action === "getWeapons") {
      const weapons = await fetchValorant("/weapons", "weapons", 120);
      return dataResponse(weapons, 3600);
    }

    if (action === "getSkins") {
      const skins = await fetchValorant("/weapons/skins", "skins", 120);
      return dataResponse(skins.slice(0, 200), 3600);
    }

    if (action === "getAgentDetails") {
      const uuid = String(body.uuid || '').trim();
      if (!uuid) return Response.json({ error: "uuid requis" }, { status: 400 });
      const agents = await fetchValorant("/agents?isPlayableCharacter=true", "agents", 120);
      const agent = agents.find(a => a.uuid === uuid);
      if (!agent) return Response.json({ error: "Agent introuvable" }, { status: 404 });
      return dataResponse(agent, 3600);
    }

    if (action === "purgeCache") {
      const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
      if (!user || user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
      purgeAll(CACHE_PREFIX);
      return Response.json({ ok: true, cleared: true });
    }

    return Response.json({ error: "Action inconnue" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}