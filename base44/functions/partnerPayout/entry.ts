import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req: Request): Promise<Response> {
  try {
    const cronSecret = req.headers.get('x-cron-secret') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const isAuthorizedByToken = cronSecret && cronSecret === process.env.CRON_SECRET;

    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch { /* not authenticated */ }

    if (!isAuthorizedByToken) {
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'runPayout';
    if (action !== 'runPayout') {
      return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const THIRTY_DAYS_MS = 27 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const nowIso = now.toISOString();

    // Fetch all active partners (service role — admin-level operation)
    const partners = await base44.asServiceRole.entities.Affiliation.filter({ status: 'partner' });

    let credited = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const partner of partners) {
      try {
        const last = partner.last_trix_payout_at ? new Date(partner.last_trix_payout_at).getTime() : 0;
        if (last && now.getTime() - last < THIRTY_DAYS_MS) {
          skipped++;
          continue;
        }

        const amount = partner.trix_per_month ?? 1000;

        // Credit TRIX balance on the User entity
        const target = await base44.asServiceRole.entities.User.filter({ email: partner.user_email });
        const targetUser = (target?.items || target || [])[0];
        if (!targetUser) {
          errors.push(`No user found for ${partner.user_email}`);
          continue;
        }
        const newBalance = (targetUser.trix_balance || 0) + amount;
        await base44.asServiceRole.entities.User.update(targetUser.id, { trix_balance: newBalance });

        // Log the transaction
        await base44.asServiceRole.entities.WalletTransaction.create({
          user_email: partner.user_email,
          type: 'deposit',
          amount,
          description: 'Partenaire Matrix — TRIX mensuels',
          universe: 'general',
        });

        // Update payout timestamp
        await base44.asServiceRole.entities.Affiliation.update(partner.id, {
          last_trix_payout_at: nowIso,
        });

        credited++;
      } catch (err) {
        errors.push(`${partner.user_email}: ${err.message}`);
      }
    }

    console.log(`[partnerPayout] credited=${credited} skipped=${skipped} errors=${errors.length}`);
    return Response.json({
      success: true,
      credited,
      skipped,
      totalPartners: partners.length,
      errors: errors.slice(0, 20),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}