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

      // Get the authenticated user's channel info (profile, banner, live status)
      case 'getMyChannel': {
        if (!params.userToken) return Response.json({ error: 'User OAuth token required.' }, { status: 401 });
        const userData = await twitchFetch('users', {}, params.userToken, clientId);
        if (userData._error) return Response.json(userData, { status: userData.status });
        const u = userData.data?.[0];
        if (!u) return Response.json({ data: null, _source: 'twitch' });
        // Fetch stream and channel info in parallel — tolerate partial failures
        const [streamResult, channelResult] = await Promise.all([
          twitchFetch('streams', { user_login: u.login }, params.userToken, clientId),
          twitchFetch('channels', { broadcaster_id: u.id }, params.userToken, clientId),
        ]);
        const stream = streamResult._error ? null : (streamResult.data?.[0] || null);
        const channel = channelResult._error ? null : (channelResult.data?.[0] || null);
        result = {
          user: mapUser(u),
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

      // Get channel activity (recent followers) — uses app token
      case 'getChannelActivity': {
        let targetUserId = params.userId;
        // If userToken provided, resolve their user ID from Twitch
        if (!targetUserId && params.userToken) {
          const userData = await twitchFetch('users', {}, params.userToken, clientId);
          if (!userData._error) targetUserId = userData.data?.[0]?.id;
        }
        if (!targetUserId) return Response.json({ error: 'Could not determine user ID.' }, { status: 400 });
        if (!clientSecret) return Response.json({ error: 'TWITCH_CLIENT_SECRET not configured.' }, { status: 500 });
        const token = await getAppToken(clientId, clientSecret);
        if (token?._error) return Response.json(token, { status: token.status });
        // Recent followers (users/follows with to_id=channel owner)
        const followsData = await twitchFetch('users/follows', {
          to_id: targetUserId,
          first: params.first || 20,
        }, token, clientId);
        if (followsData._error) {
          // Tolerate API errors — return empty rather than failing the whole panel
          result = { followers: [], total_followers: 0 };
          break;
        }
        result = {
          followers: (followsData.data || []).map(f => ({
            from_id: f.from_id,
            from_login: f.from_login,
            from_name: f.from_name,
            followed_at: f.followed_at,
            _source: 'twitch',
          })),
          total_followers: followsData.total || 0,
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