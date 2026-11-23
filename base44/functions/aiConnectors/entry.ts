import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { AI_TIER_PLANS, normalizeTier } from '../../shared/aiPlans.ts';
import {
  MAX_WEBHOOKS_PER_USER,
  WEBHOOK_TEST_COOLDOWN_MS,
  WebhookError,
  describeWebhookOutcome,
  maskWebhookUrl,
  normalizeWebhookName,
  runWebhookConnector,
  validateWebhookUrl,
} from '../../shared/aiConnectors.ts';

// Connecteurs Matrix AI : webhooks personnalisés. L'URL complète reste côté serveur (jamais renvoyée au client).

async function listWebhooks(base44, userId: string) {
  const page = await base44.asServiceRole.entities.AiConnector.filter(
    { user_id: userId, provider: 'webhook' },
    '-created_date',
    MAX_WEBHOOKS_PER_USER + 5,
  );
  return page?.items || page || [];
}

function publicWebhook(connector) {
  return {
    id: connector.id,
    name: connector.name,
    enabled: connector.enabled !== false,
    url_preview: maskWebhookUrl(connector.webhook_url),
    status: connector.status || 'untested',
    last_error: connector.last_error || '',
    last_triggered_at: connector.last_triggered_at || null,
  };
}

function fail(error: string, message: string, status: number) {
  return Response.json({ error, message }, { status });
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || 'status');

    const account = await base44.asServiceRole.entities.User.get(user.id);
    const eligible = AI_TIER_PLANS[normalizeTier(account.plan_tier)].connectors;
    const webhooks = await listWebhooks(base44, user.id);
    const payload = () => ({
      eligible,
      max_webhooks: MAX_WEBHOOKS_PER_USER,
      webhooks: webhooks.map(publicWebhook),
    });
    const owned = (id: unknown) => webhooks.find((w) => w.id === String(id || ''));

    if (action === 'status') {
      return Response.json(payload());
    }

    if (!eligible) {
      return fail('upgrade_required', 'Les connecteurs sont inclus à partir de Matrix Plus.', 403);
    }

    if (action === 'webhook_save') {
      const existing = body?.id ? owned(body.id) : null;
      if (body?.id && !existing) return fail('not_found', 'Webhook introuvable.', 404);
      if (!existing && webhooks.length >= MAX_WEBHOOKS_PER_USER) {
        return fail('limit_reached', `Tu peux enregistrer ${MAX_WEBHOOKS_PER_USER} webhooks maximum.`, 400);
      }
      if (!existing && !body?.url) return fail('invalid_url', "L'URL du webhook est obligatoire.", 400);

      const patch: Record<string, unknown> = { name: normalizeWebhookName(body?.name ?? existing?.name) };
      if (body?.url) {
        patch.webhook_url = await validateWebhookUrl(body.url);
        patch.status = 'untested';
        patch.last_error = '';
      }
      if (typeof body?.enabled === 'boolean') patch.enabled = body.enabled;

      const saved = existing
        ? await base44.asServiceRole.entities.AiConnector.update(existing.id, patch)
        : await base44.asServiceRole.entities.AiConnector.create({
          user_id: user.id,
          provider: 'webhook',
          enabled: true,
          status: 'untested',
          ...patch,
        });
      const next = existing ? webhooks.map((w) => (w.id === existing.id ? { ...w, ...saved } : w)) : [saved, ...webhooks];
      return Response.json({ eligible, max_webhooks: MAX_WEBHOOKS_PER_USER, webhooks: next.map(publicWebhook), saved_id: saved.id });
    }

    if (action === 'webhook_toggle') {
      const existing = owned(body?.id);
      if (!existing) return fail('not_found', 'Webhook introuvable.', 404);
      const enabled = Boolean(body?.enabled);
      await base44.asServiceRole.entities.AiConnector.update(existing.id, { enabled });
      existing.enabled = enabled;
      return Response.json(payload());
    }

    if (action === 'webhook_delete') {
      const existing = owned(body?.id);
      if (!existing) return fail('not_found', 'Webhook introuvable.', 404);
      await base44.asServiceRole.entities.AiConnector.delete(existing.id);
      webhooks.splice(webhooks.indexOf(existing), 1);
      return Response.json(payload());
    }

    if (action === 'webhook_test') {
      const existing = owned(body?.id);
      if (!existing) return fail('not_found', 'Webhook introuvable.', 404);
      const last = existing.last_triggered_at ? Date.parse(existing.last_triggered_at) : 0;
      if (Date.now() - last < WEBHOOK_TEST_COOLDOWN_MS) {
        return fail('rate_limited', 'Patiente quelques secondes avant un nouveau test.', 429);
      }
      const pseudo = user.pseudo || user.full_name || 'membre Matrix';
      const result = await runWebhookConnector(
        base44,
        existing,
        `Test Matrix AI : le webhook « ${existing.name} » est bien connecté (demandé par ${pseudo}).`,
        { pseudo, kind: 'test' },
      );
      existing.status = result.ok ? 'ok' : 'error';
      existing.last_error = result.ok ? '' : result.error || '';
      existing.last_triggered_at = new Date().toISOString();
      return Response.json({ ...payload(), result: { ok: result.ok, message: describeWebhookOutcome(existing.name, result) } });
    }

    return fail('unknown_action', 'Action inconnue', 400);
  } catch (error) {
    if (error instanceof WebhookError) {
      return Response.json({ error: error.code, message: error.message }, { status: 400 });
    }
    return Response.json({ error: (error as Error).message || 'Erreur serveur' }, { status: 500 });
  }
}
