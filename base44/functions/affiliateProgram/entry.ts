import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const PARTNER_VIEWS = 100000;
const PARTNER_SUBSCRIBERS = 10000;
const PARTNER_MIN_CONTENT = 5;
const MAX_LINKS = 5;

const cleanCode = (value) => String(value || "").trim().replace(/\s+/g, "").replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 32);
const toNumber = (value) => {
  const n = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
};

function normalizeLinks(input) {
  const list = Array.isArray(input) ? input : [];
  return list
    .map((l) => String(l || "").trim())
    .filter((l) => /^https?:\/\/\S+\.\S+/.test(l))
    .slice(0, MAX_LINKS);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const userEmail = user.email;
    const userName = user.pseudo || user.full_name || String(userEmail).split("@")[0];
    const code = cleanCode(body?.code) || cleanCode(user.pseudo) || cleanCode(String(userEmail).split("@")[0]);

    if (action === 'activateAffiliate') {
      const existingRes = await base44.asServiceRole.entities.Affiliation.filter({ user_email: userEmail }, { limit: 1 });
      const existing = existingRes?.items?.[0] || null;

      if (existing?.status === 'revoked') {
        return Response.json({ error: "Votre statut a été retiré. Contactez un administrateur." }, { status: 403 });
      }
      if (existing) {
        const patch = { referral_code: existing.referral_code || code };
        if (existing.status !== 'partner') {
          patch.status = 'affiliate';
          patch.approved_at = existing.approved_at || new Date().toISOString();
        }
        const updated = await base44.asServiceRole.entities.Affiliation.update(existing.id, patch);
        return Response.json({ affiliation: updated });
      }

      const created = await base44.asServiceRole.entities.Affiliation.create({
        user_email: userEmail,
        user_name: userName,
        user_avatar: user.avatar_url || "",
        status: 'affiliate',
        referral_code: code,
        approved_at: new Date().toISOString(),
        trix_per_month: 0,
      });
      return Response.json({ affiliation: created });
    }

    if (action === 'applyPartner') {
      const platform = String(body?.platform || "").trim();
      const subscribers = toNumber(body?.subscribers);
      const views = toNumber(body?.views);
      const contents = toNumber(body?.contents);
      const motivation = String(body?.motivation || "").trim();
      const links = normalizeLinks(body?.links);

      if (!platform || !motivation || links.length === 0) {
        return Response.json({ error: "Plateforme, liens et motivation sont requis." }, { status: 400 });
      }

      const missing = [];
      if (subscribers < PARTNER_SUBSCRIBERS) missing.push(`${PARTNER_SUBSCRIBERS.toLocaleString('fr-FR')} abonnés`);
      if (views < PARTNER_VIEWS) missing.push(`${PARTNER_VIEWS.toLocaleString('fr-FR')} vues cumulées`);
      if (contents < PARTNER_MIN_CONTENT) missing.push(`${PARTNER_MIN_CONTENT} contenus publiés`);
      if (missing.length > 0) {
        return Response.json({ error: `Seuils non atteints : ${missing.join(', ')}.` }, { status: 400 });
      }

      const pendingRes = await base44.asServiceRole.entities.SupportTicket.filter(
        { user_email: userEmail, program_type: 'partner', status: { $in: ['open', 'in_progress'] } },
        { limit: 1 }
      );
      if (pendingRes?.items?.[0]) {
        return Response.json({ error: "Une candidature Partenaire est déjà en attente." }, { status: 409 });
      }

      const ticket = await base44.asServiceRole.entities.SupportTicket.create({
        user_email: userEmail,
        user_name: userName,
        user_avatar: user.avatar_url || "",
        subject: "Candidature Partenaire",
        category: "affiliate_partner",
        program_type: "partner",
        message: [
          "Candidature Partenaire",
          `Plateforme : ${platform}`,
          `Abonnés : ${subscribers.toLocaleString('fr-FR')}`,
          `Vues cumulées : ${views.toLocaleString('fr-FR')}`,
          `Contenus publiés : ${contents}`,
          "",
          motivation,
        ].join("\n"),
        creator_description: `${contents} contenus publiés sur ${platform} (${subscribers.toLocaleString('fr-FR')} abonnés, ${views.toLocaleString('fr-FR')} vues cumulées).`,
        portfolio_links: links,
        status: "open",
        priority: "high",
      });

      return Response.json({ ticket });
    }

    if (action === 'trackReferral') {
      const refCode = cleanCode(body?.ref_code ?? body?.ref);
      if (!refCode) return Response.json({ tracked: false });

      const refRes = await base44.asServiceRole.entities.Affiliation.filter({ referral_code: refCode }, { limit: 1 });
      let referrer = refRes?.items?.[0] || null;

      // Any member can share his personal link: fall back to the pseudo.
      if (!referrer) {
        const userRes = await base44.asServiceRole.entities.User.filter({ pseudo: refCode }, { limit: 1 });
        const matched = userRes?.items?.[0] || null;
        if (matched) referrer = { user_email: matched.email };
      }
      if (!referrer || referrer.user_email === userEmail) return Response.json({ tracked: false });

      const alreadyRes = await base44.asServiceRole.entities.Referral.filter({ referred_email: userEmail }, { limit: 1 });
      if (alreadyRes?.items?.[0]) return Response.json({ tracked: false });

      await base44.asServiceRole.entities.Referral.create({
        referrer_email: referrer.user_email,
        referrer_code: refCode,
        referred_email: userEmail,
        referred_name: userName,
      });
      return Response.json({ tracked: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}