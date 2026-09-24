import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { waitUntil } from 'base44:runtime';
import { SUPPORT_EMAIL, SUPPORT_NAME, SUPPORT_AVATAR } from '../../shared/supportAccount.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { content, is_read_only } = body;

    if (!content || !content.trim()) {
      return Response.json({ error: 'Missing content' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Authenticate — admin only
    const currentUser = await base44.auth.me();
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (currentUser.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    // Fetch all users (paginate)
    let allUsers: any[] = [];
    let offset = 0;
    const pageSize = 200;
    let hasMore = true;
    while (hasMore) {
      const batch = await base44.asServiceRole.entities.User.list('-created_date', pageSize, offset);
      allUsers = allUsers.concat(batch || []);
      hasMore = (batch || []).length === pageSize;
      offset += pageSize;
    }

    const readOnly = is_read_only !== false; // default true
    const messageContent = content.trim();

    // Create a DM from Équipe Matrix to each user (bypass RLS via asServiceRole)
    // Use waitUntil so the response returns immediately while messages are sent
    const sendAll = async () => {
      for (const u of allUsers) {
        if (!u.email) continue;
        try {
          await base44.asServiceRole.entities.DirectMessage.create({
            sender_email: SUPPORT_EMAIL,
            sender_name: SUPPORT_NAME,
            sender_avatar: SUPPORT_AVATAR,
            recipient_email: u.email,
            recipient_name: u.pseudo || u.full_name || u.email.split('@')[0],
            recipient_avatar: u.avatar_url || '',
            content: messageContent,
            is_read: false,
            is_read_only: readOnly,
          });
        } catch (e) {
          // Continue even if one fails
        }
      }
    };

    waitUntil(sendAll());

    return Response.json({
      success: true,
      recipients: allUsers.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}