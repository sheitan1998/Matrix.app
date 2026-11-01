import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { createApiCache, dataResponse } from "../../shared/apiCache.ts";

const { getCached, setCached, purgeAll } = createApiCache(30);
const CACHE_PREFIX = 'val:';
function get(key, ttlMin) { return getCached(CACHE_PREFIX + key, ttlMin * 60 * 1000); }
function set(key, data) { setCached(CACHE_PREFIX + key, data); }

const API_BASE = "https://valorant-api.com/v1";
const LANG = "fr-FR";

// Fallback local pour les armes (si l'API est indisponible)
const FALLBACK_WEAPONS = [
  { uuid: "fallback-vandal", displayName: "Vandal", category: "Rifle", displayIcon: "", cost: 2900, weaponStats: { damage: 39, fireRate: 9.75, magazineSize: 25, reloadTimeSeconds: 2.5 }, shopData: { category: "Rifles" } },
  { uuid: "fallback-phantom", displayName: "Phantom", category: "Rifle", displayIcon: "", cost: 2900, weaponStats: { damage: 39, fireRate: 11, magazineSize: 30, reloadTimeSeconds: 2.5 }, shopData: { category: "Rifles" } },
  { uuid: "fallback-operator", displayName: "Operator", category: "Sniper", displayIcon: "", cost: 4700, weaponStats: { damage: 150, fireRate: 0.75, magazineSize: 5, reloadTimeSeconds: 3.7 }, shopData: { category: "Snipers" } },
  { uuid: "fallback-sheriff", displayName: "Sheriff", category: "Sidearm", displayIcon: "", cost: 800, weaponStats: { damage: 55, fireRate: 4, magazineSize: 6, reloadTimeSeconds: 1.5 }, shopData: { category: "Sidearms" } },
  { uuid: "fallback-classic", displayName: "Classic", category: "Sidearm", displayIcon: "", cost: 0, weaponStats: { damage: 26, fireRate: 6.75, magazineSize: 12, reloadTimeSeconds: 1.5 }, shopData: { category: "Sidearms" } },
  { uuid: "fallback-spectre", displayName: "Spectre", category: "SMG", displayIcon: "", cost: 1600, weaponStats: { damage: 26, fireRate: 13.33, magazineSize: 30, reloadTimeSeconds: 2.25 }, shopData: { category: "SMGs" } },
  { uuid: "fallback-odin", displayName: "Odin", category: "Heavy", displayIcon: "", cost: 3200, weaponStats: { damage: 48, fireRate: 12, magazineSize: 100, reloadTimeSeconds: 5 }, shopData: { category: "Heavy" } },
  { uuid: "fallback-ghost", displayName: "Ghost", category: "Sidearm", displayIcon: "", cost: 500, weaponStats: { damage: 30, fireRate: 5, magazineSize: 15, reloadTimeSeconds: 1.5 }, shopData: { category: "Sidearms" } },
  { uuid: "fallback-guardian", displayName: "Guardian", category: "Rifle", displayIcon: "", cost: 2250, weaponStats: { damage: 65, fireRate: 5.25, magazineSize: 12, reloadTimeSeconds: 2.5 }, shopData: { category: "Rifles" } },
  { uuid: "fallback-judge", displayName: "Judge", category: "Shotgun", displayIcon: "", cost: 1850, weaponStats: { damage: 75, fireRate: 3.5, magazineSize: 7, reloadTimeSeconds: 2 }, shopData: { category: "Shotguns" } },
];

// Fallback local pour les skins (si l'API est indisponible)
const FALLBACK_SKINS = [
  { uuid: "fallback-skin-1", displayName: "Reaver Vandal", tier: "Premium", displayIcon: "", contentTierUuid: "default" },
  { uuid: "fallback-skin-2", displayName: "Prime Vandal", tier: "Premium", displayIcon: "", contentTierUuid: "default" },
  { uuid: "fallback-skin-3", displayName: "Elderflame Operator", tier: "Ultra", displayIcon: "", contentTierUuid: "default" },
  { uuid: "fallback-skin-4", displayName: "Glitchpop Phantom", tier: "Premium", displayIcon: "", contentTierUuid: "default" },
  { uuid: "fallback-skin-5", displayName: "Oni Phantom", tier: "Premium", displayIcon: "", contentTierUuid: "default" },
  { uuid: "fallback-skin-6", displayName: "Sovereign Ghost", tier: "Select", displayIcon: "", contentTierUuid: "default" },
  { uuid: "fallback-skin-7", displayName: "Arcane Sheriff", tier: "Exclusive", displayIcon: "", contentTierUuid: "default" },
  { uuid: "fallback-skin-8", displayName: "RGX 11z Pro Vandal", tier: "Exclusive", displayIcon: "", contentTierUuid: "default" },
  { uuid: "fallback-skin-9", displayName: "Kurunami Vandal", tier: "Exclusive", displayIcon: "", contentTierUuid: "default" },
  { uuid: "fallback-skin-10", displayName: "Neon Sting Phantom", tier: "Deluxe", displayIcon: "", contentTierUuid: "default" },
];

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
      try {
        const agents = await fetchValorant("/agents?isPlayableCharacter=true", "agents", 120);
        return dataResponse(agents, 3600);
      } catch {
        return dataResponse([], 60);
      }
    }

    if (action === "getWeapons") {
      try {
        const weapons = await fetchValorant("/weapons", "weapons", 120);
        return dataResponse(weapons, 3600);
      } catch {
        return dataResponse(FALLBACK_WEAPONS, 300);
      }
    }

    if (action === "getSkins") {
      try {
        const skins = await fetchValorant("/weapons/skins", "skins", 120);
        return dataResponse(skins.slice(0, 200), 3600);
      } catch {
        return dataResponse(FALLBACK_SKINS, 300);
      }
    }

    if (action === "getAgentDetails") {
      const uuid = String(body.uuid || '').trim();
      if (!uuid) return Response.json({ error: "uuid requis" }, { status: 400 });
      try {
        const agents = await fetchValorant("/agents?isPlayableCharacter=true", "agents", 120);
        const agent = agents.find(a => a.uuid === uuid);
        if (!agent) return Response.json({ error: "Agent introuvable" }, { status: 404 });
        return dataResponse(agent, 3600);
      } catch {
        return Response.json({ error: "API indisponible" }, { status: 503 });
      }
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