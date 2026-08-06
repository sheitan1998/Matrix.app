import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// Server-side catalog of Trix packs — the client sends only a packId;
// the backend determines the price and trix amount. This prevents price/quantity
// falsification by the client.
const TRIX_PACKS: Record<string, { priceCents: number; trixTotal: number; label: string }> = {
  pack_500:   { priceCents: 499,   trixTotal: 500,   label: 'Pack 500 TRIX' },
  pack_1400:  { priceCents: 999,   trixTotal: 1400,  label: 'Pack 1 200 TRIX' },
  pack_3750:  { priceCents: 2499,  trixTotal: 3750,  label: 'Pack 3 000 TRIX' },
  pack_9000:  { priceCents: 4999,  trixTotal: 9000,  label: 'Pack 7 000 TRIX' },
  pack_20000: { priceCents: 9999,  trixTotal: 20000, label: 'Pack 15 000 TRIX' },
  pack_55000: { priceCents: 24999, trixTotal: 55000, label: 'Pack 40 000 TRIX' },
};

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const base44 = createClientFromRequest(req);
    const origin = req.headers.get('origin') || 'https://matrix-hub.base44.app';
    const stripeKey = secrets.get('STRIPE_SECRET_KEY');

    // ---- Verify a completed session and credit balance (no user auth required - called on redirect) ----
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

      // Idempotency: check if already processed
      const existing = await base44.asServiceRole.entities.TrixTransaction.filter({
        user_email: userEmail,
        type: type === 'trix_purchase' ? 'purchase' : 'donation',
        description: { $regex: session.id },
      });
      if (existing.length > 0) {
        return Response.json({ success: true, alreadyProcessed: true, type, trixAmount });
      }

      if (type === 'trix_purchase' && trixAmount > 0) {
        // Validate trix_amount against the server-side catalog using pack_id
        const packId = session.metadata?.pack_id;
        const pack = packId ? TRIX_PACKS[packId] : null;
        if (!pack || pack.trixTotal !== trixAmount) {
          return Response.json({ error: 'Invalid trix amount for pack' }, { status: 400 });
        }

        // Credit Trix balance via service role
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

        console.log('[stripePayment] trix credited:', trixAmount, 'for', userEmail);
        return Response.json({ success: true, type, credited: trixAmount });
      }

      if (type === 'donation') {
        await base44.asServiceRole.entities.TrixTransaction.create({
          user_email: userEmail,
          type: 'donation',
          amount: 0,
          description: `Don de ${(session.amount_total / 100).toFixed(2)}€ (session ${session.id})`,
        });

        console.log('[stripePayment] donation recorded:', session.amount_total, 'for', userEmail);
        return Response.json({ success: true, type, donationAmount: session.amount_total });
      }

      if (type === 'nitro_subscription') {
        const nitroPlan = session.metadata?.nitro_plan || 'monthly';
        if (userId) {
          const target = await base44.asServiceRole.entities.User.get(userId);
          if (target) {
            await base44.asServiceRole.entities.User.update(userId, {
              nitro: true,
              nitro_plan: nitroPlan,
              nitro_since: new Date().toISOString(),
            });
          }
        }
        await base44.asServiceRole.entities.TrixTransaction.create({
          user_email: userEmail,
          type: 'nitro',
          amount: 0,
          description: `Abonnement Nitro ${nitroPlan} - ${(session.amount_total / 100).toFixed(2)}€ (session ${session.id})`,
        });
        console.log('[stripePayment] nitro activated:', nitroPlan, 'for', userEmail);
        return Response.json({ success: true, type, nitroPlan });
      }

      return Response.json({ error: 'Unknown session type' }, { status: 400 });
    }

    // ---- Auth required for session creation ----
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // ---- Create a donation checkout session ----
    if (action === 'createDonation') {
      const { amount } = body; // amount in cents (EUR)
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
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const session = await res.json();
      if (session.error) return Response.json({ error: session.error.message }, { status: 400 });
      if (!session.url) return Response.json({ error: 'Erreur Stripe' }, { status: 500 });

      console.log('[stripePayment] donation session created:', session.id);
      return Response.json({ url: session.url });
    }

    // ---- Create a Trix purchase checkout session ----
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
      params.append('success_url', `${origin}/trix-store?success=true&session_id={CHECKOUT_SESSION_ID}`);
      params.append('cancel_url', `${origin}/trix-store?canceled=true`);
      params.append('metadata[type]', 'trix_purchase');
      params.append('metadata[user_email]', user.email);
      params.append('metadata[user_id]', user.id);
      params.append('metadata[trix_amount]', String(pack.trixTotal));
      params.append('metadata[pack_id]', packId);

      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const session = await res.json();
      if (session.error) return Response.json({ error: session.error.message }, { status: 400 });
      if (!session.url) return Response.json({ error: 'Erreur Stripe' }, { status: 500 });

      console.log('[stripePayment] trix session created:', session.id);
      return Response.json({ url: session.url, sessionId: session.id });
    }

    // ---- Create a Nitro subscription checkout session ----
    if (action === 'createNitroSubscription') {
      const { plan } = body; // 'monthly' or 'yearly'
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
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const session = await res.json();
      if (session.error) return Response.json({ error: session.error.message }, { status: 400 });
      if (!session.url) return Response.json({ error: 'Erreur Stripe' }, { status: 500 });

      console.log('[stripePayment] nitro session created:', session.id);
      return Response.json({ url: session.url, sessionId: session.id });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}