import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { isBotRequestAuthorized, listOf, unauthorized } from '../../shared/botAuth.ts';
import { normalizeDay, numericMap } from '../../shared/botSettings.ts';

// POST /functions/botPushStats — totaux du jour envoyés par le worker.
// Idempotent : une même journée est remplacée, jamais cumulée.
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

    const day = normalizeDay(body?.day);
    const count = (value: any) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
    };

    const updates: Record<string, any> = {
      owner_email: integration.owner_email,
      platform: integration.platform,
      messages: count(body?.messages),
      commands: count(body?.commands),
      timeouts: count(body?.timeouts),
      deletions: count(body?.deletions),
      filter_hits: numericMap(body?.filterHits),
      top_commands: numericMap(body?.topCommands),
      top_chatters: numericMap(body?.topChatters),
    };

    const quotaUsed = Number(body?.quota?.used);
    if (Number.isFinite(quotaUsed)) updates.quota_used = Math.max(0, Math.round(quotaUsed));

    const existing = listOf(
      await base44.asServiceRole.entities.BotDailyStats.filter(
        { integration_id: channelId, day },
        { limit: 1 },
      ),
    )[0];

    const saved = existing
      ? await base44.asServiceRole.entities.BotDailyStats.update(existing.id, updates)
      : await base44.asServiceRole.entities.BotDailyStats.create({ integration_id: channelId, day, ...updates });

    return Response.json({ success: true, id: saved.id, day });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}