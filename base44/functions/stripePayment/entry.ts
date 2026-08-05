import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

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
      const { priceCents, trixTotal, packLabel } = body;
      if (!priceCents || !trixTotal) return Response.json({ error: 'Paramètres manquants' }, { status: 400 });

      const params = new URLSearchParams();
      params.append('payment_method_types[]', 'card');
      params.append('mode', 'payment');
      params.append('customer_email', user.email);
      params.append('line_items[0][price_data][currency]', 'eur');
      params.append('line_items[0][price_data][product_data][name]', packLabel || 'Pack TRIX');
      params.append('line_items[0][price_data][unit_amount]', String(priceCents));
      params.append('line_items[0][quantity]', '1');
      params.append('success_url', `${origin}/trix-store?success=true&session_id={CHECKOUT_SESSION_ID}`);
      params.append('cancel_url', `${origin}/trix-store?canceled=true`);
      params.append('metadata[type]', 'trix_purchase');
      params.append('metadata[user_email]', user.email);
      params.append('metadata[user_id]', user.id);
      params.append('metadata[trix_amount]', String(trixTotal));
      params.append('metadata[pack_label]', packLabel || '');

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

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}