import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { isBotRequestAuthorized, unauthorized } from '../../shared/botAuth.ts';

const STATES = ['connecting', 'connected', 'disconnected', 'error', 'stopped'];

// POST /functions/botPushStatus — état de connexion envoyé par le worker.
export default async function (req: Request): Promise<Response> {
  try {
    if (!isBotRequestAuthorized(req)) return unauthorized();

    const body = await req.json().catch(() => ({} as any));
    const channelId = String(body?.channelId || '').trim();
    if (!channelId) return Response.json({ error: 'channelId is required' }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const integration = await base44.asServiceRole.entities.BotIntegration
      .get(channelId)
      .catch((error) => (error?.status === 404 ? null : Promise.reject(error)));
    if (!integration) return Response.json({ error: 'not_found' }, { status: 404 });

    const now = new Date().toISOString();
    const updates: Record<string, any> = { last_seen_at: now, updated_at: now };

    if (typeof body?.state === 'string' && STATES.includes(body.state)) updates.status = body.state;
    if (typeof body?.live === 'boolean') updates.is_live = body.live;
    if (typeof body?.liveSince === 'string' && body.liveSince) {
      updates.live_since = body.liveSince;
    } else if (body?.live === false) {
      updates.live_since = null;
    }
    if (typeof body?.error === 'string') updates.last_error = body.error.slice(0, 1000);

    const quota = body?.quota;
    if (quota && typeof quota === 'object') {
      const used = Number(quota.used);
      const limit = Number(quota.limit);
      if (Number.isFinite(used)) updates.quota_used = Math.max(0, Math.round(used));
      if (Number.isFinite(limit)) updates.quota_limit = Math.max(0, Math.round(limit));
    }

    const saved = await base44.asServiceRole.entities.BotIntegration.update(channelId, updates);
    return Response.json({ success: true, integration: { id: saved.id, status: saved.status } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}