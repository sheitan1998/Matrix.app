import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Le SDK peut renvoyer un tableau ou une page selon les options : on normalise.
const toArray = (res: any): any[] => (Array.isArray(res) ? res : (res?.items || []));

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const svc = base44.asServiceRole.entities;

    const creditTrix = async (email: string, amount: number, description: string) => {
      const amt = Math.round(Number(amount) || 0);
      if (!email || amt <= 0) return false;
      const found = toArray(await svc.User.filter({ email }));
      const target = found[0];
      if (!target) return false;
      await svc.User.update(target.id, { trix_balance: (target.trix_balance || 0) + amt });
      await svc.TrixTransaction.create({
        user_email: email,
        type: 'refund',
        amount: amt,
        description,
      });
      return true;
    };

    // ---- Historique des attributions d'un article ----
    if (action === 'owners') {
      const { item_id } = body;
      if (!item_id) return Response.json({ error: 'item_id requis' }, { status: 400 });
      const owners = toArray(await svc.UserCosmetic.filter({ item_id }, '-created_date', 500));
      return Response.json({ owners });
    }

    // ---- Remplacer un article possédé (un ou plusieurs propriétaires) ----
    if (action === 'replace') {
      const { ownership_ids = [], from_item_id, to_item_id, compensate_trix = 0, reason = '' } = body;
      if (!to_item_id) return Response.json({ error: 'Article cible requis' }, { status: 400 });

      const target = await svc.MatrixShopItem.get(to_item_id).catch((e: any) => (e.status === 404 ? null : Promise.reject(e)));
      if (!target) return Response.json({ error: 'Article cible introuvable' }, { status: 404 });

      let ids: string[] = Array.isArray(ownership_ids) ? ownership_ids : [];
      if (ids.length === 0) {
        if (!from_item_id) return Response.json({ error: 'Sélection requise' }, { status: 400 });
        ids = toArray(await svc.UserCosmetic.filter({ item_id: from_item_id }, '-created_date', 500)).map((r: any) => r.id);
      }

      const snapshot: Record<string, any> = {
        item_id: target.id,
        item_name: target.name,
        category: target.category,
        icon: target.icon || '',
        rarity: target.rarity || 'common',
        video_url: target.video_url || '',
        preview_image: target.preview_image || '',
      };
      if (target.anim_config) snapshot.anim_config = target.anim_config;

      let updated = 0;
      let compensated = 0;
      for (const id of ids) {
        const record = await svc.UserCosmetic.get(id).catch((e: any) => (e.status === 404 ? null : Promise.reject(e)));
        if (!record) continue;

        const dupe = toArray(await svc.UserCosmetic.filter({ user_email: record.user_email, item_id: target.id }));
        const existing = dupe.find((d: any) => d.id !== record.id);
        if (existing) {
          await svc.UserCosmetic.update(existing.id, {
            quantity: (existing.quantity || 1) + (record.quantity || 1),
          });
          await svc.UserCosmetic.delete(record.id);
        } else if (record.item_id !== target.id) {
          await svc.UserCosmetic.update(record.id, snapshot);
        }

        updated += 1;
        const ok = await creditTrix(
          record.user_email,
          compensate_trix,
          `Compensation cosmétique : « ${record.item_name || record.item_id} » remplacé par « ${target.name} »${reason ? ` — ${reason}` : ''}`
        );
        if (ok) compensated += 1;
      }
      return Response.json({ success: true, updated, compensated });
    }

    // ---- Retirer un article (avec dédommagement optionnel) ----
    if (action === 'remove') {
      const { ownership_ids = [], compensate_trix = 0, reason = '' } = body;
      if (!Array.isArray(ownership_ids) || ownership_ids.length === 0) {
        return Response.json({ error: 'Sélection requise' }, { status: 400 });
      }

      let removed = 0;
      let compensated = 0;
      for (const id of ownership_ids) {
        const record = await svc.UserCosmetic.get(id).catch((e: any) => (e.status === 404 ? null : Promise.reject(e)));
        if (!record) continue;
        await svc.UserCosmetic.delete(id);
        removed += 1;
        const ok = await creditTrix(
          record.user_email,
          compensate_trix,
          `Dédommagement : retrait de « ${record.item_name || record.item_id} »${reason ? ` — ${reason}` : ''}`
        );
        if (ok) compensated += 1;
      }
      return Response.json({ success: true, removed, compensated });
    }

    // ---- Créditer un dédommagement en Trix sans toucher à l'inventaire ----
    if (action === 'compensate') {
      const { user_email, amount_trix, reason = '' } = body;
      const amount = Math.round(Number(amount_trix) || 0);
      if (!user_email) return Response.json({ error: 'Joueur requis' }, { status: 400 });
      if (amount <= 0) return Response.json({ error: 'Montant invalide' }, { status: 400 });

      const ok = await creditTrix(
        user_email,
        amount,
        `Dédommagement boutique Matrix : ${amount} Trix${reason ? ` — ${reason}` : ''}`
      );
      if (!ok) return Response.json({ error: 'Joueur introuvable' }, { status: 404 });
      return Response.json({ success: true, amount });
    }

    return Response.json({ error: `Action inconnue : ${action}` }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}