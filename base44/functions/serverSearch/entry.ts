import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const VOTE_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
const BOOST_COST = 500; // 500 Trix minimum per boost
const PLAYER_BOOST_COST = 50; // 50 Trix for player ad boost
const BOOST_DURATION_HOURS = 24;

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, ...params } = body;

    // System action: monthly boost reset (no user auth required)
    if (action === 'resetBoosts') {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.ServerAd.updateMany(
        {},
        { $set: { boosts: 0, is_boosted: false, boost_until: null } }
      );
      return Response.json({ success: true });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    switch (action) {

      // ---- Vote for a server (2h cooldown per user per server) ----
      case 'vote': {
        const { serverAdId } = params;
        if (!serverAdId) return Response.json({ error: 'Missing serverAdId' }, { status: 400 });

        // Check existing vote record for this user + server
        const existingVotes = await base44.asServiceRole.entities.ServerVote.filter({
          server_ad_id: serverAdId,
          user_email: user.email,
        });

        const now = Date.now();

        if (existingVotes.length > 0) {
          const lastVoted = existingVotes[0].last_voted_at
            ? new Date(existingVotes[0].last_voted_at).getTime()
            : 0;
          const elapsed = now - lastVoted;

          if (elapsed < VOTE_COOLDOWN_MS) {
            const remaining = VOTE_COOLDOWN_MS - elapsed;
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

          // Update existing vote timestamp
          await base44.asServiceRole.entities.ServerVote.update(existingVotes[0].id, {
            last_voted_at: new Date(now).toISOString(),
          });
        } else {
          // Create new vote record
          await base44.asServiceRole.entities.ServerVote.create({
            server_ad_id: serverAdId,
            user_email: user.email,
            last_voted_at: new Date(now).toISOString(),
          });
        }

        // Increment vote count on the ad
        const ad = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        if (!ad) return Response.json({ error: 'Server not found' }, { status: 404 });
        const newVotes = (ad.votes || 0) + 1;
        await base44.asServiceRole.entities.ServerAd.update(serverAdId, {
          votes: newVotes,
        });

        return Response.json({ success: true, votes: newVotes });
      }

      // ---- Boost a server with Trix tokens ----
      case 'boost': {
        const { serverAdId } = params;
        if (!serverAdId) return Response.json({ error: 'Missing serverAdId' }, { status: 400 });

        // Verify the ad exists first
        const ad = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        if (!ad) return Response.json({ error: 'Server not found' }, { status: 404 });

        // Get user's Trix balance (single wallet: user.trix_balance)
        const currentTrix = user.trix_balance || 0;

        if (currentTrix < BOOST_COST) {
          return Response.json({
            error: 'Insufficient Trix',
            balance: currentTrix,
            cost: BOOST_COST,
          }, { status: 400 });
        }

        // Deduct Trix from user's wallet
        const newBalance = currentTrix - BOOST_COST;
        await base44.auth.updateMe({ trix_balance: newBalance });

        const boostUntil = new Date(Date.now() + BOOST_DURATION_HOURS * 60 * 60 * 1000).toISOString();
        const newBoosts = (ad.boosts || 0) + 1;
        await base44.asServiceRole.entities.ServerAd.update(serverAdId, {
          boosts: newBoosts,
          is_boosted: true,
          boost_until: boostUntil,
        });

        return Response.json({
          success: true,
          boosts: newBoosts,
          newBalance,
        });
      }

      // ---- Boost a player search ad with Trix tokens (50 Trix) ----
      case 'boostPlayer': {
        const { serverAdId } = params;
        if (!serverAdId) return Response.json({ error: 'Missing serverAdId' }, { status: 400 });

        const playerAd = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        if (!playerAd) return Response.json({ error: 'Ad not found' }, { status: 404 });

        const playerTrix = user.trix_balance || 0;

        if (playerTrix < PLAYER_BOOST_COST) {
          return Response.json({
            error: 'Insufficient Trix',
            balance: playerTrix,
            cost: PLAYER_BOOST_COST,
          }, { status: 400 });
        }

        const playerNewBalance = playerTrix - PLAYER_BOOST_COST;
        await base44.auth.updateMe({ trix_balance: playerNewBalance });

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

        const existingVotes = await base44.asServiceRole.entities.ServerVote.filter({
          server_ad_id: serverAdId,
          user_email: user.email,
        });

        if (existingVotes.length === 0) {
          return Response.json({ canVote: true });
        }

        const lastVoted = existingVotes[0].last_voted_at
          ? new Date(existingVotes[0].last_voted_at).getTime()
          : 0;
        const elapsed = Date.now() - lastVoted;

        if (elapsed >= VOTE_COOLDOWN_MS) {
          return Response.json({ canVote: true });
        }

        const remaining = VOTE_COOLDOWN_MS - elapsed;
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
      case 'cleanupExpired': {
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

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}