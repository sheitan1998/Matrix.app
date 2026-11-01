import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { createApiCache, dataResponse } from "../../shared/apiCache.ts";

const { getCached, setCached, purgeAll } = createApiCache(30);
const CACHE_PREFIX = 'rust:';
function get(key, ttlMin) { return getCached(CACHE_PREFIX + key, ttlMin * 60 * 1000); }
function set(key, data) { setCached(CACHE_PREFIX + key, data); }

const API_BASE = "https://api.battlemetrics.com";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "getServers") {
      const page = Math.min(Math.max(parseInt(body.page) || 1, 1), 50);
      const pageSize = Math.min(Math.max(parseInt(body.pageSize) || 20, 5), 50);
      const search = String(body.search || '').trim().slice(0, 100);
      const filterType = String(body.filter || 'all');

      const cacheKey = `servers:${page}:${pageSize}:${search}:${filterType}`;
      const cached = get(cacheKey, 5);
      if (cached) return dataResponse(cached, 300);

      const params = new URLSearchParams({
        'filter[game]': 'rust',
        'page[size]': String(pageSize),
        'page[number]': String(page),
      });

      if (search) params.set('filter[search]', search);
      if (filterType === 'official') params.set('filter[official]', 'true');
      if (filterType === 'modded') params.set('filter[tags]', 'modded');
      if (filterType === 'solo') {
        params.set('filter[search]', (search ? search + ' ' : '') + 'solo duo trio');
      }

      const res = await fetch(`${API_BASE}/servers?${params}`, {
        signal: AbortSignal.timeout(12000),
        headers: { "Accept": "application/json" },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Battlemetrics API error (${res.status}): ${text}`);
      }

      const payload = await res.json();
      const servers = (payload?.data || []).map(s => ({
        id: s.id,
        name: s.attributes?.name || "Serveur inconnu",
        players: s.attributes?.players || 0,
        maxPlayers: s.attributes?.maxPlayers || 0,
        rank: s.attributes?.rank || 0,
        country: s.attributes?.country || "",
        ip: s.attributes?.ip || "",
        port: s.attributes?.port || 0,
        status: s.attributes?.status || "offline",
        isOfficial: s.attributes?.details?.official || false,
        wipe: s.attributes?.details?.wipe_cycle || "",
        description: s.attributes?.description || "",
      }));

      const meta = payload?.meta || {};
      const result = {
        servers,
        total: meta.total || servers.length,
        page,
        pageSize,
        hasMore: (meta.total || 0) > page * pageSize,
      };

      set(cacheKey, result);
      return dataResponse(result, 300);
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