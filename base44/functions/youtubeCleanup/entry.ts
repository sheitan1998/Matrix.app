import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * YouTube API Data Cleanup — YouTube API Services Compliance
 * Deletes Video and Channel records that were sourced from YouTube API
 * and have not been updated in more than 30 days (YouTube API policy).
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();

    // Fetch all videos and channels (service role to access all records)
    const allVideos = await base44.asServiceRole.entities.Video.list('-updated_date', 500);
    const allChannels = await base44.asServiceRole.entities.Channel.list('-updated_date', 500);

    // Identify YouTube-sourced records older than 30 days
    // YouTube-sourced videos have no video_url (they stream from YouTube embed) and no owner
    const expiredVideos = allVideos.filter((v: any) => {
      const lastUpdate = v.updated_date || v.created_date;
      return !v.video_url && lastUpdate && new Date(lastUpdate).getTime() < Date.now() - THIRTY_DAYS_MS;
    });

    // Channels with no owner_email are YouTube API-only cache records
    const expiredChannels = allChannels.filter((c: any) => {
      const lastUpdate = c.updated_date || c.created_date;
      return !c.owner_email && lastUpdate && new Date(lastUpdate).getTime() < Date.now() - THIRTY_DAYS_MS;
    });

    let deletedVideos = 0;
    let deletedChannels = 0;

    for (const v of expiredVideos) {
      await base44.asServiceRole.entities.Video.delete(v.id);
      deletedVideos++;
    }

    for (const c of expiredChannels) {
      await base44.asServiceRole.entities.Channel.delete(c.id);
      deletedChannels++;
    }

    return Response.json({
      success: true,
      deleted_videos: deletedVideos,
      deleted_channels: deletedChannels,
      cutoff_date: cutoff,
      message: `YouTube data cleanup complete. Removed ${deletedVideos} video(s) and ${deletedChannels} channel(s) older than 30 days.`,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}