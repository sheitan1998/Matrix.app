import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { rateLimitByIp } from '../../shared/security.ts';
import { computeHmacSha256, sendVoteWebhook } from '../../shared/voteWebhook.ts';
import { VOTE_COOLDOWN_MS, getLastVote, processAllAutoVotes } from '../../shared/autoVote.ts';

const BOOST_COST = 500; // 500 Trix minimum per boost
const PLAYER_BOOST_COST = 50; // 50 Trix for player ad boost
const BOOST_DURATION_HOURS = 24;
const SERVER_BOOST_DURATION_DAYS = 30; // 30 days for community server boosts

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, ...params } = body;

    const base44 = createClientFromRequest(req);

    // ---- get server by invite code (auth required to prevent enumeration) ----
    if (action === 'getServerByInviteCode') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { inviteCode } = params;
      if (!inviteCode || typeof inviteCode !== 'string' || inviteCode.length < 3 || inviteCode.length > 64) {
        return Response.json({ error: 'Invalid invite code' }, { status: 400 });
      }
      if (!rateLimitByIp(req, 'inviteLookup', 30, 60_000)) {
        return Response.json({ error: 'Too many requests' }, { status: 429 });
      }
      const serverPage = await base44.asServiceRole.entities.Server.filter({ invite_code: inviteCode }, null, 1);
      const found = (serverPage?.items || serverPage || [])[0];
      if (!found) return Response.json({ error: 'Not found' }, { status: 404 });
      if (found.invite_expires_at && new Date(found.invite_expires_at).getTime() < Date.now()) {
        return Response.json({ error: 'This invite link has expired' }, { status: 410 });
      }
      return Response.json({
        id: found.id,
        name: found.name,
        description: found.description,
        icon_emoji: found.icon_emoji,
        icon_url: found.icon_url,
        banner_url: found.banner_url,
        banner_color: found.banner_color,
        visual_theme: found.visual_theme,
        theme: found.theme,
        is_public: found.is_public,
        members_count: found.members_count,
        boosts: found.boosts,
      });
    }

    const user = await base44.auth.me().catch(() => null);
    // Vote and getVoteStatus don't require auth (IP-based fallback for anonymous visitors)
    if (!user && action !== 'vote' && action !== 'getVoteStatus' && action !== 'getServerBySlug' && action !== 'trackClick') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ---- get server by slug (public - no auth required) ----
    if (action === 'getServerBySlug') {
      const { slug } = params;
      if (!slug || typeof slug !== 'string' || slug.length < 2 || slug.length > 128) {
        return Response.json({ error: 'Invalid slug' }, { status: 400 });
      }
      let serverPage = await base44.asServiceRole.entities.ServerAd.filter({ slug }, null, 1);
      let found = (serverPage?.items || serverPage || [])[0];
      // Fallback: try by ID if slug lookup fails
      if (!found) {
        try { found = await base44.asServiceRole.entities.ServerAd.get(slug); }
        catch { /* not found by ID either */ }
      }
      if (!found) return Response.json({ error: 'Not found' }, { status: 404 });
      return Response.json({
        id: found.id,
        title: found.title,
        slug: found.slug,
        description: found.description,
        server_type: found.server_type,
        category_id: found.category_id,
        category_slug: found.category_slug,
        logo_url: found.logo_url,
        banner_url: found.banner_url,
        profile_image: found.profile_image,
        cover_image: found.cover_image,
        discord_link: found.discord_link,
        website_url: found.website_url,
        ip: found.ip,
        port: found.port,
        discord_server_id: found.discord_server_id,
        game: found.game,
        category: found.category,
        votes: found.votes,
        votes_month: found.votes_month,
        boosts: found.boosts,
        is_boosted: found.is_boosted,
        boost_until: found.boost_until,
        players_count: found.players_count,
        max_players: found.max_players,
        author_name: found.author_name,
        author_avatar: found.author_avatar,
        created_date: found.created_date,
        is_owner: !!user && user.email === found.author_email,
        api_key: (!!user && user.email === found.author_email) ? found.api_key : undefined,
        webhook_url: (!!user && user.email === found.author_email) ? found.webhook_url : undefined,
      });
    }

    // System action: monthly reset of votes AND boosts (admin or cron only, 1st of each month)
    if (action === 'resetMonthly') {
      const apiKey = req.headers.get('x-api-key');
      const isAuthorized = (apiKey && apiKey === process.env.CRON_SECRET) || user.role === 'admin';
      if (!isAuthorized) return Response.json({ error: 'Forbidden' }, { status: 403 });
      // Archive current month values before resetting
      const allServersForArchive = await base44.asServiceRole.entities.ServerAd.list('-created_date', 500);
      for (const s of allServersForArchive) {
        await base44.asServiceRole.entities.ServerAd.update(s.id, {
          votes_last_month: s.votes_month || 0,
          clicks_last_month: s.clicks_month || 0,
        });
      }
      await base44.asServiceRole.entities.ServerAd.updateMany(
        {},
        { $set: { votes: 0, votes_month: 0, clicks: 0, clicks_month: 0, boosts: 0, is_boosted: false, boost_until: null } }
      );
      // Vote history (ServerVote) is intentionally preserved: only monthly counters/boosts reset.
      // Cooldowns are time-based (1h/2h), so no record deletion is needed to allow new votes.
      return Response.json({ success: true });
    }

    // System action: process all Vote Auto subscriptions (cron only, every hour)
    if (action === 'processAutoVotes') {
      const apiKey = req.headers.get('x-api-key');
      const isAuthorized = (apiKey && apiKey === process.env.CRON_SECRET) || user?.role === 'admin';
      if (!isAuthorized) return Response.json({ error: 'Forbidden' }, { status: 403 });

      const summary = await processAllAutoVotes(base44);
      console.log('[processAutoVotes]', JSON.stringify(summary));
      return Response.json({ success: true, processed: summary.voted, ...summary, timestamp: new Date().toISOString() });
    }

    switch (action) {

      // ---- Vote for a server (2h cooldown, no auth required - IP fallback) ----
      case 'vote': {
        const { serverAdId } = params;
        const voterPseudo = String(params.voterPseudo || '').trim().slice(0, 30);
        if (!serverAdId) return Response.json({ error: 'Missing serverAdId' }, { status: 400 });
        if (!voterPseudo) return Response.json({ error: 'Le pseudo en jeu est obligatoire pour voter.' }, { status: 400 });

        const voterEmail = user?.email || '';
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   req.headers.get('x-real-ip') || 'unknown';

        // Build query based on auth status (logged-in by email, anonymous by IP)
        const voteQuery = voterEmail
          ? { server_ad_id: serverAdId, user_email: voterEmail }
          : { server_ad_id: serverAdId, ip_address: ip };

        const lastVote = await getLastVote(base44, voteQuery);

        const now = Date.now();

        // VIP users get 1h cooldown instead of 2h
        // is_vip is set to false by the Stripe webhook on subscription deletion,
        // so if is_vip is true the subscription is active (even if vip_until is missing)
        const isVip = !!(user && user.is_vip && (!user.vip_until || new Date(user.vip_until).getTime() > now));
        const effectiveCooldown = isVip ? (1 * 60 * 60 * 1000) : VOTE_COOLDOWN_MS;

        if (lastVote) {
          const lastVoted = lastVote.last_voted_at
            ? new Date(lastVote.last_voted_at).getTime()
            : 0;
          const elapsed = now - lastVoted;

          if (elapsed < effectiveCooldown) {
            const remaining = effectiveCooldown - elapsed;
            return Response.json({
              success: false,
              error: 'cooldown',
              remainingMs: remaining,
              remainingTime: {
                h: Math.floor(remaining / (60 * 60 * 1000)),
                m: Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000)),
                s: Math.floor((remaining % (60 * 1000)) / 1000),
              },
            });
          }

        }

        // Always insert a new record so every manual vote stays in the history (never overwrite)
        await base44.asServiceRole.entities.ServerVote.create({
          server_ad_id: serverAdId,
          user_email: voterEmail || undefined,
          ip_address: voterEmail ? undefined : ip,
          voter_pseudo: voterPseudo,
          last_voted_at: new Date(now).toISOString(),
          vote_source: 'manual',
        });

        // Atomically increment vote + click counters (no read-then-write race condition)
        const voteAd = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        if (!voteAd) return Response.json({ error: 'Server not found' }, { status: 404 });
        await base44.asServiceRole.entities.ServerAd.updateMany(
          { id: serverAdId },
          { $inc: { votes: 1, votes_month: 1, clicks: 1, clicks_month: 1 } }
        );

        // Fire-and-forget: send webhook postback if configured
        if (voteAd.webhook_url && voteAd.api_key) {
          sendVoteWebhook(voteAd.webhook_url, voteAd.api_key, voterPseudo, serverAdId);
        }

        const freshAd = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        return Response.json({
          success: true,
          votes: freshAd.votes || 0,
          votes_month: freshAd.votes_month || 0,
          clicks: freshAd.clicks || 0,
          clicks_month: freshAd.clicks_month || 0,
        });
      }

      // ---- Boost a server ad: both Flash and Trix count as a vote ----
      case 'boost': {
        const { serverAdId, method } = params;
        if (!serverAdId) return Response.json({ error: 'Missing serverAdId' }, { status: 400 });

        const ad = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        if (!ad) return Response.json({ error: 'Server not found' }, { status: 404 });

        const nowIso = new Date().toISOString();
        const freshUser = await base44.asServiceRole.entities.User.get(user.id);
        const payment: Record<string, number> = {};

        if (method === 'trix') {
          const TRIX_BOOST_COST = 200;
          const userTrix = freshUser?.trix_balance || 0;
          if (userTrix < TRIX_BOOST_COST) {
            return Response.json({ error: 'Trix insuffisants (200 requis)', balance: userTrix, cost: TRIX_BOOST_COST }, { status: 400 });
          }
          payment.newBalance = userTrix - TRIX_BOOST_COST;
          await base44.asServiceRole.entities.User.update(user.id, { trix_balance: payment.newBalance });
        } else {
          const currentFlashBoosts = freshUser?.flash_boosts || 0;
          if (currentFlashBoosts < 1) {
            return Response.json({ error: 'Insufficient Flash Boosts', balance: currentFlashBoosts }, { status: 400 });
          }
          payment.newFlashBoosts = currentFlashBoosts - 1;
          await base44.asServiceRole.entities.User.update(user.id, { flash_boosts: payment.newFlashBoosts });
        }

        // Every boost (Flash or Trix) = +1 boost AND +1 vote, in ONE atomic write so counters never drift
        const boostUntil = new Date(Date.now() + BOOST_DURATION_HOURS * 60 * 60 * 1000).toISOString();
        await base44.asServiceRole.entities.ServerAd.updateMany(
          { id: serverAdId },
          {
            $inc: { boosts: 1, votes: 1, votes_month: 1, clicks: 1, clicks_month: 1 },
            $set: { is_boosted: true, boost_until: boostUntil },
          }
        );

        // Vote record for traceability (source: boost)
        const voterPseudo = String(freshUser?.pseudo || '').split('#')[0].trim() || user.email.split('@')[0];
        await base44.asServiceRole.entities.ServerVote.create({
          server_ad_id: serverAdId,
          user_email: user.email,
          voter_pseudo: voterPseudo,
          last_voted_at: nowIso,
          vote_source: 'boost',
        });

        if (ad.webhook_url && ad.api_key) {
          sendVoteWebhook(ad.webhook_url, ad.api_key, voterPseudo, serverAdId);
        }

        const freshAd = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        return Response.json({
          success: true,
          ...payment,
          boosts: freshAd?.boosts || 0,
          votes: freshAd?.votes || 0,
          votes_month: freshAd?.votes_month || 0,
          clicks: freshAd?.clicks || 0,
          clicks_month: freshAd?.clicks_month || 0,
          voted: true,
        });
      }

      // ---- Boost a player search ad with Trix tokens (50 Trix) ----
      case 'boostPlayer': {
        const { serverAdId } = params;
        if (!serverAdId) return Response.json({ error: 'Missing serverAdId' }, { status: 400 });

        const playerAd = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        if (!playerAd) return Response.json({ error: 'Ad not found' }, { status: 404 });

        const freshPlayerUser = await base44.asServiceRole.entities.User.get(user.id);
        const playerTrix = freshPlayerUser?.trix_balance || 0;

        if (playerTrix < PLAYER_BOOST_COST) {
          return Response.json({
            error: 'Insufficient Trix',
            balance: playerTrix,
            cost: PLAYER_BOOST_COST,
          }, { status: 400 });
        }

        const playerNewBalance = playerTrix - PLAYER_BOOST_COST;
        await base44.asServiceRole.entities.User.update(user.id, { trix_balance: playerNewBalance });

        const playerBoostUntil = new Date(Date.now() + BOOST_DURATION_HOURS * 60 * 60 * 1000).toISOString();
        const playerNewBoosts = (playerAd.boosts || 0) + 1;
        await base44.asServiceRole.entities.ServerAd.update(serverAdId, {
          boosts: playerNewBoosts,
          is_boosted: true,
          boost_until: playerBoostUntil,
        });

        return Response.json({
          success: true,
          boosts: playerNewBoosts,
          newBalance: playerNewBalance,
        });
      }

      // ---- Check vote status (can user vote?) ----
      case 'getVoteStatus': {
        const { serverAdId } = params;
        if (!serverAdId) return Response.json({ error: 'Missing serverAdId' }, { status: 400 });

        const voterEmail = user?.email || '';
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   req.headers.get('x-real-ip') || 'unknown';

        const voteQuery = voterEmail
          ? { server_ad_id: serverAdId, user_email: voterEmail }
          : { server_ad_id: serverAdId, ip_address: ip };

        const lastVote = await getLastVote(base44, voteQuery);

        if (!lastVote) {
          return Response.json({ canVote: true });
        }

        const lastVoted = lastVote.last_voted_at
          ? new Date(lastVote.last_voted_at).getTime()
          : 0;
        const elapsed = Date.now() - lastVoted;

        const isVip = !!(user && user.is_vip && (!user.vip_until || new Date(user.vip_until).getTime() > Date.now()));
        const effectiveCooldown = isVip ? (1 * 60 * 60 * 1000) : VOTE_COOLDOWN_MS;

        if (elapsed >= effectiveCooldown) {
          return Response.json({ canVote: true });
        }

        const remaining = effectiveCooldown - elapsed;
        return Response.json({
          canVote: false,
          remainingMs: remaining,
          remainingTime: {
            h: Math.floor(remaining / (60 * 60 * 1000)),
            m: Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000)),
            s: Math.floor((remaining % (60 * 1000)) / 1000),
          },
        });
      }

      // ---- Setup Vote Auto (configure up to 3 servers + pseudo) ----
      case 'setupVoteAuto': {
        const { serverAdIds, voterPseudo } = params;
        const pseudo = String(voterPseudo || '').trim().slice(0, 30);
        if (!pseudo) return Response.json({ error: 'Le pseudo est obligatoire.' }, { status: 400 });

        // Parse and validate server IDs (max 3)
        let ids = Array.isArray(serverAdIds) ? serverAdIds : (serverAdIds ? [serverAdIds] : []);
        ids = ids.filter(Boolean).slice(0, 3);
        if (ids.length === 0) return Response.json({ error: 'Veuillez sélectionner au moins un serveur' }, { status: 400 });

        // Verify all selected servers exist (any server in the directory — no ownership required)
        for (const sid of ids) {
          const ad = await base44.asServiceRole.entities.ServerAd.get(sid).catch(() => null);
          if (!ad) return Response.json({ error: `Serveur introuvable: ${sid}` }, { status: 404 });
        }

        // Check the user has Vote Auto subscription active
        const freshUser = await base44.asServiceRole.entities.User.get(user.id);
        if (!freshUser?.has_vote_auto ||
            (freshUser?.vote_auto_until && new Date(freshUser.vote_auto_until).getTime() <= Date.now())) {
          return Response.json({ error: 'Vote Auto subscription inactive' }, { status: 403 });
        }

        await base44.asServiceRole.entities.User.update(user.id, {
          vote_auto_server_ids: ids,
          vote_auto_pseudo: pseudo,
        });

        return Response.json({ success: true, serverAdIds: ids, voterPseudo: pseudo });
      }

      // ---- Get Vote Auto status (config + subscription + live per-server data) ----
      case 'getVoteAutoStatus': {
        const freshUser = await base44.asServiceRole.entities.User.get(user.id);
        const isActive = !!freshUser?.has_vote_auto &&
          (!freshUser?.vote_auto_until || new Date(freshUser.vote_auto_until).getTime() > Date.now());
        const isVip = !!freshUser?.is_vip &&
          (!freshUser?.vip_until || new Date(freshUser.vip_until).getTime() > Date.now());
        const paused = !!freshUser?.vote_auto_paused;

        const serverIds = Array.isArray(freshUser?.vote_auto_server_ids)
          ? freshUser.vote_auto_server_ids
          : (freshUser?.vote_auto_server_id ? [freshUser.vote_auto_server_id] : []);

        // Fetch configured server details + latest auto-vote timestamp per server
        let servers = [];
        let lastRun = null;
        if (serverIds.length > 0) {
          const page = await base44.asServiceRole.entities.ServerAd.filter({ id: { $in: serverIds } }, '-votes_month', 20);
          const items = page?.items || page || [];

          const votesPage = await base44.asServiceRole.entities.ServerVote.filter(
            { server_ad_id: { $in: serverIds }, user_email: user.email, vote_source: 'auto' },
            '-last_voted_at',
            50
          );
          const votes = votesPage?.items || votesPage || [];
          const lastByServer = {};
          for (const v of votes) {
            if (!lastByServer[v.server_ad_id]) lastByServer[v.server_ad_id] = v.last_voted_at;
          }

          // Keep the exact order the user saved (slot 1, 2, 3) — never reorder by votes
          const byId = Object.fromEntries(items.map(a => [a.id, a]));
          servers = serverIds.map(id => {
            const a = byId[id];
            if (!a) return { id, title: 'Serveur introuvable', missing: true, votes_month: 0, votes: 0, last_auto_voted_at: lastByServer[id] || null };
            return {
              id: a.id,
              title: a.title,
              server_type: a.server_type,
              logo_url: a.logo_url,
              profile_image: a.profile_image,
              game: a.game || '',
              votes_month: a.votes_month || 0,
              votes: a.votes || 0,
              last_auto_voted_at: lastByServer[a.id] || null,
            };
          });

          lastRun = servers.reduce((max, s) => {
            if (!s.last_auto_voted_at) return max;
            const t = new Date(s.last_auto_voted_at).getTime();
            return (!max || t > new Date(max).getTime()) ? s.last_auto_voted_at : max;
          }, null);
        }

        return Response.json({
          active: isActive,
          paused,
          vote_auto_until: freshUser?.vote_auto_until || null,
          configured: !!(serverIds.length > 0 && freshUser?.vote_auto_pseudo),
          server_ids: serverIds,
          voter_pseudo: freshUser?.vote_auto_pseudo || null,
          effective_cooldown_hours: (isActive && isVip) ? 1 : 2,
          has_vip: isVip,
          servers,
          last_run: lastRun,
        });
      }

      // ---- Pause / resume Vote Auto execution (subscription stays active) ----
      case 'toggleVoteAutoPaused': {
        const freshUser = await base44.asServiceRole.entities.User.get(user.id);
        if (!freshUser?.has_vote_auto ||
            (freshUser?.vote_auto_until && new Date(freshUser.vote_auto_until).getTime() <= Date.now())) {
          return Response.json({ error: 'Vote Auto subscription inactive' }, { status: 403 });
        }
        const newPaused = !freshUser?.vote_auto_paused;
        await base44.asServiceRole.entities.User.update(user.id, { vote_auto_paused: newPaused });
        return Response.json({ success: true, paused: newPaused });
      }

      // ---- Clear Vote Auto config (disable execution, keeps subscription) ----
      case 'clearVoteAutoConfig': {
        await base44.asServiceRole.entities.User.update(user.id, {
          vote_auto_server_ids: [],
          vote_auto_pseudo: null,
          vote_auto_paused: false,
        });
        return Response.json({ success: true });
      }

      // ---- Search any server in the directory (for Vote Auto setup) ----
      case 'searchServers': {
        const q = String(params.query || '').trim().slice(0, 60);
        // Escape regex special chars so inputs like "(" or "+" never crash the search
        const rx = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
        const baseQ = { type: 'server' };
        const query = q
          ? { ...baseQ, $or: [ { title: rx }, { slug: rx }, { game: rx }, { games: rx }, { category: rx }, { categories: rx }, { server_type: rx }, { description: rx } ] }
          : baseQ;
        const page = await base44.asServiceRole.entities.ServerAd.filter(query, '-votes_month', 30);
        const items = page?.items || page || [];
        return Response.json({
          servers: items.map(a => ({
            id: a.id,
            title: a.title,
            server_type: a.server_type,
            logo_url: a.logo_url,
            profile_image: a.profile_image,
            game: a.game || '',
            votes_month: a.votes_month || 0,
          })),
        });
      }

      // ---- Fetch server details by IDs (for loading configured Vote Auto servers) ----
      case 'getServersByIds': {
        const { ids } = params;
        if (!Array.isArray(ids) || ids.length === 0) return Response.json({ servers: [] });
        const page = await base44.asServiceRole.entities.ServerAd.filter({ id: { $in: ids }, type: 'server' }, '-votes_month', 20);
        const items = page?.items || page || [];
        return Response.json({
          servers: items.map(a => ({
            id: a.id,
            title: a.title,
            server_type: a.server_type,
            logo_url: a.logo_url,
            profile_image: a.profile_image,
            game: a.game || '',
            votes_month: a.votes_month || 0,
          })),
        });
      }

      // ---- Delete an ad (creator only) + associated messages and votes ----
      case 'deleteAd': {
        const { serverAdId } = params;
        if (!serverAdId) return Response.json({ error: 'Missing serverAdId' }, { status: 400 });

        const ad = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        if (!ad) return Response.json({ error: 'Ad not found' }, { status: 404 });

        if (ad.author_email !== user.email) {
          return Response.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Delete associated messages
        await base44.asServiceRole.entities.AdMessage.deleteMany({ ad_id: serverAdId });

        // Delete associated votes
        await base44.asServiceRole.entities.ServerVote.deleteMany({ server_ad_id: serverAdId });

        // Delete the ad
        await base44.asServiceRole.entities.ServerAd.delete(serverAdId);

        return Response.json({ success: true });
      }

      // ---- Cleanup expired ads (1 hour lifetime) + associated data ----
      // Secured: requires either a valid API key (for automated tasks) or an admin user
      case 'cleanupExpired': {
        const apiKey = req.headers.get('x-api-key');
        const isAuthorized = (apiKey && apiKey === process.env.CLEANUP_API_KEY) || user.role === 'admin';
        if (!isAuthorized) {
          return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const now = new Date().toISOString();
        const expiredAds = await base44.asServiceRole.entities.ServerAd.filter({
          expires_at: { $lt: now }
        });

        for (const ad of expiredAds) {
          await base44.asServiceRole.entities.AdMessage.deleteMany({ ad_id: ad.id });
          await base44.asServiceRole.entities.ServerVote.deleteMany({ server_ad_id: ad.id });
          await base44.asServiceRole.entities.ServerAd.delete(ad.id);
        }

        return Response.json({ success: true, deleted: expiredAds.length });
      }

      // ---- Search a user by email OR pseudo#tag (case-insensitive) for friend requests ----
      case 'searchUser': {
        const { pseudo, tag, email } = params;
        const query = (pseudo || email || '').trim().toLowerCase();

        if (!query) return Response.json({ error: 'Veuillez saisir un pseudo ou un email.' }, { status: 400 });
        if (!rateLimitByIp(req, `searchUser:${user.email}`, 20, 60_000)) {
          return Response.json({ error: 'Too many requests' }, { status: 429 });
        }

        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
        const inputPseudo = (pseudo || '').trim().toLowerCase();
        const inputTag = (tag || '').trim().toLowerCase();

        const target = allUsers.find(u => {
          if (!u) return false;

          // Match by email (case-insensitive)
          if (u.email && u.email.toLowerCase() === query) return true;
          if (!u.pseudo) return false;

          const storedPseudo = u.pseudo.toLowerCase();

          // Case 1: stored pseudo contains "#" (e.g. "she#7869" as a single string)
          if (storedPseudo.includes('#')) {
            if (inputTag) {
              return storedPseudo === `${inputPseudo}#${inputTag}`;
            }
            return storedPseudo.split('#')[0] === inputPseudo;
          }

          // Case 2: pseudo and pseudo_tag stored as separate fields
          if (storedPseudo === inputPseudo) {
            if (!inputTag) return true;
            if (u.pseudo_tag && u.pseudo_tag.toLowerCase() === inputTag) return true;
          }
          return false;
        });

        if (!target) return Response.json({ error: 'Aucun utilisateur trouvé. Vérifiez le pseudo#tag ou l\'email saisi.' }, { status: 404 });

        // Normalize display pseudo to "name#tag" format
        let displayPseudo = target.pseudo || '';
        if (!displayPseudo.includes('#') && target.pseudo_tag) {
          displayPseudo = `${displayPseudo}#${target.pseudo_tag}`;
        }

        console.log('[searchUser] query length:', query.length, '| found:', !!target);

        return Response.json({
          success: true,
          user: {
            id: target.id,
            pseudo: displayPseudo,
            pseudo_tag: target.pseudo_tag || '',
            avatar_url: target.avatar_url || '',
            last_seen: target.last_seen || '',
            current_activity: target.current_activity || '',
            current_activity_type: target.current_activity_type || 'idle',
            custom_status: target.custom_status || '',
          },
        });
      }

      // ---- Fetch fresh profile data for a list of user IDs (for live display) ----
      case 'getUsersByIds': {
        const { ids } = params;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return Response.json({ users: [] });
        }
        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
        const idSet = new Set(ids);
        const users = allUsers
          .filter(u => idSet.has(u.id))
          .map(u => {
            let displayPseudo = u.pseudo || '';
            if (!displayPseudo.includes('#') && u.pseudo_tag) {
              displayPseudo = `${displayPseudo}#${u.pseudo_tag}`;
            }
            const showActivity = u.show_game_activity !== false;
            return {
              id: u.id,
              pseudo: displayPseudo,
              avatar_url: u.avatar_url || '',
              last_seen: u.last_seen || '',
              current_activity: showActivity ? (u.current_activity || '') : '',
              current_activity_type: showActivity ? (u.current_activity_type || 'idle') : 'idle',
              custom_status: u.custom_status || '',
              show_game_activity: showActivity,
            };
          });
        console.log('[getUsersByIds] requested:', ids.length, '| found:', users.length);
        return Response.json({ users });
      }

      // ---- Fetch user profiles by email (for member lists) ----
      case 'getUsersByEmails': {
        const { emails } = params;
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
          return Response.json({ users: [] });
        }
        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
        const userMap = {};
        for (const u of allUsers) {
          if (u.email) userMap[u.email.toLowerCase()] = u;
        }
        // Return profiles aligned to the input email order (no emails in response)
        const users = emails.map((e: string) => {
          const u = userMap[e.toLowerCase()];
          if (!u) return null;
          const cleanPseudo = String(u.pseudo || '').split('#')[0].trim();
          const showActivity = u.show_game_activity !== false;
          return {
            id: u.id,
            email: u.email || '',
            pseudo: cleanPseudo,
            avatar_url: u.avatar_url || '',
            last_seen: u.last_seen || '',
            current_activity: showActivity ? (u.current_activity || '') : '',
            current_activity_type: showActivity ? (u.current_activity_type || 'idle') : 'idle',
            custom_status: u.custom_status || '',
            show_game_activity: showActivity,
          };
        }).filter(Boolean);
        return Response.json({ users });
      }

      // ---- Add a friend in ONE call (search + create both records atomically) ----
      case 'addFriend': {
        const { pseudo, tag, email } = params;
        const senderEmail = user.email;
        const senderId = user.id;

        // Find the target user
        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
        const inputPseudo = (pseudo || '').trim().toLowerCase();
        const inputTag = (tag || '').trim().toLowerCase();
        const query = (pseudo || email || '').trim().toLowerCase();

        if (!query) return Response.json({ error: 'Veuillez saisir un pseudo ou un email.' }, { status: 400 });

        const target = allUsers.find(u => {
          if (!u) return false;
          if (u.email && u.email.toLowerCase() === query) return true;
          if (!u.pseudo) return false;
          const storedPseudo = u.pseudo.toLowerCase();
          if (storedPseudo.includes('#')) {
            if (inputTag) return storedPseudo === `${inputPseudo}#${inputTag}`;
            return storedPseudo.split('#')[0] === inputPseudo;
          }
          if (storedPseudo === inputPseudo) {
            if (!inputTag) return true;
            if (u.pseudo_tag && u.pseudo_tag.toLowerCase() === inputTag) return true;
          }
          return false;
        });

        if (!target) return Response.json({ error: 'Aucun utilisateur trouvé. Vérifiez le pseudo#tag ou l\'email saisi.' }, { status: 404 });
        if (target.id === senderId) return Response.json({ error: 'Tu ne peux pas t\'ajouter toi-même !' }, { status: 400 });

        const targetEmail = target.email;
        const targetUserId = target.id;

        // Check for existing relationship
        const existing = await base44.asServiceRole.entities.Friend.filter({
          $or: [
            { user_email: senderEmail, friend_user_id: targetUserId },
            { user_email: targetEmail, friend_user_id: senderId },
          ],
        });

        if (existing.length > 0) {
          const rel = existing[0];
          let msg = 'Une relation existe déjà.';
          if (rel.status === 'accepted') msg = 'Vous êtes déjà amis.';
          else if (rel.status === 'pending_sent') msg = 'Une demande a déjà été envoyée.';
          else if (rel.status === 'pending_received') msg = 'Cet utilisateur t\'a déjà envoyé une demande.';
          return Response.json({ error: msg }, { status: 409 });
        }

        // Create both records atomically
        await base44.asServiceRole.entities.Friend.create({
          user_email: senderEmail,
          friend_user_id: targetUserId,
          status: 'pending_sent',
        });
        await base44.asServiceRole.entities.Friend.create({
          user_email: targetEmail,
          friend_user_id: senderId,
          status: 'pending_received',
        });

        let displayPseudo = target.pseudo || target.full_name || target.email;
        if (!displayPseudo.includes('#') && target.pseudo_tag) {
          displayPseudo = `${displayPseudo}#${target.pseudo_tag}`;
        }

        console.log('[addFriend] sender', senderId, '-> target', targetUserId);
        return Response.json({ success: true, target_name: displayPseudo });
      }

      // ---- Send a friend request (creates both records atomically, linked by user ID) ----
      case 'sendFriendRequest': {
        const { target_user_id } = params;
        if (!target_user_id) return Response.json({ error: 'Missing target_user_id' }, { status: 400 });

        const senderEmail = user.email;
        const senderId = user.id;

        if (senderId === target_user_id) {
          return Response.json({ error: 'Tu ne peux pas t\'ajouter toi-même !' }, { status: 400 });
        }

        // Look up target user to get their email (needed for user_email field on their record)
        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
        const target = allUsers.find(u => u.id === target_user_id);

        if (!target) return Response.json({ error: 'Utilisateur introuvable.' }, { status: 404 });

        const targetEmail = target.email;

        // Check if target allows friend requests
        if (target.allow_friend_requests === false) {
          return Response.json({ error: 'Cet utilisateur n\'accepte pas les demandes d\'amis.' }, { status: 403 });
        }

        // Check if a relationship already exists in either direction (by user_id)
        const existing = await base44.asServiceRole.entities.Friend.filter({
          $or: [
            { user_email: senderEmail, friend_user_id: target_user_id },
            { user_email: targetEmail, friend_user_id: senderId },
          ],
        });

        if (existing.length > 0) {
          const rel = existing[0];
          let msg = 'Une relation existe déjà.';
          if (rel.status === 'accepted') msg = 'Vous êtes déjà amis.';
          else if (rel.status === 'pending_sent') msg = 'Une demande a déjà été envoyée.';
          else if (rel.status === 'pending_received') msg = 'Cet utilisateur t\'a déjà envoyé une demande.';
          return Response.json({ error: msg }, { status: 409 });
        }

        // Create both records — only user_email (RLS) + friend_user_id (stable link) + status
        await base44.asServiceRole.entities.Friend.create({
          user_email: senderEmail,
          friend_user_id: target_user_id,
          status: 'pending_sent',
        });

        await base44.asServiceRole.entities.Friend.create({
          user_email: targetEmail,
          friend_user_id: senderId,
          status: 'pending_received',
        });

        console.log('[sendFriendRequest] created pair: sender', senderId, '-> target', target_user_id);
        return Response.json({ success: true });
      }

      // ---- Accept a friend request (updates both records to accepted) ----
      case 'acceptFriendRequest': {
        const { friend_user_id } = params;
        if (!friend_user_id) return Response.json({ error: 'Missing friend_user_id' }, { status: 400 });

        const myEmail = user.email;
        const myId = user.id;

        // Find the friend's email by their user ID
        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
        const friend = allUsers.find(u => u.id === friend_user_id);
        if (!friend) return Response.json({ error: 'Utilisateur introuvable.' }, { status: 404 });
        const friendEmail = friend.email;

        // Update my record (pending_received -> accepted)
        const myRecords = await base44.asServiceRole.entities.Friend.filter({
          user_email: myEmail,
          friend_user_id: friend_user_id,
          status: 'pending_received',
        });
        if (myRecords.length === 0) return Response.json({ error: 'Demande introuvable.' }, { status: 404 });
        await base44.asServiceRole.entities.Friend.update(myRecords[0].id, { status: 'accepted' });

        // Update reciprocal record (pending_sent -> accepted)
        const reciprocal = await base44.asServiceRole.entities.Friend.filter({
          user_email: friendEmail,
          friend_user_id: myId,
        });
        if (reciprocal.length > 0) {
          await base44.asServiceRole.entities.Friend.update(reciprocal[0].id, { status: 'accepted' });
        }

        console.log('[acceptFriendRequest] accepted:', myId, '<->', friend_user_id);
        return Response.json({ success: true });
      }

      // ---- Block a user (sets status to blocked, removes friendship) ----
      case 'blockFriend': {
        const { friend_user_id } = params;
        if (!friend_user_id) return Response.json({ error: 'Missing friend_user_id' }, { status: 400 });

        const myEmail = user.email;
        const myId = user.id;

        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
        const friend = allUsers.find(u => u.id === friend_user_id);
        const friendEmail = friend?.email || '';

        // Update or create my record as blocked
        const myRecords = await base44.asServiceRole.entities.Friend.filter({
          user_email: myEmail,
          friend_user_id: friend_user_id,
        });
        if (myRecords.length > 0) {
          await base44.asServiceRole.entities.Friend.update(myRecords[0].id, { status: 'blocked' });
        } else {
          await base44.asServiceRole.entities.Friend.create({
            user_email: myEmail,
            friend_user_id: friend_user_id,
            status: 'blocked',
          });
        }

        // Delete the reciprocal record so they can't message me
        if (friendEmail) {
          const reciprocal = await base44.asServiceRole.entities.Friend.filter({
            user_email: friendEmail,
            friend_user_id: myId,
          });
          for (const r of reciprocal) {
            await base44.asServiceRole.entities.Friend.delete(r.id);
          }
        }

        console.log('[blockFriend] blocked:', myId, '<->', friend_user_id);
        return Response.json({ success: true });
      }

      // ---- Check friendship status with a user ----
      case 'getFriendStatus': {
        const { friend_user_id } = params;
        if (!friend_user_id) return Response.json({ status: 'none' });

        const myEmail = user.email;
        const records = await base44.asServiceRole.entities.Friend.filter({
          user_email: myEmail,
          friend_user_id,
        });
        if (records.length === 0) return Response.json({ status: 'none' });
        return Response.json({ status: records[0].status });
      }

      // ---- Remove a friend / cancel a request (deletes both records) ----
      case 'removeFriend': {
        const { friend_user_id } = params;
        if (!friend_user_id) return Response.json({ error: 'Missing friend_user_id' }, { status: 400 });

        const myEmail = user.email;
        const myId = user.id;

        // Find the friend's email by their user ID
        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
        const friend = allUsers.find(u => u.id === friend_user_id);
        const friendEmail = friend?.email || '';

        // Delete my record
        const myRecords = await base44.asServiceRole.entities.Friend.filter({
          user_email: myEmail,
          friend_user_id: friend_user_id,
        });
        for (const r of myRecords) {
          await base44.asServiceRole.entities.Friend.delete(r.id);
        }

        // Delete reciprocal record
        if (friendEmail) {
          const reciprocal = await base44.asServiceRole.entities.Friend.filter({
            user_email: friendEmail,
            friend_user_id: myId,
          });
          for (const r of reciprocal) {
            await base44.asServiceRole.entities.Friend.delete(r.id);
          }
        }

        console.log('[removeFriend] removed:', myId, '<->', friend_user_id);
        return Response.json({ success: true });
      }

      // ---- Boost a community Server (not ServerAd) with Flash Boosts ----
      case 'boostServer': {
        const { serverId } = params;
        if (!serverId) return Response.json({ error: 'Missing serverId' }, { status: 400 });

        const srv = await base44.asServiceRole.entities.Server.get(serverId);
        if (!srv) return Response.json({ error: 'Serveur introuvable' }, { status: 404 });

        // Check user is a member or owner
        const isOwner = srv.owner_email === user.email;
        if (!isOwner) {
          const members = await base44.asServiceRole.entities.ServerMember.filter({
            server_id: serverId,
            user_email: user.email,
          });
          if (members.length === 0) {
            return Response.json({ error: 'Tu dois être membre du serveur pour le booster' }, { status: 403 });
          }
        }

        const currentBoosts = srv.boosts || 0;
        if (currentBoosts >= 30) {
          return Response.json({ error: 'Ce serveur a atteint le niveau maximum de boosts (30)' }, { status: 400 });
        }

        const freshBoostUser = await base44.asServiceRole.entities.User.get(user.id);
        const currentFlashBoosts = freshBoostUser?.flash_boosts || 0;
        if (currentFlashBoosts < 1) {
          return Response.json({
            error: 'Tu n\'as pas de boost Flash. Va à la Boutique Nexus pour en acheter.',
            balance: currentFlashBoosts,
          }, { status: 400 });
        }

        // Deduct 1 flash boost from user
        const newFlashBoosts = currentFlashBoosts - 1;
        await base44.asServiceRole.entities.User.update(user.id, { flash_boosts: newFlashBoosts });

        // Increment server boost count
        const newBoosts = currentBoosts + 1;
        await base44.asServiceRole.entities.Server.update(serverId, {
          boosts: newBoosts,
        });

        // Create a boost record: user + exact start date + 30-day expiry (all mandatory)
        const startedAtMs = Date.now();
        const startedAt = new Date(startedAtMs).toISOString();
        const expiresAt = new Date(startedAtMs + SERVER_BOOST_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
        await base44.asServiceRole.entities.ServerBoostRecord.create({
          server_id: serverId,
          user_id: user.id,
          user_email: user.email,
          user_name: String(freshBoostUser?.pseudo || '').split('#')[0].trim(),
          started_at: startedAt,
          expires_at: expiresAt,
        });

        console.log('[boostServer] server', serverId, 'boosts:', newBoosts, 'by', user.email, 'expires:', expiresAt);
        return Response.json({ success: true, boosts: newBoosts, newFlashBoosts });
      }

      // ---- List a server's boosts with resolved booster profiles (no emails returned) ----
      case 'getServerBoosts': {
        const { serverId } = params;
        if (!serverId) return Response.json({ error: 'Missing serverId' }, { status: 400 });

        const srv = await base44.asServiceRole.entities.Server.get(serverId);
        if (!srv) return Response.json({ error: 'Serveur introuvable' }, { status: 404 });

        const page = await base44.asServiceRole.entities.ServerBoostRecord.filter({ server_id: serverId }, '-created_date', 100);
        const records = page?.items || page || [];

        const emails = [...new Set(records.map((r) => r.user_email).filter(Boolean))];
        const profiles = {};
        if (emails.length > 0) {
          const usersPage = await base44.asServiceRole.entities.User.filter({ email: { $in: emails } });
          for (const u of (usersPage?.items || usersPage || [])) {
            if (u?.email) profiles[u.email.toLowerCase()] = u;
          }
        }

        const nowMs = Date.now();
        const boosts = records.map((r) => {
          const u = profiles[(r.user_email || '').toLowerCase()];
          return {
            id: r.id,
            user_id: r.user_id || u?.id || '',
            user_name: String(u?.pseudo || r.user_name || '').split('#')[0].trim() || 'Membre',
            user_avatar: u?.avatar_url || '',
            started_at: r.started_at || r.created_date,
            expires_at: r.expires_at,
            is_active: new Date(r.expires_at).getTime() > nowMs,
          };
        });

        const serverBoosts = srv.boosts || 0;
        const activeCount = boosts.filter((b) => b.is_active).length;

        // The authoritative count is the number of active (non-expired) boost records.
        // If there are NO records at all, keep the existing server.boosts value
        // (it may represent legacy boosts created before the tracking system).
        const hasRecords = boosts.length > 0;
        const finalCount = hasRecords ? activeCount : serverBoosts;
        const legacyCount = hasRecords ? Math.max(0, serverBoosts - activeCount) : 0;

        // Only resync the counter when we have records to base it on
        if (hasRecords && serverBoosts !== finalCount) {
          await base44.asServiceRole.entities.Server.update(serverId, { boosts: finalCount });
        }

        return Response.json({
          boosts,
          server_boosts: finalCount,
          legacy_count: legacyCount,
        });
      }

      // ---- Delete a server message (author or server owner only) ----
      case 'deleteServerMessage': {
        const { messageId } = params;
        if (!messageId) return Response.json({ error: 'Missing messageId' }, { status: 400 });

        const msg = await base44.asServiceRole.entities.ServerMessage.get(messageId);
        if (!msg) return Response.json({ error: 'Message not found' }, { status: 404 });

        // Author can delete their own messages
        if (msg.author_email === user.email) {
          await base44.asServiceRole.entities.ServerMessage.delete(messageId);
          return Response.json({ success: true });
        }

        // Server owner can delete any message in their server
        const srv = await base44.asServiceRole.entities.Server.get(msg.server_id);
        if (srv && srv.owner_email === user.email) {
          await base44.asServiceRole.entities.ServerMessage.delete(messageId);
          return Response.json({ success: true });
        }

        // Platform admin can delete any message
        if (user.role === 'admin') {
          await base44.asServiceRole.entities.ServerMessage.delete(messageId);
          return Response.json({ success: true });
        }

        return Response.json({ error: 'Not authorized' }, { status: 403 });
      }

      // ---- Check if the current user can DM the target (based on target's dm_privacy setting) ----
      case 'checkDmPrivacy': {
        const { target_email } = params;
        if (!target_email) return Response.json({ can_dm: true });

        // Official support accounts always accept DMs
        const officialEmails = ['support@matrix.app', 'contact@matrix.app', 'official@matrix.app'];
        if (officialEmails.includes(target_email.toLowerCase())) {
          return Response.json({ can_dm: true });
        }

        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
        const target = allUsers.find(u => u.email?.toLowerCase() === target_email.toLowerCase());

        if (!target) return Response.json({ can_dm: true }); // Default allow if user not found

        const dmPrivacy = target.dm_privacy || 'everyone';
        if (dmPrivacy === 'everyone') return Response.json({ can_dm: true });

        // dm_privacy === 'friends' — check if they are friends
        const friendRecords = await base44.asServiceRole.entities.Friend.filter({
          user_email: target_email,
          friend_user_id: user.id,
          status: 'accepted',
        });
        return Response.json({ can_dm: friendRecords.length > 0, reason: friendRecords.length > 0 ? '' : 'friends_only' });
      }

      // ---- Check if a user has blocked the current user ----
      case 'isBlockedBy': {
        const { target_email } = params;
        if (!target_email) return Response.json({ blocked: false });

        const records = await base44.asServiceRole.entities.Friend.filter({
          user_email: target_email,
          friend_user_id: user.id,
          status: 'blocked',
        });
        return Response.json({ blocked: records.length > 0 });
      }

      // ---- Cleanup expired server boosts (30-day expiry) + resync orphaned/legacy counters ----
      // Secured: requires either a valid API key (for automated tasks) or an admin user
      case 'cleanupExpiredBoosts': {
        const apiKey = req.headers.get('x-api-key');
        const isAuthorized = (apiKey && apiKey === process.env.CLEANUP_API_KEY) || user.role === 'admin';
        if (!isAuthorized) {
          return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const now = new Date().toISOString();

        // 1. Delete expired records (boost older than 30 days)
        const expiredRecords = await base44.asServiceRole.entities.ServerBoostRecord.filter({
          expires_at: { $lt: now }
        });
        if (expiredRecords.length > 0) {
          await base44.asServiceRole.entities.ServerBoostRecord.deleteMany({
            expires_at: { $lt: now }
          });
        }

        // 2. Resync ALL servers with boosts > 0 to their actual active record count.
        //    This removes legacy/orphaned boosts (no record, no dates) from the counter
        //    and corrects any drift between server.boosts and tracked records.
        const serversPage = await base44.asServiceRole.entities.Server.filter({ boosts: { $gt: 0 } }, null, 500);
        const servers = serversPage?.items || serversPage || [];
        let synced = 0;
        for (const srv of servers) {
          const activePage = await base44.asServiceRole.entities.ServerBoostRecord.filter({
            server_id: srv.id,
            expires_at: { $gt: now }
          });
          const activeCount = (activePage?.items || activePage || []).length;
          if ((srv.boosts || 0) !== activeCount) {
            await base44.asServiceRole.entities.Server.update(srv.id, { boosts: activeCount });
            synced++;
          }
        }

        console.log('[cleanupExpiredBoosts] expired:', expiredRecords.length, 'servers synced:', synced, '/', servers.length);
        return Response.json({
          success: true,
          expired: expiredRecords.length,
          serversSynced: synced,
          totalServers: servers.length,
        });
      }

      // ---- Search public creators/users (for Prospecteur Creator tab) ----
      case 'searchCreators': {
        const { query } = params;
        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);

        // Filter: public profiles (is_private !== true) with a pseudo
        let publicUsers = allUsers.filter(u => u.is_private !== true && u.pseudo);

        // Optional search filter on pseudo (case-insensitive)
        if (query && query.trim()) {
          const q = query.trim().toLowerCase();
          publicUsers = publicUsers.filter(u => {
            const p = (u.pseudo || '').toLowerCase();
            return p.includes(q);
          });
        }

        // Aggregate content stats per creator (aggregate not available in backend SDK — compute from filter)
        const allMods = await base44.asServiceRole.entities.FarmingMod.filter({}, '-created_date', 500);
        const allMaps = await base44.asServiceRole.entities.FortniteMap.filter({}, '-created_date', 500);

        const modStats = {};
        for (const m of (allMods || [])) {
          const key = (m.creator_email || '').toLowerCase();
          if (!key) continue;
          if (!modStats[key]) modStats[key] = { count: 0, sum_views: 0, sum_likes: 0, sum_download_count: 0 };
          modStats[key].count++;
          modStats[key].sum_views += (m.views || 0);
          modStats[key].sum_likes += (m.likes || 0);
          modStats[key].sum_download_count += (m.download_count || 0);
        }
        const mapStats = {};
        for (const m of (allMaps || [])) {
          const key = (m.user_email || '').toLowerCase();
          if (!key) continue;
          if (!mapStats[key]) mapStats[key] = { count: 0, sum_views: 0, sum_likes: 0 };
          mapStats[key].count++;
          mapStats[key].sum_views += (m.views || 0);
          mapStats[key].sum_likes += (m.likes || 0);
        }

        const results = publicUsers.map(u => {
          const email = u.email?.toLowerCase();
          const mod = modStats[email] || {};
          const map = mapStats[email] || {};
          return {
            id: u.id,
            pseudo: (u.pseudo || '').split('#')[0],
            pseudo_tag: u.pseudo_tag || '',
            avatar_url: u.avatar_url || '',
            bio: u.bio || '',
            mod_count: mod.count || 0,
            map_count: map.count || 0,
            total_views: (mod.sum_views || 0) + (map.sum_views || 0),
            total_likes: (mod.sum_likes || 0) + (map.sum_likes || 0),
            total_downloads: mod.sum_download_count || 0,
          };
        });

        // Sort: creators with content first, then by total views
        results.sort((a, b) => {
          const aContent = a.mod_count + a.map_count;
          const bContent = b.mod_count + b.map_count;
          if (bContent !== aContent) return bContent - aContent;
          return b.total_views - a.total_views;
        });

        return Response.json({ users: results });
      }

      // ---- Get a single creator's profile by id (for profile view) ----
      case 'getCreatorById': {
        const { id } = params;
        if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
        let target;
        try { target = await base44.asServiceRole.entities.User.get(id); }
        catch { return Response.json({ error: 'Créateur introuvable' }, { status: 404 }); }
        if (!target || target.is_private === true) {
          return Response.json({ error: 'Créateur introuvable ou profil privé' }, { status: 404 });
        }
        return Response.json({
          creator: {
            id: target.id,
            email: target.email,
            pseudo: (target.pseudo || '').split('#')[0],
            avatar_url: target.avatar_url || '',
            bio: target.bio || '',
          },
        });
      }

      // ---- Subscribe to a creator/user ----
      case 'subscribe': {
        const { target_email } = params;
        if (!target_email) return Response.json({ error: 'Missing target_email' }, { status: 400 });
        if (target_email === user.email) return Response.json({ error: 'Tu ne peux pas t\'abonner à toi-même' }, { status: 400 });

        const existing = await base44.asServiceRole.entities.UserSubscription.filter({
          subscriber_email: user.email,
          target_email,
        });
        if (existing.length > 0) return Response.json({ success: true, already_subscribed: true });

        const targetUser = await base44.asServiceRole.entities.User.filter({ email: target_email });
        const target = (targetUser?.items || targetUser || [])[0];
        const targetName = target?.pseudo || '';

        await base44.asServiceRole.entities.UserSubscription.create({
          subscriber_email: user.email,
          target_email,
          target_name: targetName,
        });

        return Response.json({ success: true });
      }

      // ---- Unsubscribe from a creator/user ----
      case 'unsubscribe': {
        const { target_email } = params;
        if (!target_email) return Response.json({ error: 'Missing target_email' }, { status: 400 });

        await base44.asServiceRole.entities.UserSubscription.deleteMany({
          subscriber_email: user.email,
          target_email,
        });

        return Response.json({ success: true });
      }

      // ---- Check subscription status ----
      case 'getSubscriptionStatus': {
        const { target_email } = params;
        if (!target_email) return Response.json({ subscribed: false });

        const records = await base44.asServiceRole.entities.UserSubscription.filter({
          subscriber_email: user.email,
          target_email,
        });
        return Response.json({ subscribed: records.length > 0 });
      }

      // ---- Test webhook (owner only) — sends a test POST to the configured webhook URL ----
      case 'testWebhook': {
        const { serverAdId } = params;
        if (!serverAdId) return Response.json({ error: 'Missing serverAdId' }, { status: 400 });
        const ad = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        if (!ad) return Response.json({ error: 'Server not found' }, { status: 404 });
        if (ad.author_email !== user.email) return Response.json({ error: 'Not authorized' }, { status: 403 });
        if (!ad.webhook_url) return Response.json({ error: 'Aucune URL de webhook configurée' }, { status: 400 });
        if (!ad.api_key) return Response.json({ error: 'Aucune clé API configurée' }, { status: 400 });

        try {
          const testPayload = {
            pseudo: '__TEST__',
            server_id: serverAdId,
            timestamp: new Date().toISOString(),
            test: true,
          };
          const bodyStr = JSON.stringify(testPayload);
          const signature = await computeHmacSha256(ad.api_key, bodyStr);
          const res = await fetch(ad.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Matrix-Signature': signature,
            },
            body: bodyStr,
            signal: AbortSignal.timeout(8000),
          });
          return Response.json({
            success: true,
            status: res.status,
            statusText: res.statusText,
            webhook_url: ad.webhook_url,
          });
        } catch (err: any) {
          return Response.json({ success: false, error: err.message || 'Webhook injoignable' }, { status: 502 });
        }
      }

      // ---- Set webhook URL (owner only) ----
      case 'setWebhookUrl': {
        const { serverAdId, webhookUrl } = params;
        if (!serverAdId) return Response.json({ error: 'Missing serverAdId' }, { status: 400 });
        const ad = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        if (!ad) return Response.json({ error: 'Server not found' }, { status: 404 });
        if (ad.author_email !== user.email) return Response.json({ error: 'Not authorized' }, { status: 403 });
        // Basic URL validation
        const url = String(webhookUrl || '').trim();
        if (url && !url.startsWith('https://')) {
          return Response.json({ error: 'L\'URL du webhook doit commencer par https://' }, { status: 400 });
        }
        await base44.asServiceRole.entities.ServerAd.update(serverAdId, { webhook_url: url });
        return Response.json({ success: true, webhook_url: url });
      }

      // ---- Get recent votes for owner dashboard (owner only) ----
      case 'getRecentVotes': {
        const { serverAdId } = params;
        if (!serverAdId) return Response.json({ error: 'Missing serverAdId' }, { status: 400 });
        const ad = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        if (!ad) return Response.json({ error: 'Server not found' }, { status: 404 });
        if (ad.author_email !== user.email) return Response.json({ error: 'Not authorized' }, { status: 403 });
        const pageSize = Math.min(Math.max(Number(params.pageSize) || 20, 1), 100);
        const page = Math.max(Math.floor(Number(params.page) || 0), 0);
        // Fetch one extra row to know whether a next page exists (sorted newest first)
        const votesPage = await base44.asServiceRole.entities.ServerVote.filter(
          { server_ad_id: serverAdId }, '-last_voted_at', pageSize + 1, page * pageSize
        );
        const rawItems = (votesPage?.items || votesPage || []);
        const hasMore = rawItems.length > pageSize;
        const votes = rawItems.slice(0, pageSize).map((v) => ({
          id: v.id,
          voter_pseudo: v.voter_pseudo || 'Anonyme',
          user_email: v.user_email || null,
          last_voted_at: v.last_voted_at || v.created_date,
          source: v.vote_source === 'auto' ? 'auto'
            : v.vote_source === 'boost' ? 'boost'
            : v.user_email ? 'authenticated' : 'guest',
        }));
        return Response.json({ votes, page, page_size: pageSize, has_more: hasMore });
      }

      // ---- Regenerate the server's secret API key (owner only) ----
      case 'regenerateApiKey': {
        const { serverAdId } = params;
        if (!serverAdId) return Response.json({ error: 'Missing serverAdId' }, { status: 400 });
        const ad = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        if (!ad) return Response.json({ error: 'Server not found' }, { status: 404 });
        if (ad.author_email !== user.email) return Response.json({ error: 'Not authorized' }, { status: 403 });
        const newKey = crypto.randomUUID();
        await base44.asServiceRole.entities.ServerAd.update(serverAdId, { api_key: newKey });
        return Response.json({ success: true, api_key: newKey });
      }

      // ---- Track a click (visit / vote) — anonymous allowed ----
      case 'trackClick': {
        const { serverAdId } = params;
        if (!serverAdId) return Response.json({ error: 'Missing serverAdId' }, { status: 400 });
        const clickAd = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        if (!clickAd) return Response.json({ error: 'Server not found' }, { status: 404 });
        await base44.asServiceRole.entities.ServerAd.updateMany(
          { id: serverAdId },
          { $inc: { clicks: 1, clicks_month: 1 } }
        );
        return Response.json({ success: true });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}