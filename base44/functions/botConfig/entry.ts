import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { listOf } from '../../shared/botAuth.ts';
import { deepMerge, defaultSettings, sanitizeSettings, stripSecrets } from '../../shared/botSettings.ts';

// Appelée par la page /live-bot (navigateur). Chaque action vérifie côté serveur
// que l'intégration appartient bien à l'utilisateur connecté.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((error) => (error?.status === 401 ? null : Promise.reject(error)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({} as any));
    const action = String(body?.action || '');
    const now = new Date().toISOString();

    const owned = async (id: string) => {
      if (!id) return null;
      const record = await base44.entities.BotIntegration
        .get(id)
        .catch((error) => (error?.status === 404 ? null : Promise.reject(error)));
      if (!record) return null;
      if (record.owner_email !== user.email && user.role !== 'admin') return null;
      return record;
    };

    if (action === 'list') {
      const page = await base44.entities.BotIntegration.filter(
        { owner_email: user.email },
        { sort: '-updated_date', limit: 20 },
      );
      return Response.json({
        integrations: listOf(page).map(stripSecrets),
        workerConfigured: true,
      });
    }

    if (action === 'saveSettings') {
      const record = await owned(String(body?.id || ''));
      if (!record) return Response.json({ error: 'not_found' }, { status: 404 });
      const settings = sanitizeSettings(deepMerge(record.settings || {}, body?.patch || {}));
      const saved = await base44.entities.BotIntegration.update(record.id, { settings, updated_at: now });
      return Response.json({ integration: stripSecrets(saved) });
    }

    if (action === 'setEnabled') {
      const record = await owned(String(body?.id || ''));
      if (!record) return Response.json({ error: 'not_found' }, { status: 404 });
      const enabled = body?.enabled === true;
      const updates: Record<string, any> = {
        enabled,
        status: enabled ? (record.status === 'stopped' || record.status === 'disconnected' ? 'connecting' : record.status) : 'stopped',
        updated_at: now,
      };
      if (!enabled) updates.is_live = false;
      const saved = await base44.entities.BotIntegration.update(record.id, updates);
      return Response.json({ integration: stripSecrets(saved) });
    }

    if (action === 'disconnect') {
      const record = await owned(String(body?.id || ''));
      if (!record) return Response.json({ error: 'not_found' }, { status: 404 });
      const credentials = listOf(await base44.entities.BotCredential.filter({ integration_id: record.id }, { limit: 5 }));
      for (const credential of credentials) {
        await base44.asServiceRole.entities.BotCredential.delete(credential.id);
      }
      const saved = await base44.entities.BotIntegration.update(record.id, {
        enabled: false,
        status: 'stopped',
        is_live: false,
        live_since: null,
        last_error: '',
        quota_used: 0,
        updated_at: now,
      });
      return Response.json({ integration: stripSecrets(saved) });
    }

    if (action === 'remove') {
      const record = await owned(String(body?.id || ''));
      if (!record) return Response.json({ error: 'not_found' }, { status: 404 });
      const credentials = listOf(await base44.entities.BotCredential.filter({ integration_id: record.id }, { limit: 5 }));
      for (const credential of credentials) {
        await base44.asServiceRole.entities.BotCredential.delete(credential.id);
      }
      await base44.entities.BotIntegration.delete(record.id);
      return Response.json({ success: true });
    }

    if (action === 'createDiscord') {
      const name = String(body?.channel_name || '').trim().slice(0, 80);
      if (name.length < 2) return Response.json({ error: 'name_required' }, { status: 400 });
      const existing = listOf(
        await base44.entities.BotIntegration.filter({ owner_email: user.email, platform: 'discord' }, { limit: 1 }),
      )[0];
      if (existing) return Response.json({ integration: stripSecrets(existing) });

      const created = await base44.entities.BotIntegration.create({
        owner_email: user.email,
        owner_user_id: user.id,
        platform: 'discord',
        channel_id: String(body?.channel_id || '').trim().slice(0, 64),
        channel_name: name,
        account_mode: 'bot',
        enabled: true,
        status: 'connected',
        settings: sanitizeSettings(defaultSettings()),
        updated_at: now,
      });
      return Response.json({ integration: stripSecrets(created) });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}