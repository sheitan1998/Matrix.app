import { createApiCache } from '../../shared/apiCache.ts';
import { buildOpenGame, fetchOpenPlayer, isOpenGame } from '../../shared/openGameSources.ts';

// Proxy public : aucune clé API, aucun secret, aucune authentification requise.
const cache = createApiCache(80);
const TTL = 10 * 60 * 1000;

Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || 'game');
  const slug = String(body.game || '').trim();

  if (!slug || !isOpenGame(slug)) {
    return Response.json({ error: 'Jeu inconnu' }, { status: 400 });
  }

  try {
    if (action === 'player') {
      const player = await fetchOpenPlayer(slug, String(body.query || ''));
      return Response.json({ player });
    }

    const key = `game:v3:${slug}`;
    const cached = cache.getCached(key, TTL);
    if (cached) return Response.json(cached);

    const data = await buildOpenGame(slug);
    cache.setCached(key, data);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: String((error as Error)?.message || error) }, { status: 502 });
  }
});