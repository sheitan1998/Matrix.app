import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { twitchFetch, getAppAccessToken } from '../../shared/twitch.ts';

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
    cachedTokenExpiry = now + 3600000;
  }
  return token;
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action, ...params } = body;
    const clientId = secrets.get("TWITCH_CLIENT_ID");
    const clientSecret = secrets.get("TWITCH_CLIENT_SECRET");

    // ---- toggleFavorite (user) ----
    if (action === 'toggleFavorite') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { channelLogin, channelDisplayName, channelAvatar } = params;
      if (!channelLogin) return Response.json({ error: 'Missing channelLogin' }, { status: 400 });

      const existing = await base44.asServiceRole.entities.TwitchFavoriteChannel.filter({
        user_email: user.email,
        channel_login: channelLogin,
      });

      if (existing.length > 0) {
        await base44.asServiceRole.entities.TwitchFavoriteChannel.delete(existing[0].id);
        return Response.json({ success: true, isFavorite: false });
      }

      await base44.asServiceRole.entities.TwitchFavoriteChannel.create({
        user_email: user.email,
        channel_login: channelLogin,
        channel_display_name: channelDisplayName || channelLogin,
        channel_avatar: channelAvatar || '',
        is_live: false,
      });
      return Response.json({ success: true, isFavorite: true });
    }

    // ---- getFavorites (user) ----
    if (action === 'getFavorites') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const favorites = await base44.asServiceRole.entities.TwitchFavoriteChannel.filter({
        user_email: user.email,
      }, '-created_date', 100);
      return Response.json({ favorites: favorites || [] });
    }

    // ---- checkFavoriteStatus (user) ----
    if (action === 'checkFavoriteStatus') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const { channelLogin } = params;
      if (!channelLogin) return Response.json({ isFavorite: false });

      const existing = await base44.asServiceRole.entities.TwitchFavoriteChannel.filter({
        user_email: user.email,
        channel_login: channelLogin,
      });
      return Response.json({ isFavorite: existing.length > 0 });
    }

    // ---- checkLiveAndNotify (cron / workflow) ----
    if (action === 'checkLiveAndNotify') {
      const apiKey = req.headers.get('x-api-key');
      const isAuthorized = (apiKey && apiKey === secrets.get('CRON_SECRET')) || apiKey === process.env.CRON_SECRET;
      if (!isAuthorized) {
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
          return Response.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      if (!clientId || !clientSecret) {
        return Response.json({ error: 'Twitch credentials not configured' }, { status: 500 });
      }

      const token = await getAppToken(clientId, clientSecret);
      if (token?._error) return Response.json(token, { status: token.status });

      // Get all unique favorite channel logins
      const allFavorites = await base44.asServiceRole.entities.TwitchFavoriteChannel.list('-created_date', 500);
      if (!allFavorites || allFavorites.length === 0) {
        return Response.json({ success: true, checked: 0, notified: 0 });
      }

      // Group by channel_login to avoid duplicate API calls
      const channelMap = new Map();
      for (const fav of allFavorites) {
        if (!channelMap.has(fav.channel_login)) {
          channelMap.set(fav.channel_login, {
            channel_login: fav.channel_login,
            favorites: [],
          });
        }
        channelMap.get(fav.channel_login).favorites.push(fav);
      }

      const uniqueLogins = Array.from(channelMap.keys());
      let notifiedCount = 0;

      // Twitch API allows up to 100 logins per request
      const batchSize = 100;
      for (let i = 0; i < uniqueLogins.length; i += batchSize) {
        const batch = uniqueLogins.slice(i, i + batchSize);
        const streamData = await twitchFetch('streams', {
          first: batchSize,
          user_login: batch,
        }, token, clientId);

        if (streamData._error) {
          console.error('[twitchLiveNotifier] API error:', streamData.message);
          continue;
        }

        const liveStreams = streamData.data || [];
        const liveLogins = new Set(liveStreams.map(s => s.user_login));

        // Build a map of live stream data
        const liveStreamMap = new Map();
        for (const s of liveStreams) {
          liveStreamMap.set(s.user_login, s);
        }

        // For each channel, check if it's live and notify users
        for (const login of batch) {
          const channelInfo = channelMap.get(login);
          const stream = liveStreamMap.get(login);
          const isLive = !!stream;
          const wasLive = channelInfo.favorites[0]?.is_live;

          // Channel just went live (was not live before, is live now)
          if (isLive && !wasLive) {
            for (const fav of channelInfo.favorites) {
              // Check if we already notified recently (within 1 hour)
              const lastNotified = fav.last_notified_live_at
                ? new Date(fav.last_notified_live_at).getTime()
                : 0;
              const oneHourAgo = Date.now() - 3600000;

              if (lastNotified > oneHourAgo) continue;

              await base44.asServiceRole.entities.Notification.create({
                user_email: fav.user_email,
                type: 'twitch_live',
                title: `${stream.user_name} est en direct sur Twitch !`,
                body: stream.title || `Diffuse actuellement ${stream.game_name || ''}`.trim(),
                link: `/twitch/watch/${stream.user_login}`,
                icon: fav.channel_avatar || '',
                is_read: false,
              });

              // Update favorite record
              await base44.asServiceRole.entities.TwitchFavoriteChannel.update(fav.id, {
                is_live: true,
                last_notified_live_at: new Date().toISOString(),
              });
              notifiedCount++;
            }
          } else if (!isLive && wasLive) {
            // Channel went offline — update status without notification
            for (const fav of channelInfo.favorites) {
              await base44.asServiceRole.entities.TwitchFavoriteChannel.update(fav.id, {
                is_live: false,
              });
            }
          }
        }
      }

      console.log(`[twitchLiveNotifier] checked ${uniqueLogins.length} channels, notified ${notifiedCount} users`);
      return Response.json({ success: true, checked: uniqueLogins.length, notified: notifiedCount });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}