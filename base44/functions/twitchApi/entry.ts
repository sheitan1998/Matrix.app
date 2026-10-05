import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import {
  twitchFetch, getAppAccessToken, mapStream, mapChannel, mapCategory, mapUser,
} from '../../shared/twitch.ts';

// In-memory cache for app access token (survives warm invocations)
let cachedToken = null;
let cachedTokenExpiry = 0;

async function getAppToken(clientId, clientSecret) {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiry - 60000) {
    return cachedToken;
  }
  const token = await getAppAccessToken(clientId, clientSecret);
  if (token && !token._error) {
    cachedToken = token;
    cachedTokenExpiry = now + 3600000; // 1 hour
  }
  return token;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, ...params } = body;
    const clientId = secrets.get("TWITCH_CLIENT_ID");
    const clientSecret = secrets.get("TWITCH_CLIENT_SECRET");

    if (!clientId) {
      return Response.json({ error: 'TWITCH_CLIENT_ID not configured. Add it in Dashboard → Settings → Environment Variables.' }, { status: 500 });
    }

    let result = [];

    switch (action) {
      // OAuth config — returns public client_id for client-side implicit grant
      case 'getOAuthConfig': {
        result = {
          client_id: clientId,
          scope: 'user:read:email user:read:follows',
        };
        break;
      }

      // Get live streams (public)
      case 'getStreams': {
        if (!clientSecret) return Response.json({ error: 'TWITCH_CLIENT_SECRET not configured.' }, { status: 500 });
        const token = await getAppToken(clientId, clientSecret);
        if (token?._error) return Response.json(token, { status: token.status });
        const data = await twitchFetch('streams', {
          first: params.first || 20,
          game_id: params.gameId,
          language: params.language,
          after: params.after,
        }, token, clientId);
        if (data._error) return Response.json(data, { status: data.status });
        result = {
          streams: (data.data || []).map(mapStream),
          pagination: data.pagination || {},
        };
        break;
      }

      // Search channels
      case 'searchChannels': {
        if (!clientSecret) return Response.json({ error: 'TWITCH_CLIENT_SECRET not configured.' }, { status: 500 });
        const token = await getAppToken(clientId, clientSecret);
        if (token?._error) return Response.json(token, { status: token.status });
        const data = await twitchFetch('search/channels', {
          query: params.query,
          first: params.first || 20,
          live_only: params.liveOnly ? 'true' : undefined,
          after: params.after,
        }, token, clientId);
        if (data._error) return Response.json(data, { status: data.status });
        result = {
          channels: (data.data || []).map(mapChannel),
          pagination: data.pagination || {},
        };
        break;
      }

      // Search categories (games)
      case 'searchCategories': {
        if (!clientSecret) return Response.json({ error: 'TWITCH_CLIENT_SECRET not configured.' }, { status: 500 });
        const token = await getAppToken(clientId, clientSecret);
        if (token?._error) return Response.json(token, { status: token.status });
        const data = await twitchFetch('search/categories', {
          query: params.query,
          first: params.first || 20,
          after: params.after,
        }, token, clientId);
        if (data._error) return Response.json(data, { status: data.status });
        result = {
          categories: (data.data || []).map(mapCategory),
          pagination: data.pagination || {},
        };
        break;
      }

      // Get top categories (games)
      case 'getTopGames': {
        if (!clientSecret) return Response.json({ error: 'TWITCH_CLIENT_SECRET not configured.' }, { status: 500 });
        const token = await getAppToken(clientId, clientSecret);
        if (token?._error) return Response.json(token, { status: token.status });
        const data = await twitchFetch('games/top', {
          first: params.first || 20,
          after: params.after,
        }, token, clientId);
        if (data._error) return Response.json(data, { status: data.status });
        result = {
          categories: (data.data || []).map(mapCategory),
          pagination: data.pagination || {},
        };
        break;
      }

      // Get game details by ID (for category browse page)
      case 'getGameDetails': {
        if (!clientSecret) return Response.json({ error: 'TWITCH_CLIENT_SECRET not configured.' }, { status: 500 });
        const token = await getAppToken(clientId, clientSecret);
        if (token?._error) return Response.json(token, { status: token.status });
        const data = await twitchFetch('games', { id: params.gameId }, token, clientId);
        if (data._error) return Response.json(data, { status: data.status });
        const game = data.data?.[0];
        result = game ? mapCategory(game) : null;
        break;
      }

      // Get channel details (user + stream + channel info) by login
      case 'getChannelDetails': {
        if (!clientSecret) return Response.json({ error: 'TWITCH_CLIENT_SECRET not configured.' }, { status: 500 });
        const token = await getAppToken(clientId, clientSecret);
        if (token?._error) return Response.json(token, { status: token.status });
        const userData = await twitchFetch('users', { login: params.login }, token, clientId);
        if (userData._error) return Response.json(userData, { status: userData.status });
        const user = userData.data?.[0];
        if (!user) return Response.json({ data: null, _source: 'twitch' });
        const streamData = await twitchFetch('streams', { user_login: params.login }, token, clientId);
        const stream = streamData._error ? null : (streamData.data?.[0] || null);
        const channelData = await twitchFetch('channels', { broadcaster_id: user.id }, token, clientId);
        const channel = channelData._error ? null : (channelData.data?.[0] || null);
        result = {
          user: mapUser(user),
          stream: stream ? mapStream(stream) : null,
          channel: channel ? {
            title: channel.title,
            game_name: channel.game_name,
            game_id: channel.game_id,
            broadcaster_language: channel.broadcaster_language,
            _source: 'twitch',
          } : null,
        };
        break;
      }

      // Get user info (current user with OAuth token, or by login/id with app token)
      case 'getUserInfo': {
        if (params.userToken) {
          const data = await twitchFetch('users', {}, params.userToken, clientId);
          if (data._error) return Response.json(data, { status: data.status });
          result = (data.data || []).map(mapUser);
        } else {
          if (!clientSecret) return Response.json({ error: 'TWITCH_CLIENT_SECRET not configured.' }, { status: 500 });
          const token = await getAppToken(clientId, clientSecret);
          if (token?._error) return Response.json(token, { status: token.status });
          const data = await twitchFetch('users', {
            login: params.login,
            id: params.id,
          }, token, clientId);
          if (data._error) return Response.json(data, { status: data.status });
          result = (data.data || []).map(mapUser);
        }
        break;
      }

      // Get followed live streams (requires user OAuth token)
      case 'getFollowedStreams': {
        if (!params.userToken) return Response.json({ error: 'User OAuth token required.' }, { status: 401 });
        const userData = await twitchFetch('users', {}, params.userToken, clientId);
        if (userData._error) return Response.json(userData, { status: userData.status });
        const userId = userData.data?.[0]?.id;
        if (!userId) return Response.json({ error: 'Could not determine Twitch user ID.' }, { status: 400 });
        const data = await twitchFetch('streams/followed', {
          user_id: userId,
          first: params.first || 50,
        }, params.userToken, clientId);
        if (data._error) return Response.json(data, { status: data.status });
        result = { streams: (data.data || []).map(mapStream) };
        break;
      }

      // Get followed channels (requires user OAuth token)
      case 'getFollowedChannels': {
        if (!params.userToken) return Response.json({ error: 'User OAuth token required.' }, { status: 401 });
        const userData = await twitchFetch('users', {}, params.userToken, clientId);
        if (userData._error) return Response.json(userData, { status: userData.status });
        const userId = userData.data?.[0]?.id;
        if (!userId) return Response.json({ error: 'Could not determine Twitch user ID.' }, { status: 400 });
        const data = await twitchFetch('channels/followed', {
          user_id: userId,
          first: params.first || 100,
        }, params.userToken, clientId);
        if (data._error) return Response.json(data, { status: data.status });
        result = {
          channels: (data.data || []).map(item => ({
            id: item.broadcaster_id,
            user_login: item.broadcaster_login,
            user_name: item.broadcaster_name,
            followed_at: item.followed_at,
            _source: 'twitch',
          })),
        };
        break;
      }

      // Channel profile (users + streams + channels + follower/sub totals).
      // Without `login` → the connected user's own channel (user token, includes subscribers).
      // With `login` → any public channel (app token).
      case 'getChannelProfile': {
        const isOwn = !params.login;
        let accessToken = params.userToken;
        if (isOwn && !accessToken) return Response.json({ error: 'User OAuth token required.' }, { status: 401 });
        if (!isOwn) {
          if (!clientSecret) return Response.json({ error: 'TWITCH_CLIENT_SECRET not configured.' }, { status: 500 });
          const token = await getAppToken(clientId, clientSecret);
          if (token?._error) return Response.json(token, { status: token.status });
          accessToken = token;
        }
        const userData = await twitchFetch('users', isOwn ? {} : { login: params.login }, accessToken, clientId);
        if (userData._error) return Response.json(userData, { status: userData.status });
        const u = userData.data?.[0];
        if (!u) { result = null; break; }
        const [streamRes, channelRes, followersRes, subsRes] = await Promise.all([
          twitchFetch('streams', { user_id: u.id }, accessToken, clientId),
          twitchFetch('channels', { broadcaster_id: u.id }, accessToken, clientId),
          twitchFetch('channels/followers', { broadcaster_id: u.id, first: 1 }, accessToken, clientId),
          isOwn ? twitchFetch('subscriptions', { broadcaster_id: u.id, first: 1 }, accessToken, clientId) : Promise.resolve(null),
        ]);
        const stream = streamRes._error ? null : (streamRes.data?.[0] || null);
        const channel = channelRes._error ? null : (channelRes.data?.[0] || null);
        result = {
          user: mapUser(u),
          stream: stream ? mapStream(stream) : null,
          channel: channel ? {
            title: channel.title,
            game_name: channel.game_name,
            game_id: channel.game_id,
            broadcaster_language: channel.broadcaster_language,
            tags: channel.tags || [],
            _source: 'twitch',
          } : null,
          followers_total: followersRes._error ? null : (followersRes.total ?? 0),
          // Only partners/affiliates have subscriptions; null = unavailable
          subscribers_total: subsRes && !subsRes._error ? (subsRes.total ?? 0) : null,
          is_own: isOwn,
        };
        break;
      }

      // Subscribe an EventSub WebSocket session to the user's incoming whispers
      case 'subscribeWhispers': {
        if (!params.userToken || !params.sessionId) return Response.json({ error: 'userToken and sessionId required.' }, { status: 400 });
        const meData = await twitchFetch('users', {}, params.userToken, clientId);
        if (meData._error) return Response.json(meData, { status: meData.status });
        const meId = meData.data?.[0]?.id;
        if (!meId) return Response.json({ error: 'Could not determine Twitch user ID.' }, { status: 400 });
        const subRes = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
          method: 'POST',
          headers: {
            'Client-Id': clientId,
            'Authorization': `Bearer ${params.userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'user.whisper.message',
            version: '1',
            condition: { user_id: meId },
            transport: { method: 'websocket', session_id: params.sessionId },
          }),
        });
        const subData = await subRes.json().catch(() => ({}));
        if (!subRes.ok) {
          return Response.json({ _error: true, message: subData.message || `EventSub ${subRes.status}` }, { status: subRes.status });
        }
        result = { subscribed: true };
        break;
      }

      // Get channel activity (recent followers) — Helix channels/followers.
      // The follower list requires the broadcaster's own user token (moderator:read:followers);
      // with an app token Twitch only returns the total.
      case 'getChannelActivity': {
        let broadcasterId = params.userId;
        let accessToken = params.userToken;
        if (accessToken && !broadcasterId) {
          const userData = await twitchFetch('users', {}, accessToken, clientId);
          if (!userData._error) broadcasterId = userData.data?.[0]?.id;
        }
        if (!broadcasterId) return Response.json({ error: 'Could not determine user ID.' }, { status: 400 });
        if (!accessToken) {
          if (!clientSecret) return Response.json({ error: 'TWITCH_CLIENT_SECRET not configured.' }, { status: 500 });
          const token = await getAppToken(clientId, clientSecret);
          if (token?._error) return Response.json(token, { status: token.status });
          accessToken = token;
        }
        const followersData = await twitchFetch('channels/followers', {
          broadcaster_id: broadcasterId,
          first: params.first || 20,
        }, accessToken, clientId);
        if (followersData._error) {
          // Tolerate API errors — return empty rather than failing the whole panel
          result = { followers: [], total_followers: 0 };
          break;
        }
        // Enrich followers with their real Twitch avatars (one batched /users call)
        const followerIds = (followersData.data || []).map(f => f.user_id);
        const avatarById = {};
        if (followerIds.length > 0) {
          const followerUsers = await twitchFetch('users', { id: followerIds }, accessToken, clientId);
          for (const fu of (followerUsers._error ? [] : followerUsers.data || [])) {
            avatarById[fu.id] = fu.profile_image_url || '';
          }
        }
        result = {
          followers: (followersData.data || []).map(f => ({
            from_id: f.user_id,
            from_login: f.user_login,
            from_name: f.user_name,
            from_avatar: avatarById[f.user_id] || '',
            followed_at: f.followed_at,
            _source: 'twitch',
          })),
          total_followers: followersData.total || 0,
        };
        break;
      }

      // Search live streams — searches channels (live_only), then fetches stream details
      case 'searchStreams': {
        if (!clientSecret) return Response.json({ error: 'TWITCH_CLIENT_SECRET not configured.' }, { status: 500 });
        const token = await getAppToken(clientId, clientSecret);
        if (token?._error) return Response.json(token, { status: token.status });
        const channelData = await twitchFetch('search/channels', {
          query: params.query,
          first: params.first || 20,
          live_only: 'true',
        }, token, clientId);
        if (channelData._error) return Response.json(channelData, { status: channelData.status });
        const liveLogins = (channelData.data || []).filter(c => c.is_live).map(c => c.broadcaster_login);
        if (liveLogins.length === 0) {
          result = { streams: [] };
          break;
        }
        const streamData = await twitchFetch('streams', {
          first: liveLogins.length,
          user_login: liveLogins,
        }, token, clientId);
        if (streamData._error) return Response.json(streamData, { status: streamData.status });
        result = { streams: (streamData.data || []).map(mapStream) };
        break;
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return Response.json({ data: result, _source: 'twitch' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}