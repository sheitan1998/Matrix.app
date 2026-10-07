import { sendVoteWebhook } from './voteWebhook.ts';

export const VOTE_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2h (default)
export const VIP_COOLDOWN_MS = 60 * 60 * 1000; // 1h (VIP)
export const MAX_AUTO_VOTE_SERVERS = 3;

// The hourly cron fires a few seconds/minutes off the hour. Without a margin, a vote at
// 02:03:50 would be refused at 03:03:45 (59m55s < 1h), doubling the real cadence.
// Applied ONLY to scheduled runs, never to manual tests or manual votes.
export const SCHEDULED_GRACE_MS = 10 * 60 * 1000;

export function isVipActive(u: any, now = Date.now()) {
  return !!(u?.is_vip && (!u.vip_until || new Date(u.vip_until).getTime() > now));
}

export function isVoteAutoActive(u: any, now = Date.now()) {
  return !!(u?.has_vote_auto && (!u.vote_auto_until || new Date(u.vote_auto_until).getTime() > now));
}

// Most recent vote for a query (several records can exist per user/server: votes + boosts)
export async function getLastVote(base44: any, query: any) {
  const page = await base44.asServiceRole.entities.ServerVote.filter(query, '-last_voted_at', 1);
  return (page?.items || page || [])[0] || null;
}

async function autoVoteOnServer(base44: any, u: any, serverAdId: string, pseudo: string, cooldownMs: number, graceMs: number, now: number) {
  try {
    const ad = await base44.asServiceRole.entities.ServerAd.get(serverAdId).catch(() => null);
    if (!ad) return { server_id: serverAdId, title: null, status: 'not_found' };
    const voteQuery = { server_ad_id: serverAdId, user_email: u.email };
    const lastVote = await getLastVote(base44, voteQuery);
    const lastMs = lastVote?.last_voted_at ? new Date(lastVote.last_voted_at).getTime() : 0;
    const elapsed = now - lastMs;

    if (lastVote && elapsed < cooldownMs - graceMs) {
      return {
        server_id: serverAdId,
        title: ad.title,
        status: 'cooldown',
        remaining_minutes: Math.ceil((cooldownMs - elapsed) / 60000),
      };
    }

    const nowIso = new Date(now).toISOString();
    if (lastVote) {
      await base44.asServiceRole.entities.ServerVote.update(lastVote.id, { last_voted_at: nowIso, voter_pseudo: pseudo, vote_source: 'auto' });
    } else {
      await base44.asServiceRole.entities.ServerVote.create({ ...voteQuery, voter_pseudo: pseudo, last_voted_at: nowIso, vote_source: 'auto' });
    }

    await base44.asServiceRole.entities.ServerAd.updateMany(
      { id: serverAdId },
      { $inc: { votes: 1, votes_month: 1, clicks: 1, clicks_month: 1 } }
    );

    if (ad.webhook_url && ad.api_key) {
      await sendVoteWebhook(ad.webhook_url, ad.api_key, pseudo, serverAdId);
    }

    const fresh = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
    return { server_id: serverAdId, title: ad.title, status: 'voted', votes_month: fresh?.votes_month || 0 };
  } catch (err: any) {
    console.error('[autoVote] Error on server', serverAdId, err);
    return { server_id: serverAdId, title: null, status: 'error', error: err?.message || 'Erreur inconnue' };
  }
}

// Run auto-votes for ONE subscriber on each of their (max 3) selected servers
export async function processUserAutoVotes(base44: any, u: any, now = Date.now(), graceMs = 0) {
  if (!isVoteAutoActive(u, now)) return { status: 'inactive', results: [] };
  if (u?.vote_auto_paused) return { status: 'paused', results: [] };

  const serverIds = (Array.isArray(u.vote_auto_server_ids) ? u.vote_auto_server_ids : [])
    .filter(Boolean)
    .slice(0, MAX_AUTO_VOTE_SERVERS);
  const pseudo = String(u.vote_auto_pseudo || '').trim().slice(0, 30);
  if (serverIds.length === 0 || !pseudo) return { status: 'not_configured', results: [] };

  const cooldownMs = isVipActive(u, now) ? VIP_COOLDOWN_MS : VOTE_COOLDOWN_MS;
  const results = [];
  for (const serverAdId of serverIds) {
    results.push(await autoVoteOnServer(base44, u, serverAdId, pseudo, cooldownMs, graceMs, now));
  }
  return { status: 'ok', cooldown_hours: cooldownMs / (60 * 60 * 1000), results };
}

// Scheduled run: every active subscriber, every selected server
export async function processAllAutoVotes(base44: any, now = Date.now()) {
  const page = await base44.asServiceRole.entities.User.filter({ has_vote_auto: true }, '-created_date', 500);
  const users = page?.items || page || [];
  const summary = { subscribers: users.length, voted: 0, cooldown: 0, skipped: 0, errors: 0 };

  for (const u of users) {
    const res = await processUserAutoVotes(base44, u, now, SCHEDULED_GRACE_MS);
    if (res.status !== 'ok') { summary.skipped++; continue; }
    for (const r of res.results) {
      if (r.status === 'voted') summary.voted++;
      else if (r.status === 'cooldown') summary.cooldown++;
      else if (r.status === 'error') summary.errors++;
      else summary.skipped++;
    }
  }
  return summary;
}