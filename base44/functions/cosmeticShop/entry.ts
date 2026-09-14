import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

function normalizeAssetUrl(value: unknown, { allowText = false }: { allowText?: boolean } = {}): string {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  if (raw.startsWith('//')) return `https:${raw}`;
  if (raw.startsWith('/')) return raw;
  if (/^[a-z][a-z\d+.-]*:/i.test(raw)) return allowText ? raw : '';
  if (raw.includes('/') || /\.(png|jpe?g|gif|webp|svg|avif|bmp|mp4|webm|mov|m4v|ogg)([?#].*)?$/i.test(raw)) {
    const noRelativePrefix = raw.replace(/^\.?\//, '');
    return `/${noRelativePrefix.replace(/^\/+/, '')}`;
  }
  return allowText ? raw : '';
}

// ---- Stripe webhook signature verification (Web Crypto API) ----
async function verifyStripeSignature(payload: string, signatureHeader: string, secret: string): Promise<boolean> {
  const parts = signatureHeader.split(',');
  const timestampPart = parts.find(p => p.startsWith('t='));
  const signaturePart = parts.find(p => p.startsWith('v1='));
  if (!timestampPart || !signaturePart) return false;

  const timestamp = timestampPart.split('=')[1];
  const signature = signaturePart.split('=')[1];
  if (!timestamp || !signature) return false;

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
    const STRIPE_PUBLISHABLE_KEY = secrets.get('STRIPE_PUBLISHABLE_KEY');
    const ALLOWED_ORIGINS = ['https://matrix-hub.base44.app', 'https://www.matrix-hub.base44.app'];
    const requestOrigin = req.headers.get('origin') || '';
    const origin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : 'https://matrix-hub.base44.app';

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

      console.log('[cosmeticShop] webhook received:', eventType);

      if (eventType === 'checkout.session.completed' && data) {
        const type = data.metadata?.type;

        if (type === 'cosmetic_purchase') {
          const itemId = data.metadata?.item_id;
          const userEmail = data.metadata?.user_email || data.customer_email || '';
          const userId = data.metadata?.user_id || '';

          // Idempotency check
          const existing = await base44.asServiceRole.entities.TrixTransaction.filter({
            user_email: userEmail,
            description: { $regex: data.id },
          });

          if (existing.length === 0 && itemId && userId) {
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
                  quantity: 1,
                  video_url: shopItem.video_url || "",
                  preview_image: shopItem.preview_image || "",
                  anim_config: shopItem.anim_config || undefined,
                });
              } else {
                // Increment quantity instead of duplicating
                const existingItem = existingCosm[0];
                await base44.asServiceRole.entities.UserCosmetic.update(existingItem.id, {
                  quantity: (existingItem.quantity || 1) + 1,
                });
              }
              await base44.asServiceRole.entities.User.update(userId, {
                stripe_customer_id: data.customer || undefined,
              });
            }
            await base44.asServiceRole.entities.TrixTransaction.create({
              user_email: userEmail, type: 'cosmetic', amount: 0,
              description: `Achat cosmétique ${itemId} - ${(data.amount_total / 100).toFixed(2)}€ (session ${data.id})`,
            });
          }
          return Response.json({ received: true });
        }
      }

      return Response.json({ received: true });
    }

    // ================================================================
    // JSON API — user-invoked actions
    // ================================================================
    const body = JSON.parse(rawBody);
    const { action } = body;
    const base44 = createClientFromRequest(req);

    // ---- createItem (admin only) ----
    if (action === 'createItem') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
      }

      const { name, description, category, rarity, price_euros, icon, preview_image, video_url, anim_config } = body;
      if (!name || !category || !price_euros || price_euros < 0.5) {
        return Response.json({ error: 'Nom, catégorie et prix (min 0.50€) requis' }, { status: 400 });
      }
      const normalizedIcon = normalizeAssetUrl(icon, { allowText: true });
      const normalizedPreviewImage = normalizeAssetUrl(preview_image);
      const normalizedVideoUrl = normalizeAssetUrl(video_url);

      const euroCents = Math.round(price_euros * 100);

      // Create Stripe Product
      const productParams = new URLSearchParams();
      productParams.append('name', name);
      if (description) productParams.append('description', description);
      productParams.append('metadata[type]', 'cosmetic');
      productParams.append('metadata[category]', category);

      const productRes = await fetch('https://api.stripe.com/v1/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: productParams,
      });
      const product = await productRes.json();
      if (product.error) {
        return Response.json({ error: `Stripe Product: ${product.error.message}` }, { status: 400 });
      }

      // Create Stripe Price
      const priceParams = new URLSearchParams();
      priceParams.append('product', product.id);
      priceParams.append('currency', 'eur');
      priceParams.append('unit_amount', String(euroCents));

      const priceRes = await fetch('https://api.stripe.com/v1/prices', {
        method: 'POST',
        headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: priceParams,
      });
      const price = await priceRes.json();
      if (price.error) {
        return Response.json({ error: `Stripe Price: ${price.error.message}` }, { status: 400 });
      }

      // Save to database with Stripe IDs
      const item = await base44.asServiceRole.entities.MatrixShopItem.create({
        name,
        description: description || '',
        category,
        rarity: rarity || 'common',
        price_trix: euroCents, // 1 Trix = 1 cent → price_trix = euroCents (backward compat)
        price_euros,
        icon: normalizedIcon,
        preview_image: normalizedPreviewImage,
        video_url: normalizedVideoUrl,
        stripe_product_id: product.id,
        stripe_price_id: price.id,
        is_active: true,
        anim_config: anim_config || undefined,
      });

      console.log('[cosmeticShop] Item created:', item.id, 'Stripe Product:', product.id, 'Price:', price.id);

      return Response.json({ success: true, item });
    }

    // ---- updateItem (admin only) ----
    if (action === 'updateItem') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
      }

      const { itemId, name, description, category, rarity, price_euros, icon, preview_image, video_url, is_active, anim_config } = body;
      if (!itemId) return Response.json({ error: 'itemId requis' }, { status: 400 });

      const shopItem = await base44.asServiceRole.entities.MatrixShopItem.get(itemId);
      if (!shopItem) return Response.json({ error: 'Article introuvable' }, { status: 404 });

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (category !== undefined) updates.category = category;
      if (rarity !== undefined) updates.rarity = rarity;
      if (icon !== undefined) updates.icon = normalizeAssetUrl(icon, { allowText: true });
      if (preview_image !== undefined) updates.preview_image = normalizeAssetUrl(preview_image);
      if (video_url !== undefined) updates.video_url = normalizeAssetUrl(video_url);
      if (is_active !== undefined) updates.is_active = is_active;
      if (anim_config !== undefined) updates.anim_config = anim_config;

      // If price changed, create a new Stripe Price
      if (price_euros !== undefined && price_euros !== shopItem.price_euros && price_euros >= 0.5) {
        const euroCents = Math.round(price_euros * 100);

        const priceParams = new URLSearchParams();
        priceParams.append('product', shopItem.stripe_product_id);
        priceParams.append('currency', 'eur');
        priceParams.append('unit_amount', String(euroCents));

        const priceRes = await fetch('https://api.stripe.com/v1/prices', {
          method: 'POST',
          headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: priceParams,
        });
        const price = await priceRes.json();
        if (price.error) {
          return Response.json({ error: `Stripe Price: ${price.error.message}` }, { status: 400 });
        }

        updates.price_euros = price_euros;
        updates.price_trix = euroCents;
        updates.stripe_price_id = price.id;

        // Deactivate old price
        if (shopItem.stripe_price_id) {
          await fetch(`https://api.stripe.com/v1/prices/${shopItem.stripe_price_id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ active: 'false' }),
          });
        }
      }

      // Update Stripe Product if name/description changed
      if ((name !== undefined && name !== shopItem.name) || (description !== undefined && description !== shopItem.description)) {
        const productParams = new URLSearchParams();
        if (name !== undefined) productParams.append('name', name);
        if (description !== undefined) productParams.append('description', description);

        await fetch(`https://api.stripe.com/v1/products/${shopItem.stripe_product_id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: productParams,
        });
      }

      await base44.asServiceRole.entities.MatrixShopItem.update(itemId, updates);

      // Propagate anim_config changes to all owned copies (UserCosmetic)
      if (anim_config !== undefined || icon !== undefined || preview_image !== undefined || video_url !== undefined) {
        const ownedCopies = await base44.asServiceRole.entities.UserCosmetic.filter({ item_id: itemId });
        if (ownedCopies.length > 0) {
          const userCosmeticUpdates: any = {};
          if (anim_config !== undefined) userCosmeticUpdates.anim_config = anim_config;
          if (icon !== undefined) userCosmeticUpdates.icon = updates.icon;
          if (preview_image !== undefined) userCosmeticUpdates.preview_image = updates.preview_image;
          if (video_url !== undefined) userCosmeticUpdates.video_url = updates.video_url;
          await base44.asServiceRole.entities.UserCosmetic.bulkUpdate(
            ownedCopies.map(c => ({ id: c.id, ...userCosmeticUpdates }))
          );
        }
      }

      return Response.json({ success: true });
    }

    // ---- deleteItem (admin only) ----
    if (action === 'deleteItem') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
      }

      const { itemId } = body;
      if (!itemId) return Response.json({ error: 'itemId requis' }, { status: 400 });

      const shopItem = await base44.asServiceRole.entities.MatrixShopItem.get(itemId);
      if (!shopItem) return Response.json({ error: 'Article introuvable' }, { status: 404 });

      // Deactivate Stripe Product
      if (shopItem.stripe_product_id) {
        await fetch(`https://api.stripe.com/v1/products/${shopItem.stripe_product_id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ active: 'false' }),
        });
      }

      await base44.asServiceRole.entities.MatrixShopItem.delete(itemId);
      return Response.json({ success: true });
    }

    // ---- createCheckout (user) ----
    if (action === 'createCheckout') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { itemId } = body;
      if (!itemId) return Response.json({ error: 'Article manquant' }, { status: 400 });

      const shopItem = await base44.asServiceRole.entities.MatrixShopItem.get(itemId);
      if (!shopItem || !shopItem.is_active) {
        return Response.json({ error: 'Article invalide' }, { status: 400 });
      }

      const params = new URLSearchParams();
      params.append('payment_method_types[]', 'card');
      params.append('mode', 'payment');
      params.append('ui_mode', 'embedded');
      params.append('return_url', `${origin}`);
      params.append('customer_email', user.email);

      // Use pre-created Stripe Price ID if available, otherwise inline price_data
      if (shopItem.stripe_price_id) {
        params.append('line_items[0][price]', shopItem.stripe_price_id);
        params.append('line_items[0][quantity]', '1');
      } else {
        const euroCents = Math.round((shopItem.price_euros || shopItem.price_trix / 100) * 100);
        params.append('line_items[0][price_data][currency]', 'eur');
        params.append('line_items[0][price_data][product_data][name]', shopItem.name);
        params.append('line_items[0][price_data][unit_amount]', String(euroCents));
        params.append('line_items[0][quantity]', '1');
      }

      // params.append('success_url', `${origin}/boutique-matrix?payment=success&session_id={CHECKOUT_SESSION_ID}`);
      // params.append('cancel_url', `${origin}/boutique-matrix?payment=cancelled`);
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

      return Response.json({ clientSecret: session.client_secret, sessionId: session.id, publishableKey: STRIPE_PUBLISHABLE_KEY });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}