import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import {
  youtubeFetch, fetchVideoStats, mapVideoWithStats, mapChannel,
  mapComment, mapSearchChannel, mapLiveChatMessage,
} from '../../shared/youtube.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, ...params } = body;
    const apiKey = secrets.get("YOUTUBE_API_KEY");
    if (!apiKey) return Response.json({ error: 'YOUTUBE_API_KEY not configured. Add it in Dashboard → Settings → Environment Variables.' }, { status: 500 });

    let result = [];

    switch (action) {

      // ─── videos.list — most popular / trending ───
      case 'trending': {
        const data = await youtubeFetch('videos', {
          part: 'snippet,statistics,contentDetails,liveStreamingDetails',
          chart: 'mostPopular',
          maxResults: params.maxResults || 50,
          regionCode: params.regionCode || 'FR',
          hl: params.hl || 'fr',
          videoCategoryId: params.videoCategoryId,
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        result = (data.items || []).map(mapVideoWithStats);
        break;
      }

      // ─── videos.list — specific video IDs ───
      case 'videoDetails': {
        const data = await youtubeFetch('videos', {
          part: 'snippet,statistics,contentDetails,liveStreamingDetails',
          id: params.id,
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        result = (data.items || []).map(mapVideoWithStats);
        break;
      }

      // ─── search.list — keyword search (videos / channels / playlists) ───
      case 'search': {
        const searchType = params.type || 'video';
        const searchParams: Record<string, string> = {
          part: 'snippet',
          q: params.q,
          type: searchType,
          maxResults: String(params.maxResults || 25),
          regionCode: params.regionCode || 'FR',
          hl: params.hl || 'fr',
          order: params.order || 'relevance',
        };
        if (params.publishedAfter && searchType === 'video') searchParams.publishedAfter = params.publishedAfter;
        if (params.videoDuration && searchType === 'video') searchParams.videoDuration = params.videoDuration;
        if (params.videoCategoryId && searchType === 'video') searchParams.videoCategoryId = params.videoCategoryId;
        if (params.eventType && searchType === 'video') searchParams.eventType = params.eventType;

        const data = await youtubeFetch('search', searchParams, apiKey);
        if (data._error) return Response.json(data, { status: data.status });

        if (searchType === 'video') {
          const ids = (data.items || []).map(i => i.id?.videoId).filter(Boolean);
          result = await fetchVideoStats(ids, apiKey);
        } else if (searchType === 'channel') {
          const ids = (data.items || []).map(i => i.id?.channelId).filter(Boolean);
          if (ids.length > 0) {
            const chData = await youtubeFetch('channels', { part: 'snippet,statistics', id: ids.join(',') }, apiKey);
            if (!chData._error) result = (chData.items || []).map(mapChannel);
          }
        } else if (searchType === 'playlist') {
          result = (data.items || []).map(item => ({
            id: item.id?.playlistId,
            title: item.snippet?.title || "",
            description: item.snippet?.description || "",
            thumbnail_url: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || "",
            channel_id: item.snippet?.channelId,
            channel_name: item.snippet?.channelTitle,
            _source: "youtube",
          }));
        }
        break;
      }

      // ─── search.list — channel search ───
      case 'channelSearch': {
        const data = await youtubeFetch('search', {
          part: 'snippet',
          q: params.q,
          type: 'channel',
          maxResults: params.maxResults || 25,
          regionCode: params.regionCode || 'FR',
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        const ids = (data.items || []).map(i => i.id?.channelId).filter(Boolean);
        if (ids.length > 0) {
          const chData = await youtubeFetch('channels', {
            part: 'snippet,statistics',
            id: ids.join(','),
          }, apiKey);
          if (!chData._error) result = (chData.items || []).map(mapChannel);
        }
        break;
      }

      // ─── channels.list — channel details by ID ───
      case 'channelDetails': {
        const data = await youtubeFetch('channels', {
          part: 'snippet,statistics,contentDetails,brandingSettings',
          id: params.id,
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        result = (data.items || []).map(mapChannel);
        break;
      }

      // ─── search.list — a channel's uploaded videos ───
      case 'channelVideos': {
        const data = await youtubeFetch('search', {
          part: 'snippet',
          channelId: params.channelId,
          type: 'video',
          maxResults: params.maxResults || 50,
          order: 'date',
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        const ids = (data.items || []).map(i => i.id?.videoId).filter(Boolean);
        result = await fetchVideoStats(ids, apiKey);
        break;
      }

      // ─── search.list — live streams ───
      case 'liveStreams': {
        const searchParams: Record<string, string> = {
          part: 'snippet',
          eventType: 'live',
          type: 'video',
          maxResults: String(params.maxResults || 50),
          regionCode: params.regionCode || 'FR',
          hl: params.hl || 'fr',
        };
        if (params.q) searchParams.q = params.q;

        let data = await youtubeFetch('search', searchParams, apiKey);
        if (data._error) return Response.json(data, { status: data.status });

        // Fallback: YouTube search with eventType=live and no q often returns 0 results.
        // Retry with a broad query term to surface actual live streams.
        if (!data.items?.length && !params.q) {
          console.log('[liveStreams] 0 results without q — retrying with q=" "');
          data = await youtubeFetch('search', { ...searchParams, q: ' ' }, apiKey);
        }

        const ids = (data.items || []).map(i => i.id?.videoId).filter(Boolean);
        console.log(`[liveStreams] search returned ${data.items?.length || 0} items, ${ids.length} video IDs`);
        result = await fetchVideoStats(ids, apiKey);
        console.log(`[liveStreams] fetchVideoStats returned ${result.length} videos`);
        break;
      }

      // ─── search.list — upcoming live ───
      case 'upcomingLive': {
        const data = await youtubeFetch('search', {
          part: 'snippet',
          eventType: 'upcoming',
          type: 'video',
          maxResults: params.maxResults || 50,
          regionCode: params.regionCode || 'FR',
          q: params.q,
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        const ids = (data.items || []).map(i => i.id?.videoId).filter(Boolean);
        result = await fetchVideoStats(ids, apiKey);
        break;
      }

      // ─── search.list — completed live ───
      case 'completedLive': {
        const data = await youtubeFetch('search', {
          part: 'snippet',
          eventType: 'completed',
          type: 'video',
          maxResults: params.maxResults || 50,
          regionCode: params.regionCode || 'FR',
          q: params.q,
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        const ids = (data.items || []).map(i => i.id?.videoId).filter(Boolean);
        result = await fetchVideoStats(ids, apiKey);
        break;
      }

      // ─── commentThreads.list — video comments ───
      case 'comments': {
        const data = await youtubeFetch('commentThreads', {
          part: 'snippet',
          videoId: params.videoId,
          maxResults: params.maxResults || 100,
          order: params.order || 'relevance',
          textFormat: 'plainText',
          pageToken: params.pageToken,
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        result = (data.items || []).map(mapComment);
        break;
      }

      // ─── comments.list — replies to a comment ───
      case 'commentReplies': {
        const data = await youtubeFetch('comments', {
          part: 'snippet',
          parentId: params.parentId,
          maxResults: params.maxResults || 100,
          textFormat: 'plainText',
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        result = (data.items || []).map(item => ({
          id: item.id,
          author_name: item.snippet?.authorDisplayName || "",
          author_avatar: item.snippet?.authorProfileImageUrl || "",
          content: item.snippet?.textDisplay || item.snippet?.textOriginal || "",
          likes: parseInt(item.snippet?.likeCount || "0"),
          created_date: item.snippet?.publishedAt || "",
          _source: "youtube",
        }));
        break;
      }

      // ─── videoCategories.list ───
      case 'categories': {
        const data = await youtubeFetch('videoCategories', {
          part: 'snippet',
          regionCode: params.regionCode || 'FR',
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        result = (data.items || []).map(item => ({
          id: item.id,
          title: item.snippet?.title || "",
          assignable: item.snippet?.assignable,
          _source: "youtube",
        }));
        break;
      }

      // ─── videos.list — popular by category ───
      case 'categorySearch': {
        const data = await youtubeFetch('videos', {
          part: 'snippet,statistics,contentDetails',
          chart: 'mostPopular',
          videoCategoryId: params.categoryId,
          maxResults: params.maxResults || 50,
          regionCode: params.regionCode || 'FR',
          hl: params.hl || 'fr',
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        result = (data.items || []).map(mapVideoWithStats);
        break;
      }

      // ─── search.list — related videos ───
      case 'relatedVideos': {
        const data = await youtubeFetch('search', {
          part: 'snippet',
          relatedToVideoId: params.videoId,
          type: 'video',
          maxResults: params.maxResults || 15,
          regionCode: params.regionCode || 'FR',
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        const ids = (data.items || []).map(i => i.id?.videoId).filter(Boolean);
        result = await fetchVideoStats(ids, apiKey);
        break;
      }

      // ─── search.list — shorts (#shorts + short duration) ───
      case 'shorts': {
        const searchParams: Record<string, string> = {
          part: 'snippet',
          q: params.q || '#shorts',
          type: 'video',
          maxResults: String(params.maxResults || 20),
          regionCode: params.regionCode || 'FR',
          hl: params.hl || 'fr',
          order: 'viewCount',
          videoDuration: 'short',
        };
        if (params.pageToken) searchParams.pageToken = params.pageToken;
        const data = await youtubeFetch('search', searchParams, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        const ids = (data.items || []).map(i => i.id?.videoId).filter(Boolean);
        const videos = await fetchVideoStats(ids, apiKey);
        result = { videos, nextPageToken: data.nextPageToken || null };
        break;
      }

      // ─── activities.list — channel activity feed ───
      case 'activities': {
        const data = await youtubeFetch('activities', {
          part: 'snippet,contentDetails',
          channelId: params.channelId,
          maxResults: params.maxResults || 50,
          publishedAfter: params.publishedAfter,
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        result = (data.items || []).map(item => ({
          id: item.id,
          type: item.snippet?.type || "",
          title: item.snippet?.title || "",
          description: item.snippet?.description || "",
          publishedAt: item.snippet?.publishedAt || "",
          channel_id: item.snippet?.channelId,
          videoId: item.contentDetails?.upload?.videoId || item.contentDetails?.like?.resourceId?.videoId || "",
          _source: "youtube",
        }));
        break;
      }

      // ─── i18nRegions.list ───
      case 'regions': {
        const data = await youtubeFetch('i18nRegions', { part: 'snippet' }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        result = (data.items || []).map(item => ({
          id: item.id, name: item.snippet?.name || "", region: item.snippet?.gl || item.id,
        }));
        break;
      }

      // ─── i18nLanguages.list ───
      case 'languages': {
        const data = await youtubeFetch('i18nLanguages', { part: 'snippet' }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        result = (data.items || []).map(item => ({
          id: item.id, name: item.snippet?.name || "", language: item.snippet?.hl || item.id,
        }));
        break;
      }

      // ─── guideCategories.list ───
      case 'guideCategories': {
        const data = await youtubeFetch('guideCategories', {
          part: 'snippet', regionCode: params.regionCode || 'FR',
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        result = (data.items || []).map(item => ({
          id: item.id, title: item.snippet?.title || "", channelId: item.snippet?.channelId,
        }));
        break;
      }

      // ─── playlists.list — channel playlists ───
      case 'playlists': {
        const data = await youtubeFetch('playlists', {
          part: 'snippet,contentDetails',
          channelId: params.channelId,
          maxResults: params.maxResults || 25,
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        result = (data.items || []).map(item => ({
          id: item.id,
          title: item.snippet?.title || "",
          description: item.snippet?.description || "",
          thumbnail_url: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || "",
          item_count: item.contentDetails?.itemCount || 0,
          channel_id: item.snippet?.channelId,
          channel_name: item.snippet?.channelTitle,
          _source: "youtube",
        }));
        break;
      }

      // ─── playlistItems.list — videos in a playlist ───
      case 'playlistItems': {
        const data = await youtubeFetch('playlistItems', {
          part: 'snippet,contentDetails',
          playlistId: params.playlistId,
          maxResults: params.maxResults || 50,
          pageToken: params.pageToken,
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        const ids = (data.items || []).map(i => i.contentDetails?.videoId).filter(Boolean);
        result = await fetchVideoStats(ids, apiKey);
        break;
      }

      // ─── channelSections.list ───
      case 'channelSections': {
        const data = await youtubeFetch('channelSections', {
          part: 'snippet,contentDetails',
          channelId: params.channelId,
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        result = (data.items || []).map(item => ({
          id: item.id,
          type: item.snippet?.type || "",
          title: item.snippet?.title || "",
          position: item.snippet?.position,
          playlists: item.contentDetails?.playlists || [],
          channels: item.contentDetails?.channels || [],
          _source: "youtube",
        }));
        break;
      }

      // ─── search.list — all types (video + channel) ───
      case 'searchAll': {
        const data = await youtubeFetch('search', {
          part: 'snippet',
          q: params.q,
          maxResults: params.maxResults || 25,
          regionCode: params.regionCode || 'FR',
          hl: params.hl || 'fr',
          order: params.order || 'relevance',
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        const videoIds = (data.items || []).filter(i => i.id?.kind === 'youtube#video').map(i => i.id.videoId);
        const channelIds = (data.items || []).filter(i => i.id?.kind === 'youtube#channel').map(i => i.id.channelId);
        const videos = await fetchVideoStats(videoIds, apiKey);
        let channels = [];
        if (channelIds.length > 0) {
          const chData = await youtubeFetch('channels', { part: 'snippet,statistics', id: channelIds.join(',') }, apiKey);
          if (!chData._error) channels = (chData.items || []).map(mapChannel);
        }
        result = { videos, channels };
        break;
      }

      // ─── OAuth config — returns the Google OAuth Client ID (public, client-side GIS) ───
      case 'getOAuthConfig': {
        const clientId = secrets.get("GOOGLE_CLIENT_ID");
        if (!clientId) return Response.json({ error: 'GOOGLE_CLIENT_ID not configured. Add it in Dashboard → Settings → Environment Variables.' }, { status: 500 });
        result = { client_id: clientId };
        break;
      }

      // ─── liveStreamingDetails — get activeLiveChatId for a live video ───
      case 'getLiveChatId': {
        const data = await youtubeFetch('videos', {
          part: 'liveStreamingDetails',
          id: params.id,
        }, apiKey);
        if (data._error) return Response.json(data, { status: data.status });
        const item = data.items?.[0];
        result = { live_chat_id: item?.liveStreamingDetails?.activeLiveChatId || null };
        break;
      }

      // ─── liveChatMessages.list — real-time live chat messages (requires OAuth) ───
      case 'liveChatMessages': {
        const chatUrl = new URL(`https://www.googleapis.com/youtube/v3/liveChatMessages`);
        chatUrl.searchParams.set('part', 'snippet,authorDetails');
        chatUrl.searchParams.set('liveChatId', String(params.liveChatId));
        chatUrl.searchParams.set('maxResults', String(params.maxResults || 200));
        if (params.pageToken) chatUrl.searchParams.set('pageToken', params.pageToken);

        const fetchOpts: Record<string, any> = {};
        if (params.oauthToken) {
          fetchOpts.headers = { Authorization: `Bearer ${params.oauthToken}` };
        } else {
          chatUrl.searchParams.set('key', apiKey);
        }

        const chatRes = await fetch(chatUrl.toString(), fetchOpts);
        if (!chatRes.ok) {
          const errBody = await chatRes.json().catch(() => ({}));
          return Response.json({
            _error: true,
            status: chatRes.status,
            message: errBody.error?.message || `YouTube API ${chatRes.status}`,
          }, { status: chatRes.status });
        }
        const chatData = await chatRes.json();
        result = {
          messages: (chatData.items || []).map(mapLiveChatMessage),
          nextPageToken: chatData.nextPageToken || null,
          pollingIntervalMillis: chatData.pollingIntervalMillis || 5000,
          _source: 'youtube',
        };
        break;
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return Response.json({ data: result, _source: 'youtube' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}