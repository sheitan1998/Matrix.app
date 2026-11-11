import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { isBotRequestAuthorized, listOf, unauthorized } from '../../shared/botAuth.ts';

// POST /functions/botPushTokens — jetons renouvelés par le worker.
export default async function (req: Request): Promise<Response> {
  try {
    if (!isBotRequestAuthorized(req)) return unauthorized();

    const body = await req.json().catch(() => ({} as any));
    const channelId = String(body?.channelId || '').trim();
    const accessToken = String(body?.accessToken || '').trim();
    if (!channelId) return Response.json({ error: 'channelId is required' }, { status: 400 });
    if (!accessToken) return Response.json({ error: 'accessToken is required' }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const integration = await base44.asServiceRole.entities.BotIntegration
      .get(channelId)
      .catch((error) => (error?.status === 404 ? null : Promise.reject(error)));
    if (!integration) return Response.json({ error: 'not_found' }, { status: 404 });

    const now = new Date().toISOString();
    const fields: Record<string, any> = {
      integration_id: channelId,
      owner_email: integration.owner_email,
      platform: integration.platform,
      access_token: accessToken,
      refresh_token: typeof body?.refreshToken === 'string' ? body.refreshToken : '',
      expires_at: Number.isFinite(Number(body?.expiresAt)) ? Number(body.expiresAt) : 0,
      updated_at: now,
    };

    const existing = listOf(
      await base44.asServiceRole.entities.BotCredential.filter({ integration_id: channelId }, { limit: 1 }),
    )[0];

    if (existing) {
      await base44.asServiceRole.entities.BotCredential.update(existing.id, fields);
    } else {
      await base44.asServiceRole.entities.BotCredential.create(fields);
    }
    await base44.asServiceRole.entities.BotIntegration.update(channelId, { updated_at: now });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}