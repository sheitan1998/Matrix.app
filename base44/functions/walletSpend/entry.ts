import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { requireUser, rateLimitByIp, debitTrix, sanitizeText, errorResponse, HttpError } from '../../shared/security.ts';

const XP_BOOSTERS = [
  { id: 'xp_x2_1h', multiplier: 2, duration_hours: 1, price_trix: 500 },
  { id: 'xp_x2_24h', multiplier: 2, duration_hours: 24, price_trix: 2000 },
  { id: 'xp_x3_24h', multiplier: 3, duration_hours: 24, price_trix: 5000 },
  { id: 'xp_x2_7d', multiplier: 2, duration_hours: 168, price_trix: 10000 },
];

const SUB_TIERS = [
  { key: 'supporter', price: 500 },
  { key: 'premium', price: 1500 },
  { key: 'vip', price: 3000 },
];

export default async function(req: Request): Promise<Response> {
  try {
    const sdk = createClientFromRequest(req);
    const user = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (!rateLimitByIp(req, `wallet:${user.email}`, 20, 60_000)) {
      return errorResponse(429, 'Trop de transactions. Réessayez dans un instant.');
    }

    if (action === 'channelSubscription') {
      const tierKey = sanitizeText(body?.tier, 50);
      const channelId = sanitizeText(body?.channelId, 100);
      const channelName = sanitizeText(body?.channelName, 200);
      if (!tierKey || !channelId) return errorResponse(400, 'Paramètres manquants.');

      const tier = SUB_TIERS.find((t) => t.key === tierKey);
      if (!tier) return errorResponse(400, 'Tier invalide.');

      const debited = await debitTrix(sdk, user.email, tier.price);
      if (!debited) return errorResponse(400, 'Solde TRIX insuffisant.');

      const existing = await sdk.asServiceRole.entities.Subscription.filter(
        { user_email: user.email, channel_id: channelId },
        { limit: 1 }
      );
      const existingSub = existing.items?.[0];
      let sub;
      if (existingSub) {
        sub = await sdk.asServiceRole.entities.Subscription.update(existingSub.id, { tier: tier.key });
      } else {
        sub = await sdk.asServiceRole.entities.Subscription.create({
          user_email: user.email,
          channel_id: channelId,
          channel_name: channelName,
          tier: tier.key,
          notifications_enabled: true,
        });
        await sdk.asServiceRole.entities.Channel.update(channelId, {
          subscribers_count: 1,
        });
      }
      await sdk.asServiceRole.entities.Channel.update(channelId, {
        trix_received: 1,
      });
      await sdk.asServiceRole.entities.TrixTransaction.create({
        user_email: user.email,
        type: 'subscription_payment',
        amount: -tier.price,
        target_channel_id: channelId,
        target_channel_name: channelName,
        description: `Abonnement ${tier.key} à ${channelName}`,
      });
      return Response.json({ data: sub });
    }

    if (action === 'liveDonation') {
      const amount = Number(body?.amount);
      const videoId = sanitizeText(body?.videoId, 100);
      const channelId = sanitizeText(body?.channelId, 100);
      const channelName = sanitizeText(body?.channelName, 200);
      const message = sanitizeText(body?.message, 500);
      if (!amount || amount <= 0 || !videoId) return errorResponse(400, 'Paramètres manquants.');

      const debited = await debitTrix(sdk, user.email, amount);
      if (!debited) return errorResponse(400, 'Solde TRIX insuffisant.');

      if (channelId) {
        await sdk.asServiceRole.entities.Channel.update(channelId, {
          trix_received: 1,
        });
      }
      await sdk.asServiceRole.entities.ChatMessage.create({
        video_id: videoId,
        author_email: user.email,
        author_name: user.full_name,
        author_avatar: user.avatar_url,
        content: message || `a envoyé ${amount} TRIX`,
        type: 'trix_donation',
        trix_amount: amount,
        is_premium: !!user.is_premium,
      });
      await sdk.asServiceRole.entities.TrixTransaction.create({
        user_email: user.email,
        type: 'donation',
        amount: -amount,
        target_channel_id: channelId,
        target_channel_name: channelName,
        video_id: videoId,
        description: `Don de ${amount} TRIX à ${channelName}`,
      });
      return Response.json({ data: { ok: true } });
    }

    if (action === 'xpBooster') {
      const boosterId = sanitizeText(body?.boosterId, 50);
      const booster = XP_BOOSTERS.find((b) => b.id === boosterId);
      if (!booster) return errorResponse(400, 'Booster invalide.');

      const debited = await debitTrix(sdk, user.email, booster.price_trix);
      if (!debited) return errorResponse(400, 'Solde TRIX insuffisant.');

      await sdk.asServiceRole.entities.TrixTransaction.create({
        user_email: user.email,
        type: 'purchase',
        amount: -booster.price_trix,
        description: `Booster XP x${booster.multiplier} (${booster.duration_hours}h)`,
      });
      return Response.json({ data: booster });
    }

    if (action === 'cancelPremium') {
      await sdk.asServiceRole.entities.User.update(user.id, { is_premium: false, premium_until: null });
      return Response.json({ data: { ok: true } });
    }

    return errorResponse(400, `Action inconnue: ${action}`);
  } catch (err) {
    if (err instanceof HttpError) return errorResponse(err.status, err.message);
    console.error('[walletSpend] error:', err);
    return errorResponse(500, 'Erreur lors de la transaction.');
  }
}