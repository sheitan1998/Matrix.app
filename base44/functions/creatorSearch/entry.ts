import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Votes des chaînes Best Creator — mêmes règles que Best Serveur :
// 2h de cooldown (1h pour les VIP), 3 chaînes maximum en Vote Auto.
const VOTE_COOLDOWN_MS = 2 * 60 * 60 * 1000;
const VIP_COOLDOWN_MS = 60 * 60 * 1000;
const MAX_AUTO_CHANNELS = 3;

const isVipActive = (u: any, now: number) =>
  !!(u?.is_vip && (!u.vip_until || new Date(u.vip_until).getTime() > now));

const isAutoVoteActive = (u: any, now: number) =>
  !!(u?.has_vote_auto && (!u.vote_auto_until || new Date(u.vote_auto_until).getTime() > now));

function remainingTime(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
}

function firstOf(page: any) {
  return (page?.items || page || [])[0] || null;
}

async function lastVote(base44: any, creatorId: string, identity: any) {
  const page = await base44.asServiceRole.entities.CreatorVote.filter(
    { creator_id: creatorId, ...identity },
    '-last_voted_at',
    1
  );
  return firstOf(page);
}

async function applyVote(base44: any, creatorId: string, identity: any, pseudo: string, source: string) {
  const nowIso = new Date().toISOString();
  await base44.asServiceRole.entities.CreatorVote.create({
    creator_id: creatorId,
    ...identity,
    voter_pseudo: pseudo,
    last_voted_at: nowIso,
    vote_source: source,
  });
  await base44.asServiceRole.entities.CreatorChannel.updateMany(
    { id: creatorId },
    { $inc: { votes: 1, votes_month: 1 } }
  );
  return base44.asServiceRole.entities.CreatorChannel.get(creatorId);
}

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({} as any));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const action = String(body?.action || '');
    const now = Date.now();
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || null;
    const identity: any = user?.email ? { user_email: user.email } : (ip ? { ip_address: ip } : null);

    // ---- Vote manuel ----
    if (action === 'vote') {
      const creatorId = String(body?.creatorId || '');
      const pseudo = String(body?.voterPseudo || '').trim().slice(0, 30);
      if (!creatorId) return Response.json({ error: 'creatorId manquant' }, { status: 400 });
      if (!pseudo) return Response.json({ error: 'pseudo_required' }, { status: 400 });
      if (!identity) return Response.json({ error: 'anonymous_blocked' }, { status: 400 });

      const creator = await base44.asServiceRole.entities.CreatorChannel.get(creatorId).catch(() => null);
      if (!creator) return Response.json({ error: 'not_found' }, { status: 404 });

      const cooldown = isVipActive(user, now) ? VIP_COOLDOWN_MS : VOTE_COOLDOWN_MS;
      const previous = await lastVote(base44, creatorId, identity);
      const elapsed = previous?.last_voted_at ? now - new Date(previous.last_voted_at).getTime() : Infinity;
      if (previous && elapsed < cooldown) {
        return Response.json({
          error: 'cooldown',
          remainingTime: remainingTime(cooldown - elapsed),
          effective_cooldown_hours: cooldown / 3600000,
        });
      }

      const fresh = await applyVote(base44, creatorId, identity, pseudo, 'manual');
      return Response.json({
        success: true,
        votes: fresh?.votes || 0,
        votes_month: fresh?.votes_month || 0,
        effective_cooldown_hours: cooldown / 3600000,
      });
    }

    // ---- Statut du cooldown pour une chaîne ----
    if (action === 'getVoteStatus') {
      const creatorId = String(body?.creatorId || '');
      if (!creatorId || !identity) return Response.json({ canVote: true, remainingTime: null });
      const cooldown = isVipActive(user, now) ? VIP_COOLDOWN_MS : VOTE_COOLDOWN_MS;
      const previous = await lastVote(base44, creatorId, identity);
      if (!previous?.last_voted_at) return Response.json({ canVote: true, remainingTime: null });
      const elapsed = now - new Date(previous.last_voted_at).getTime();
      if (elapsed >= cooldown) return Response.json({ canVote: true, remainingTime: null });
      return Response.json({
        canVote: false,
        remainingTime: remainingTime(cooldown - elapsed),
        effective_cooldown_hours: cooldown / 3600000,
      });
    }

    // ---- Traitement horaire du Vote Auto ----
    if (action === 'processAutoVotes') {
      const configsPage = await base44.asServiceRole.entities.CreatorAutoVote.list('-created_date', 500);
      const configs = configsPage?.items || configsPage || [];
      const results: any[] = [];

      for (const config of configs) {
        if (config?.paused) continue;
        const pseudo = String(config?.pseudo || '').trim().slice(0, 30);
        const ids = (Array.isArray(config?.creator_ids) ? config.creator_ids : [])
          .filter(Boolean)
          .slice(0, MAX_AUTO_CHANNELS);
        if (!pseudo || ids.length === 0) continue;

        const usersPage = await base44.asServiceRole.entities.User.filter({ email: config.user_email }, null, 1);
        const subscriber = firstOf(usersPage);
        if (!isAutoVoteActive(subscriber, now)) continue;

        const cooldown = isVipActive(subscriber, now) ? VIP_COOLDOWN_MS : VOTE_COOLDOWN_MS;

        for (const creatorId of ids) {
          const creator = await base44.asServiceRole.entities.CreatorChannel.get(creatorId).catch(() => null);
          if (!creator) continue;
          const previous = await lastVote(base44, creatorId, { user_email: config.user_email });
          const elapsed = previous?.last_voted_at ? now - new Date(previous.last_voted_at).getTime() : Infinity;
          // Marge d'une minute : le cron peut partir quelques secondes avant l'heure pleine.
          if (previous && elapsed < cooldown - 60 * 1000) {
            results.push({ creator_id: creatorId, status: 'cooldown' });
            continue;
          }
          await applyVote(base44, creatorId, { user_email: config.user_email }, pseudo, 'auto');
          results.push({ creator_id: creatorId, status: 'voted' });
        }
      }

      return Response.json({ success: true, processed: results.length, results });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}