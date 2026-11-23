import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { rateLimitByIp } from '../../shared/security.ts';

const VOTE_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2h (default)
const VIP_COOLDOWN_MS = 60 * 60 * 1000; // 1h (VIP)
const MAX_IDS = 100;

/**
 * Statut de vote (cooldown) pour plusieurs serveurs en un seul appel.
 * Évite un appel par carte dans l'annuaire, qui saturait la limite de débit.
 * Lecture publique : un visiteur non connecté est identifié par son IP.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body?.serverAdIds)
      ? [...new Set(body.serverAdIds.filter((id) => typeof id === 'string' && id.length > 0 && id.length <= 128))].slice(0, MAX_IDS)
      : [];

    if (ids.length === 0) return Response.json({ statuses: {} });
    if (!rateLimitByIp(req, 'voteStatusBatch', 60, 60_000)) {
      return Response.json({ error: 'Too many requests' }, { status: 429 });
    }

    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    const voterEmail = user?.email || '';
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const query = voterEmail
      ? { server_ad_id: { $in: ids }, user_email: voterEmail }
      : { server_ad_id: { $in: ids }, ip_address: ip };

    const page = await base44.asServiceRole.entities.ServerVote.filter(
      query,
      '-last_voted_at',
      Math.min(500, ids.length * 5),
    );
    const votes = page?.items || (Array.isArray(page) ? page : []);

    const isVip = !!(user?.is_vip && (!user.vip_until || new Date(user.vip_until).getTime() > Date.now()));
    const cooldown = isVip ? VIP_COOLDOWN_MS : VOTE_COOLDOWN_MS;
    const now = Date.now();

    const lastByServer = {};
    for (const vote of votes) {
      const id = vote?.server_ad_id;
      const at = vote?.last_voted_at ? new Date(vote.last_voted_at).getTime() : 0;
      if (id && at > (lastByServer[id] || 0)) lastByServer[id] = at;
    }

    const statuses = {};
    for (const id of ids) {
      const last = lastByServer[id] || 0;
      const elapsed = last ? now - last : cooldown;
      if (elapsed >= cooldown) {
        statuses[id] = { canVote: true };
        continue;
      }
      const remaining = cooldown - elapsed;
      statuses[id] = {
        canVote: false,
        remainingMs: remaining,
        remainingTime: {
          h: Math.floor(remaining / 3600000),
          m: Math.floor((remaining % 3600000) / 60000),
          s: Math.floor((remaining % 60000) / 1000),
        },
      };
    }

    return Response.json({ statuses });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}