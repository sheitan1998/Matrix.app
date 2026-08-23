import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const VOTE_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
const BOOST_COST = 500; // 500 Trix minimum per boost
const PLAYER_BOOST_COST = 50; // 50 Trix for player ad boost
const BOOST_DURATION_HOURS = 24;
const SERVER_BOOST_DURATION_DAYS = 30; // 30 days for community server boosts

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, ...params } = body;

    const base44 = createClientFromRequest(req);

    // ---- Public action: get server by invite code (no auth required) ----
    if (action === 'getServerByInviteCode') {
      const { inviteCode } = params;
      if (!inviteCode) return Response.json({ error: 'Missing inviteCode' }, { status: 400 });
      const servers = await base44.asServiceRole.entities.Server.list('-created_date', 200);
      const found = servers.find(s => s.invite_code === inviteCode);
      if (!found) return Response.json({ error: 'Not found' }, { status: 404 });
      return Response.json(found);
    }

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // System action: monthly reset of votes AND boosts (admin only, 1st of each month)
    if (action === 'resetMonthly') {
      if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
      await base44.asServiceRole.entities.ServerAd.updateMany(
        {},
        { $set: { votes: 0, boosts: 0, is_boosted: false, boost_until: null } }
      );
      // Also clear all vote records so users can vote again
      await base44.asServiceRole.entities.ServerVote.deleteMany({});
      return Response.json({ success: true });
    }

    // System action: monthly purge of all server ads (1st of each month)
    if (action === 'monthlyPurge') {
      if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
      const allAds = await base44.asServiceRole.entities.ServerAd.list('-created_date', 500);
      for (const ad of allAds) {
        await base44.asServiceRole.entities.AdMessage.deleteMany({ ad_id: ad.id });
        await base44.asServiceRole.entities.ServerVote.deleteMany({ server_ad_id: ad.id });
        await base44.asServiceRole.entities.ServerAd.delete(ad.id);
      }
      return Response.json({ success: true, deleted: allAds.length });
    }

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

      // ---- Boost a server ad with Flash Boosts or Trix (200) ----
      case 'boost': {
        const { serverAdId, method } = params;
        if (!serverAdId) return Response.json({ error: 'Missing serverAdId' }, { status: 400 });

        const ad = await base44.asServiceRole.entities.ServerAd.get(serverAdId);
        if (!ad) return Response.json({ error: 'Server not found' }, { status: 404 });

        if (method === 'trix') {
          const TRIX_BOOST_COST = 200;
          const userTrix = user.trix_balance || 0;
          if (userTrix < TRIX_BOOST_COST) {
            return Response.json({ error: 'Trix insuffisants (200 requis)', balance: userTrix, cost: TRIX_BOOST_COST }, { status: 400 });
          }
          const newBalance = userTrix - TRIX_BOOST_COST;
          await base44.auth.updateMe({ trix_balance: newBalance });

          const boostUntil = new Date(Date.now() + BOOST_DURATION_HOURS * 60 * 60 * 1000).toISOString();
          const newBoosts = (ad.boosts || 0) + 1;
          await base44.asServiceRole.entities.ServerAd.update(serverAdId, { boosts: newBoosts, is_boosted: true, boost_until: boostUntil });

          return Response.json({ success: true, boosts: newBoosts, newBalance });
        }

        const currentFlashBoosts = user.flash_boosts || 0;
        if (currentFlashBoosts < 1) {
          return Response.json({ error: 'Insufficient Flash Boosts', balance: currentFlashBoosts }, { status: 400 });
        }

        const newFlashBoosts = currentFlashBoosts - 1;
        await base44.auth.updateMe({ flash_boosts: newFlashBoosts });

        const boostUntil = new Date(Date.now() + BOOST_DURATION_HOURS * 60 * 60 * 1000).toISOString();
        const newBoosts = (ad.boosts || 0) + 1;
        await base44.asServiceRole.entities.ServerAd.update(serverAdId, { boosts: newBoosts, is_boosted: true, boost_until: boostUntil });

        return Response.json({ success: true, boosts: newBoosts, newFlashBoosts });
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

        console.log('[searchUser] query:', query, '| inputPseudo:', inputPseudo, '| inputTag:', inputTag, '| found:', target?.email);

        return Response.json({
          success: true,
          user: {
            id: target.id,
            email: target.email,
            full_name: target.full_name,
            pseudo: displayPseudo,
            pseudo_tag: target.pseudo_tag || '',
            avatar_url: target.avatar_url || '',
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
            return {
              id: u.id,
              email: u.email,
              full_name: u.full_name || '',
              pseudo: displayPseudo,
              avatar_url: u.avatar_url || '',
              last_seen: u.last_seen || '',
            };
          });
        console.log('[getUsersByIds] requested:', ids.length, '| found:', users.length);
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

        const currentFlashBoosts = user.flash_boosts || 0;
        if (currentFlashBoosts < 1) {
          return Response.json({
            error: 'Tu n\'as pas de boost Flash. Va à la Boutique Nexus pour en acheter.',
            balance: currentFlashBoosts,
          }, { status: 400 });
        }

        // Deduct 1 flash boost from user
        const newFlashBoosts = currentFlashBoosts - 1;
        await base44.auth.updateMe({ flash_boosts: newFlashBoosts });

        // Increment server boost count
        const newBoosts = currentBoosts + 1;
        await base44.asServiceRole.entities.Server.update(serverId, {
          boosts: newBoosts,
        });

        // Create a boost record with 30-day expiry
        const expiresAt = new Date(Date.now() + SERVER_BOOST_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
        await base44.asServiceRole.entities.ServerBoostRecord.create({
          server_id: serverId,
          user_email: user.email,
          expires_at: expiresAt,
        });

        console.log('[boostServer] server', serverId, 'boosts:', newBoosts, 'by', user.email, 'expires:', expiresAt);
        return Response.json({ success: true, boosts: newBoosts, newFlashBoosts });
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

      // ---- Cleanup expired server boosts (30-day expiry) ----
      // Secured: requires either a valid API key (for automated tasks) or an admin user
      case 'cleanupExpiredBoosts': {
        const apiKey = req.headers.get('x-api-key');
        const isAuthorized = (apiKey && apiKey === process.env.CLEANUP_API_KEY) || user.role === 'admin';
        if (!isAuthorized) {
          return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const now = new Date().toISOString();
        const expiredRecords = await base44.asServiceRole.entities.ServerBoostRecord.filter({
          expires_at: { $lt: now }
        });

        // Group expired records by server_id
        const byServer = {};
        for (const rec of expiredRecords) {
          byServer[rec.server_id] = (byServer[rec.server_id] || 0) + 1;
        }

        // Decrement each server's boost count
        for (const [serverId, count] of Object.entries(byServer)) {
          const srv = await base44.asServiceRole.entities.Server.get(serverId);
          if (srv) {
            const newBoosts = Math.max(0, (srv.boosts || 0) - count);
            await base44.asServiceRole.entities.Server.update(serverId, {
              boosts: newBoosts,
            });
          }
        }

        // Delete all expired records
        await base44.asServiceRole.entities.ServerBoostRecord.deleteMany({
          expires_at: { $lt: now }
        });

        console.log('[cleanupExpiredBoosts] expired:', expiredRecords.length, 'servers affected:', Object.keys(byServer).length);
        return Response.json({ success: true, expired: expiredRecords.length, serversAffected: Object.keys(byServer).length });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}