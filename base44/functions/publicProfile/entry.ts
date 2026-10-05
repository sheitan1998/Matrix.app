import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const pseudo = body?.pseudo;
    if (!pseudo) return Response.json({ error: 'Missing pseudo' }, { status: 400 });

    // Fetch user by pseudo using service role — use filter (not list) to avoid loading all users
    const userPage = await base44.asServiceRole.entities.User.filter({ pseudo: pseudo }, null, 1);
    const user = (userPage?.items || userPage || [])[0];
    if (!user) return Response.json({ error: 'Creator not found' }, { status: 404 });

    // Fetch user progress (publicly readable)
    const progressList = await base44.asServiceRole.entities.UserProgress.filter({ user_email: user.email });
    const progress = progressList[0] || null;

    // Calculate total TRIX received (sum of positive transaction amounts)
    const transactions = await base44.asServiceRole.entities.TrixTransaction.filter({ user_email: user.email });
    const totalTrixReceived = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    // Fetch public shorts and videos by the creator
    const shorts = await base44.asServiceRole.entities.Short.filter({ channel_id: user.channel_id });
    const videos = await base44.asServiceRole.entities.Video.filter({ channel_id: user.channel_id });

    // Fetch equipped cosmetics (publicly visible)
    const cosmetics = await base44.asServiceRole.entities.UserCosmetic.filter({ user_email: user.email, is_equipped: true });

    return Response.json({
      creator: {
        pseudo: (user.pseudo || "").split('#')[0],
        pseudo_tag: user.pseudo_tag || "",
        avatar_url: user.avatar_url || "",
        bio: user.bio || "",
        level: progress?.level || 1,
        badge_count: progress?.badges?.length || 0,
        total_trix_received: totalTrixReceived,
        cosmetics: cosmetics || [],
      },
      shorts: shorts.map((s) => ({
        id: s.id,
        title: s.title,
        video_url: s.video_url,
        thumbnail_url: s.thumbnail_url,
        views: s.views || 0,
        likes: s.likes || 0,
        created_date: s.created_date,
      })),
      videos: videos.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        thumbnail_url: v.thumbnail_url,
        video_url: v.video_url,
        duration: v.duration,
        views: v.views || 0,
        likes: v.likes || 0,
        category: v.category,
        created_date: v.created_date,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}