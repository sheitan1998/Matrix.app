import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { SUPPORT_EMAIL, SUPPORT_NAME, SUPPORT_AVATAR } from '../../shared/supportAccount.ts';

// Strip HTML tags and limit length to sanitize user-controlled strings before
// embedding them into system-generated messages (prevents XSS / content injection).
function sanitize(str: unknown, maxLen = 200): string {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').slice(0, maxLen);
}

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, ...params } = body;
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    switch (action) {

      // ---- Open a ticket conversation (create initial DM from Support to user) ----
      case 'openTicket': {
        const { ticket_id, subject, message } = params;
        if (!ticket_id || !message) return Response.json({ error: 'Missing ticket_id or message' }, { status: 400 });

        const ticket = await base44.asServiceRole.entities.SupportTicket.get(ticket_id);
        if (!ticket) return Response.json({ error: 'Ticket not found' }, { status: 404 });

        if (ticket.user_email !== user.email && user.role !== 'admin') {
          return Response.json({ error: 'Not authorized' }, { status: 403 });
        }

        await base44.asServiceRole.entities.DirectMessage.create({
          sender_email: SUPPORT_EMAIL,
          sender_name: SUPPORT_NAME,
          sender_avatar: SUPPORT_AVATAR,
          recipient_email: ticket.user_email,
          recipient_name: ticket.user_name || '',
          recipient_avatar: ticket.user_avatar || '',
          content: `🎫 Support — ${sanitize(subject)}\n\n${sanitize(message, 2000)}`,
          ticket_id,
          is_read: false,
          is_read_only: false,
        });

        return Response.json({ success: true });
      }

      // ---- Send a message to a ticket (server-side lock enforcement) ----
      case 'sendMessage': {
        const { ticket_id, content, attachments } = params;
        if (!ticket_id || !content) return Response.json({ error: 'Missing ticket_id or content' }, { status: 400 });

        const ticket = await base44.asServiceRole.entities.SupportTicket.get(ticket_id);
        if (!ticket) return Response.json({ error: 'Ticket not found' }, { status: 404 });

        // Authorization: only the ticket owner or an admin can send messages
        if (ticket.user_email !== user.email && user.role !== 'admin') {
          return Response.json({ error: 'Not authorized' }, { status: 403 });
        }

        // SERVER-SIDE LOCK ENFORCEMENT: reject if ticket is locked, closed, or resolved
        if (ticket.is_locked || ticket.status === 'closed' || ticket.status === 'resolved') {
          return Response.json({ error: 'Ticket is locked', is_locked: true }, { status: 403 });
        }

        await base44.asServiceRole.entities.TicketMessage.create({
          ticket_id,
          author_email: user.email,
          author_name: user.full_name || user.pseudo || user.email,
          author_avatar: user.avatar_url || '',
          author_role: user.role === 'admin' ? 'admin' : 'user',
          content,
          attachments: attachments || [],
        });

        if (user.role === 'admin') {
          // Admin reply → DM from Support to user (individual admin never exposed)
          await base44.asServiceRole.entities.DirectMessage.create({
            sender_email: SUPPORT_EMAIL,
            sender_name: SUPPORT_NAME,
            sender_avatar: SUPPORT_AVATAR,
            recipient_email: ticket.user_email,
            recipient_name: ticket.user_name || '',
            recipient_avatar: ticket.user_avatar || '',
            content: `🎫 Support — ${sanitize(ticket.subject)}\n\n${sanitize(content, 2000)}`,
            ticket_id,
            is_read: false,
            is_read_only: false,
          });
          if (ticket.status === 'open') {
            await base44.asServiceRole.entities.SupportTicket.update(ticket_id, { status: 'in_progress' });
          }
        } else {
          // User reply → DM from user to Support (visible in user's messaging)
          await base44.asServiceRole.entities.DirectMessage.create({
            sender_email: user.email,
            sender_name: user.full_name || user.pseudo || user.email,
            sender_avatar: user.avatar_url || '',
            recipient_email: SUPPORT_EMAIL,
            recipient_name: SUPPORT_NAME,
            recipient_avatar: SUPPORT_AVATAR,
            content,
            ticket_id,
            is_read: false,
            is_read_only: false,
          });
        }

        return Response.json({ success: true });
      }

      // ---- Lock or unlock a ticket (admin only) ----
      case 'lockTicket': {
        if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

        const { ticket_id } = params;
        if (!ticket_id) return Response.json({ error: 'Missing ticket_id' }, { status: 400 });

        const ticket = await base44.asServiceRole.entities.SupportTicket.get(ticket_id);
        if (!ticket) return Response.json({ error: 'Ticket not found' }, { status: 404 });

        const newLocked = !ticket.is_locked;
        await base44.asServiceRole.entities.SupportTicket.update(ticket_id, {
          is_locked: newLocked,
          status: newLocked ? 'closed' : 'open',
        });

        // When closing, mark all associated DMs as read-only (not deleted)
        // When reopening, remove read-only
        const dms = await base44.asServiceRole.entities.DirectMessage.filter({ ticket_id });
        for (const dm of dms) {
          await base44.asServiceRole.entities.DirectMessage.update(dm.id, { is_read_only: newLocked });
        }

        // System message in the conversation
        await base44.asServiceRole.entities.TicketMessage.create({
          ticket_id,
          author_email: user.email,
          author_name: user.full_name || 'Système',
          author_role: 'admin',
          content: newLocked ? 'Ticket clôturé et verrouillé.' : 'Ticket rouvert.',
          is_system: true,
        });

        return Response.json({ success: true, is_locked: newLocked });
      }

      // ---- Update ticket status (admin only) ----
      case 'updateStatus': {
        if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

        const { ticket_id, status } = params;
        if (!ticket_id || !status) return Response.json({ error: 'Missing ticket_id or status' }, { status: 400 });

        const updateData: any = { status };
        if (status === 'closed') updateData.is_locked = true;
        if (status === 'open') updateData.is_locked = false;

        await base44.asServiceRole.entities.SupportTicket.update(ticket_id, updateData);

        // When closing, mark DMs as read-only; when reopening, remove read-only
        const dms = await base44.asServiceRole.entities.DirectMessage.filter({ ticket_id });
        const readOnly = status === 'closed' || status === 'resolved';
        for (const dm of dms) {
          await base44.asServiceRole.entities.DirectMessage.update(dm.id, { is_read_only: readOnly });
        }

        return Response.json({ success: true });
      }

      // ---- Permanently delete a ticket and all associated data (admin only) ----
      case 'deleteTicket': {
        if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

        const { ticket_id } = params;
        if (!ticket_id) return Response.json({ error: 'Missing ticket_id' }, { status: 400 });

        // Delete all ticket messages
        await base44.asServiceRole.entities.TicketMessage.deleteMany({ ticket_id });

        // Delete all associated DMs
        await base44.asServiceRole.entities.DirectMessage.deleteMany({ ticket_id });

        // Delete the ticket itself
        await base44.asServiceRole.entities.SupportTicket.delete(ticket_id);

        return Response.json({ success: true });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}