import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const VOTE_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
const BOOST_COST = 500; // 500 Trix minimum per boost
const BOOST_DURATION_HOURS = 24;

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, ...params } = body;

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

        // Get user's Trix balance
        const progressRecords = await base44.asServiceRole.entities.UserProgress.filter({
          user_email: user.email,
        });

        if (progressRecords.length === 0) {
          return Response.json({ error: 'Insufficient Trix', balance: 0 }, { status: 400 });
        }

        const progress = progressRecords[0];
        const currentCoins = progress.coins || 0;

        if (currentCoins < BOOST_COST) {
          return Response.json({
            error: 'Insufficient Trix',
            balance: currentCoins,
            cost: BOOST_COST,
          }, { status: 400 });
        }

        // Deduct Trix from user
        const newBalance = currentCoins - BOOST_COST;
        await base44.asServiceRole.entities.UserProgress.update(progress.id, {
          coins: newBalance,
        });

        // Boost the ad
        const ad = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        if (!ad) return Response.json({ error: 'Server not found' }, { status: 404 });

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

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}