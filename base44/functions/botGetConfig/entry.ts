import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { isBotRequestAuthorized, listOf, unauthorized } from '../../shared/botAuth.ts';

// GET /functions/botGetConfig — appelé par le worker.
// Renvoie une entrée par chaîne connectée, jetons inclus.
export default async function (req: Request): Promise<Response> {
  try {
    if (!isBotRequestAuthorized(req)) return unauthorized();

    const base44 = createClientFromRequest(req);
    const integrations = listOf(
      await base44.asServiceRole.entities.BotIntegration.filter(
        { platform: { $in: ['twitch', 'youtube'] }, status: { $ne: 'stopped' } },
        { limit: 200 },
      ),
    );

    const ids = integrations.map((item: any) => item.id);
    const credentials = ids.length
      ? listOf(
          await base44.asServiceRole.entities.BotCredential.filter(
            { integration_id: { $in: ids } },
            { limit: 200 },
          ),
        )
      : [];

    const byIntegration = new Map<string, any>();
    for (const credential of credentials) byIntegration.set(credential.integration_id, credential);

    const channels = [];
    for (const integration of integrations) {
      const credential = byIntegration.get(integration.id);
      if (!credential?.access_token) continue;
      channels.push({
        id: integration.id,
        platform: integration.platform,
        enabled: integration.enabled !== false,
        channel: { id: integration.channel_id || '', name: integration.channel_name || '' },
        account: {
          userId: integration.account_user_id || '',
          accessToken: credential.access_token || '',
          refreshToken: credential.refresh_token || '',
          expiresAt: Number(credential.expires_at) || 0,
        },
        settings: integration.settings || {},
      });
    }

    return Response.json({ channels });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}