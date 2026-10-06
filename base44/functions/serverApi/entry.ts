import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const serverScore = (s) => (s.votes_month || 0) + (s.boosts || 0) * 2;

// Public Web API for server owners — secured by the server's secret api_key.
// GET /functions/serverApi?action=stats&api_key=KEY
// GET /functions/serverApi?action=check-vote&api_key=KEY&pseudo=PSEUDO
export default async function(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  try {
    const url = new URL(req.url);
    let action, apiKey, pseudo;
    if (req.method === 'GET') {
      action = url.searchParams.get('action');
      apiKey = url.searchParams.get('api_key');
      pseudo = url.searchParams.get('pseudo');
    } else {
      const body = await req.json().catch(() => ({}));
      action = body.action;
      apiKey = body.api_key;
      pseudo = body.pseudo;
    }
    action = (action || '').toLowerCase();

    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 8) {
      return Response.json({ error: 'Missing or invalid api_key' }, { status: 401, headers: CORS });
    }

    const base44 = createClientFromRequest(req);
    const serverPage = await base44.asServiceRole.entities.ServerAd.filter({ api_key: apiKey }, null, 1);
    const server = (serverPage?.items || serverPage || [])[0];
    if (!server) return Response.json({ error: 'Invalid api_key' }, { status: 401, headers: CORS });

    if (action === 'stats') {
      // Rank within the same universe (strict isolation: nexus vs discord)
      const peersPage = await base44.asServiceRole.entities.ServerAd.filter(
        { type: 'server', server_type: server.server_type || 'nexus' },
        '-created_date',
        500
      );
      const peers = peersPage?.items || peersPage || [];
      const ranked = [...peers].sort((a, b) => serverScore(b) - serverScore(a));
      const rank = ranked.findIndex((s) => s.id === server.id) + 1;

      return Response.json({
        server: { id: server.id, title: server.title, slug: server.slug },
        universe: server.server_type || 'nexus',
        votes_month: server.votes_month || 0,
        votes_total: server.votes || 0,
        clicks: server.clicks || 0,
        clicks_month: server.clicks_month || 0,
        rank: rank > 0 ? rank : null,
      }, { headers: CORS });
    }

    if (action === 'check-vote') {
      const voterPseudo = (pseudo || '').trim().slice(0, 30);
      if (!voterPseudo) return Response.json({ error: 'Missing pseudo' }, { status: 400, headers: CORS });

      const votesPage = await base44.asServiceRole.entities.ServerVote.filter(
        { server_ad_id: server.id, voter_pseudo: voterPseudo },
        null,
        1
      );
      const vote = (votesPage?.items || votesPage || [])[0];

      return Response.json({
        pseudo: voterPseudo,
        has_voted: !!vote,
        last_voted_at: vote?.last_voted_at || null,
      }, { headers: CORS });
    }

    return Response.json(
      { error: 'Unknown action. Use ?action=stats or ?action=check-vote' },
      { status: 400, headers: CORS }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: CORS });
  }
}