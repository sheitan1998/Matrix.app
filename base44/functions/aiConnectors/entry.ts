import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { AI_TIER_PLANS, normalizeTier } from '../../shared/aiPlans.ts';
import {
  GOOGLE_SCOPES,
  buildGoogleAuthUrl,
  decryptToken,
  encryptToken,
  exchangeGoogleCode,
  googleConfig,
  revokeGoogleToken,
  signState,
  verifyState,
} from '../../shared/aiConnectors.ts';

// Connecteurs Matrix AI (Google Drive, OAuth 100% serveur). Les tokens ne sont jamais renvoyés au client.

async function findConnector(base44, userId: string) {
  const page = await base44.asServiceRole.entities.AiConnector.filter(
    { user_id: userId, provider: 'google_drive' },
    '-created_date',
    1,
  );
  return (page?.items || page || [])[0] || null;
}

function publicState(connector, config, eligible: boolean) {
  let state = 'disconnected';
  if (!config.configured) state = 'not_configured';
  else if (!eligible) state = 'upgrade_required';
  else if (connector?.status === 'error') state = 'reauth_required';
  else if (connector?.status === 'connected') state = 'connected';
  else if (config.reviewPending) state = 'pending_review';
  return {
    provider: 'google_drive',
    state,
    configured: config.configured,
    eligible,
    review_pending: config.reviewPending,
    account_email: connector?.account_email || '',
    connected_at: connector?.connected_at || null,
    scopes: connector?.scopes || GOOGLE_SCOPES.join(' '),
  };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body?.action || 'status';
    const config = googleConfig();

    const account = await base44.asServiceRole.entities.User.get(user.id);
    const eligible = AI_TIER_PLANS[normalizeTier(account.plan_tier)].connectors;
    const connector = await findConnector(base44, user.id);

    if (action === 'status') {
      return Response.json({ connectors: [publicState(connector, config, eligible)] });
    }

    if (action === 'connect') {
      if (!config.configured) {
        return Response.json({ error: 'not_configured', message: "Le connecteur Google Drive n'est pas encore configuré." }, { status: 503 });
      }
      if (!eligible) {
        return Response.json({ error: 'upgrade_required', message: 'Les connecteurs sont inclus à partir de Matrix Plus.' }, { status: 403 });
      }
      const state = await signState(user.id, config.encryptionKey);
      return Response.json({ auth_url: buildGoogleAuthUrl(config, state), review_pending: config.reviewPending });
    }

    if (action === 'callback') {
      if (!config.configured) return Response.json({ error: 'not_configured' }, { status: 503 });
      if (!eligible) return Response.json({ error: 'upgrade_required' }, { status: 403 });

      if (body?.error) {
        const denied = ['access_denied', 'admin_policy_enforced'].includes(String(body.error));
        return Response.json(
          {
            error: denied ? 'access_denied' : 'oauth_error',
            message: denied
              ? 'Autorisation Google refusée ou application en attente de validation.'
              : 'Connexion Google impossible.',
          },
          { status: 400 },
        );
      }

      const code = String(body?.code || '');
      if (!code || !(await verifyState(String(body?.state || ''), user.id, config.encryptionKey))) {
        return Response.json({ error: 'invalid_state', message: 'Demande de connexion invalide ou expirée.' }, { status: 400 });
      }

      const { tokens, email } = await exchangeGoogleCode(config, code);
      const patch: Record<string, unknown> = {
        user_id: user.id,
        provider: 'google_drive',
        status: 'connected',
        account_email: email,
        scopes: String(tokens.scope || GOOGLE_SCOPES.join(' ')),
        access_token_enc: await encryptToken(tokens.access_token, config.encryptionKey),
        expires_at: new Date(Date.now() + Number(tokens.expires_in || 3600) * 1000).toISOString(),
        connected_at: new Date().toISOString(),
      };
      // Google ne renvoie le refresh token qu'au premier consentement : on conserve l'ancien sinon.
      if (tokens.refresh_token) patch.refresh_token_enc = await encryptToken(tokens.refresh_token, config.encryptionKey);

      const saved = connector
        ? await base44.asServiceRole.entities.AiConnector.update(connector.id, patch)
        : await base44.asServiceRole.entities.AiConnector.create(patch);
      return Response.json({ connector: publicState(saved, config, true) });
    }

    if (action === 'disconnect') {
      if (connector) {
        const token = connector.refresh_token_enc || connector.access_token_enc;
        if (config.configured && token) {
          const plain = await decryptToken(token, config.encryptionKey).catch(() => '');
          if (plain) await revokeGoogleToken(plain);
        }
        await base44.asServiceRole.entities.AiConnector.delete(connector.id);
      }
      return Response.json({ connector: publicState(null, config, eligible) });
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    if ((error as any)?.code === 'invalid_grant') {
      return Response.json({ error: 'invalid_state', message: 'Code Google expiré, relance la connexion.' }, { status: 400 });
    }
    return Response.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
