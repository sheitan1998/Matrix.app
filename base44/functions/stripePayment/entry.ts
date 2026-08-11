import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// ---- Server-side catalogs (client sends only IDs; backend determines prices) ----
const TRIX_PACKS: Record<string, { priceCents: number; trixTotal: number; label: string }> = {
  pack_500:   { priceCents: 499,   trixTotal: 500,   label: 'Pack 500 TRIX' },
  pack_1400:  { priceCents: 999,   trixTotal: 1400,  label: 'Pack 1 200 TRIX' },
  pack_3750:  { priceCents: 2499,  trixTotal: 3750,  label: 'Pack 3 000 TRIX' },
  pack_9000:  { priceCents: 4999,  trixTotal: 9000,  label: 'Pack 7 000 TRIX' },
  pack_20000: { priceCents: 9999,  trixTotal: 20000, label: 'Pack 15 000 TRIX' },
  pack_55000: { priceCents: 24999, trixTotal: 55000, label: 'Pack 40 000 TRIX' },
};

const NEXUS_ITEMS: Record<string, { trixPrice: number; euroCents: number; label: string; count: number; category: string }> = {
  flash_1:  { trixPrice: 100, euroCents: 100, label: 'Post Flash ×1',  count: 1,  category: 'flash' },
  flash_3:  { trixPrice: 250, euroCents: 250, label: 'Post Flash ×3',  count: 3,  category: 'flash' },
  flash_10: { trixPrice: 800, euroCents: 800, label: 'Post Flash ×10', count: 10, category: 'flash' },
};

const VIP_PLANS: Record<string, { priceCents: number; label: string }> = {
  monthly: { priceCents: 499,  label: 'VIP Mensuel' },
  yearly:  { priceCents: 4999, label: 'VIP Annuel' },
};

// ---- Stripe webhook signature verification (Web Crypto API) ----
async function verifyStripeSignature(payload: string, signatureHeader: string, secret: string): Promise<boolean> {
  const parts = signatureHeader.split(',');
  const timestampPart = parts.find(p => p.startsWith('t='));
  const signaturePart = parts.find(p => p.startsWith('v1='));
  if (!timestampPart || !signaturePart) return false;

  const timestamp = timestampPart.split('=')[1];
  const signature = signaturePart.split('=')[1];
  if (!timestamp || !signature) return false;

  // Reject if older than 5 minutes
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
  if (age > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expectedBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expectedHex = Array.from(new Uint8Array(expectedBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

  return expectedHex === signature;
}

export default async function(req: Request): Promise<Response> {
  try {
    const rawBody = await req.text();
    const stripeKey = secrets.get('STRIPE_SECRET_KEY');
    const webhookSecret = secrets.get('STRIPE_WEBHOOK_SECRET');
    const origin = req.headers.get('origin') || 'https://matrix-hub.base44.app';

    // ================================================================
    // WEBHOOK HANDLER — Stripe sends events here (no user auth)
    // ================================================================
    const signature = req.headers.get('stripe-signature');
    if (signature && webhookSecret) {
      const isValid = await verifyStripeSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return Response.json({ error: 'Invalid signature' }, { status: 400 });
      }

      const event = JSON.parse(rawBody);
      const base44 = createClientFromRequest(req);
      const eventType = event.type;
      const data = event.data?.object;

      console.log('[stripePayment] webhook received:', eventType);

      // ---- checkout.session.completed ----
      if (eventType === 'checkout.session.completed' && data) {
        const type = data.metadata?.type;
        const userEmail = data.metadata?.user_email || data.customer_email || '';
        const userId = data.metadata?.user_id || '';

        // Idempotency check
        const existing = await base44.asServiceRole.entities.TrixTransaction.filter({
          user_email: userEmail,
          description: { $regex: data.id },
        });

        if (existing.length === 0) {
          if (type === 'trix_purchase') {
            const trixAmount = parseInt(data.metadata?.trix_amount || '0', 10);
            const packId = data.metadata?.pack_id;
            const pack = packId ? TRIX_PACKS[packId] : null;
            if (pack && pack.trixTotal === trixAmount && userId) {
              const target = await base44.asServiceRole.entities.User.get(userId);
              if (target) {
                const newBalance = (target.trix_balance || 0) + trixAmount;
                await base44.asServiceRole.entities.User.update(userId, { trix_balance: newBalance });
              }
            }
            await base44.asServiceRole.entities.TrixTransaction.create({
              user_email: userEmail,
              type: 'purchase',
              amount: trixAmount,
              description: `Achat Trix - ${(data.amount_total / 100).toFixed(2)}€ (session ${data.id})`,
            });
          }

          if (type === 'nexus_item_purchase') {
            const itemId = data.metadata?.item_id;
            const item = itemId ? NEXUS_ITEMS[itemId] : null;
            if (item && userId) {
              const target = await base44.asServiceRole.entities.User.get(userId);
              if (target) {
                const inventory = target.inventory || [];
                inventory.push({
                  item_id: itemId,
                  item_name: item.label,
                  category: item.category,
                  count: item.count,
                  purchased_at: new Date().toISOString(),
                });
                await base44.asServiceRole.entities.User.update(userId, { inventory, stripe_customer_id: data.customer || undefined });
              }
            }
            await base44.asServiceRole.entities.TrixTransaction.create({
              user_email: userEmail,
              type: 'nexus_item',
              amount: 0,
              description: `Achat Nexus ${itemId} - ${(data.amount_total / 100).toFixed(2)}€ (session ${data.id})`,
            });
          }

          if (type === 'donation') {
            await base44.asServiceRole.entities.TrixTransaction.create({
              user_email: userEmail,
              type: 'donation',
              amount: 0,
              description: `Don de ${(data.amount_total / 100).toFixed(2)}€ (session ${data.id})`,
            });
          }

          if (type === 'vip_subscription') {
            // For subscription checkout, the subscription ID is in data.subscription
            const subscriptionId = data.subscription;
            if (subscriptionId && userId) {
              const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
                headers: { Authorization: `Bearer ${stripeKey}` },
              });
              const sub = await subRes.json();
              const vipUntil = sub.current_period_end
                ? new Date(sub.current_period_end * 1000).toISOString()
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

              await base44.asServiceRole.entities.User.update(userId, {
                is_vip: true,
                vip_until: vipUntil,
                stripe_customer_id: data.customer || undefined,
              });
            }
            await base44.asServiceRole.entities.TrixTransaction.create({
              user_email: userEmail,
              type: 'vip',
              amount: 0,
              description: `Abonnement VIP - ${(data.amount_total / 100).toFixed(2)}€ (session ${data.id})`,
            });
          }

          if (type === 'nitro_subscription') {
            const nitroPlan = data.metadata?.nitro_plan || 'monthly';
            if (userId) {
              const target = await base44.asServiceRole.entities.User.get(userId);
              if (target) {
                await base44.asServiceRole.entities.User.update(userId, {
                  is_premium: true,
                  premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                });
              }
            }
            await base44.asServiceRole.entities.TrixTransaction.create({
              user_email: userEmail,
              type: 'nitro',
              amount: 0,
              description: `Abonnement Nitro ${nitroPlan} - ${(data.amount_total / 100).toFixed(2)}€ (session ${data.id})`,
            });
          }
        }
        return Response.json({ received: true });
      }

      // ---- customer.subscription.created / updated ----
      if ((eventType === 'customer.subscription.created' || eventType === 'customer.subscription.updated') && data) {
        const userId = data.metadata?.user_id;
        const userEmail = data.metadata?.user_email;
        if (userId) {
          const vipUntil = data.current_period_end
            ? new Date(data.current_period_end * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          await base44.asServiceRole.entities.User.update(userId, {
            is_vip: data.status === 'active' || data.status === 'trialing',
            vip_until: vipUntil,
            stripe_customer_id: data.customer || undefined,
          });
          console.log('[stripePayment] VIP updated:', userId, 'status:', data.status);
        }
        return Response.json({ received: true });
      }

      // ---- customer.subscription.deleted ----
      if (eventType === 'customer.subscription.deleted' && data) {
        const userId = data.metadata?.user_id;
        if (userId) {
          await base44.asServiceRole.entities.User.update(userId, {
            is_vip: false,
            vip_until: new Date().toISOString(),
          });
          console.log('[stripePayment] VIP revoked:', userId);
        }
        return Response.json({ received: true });
      }

      // Unhandled event type — acknowledge
      return Response.json({ received: true });
    }

    // ================================================================
    // JSON API — user-invoked actions
    // ================================================================
    const body = JSON.parse(rawBody);
    const { action } = body;

    const base44 = createClientFromRequest(req);

    // ---- verifySession (no auth required — called on redirect) ----
    if (action === 'verifySession') {
      const { sessionId } = body;
      if (!sessionId) return Response.json({ error: 'Missing sessionId' }, { status: 400 });

      const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${stripeKey}` },
      });
      const session = await res.json();
      if (session.error) return Response.json({ error: session.error.message }, { status: 400 });

      if (session.payment_status !== 'paid') {
        return Response.json({ success: false, status: session.payment_status });
      }

      const type = session.metadata?.type;
      const trixAmount = parseInt(session.metadata?.trix_amount || '0', 10);
      const userEmail = session.metadata?.user_email || session.customer_email || '';
      const userId = session.metadata?.user_id || '';

      // Idempotency
      const existing = await base44.asServiceRole.entities.TrixTransaction.filter({
        user_email: userEmail,
        description: { $regex: session.id },
      });
      if (existing.length > 0) {
        return Response.json({ success: true, alreadyProcessed: true, type, trixAmount });
      }

      if (type === 'trix_purchase' && trixAmount > 0) {
        const packId = session.metadata?.pack_id;
        const pack = packId ? TRIX_PACKS[packId] : null;
        if (!pack || pack.trixTotal !== trixAmount) {
          return Response.json({ error: 'Invalid trix amount for pack' }, { status: 400 });
        }
        if (userId) {
          const target = await base44.asServiceRole.entities.User.get(userId);
          if (target) {
            const newBalance = (target.trix_balance || 0) + trixAmount;
            await base44.asServiceRole.entities.User.update(userId, { trix_balance: newBalance });
          }
        }
        await base44.asServiceRole.entities.TrixTransaction.create({
          user_email: userEmail,
          type: 'purchase',
          amount: trixAmount,
          description: `Achat Trix - ${(session.amount_total / 100).toFixed(2)}€ (session ${session.id})`,
        });
        return Response.json({ success: true, type, credited: trixAmount });
      }

      if (type === 'nexus_item_purchase') {
        const itemId = session.metadata?.item_id;
        const item = itemId ? NEXUS_ITEMS[itemId] : null;
        if (item && userId) {
          const target = await base44.asServiceRole.entities.User.get(userId);
          if (target) {
            const inventory = target.inventory || [];
            inventory.push({
              item_id: itemId,
              item_name: item.label,
              category: item.category,
              count: item.count,
              purchased_at: new Date().toISOString(),
            });
            await base44.asServiceRole.entities.User.update(userId, { inventory });
          }
        }
        await base44.asServiceRole.entities.TrixTransaction.create({
          user_email: userEmail,
          type: 'nexus_item',
          amount: 0,
          description: `Achat Nexus ${itemId} - ${(session.amount_total / 100).toFixed(2)}€ (session ${session.id})`,
        });
        return Response.json({ success: true, type, itemId });
      }

      if (type === 'cosmetic_purchase') {
        const itemId = session.metadata?.item_id;
        if (itemId && userId) {
          const shopItem = await base44.asServiceRole.entities.MatrixShopItem.get(itemId);
          if (shopItem) {
            // Check if already owned
            const existingCosm = await base44.asServiceRole.entities.UserCosmetic.filter({
              user_email: userEmail, item_id: itemId,
            });
            if (existingCosm.length === 0) {
              await base44.asServiceRole.entities.UserCosmetic.create({
                user_email: userEmail, item_id: itemId, item_name: shopItem.name,
                category: shopItem.category, icon: shopItem.icon || "",
                rarity: shopItem.rarity || "common", is_equipped: false,
                video_url: shopItem.video_url || "",
                preview_image: shopItem.preview_image || "",
              });
            }
            await base44.asServiceRole.entities.User.update(userId, {
              stripe_customer_id: session.customer || undefined,
            });
          }
        }
        await base44.asServiceRole.entities.TrixTransaction.create({
          user_email: userEmail, type: 'cosmetic', amount: 0,
          description: `Achat cosmétique ${itemId} - ${(session.amount_total / 100).toFixed(2)}€ (session ${session.id})`,
        });
        return Response.json({ success: true, type, itemId });
      }

      if (type === 'cosmetic_purchase') {
        const itemId = session.metadata?.item_id;
        if (itemId && userId) {
          const shopItem = await base44.asServiceRole.entities.MatrixShopItem.get(itemId);
          if (shopItem) {
            const existingCosm = await base44.asServiceRole.entities.UserCosmetic.filter({
              user_email: userEmail, item_id: itemId,
            });
            if (existingCosm.length === 0) {
              await base44.asServiceRole.entities.UserCosmetic.create({
                user_email: userEmail, item_id: itemId, item_name: shopItem.name,
                category: shopItem.category, icon: shopItem.icon || "",
                rarity: shopItem.rarity || "common", is_equipped: false,
                video_url: shopItem.video_url || "",
                preview_image: shopItem.preview_image || "",
              });
            }
            await base44.asServiceRole.entities.User.update(userId, {
              stripe_customer_id: session.customer || undefined,
            });
          }
        }
        await base44.asServiceRole.entities.TrixTransaction.create({
          user_email: userEmail, type: 'cosmetic', amount: 0,
          description: `Achat cosmétique ${itemId} - ${(session.amount_total / 100).toFixed(2)}€ (session ${session.id})`,
        });
        return Response.json({ success: true, type, itemId });
      }

      if (type === 'donation') {
        await base44.asServiceRole.entities.TrixTransaction.create({
          user_email: userEmail,
          type: 'donation',
          amount: 0,
          description: `Don de ${(session.amount_total / 100).toFixed(2)}€ (session ${session.id})`,
        });
        return Response.json({ success: true, type, donationAmount: session.amount_total });
      }

      if (type === 'vip_subscription') {
        const subscriptionId = session.subscription;
        let vipUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        if (subscriptionId) {
          const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
            headers: { Authorization: `Bearer ${stripeKey}` },
          });
          const sub = await subRes.json();
          if (sub.current_period_end) {
            vipUntil = new Date(sub.current_period_end * 1000).toISOString();
          }
        }
        if (userId) {
          await base44.asServiceRole.entities.User.update(userId, {
            is_vip: true,
            vip_until: vipUntil,
            stripe_customer_id: session.customer || undefined,
          });
        }
        await base44.asServiceRole.entities.TrixTransaction.create({
          user_email: userEmail,
          type: 'vip',
          amount: 0,
          description: `Abonnement VIP - ${(session.amount_total / 100).toFixed(2)}€ (session ${session.id})`,
        });
        return Response.json({ success: true, type, vipUntil });
      }

      if (type === 'nitro_subscription') {
        const nitroPlan = session.metadata?.nitro_plan || 'monthly';
        if (userId) {
          await base44.asServiceRole.entities.User.update(userId, {
            is_premium: true,
            premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
        await base44.asServiceRole.entities.TrixTransaction.create({
          user_email: userEmail,
          type: 'nitro',
          amount: 0,
          description: `Abonnement Nitro ${nitroPlan} - ${(session.amount_total / 100).toFixed(2)}€ (session ${session.id})`,
        });
        return Response.json({ success: true, type, nitroPlan });
      }

      return Response.json({ error: 'Unknown session type' }, { status: 400 });
    }

    // ---- Auth required below ----
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // ---- createDonation ----
    if (action === 'createDonation') {
      const { amount } = body;
      if (!amount || amount < 100) return Response.json({ error: 'Montant minimum: 1€' }, { status: 400 });

      const params = new URLSearchParams();
      params.append('payment_method_types[]', 'card');
      params.append('mode', 'payment');
      params.append('customer_email', user.email);
      params.append('line_items[0][price_data][currency]', 'eur');
      params.append('line_items[0][price_data][product_data][name]', 'Don - MATRIX');
      params.append('line_items[0][price_data][unit_amount]', String(amount));
      params.append('line_items[0][quantity]', '1');
      params.append('success_url', `${origin}/?donation=success&session_id={CHECKOUT_SESSION_ID}`);
      params.append('cancel_url', `${origin}/?donation=canceled`);
      params.append('metadata[type]', 'donation');
      params.append('metadata[user_email]', user.email);
      params.append('metadata[user_id]', user.id);

      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      const session = await res.json();
      if (session.error) return Response.json({ error: session.error.message }, { status: 400 });
      return Response.json({ url: session.url });
    }

    // ---- createTrixPurchase ----
    if (action === 'createTrixPurchase') {
      const { packId } = body;
      const pack = packId ? TRIX_PACKS[packId] : null;
      if (!pack) return Response.json({ error: 'Pack invalide' }, { status: 400 });

      const params = new URLSearchParams();
      params.append('payment_method_types[]', 'card');
      params.append('mode', 'payment');
      params.append('customer_email', user.email);
      params.append('line_items[0][price_data][currency]', 'eur');
      params.append('line_items[0][price_data][product_data][name]', pack.label);
      params.append('line_items[0][price_data][unit_amount]', String(pack.priceCents));
      params.append('line_items[0][quantity]', '1');
      params.append('success_url', `${origin}/trix-store?payment=success&session_id={CHECKOUT_SESSION_ID}`);
      params.append('cancel_url', `${origin}/trix-store?payment=cancelled`);
      params.append('metadata[type]', 'trix_purchase');
      params.append('metadata[user_email]', user.email);
      params.append('metadata[user_id]', user.id);
      params.append('metadata[trix_amount]', String(pack.trixTotal));
      params.append('metadata[pack_id]', packId);

      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      const session = await res.json();
      if (session.error) return Response.json({ error: session.error.message }, { status: 400 });
      return Response.json({ url: session.url, sessionId: session.id });
    }

    // ---- createNexusItemPurchase (NEW) ----
    if (action === 'createNexusItemPurchase') {
      const { itemId } = body;
      const item = itemId ? NEXUS_ITEMS[itemId] : null;
      if (!item) return Response.json({ error: 'Article invalide' }, { status: 400 });

      const params = new URLSearchParams();
      params.append('payment_method_types[]', 'card');
      params.append('mode', 'payment');
      params.append('customer_email', user.email);
      params.append('line_items[0][price_data][currency]', 'eur');
      params.append('line_items[0][price_data][product_data][name]', item.label);
      params.append('line_items[0][price_data][unit_amount]', String(item.euroCents));
      params.append('line_items[0][quantity]', '1');
      params.append('success_url', `${origin}/boutique-nexus?payment=success&session_id={CHECKOUT_SESSION_ID}`);
      params.append('cancel_url', `${origin}/boutique-nexus?payment=cancelled`);
      params.append('metadata[type]', 'nexus_item_purchase');
      params.append('metadata[user_email]', user.email);
      params.append('metadata[user_id]', user.id);
      params.append('metadata[item_id]', itemId);

      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      const session = await res.json();
      if (session.error) return Response.json({ error: session.error.message }, { status: 400 });
      return Response.json({ url: session.url, sessionId: session.id });
    }

    // ---- createCosmeticPurchase (NEW) ----
    if (action === 'createCosmeticPurchase') {
      const { itemId } = body;
      if (!itemId) return Response.json({ error: 'Article manquant' }, { status: 400 });
      const shopItem = await base44.asServiceRole.entities.MatrixShopItem.get(itemId);
      if (!shopItem || !shopItem.is_active) return Response.json({ error: 'Article invalide' }, { status: 400 });
      const euroCents = Math.round(shopItem.price_trix); // 1 Trix = 0.01€ = 1 cent

      const params = new URLSearchParams();
      params.append('payment_method_types[]', 'card');
      params.append('mode', 'payment');
      params.append('customer_email', user.email);
      params.append('line_items[0][price_data][currency]', 'eur');
      params.append('line_items[0][price_data][product_data][name]', shopItem.name);
      params.append('line_items[0][price_data][unit_amount]', String(euroCents));
      params.append('line_items[0][quantity]', '1');
      params.append('success_url', `${origin}/boutique-matrix?payment=success&session_id={CHECKOUT_SESSION_ID}`);
      params.append('cancel_url', `${origin}/boutique-matrix?payment=cancelled`);
      params.append('metadata[type]', 'cosmetic_purchase');
      params.append('metadata[user_email]', user.email);
      params.append('metadata[user_id]', user.id);
      params.append('metadata[item_id]', itemId);

      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      const session = await res.json();
      if (session.error) return Response.json({ error: session.error.message }, { status: 400 });
      return Response.json({ url: session.url, sessionId: session.id });
    }

    // ---- createVIPSubscription (NEW) ----
    if (action === 'createVIPSubscription') {
      const { plan } = body;
      const selected = VIP_PLANS[plan] || VIP_PLANS.monthly;

      const params = new URLSearchParams();
      params.append('payment_method_types[]', 'card');
      params.append('mode', 'subscription');
      params.append('customer_email', user.email);
      params.append('line_items[0][price_data][currency]', 'eur');
      params.append('line_items[0][price_data][product_data][name]', selected.label);
      params.append('line_items[0][price_data][unit_amount]', String(selected.priceCents));
      params.append('line_items[0][price_data][recurring][interval]', plan === 'yearly' ? 'year' : 'month');
      params.append('line_items[0][quantity]', '1');
      params.append('success_url', `${origin}/trix-store?vip=success&session_id={CHECKOUT_SESSION_ID}`);
      params.append('cancel_url', `${origin}/trix-store?payment=cancelled`);
      params.append('metadata[type]', 'vip_subscription');
      params.append('metadata[user_email]', user.email);
      params.append('metadata[user_id]', user.id);
      params.append('metadata[plan]', plan || 'monthly');

      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      const session = await res.json();
      if (session.error) return Response.json({ error: session.error.message }, { status: 400 });
      return Response.json({ url: session.url, sessionId: session.id });
    }

    // ---- createCustomerPortal (NEW) ----
    if (action === 'createCustomerPortal') {
      // Look up Stripe customer ID from user
      let customerId = user.stripe_customer_id;

      // If no customer ID stored, look up by email
      if (!customerId) {
        const searchRes = await fetch(`https://api.stripe.com/v1/customers/search?query=email:${encodeURIComponent(user.email)}`, {
          headers: { Authorization: `Bearer ${stripeKey}` },
        });
        const searchResult = await searchRes.json();
        if (searchResult.data && searchResult.data.length > 0) {
          customerId = searchResult.data[0].id;
        }
      }

      if (!customerId) {
        return Response.json({ error: 'Aucun client Stripe trouvé' }, { status: 400 });
      }

      const params = new URLSearchParams();
      params.append('customer', customerId);
      params.append('return_url', `${origin}/mon-profil`);

      const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      const session = await res.json();
      if (session.error) return Response.json({ error: session.error.message }, { status: 400 });
      return Response.json({ url: session.url });
    }

    // ---- createNitroSubscription (existing) ----
    if (action === 'createNitroSubscription') {
      const { plan } = body;
      const plans = {
        monthly: { priceCents: 499, label: 'Nitro Mensuel' },
        yearly: { priceCents: 4999, label: 'Nitro Annuel' },
      };
      const selected = plans[plan] || plans.monthly;

      const params = new URLSearchParams();
      params.append('payment_method_types[]', 'card');
      params.append('mode', 'payment');
      params.append('customer_email', user.email);
      params.append('line_items[0][price_data][currency]', 'eur');
      params.append('line_items[0][price_data][product_data][name]', selected.label);
      params.append('line_items[0][price_data][unit_amount]', String(selected.priceCents));
      params.append('line_items[0][quantity]', '1');
      params.append('success_url', `${origin}/community?nitro=success&session_id={CHECKOUT_SESSION_ID}`);
      params.append('cancel_url', `${origin}/community?nitro=canceled`);
      params.append('metadata[type]', 'nitro_subscription');
      params.append('metadata[user_email]', user.email);
      params.append('metadata[user_id]', user.id);
      params.append('metadata[nitro_plan]', plan || 'monthly');

      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      const session = await res.json();
      if (session.error) return Response.json({ error: session.error.message }, { status: 400 });
      return Response.json({ url: session.url, sessionId: session.id });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}