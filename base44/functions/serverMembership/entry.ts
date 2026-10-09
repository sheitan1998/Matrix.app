import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { requireUser, rateLimitByIp, sanitizeText, errorResponse, HttpError } from '../../shared/security.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const sdk = createClientFromRequest(req);
    const user = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (!rateLimitByIp(req, `membership:${user.email}`, 30, 60_000)) {
      return errorResponse(429, 'Trop de requêtes. Réessayez dans un instant.');
    }

    if (action === 'join') {
      const serverId = sanitizeText(body?.serverId, 100);
      if (!serverId) return errorResponse(400, 'ID du serveur manquant.');

      let server;
      try { server = await sdk.asServiceRole.entities.Server.get(serverId); }
      catch { return errorResponse(404, 'Serveur introuvable.'); }
      if (!server) return errorResponse(404, 'Serveur introuvable.');

      const existingMembers = await sdk.asServiceRole.entities.ServerMember.filter(
        { server_id: serverId, user_email: user.email },
        '-created_date',
        1
      );
      const existing = (Array.isArray(existingMembers) ? existingMembers : existingMembers?.items || [])[0];

      if (existing?.is_banned) {
        const isPermanent = !existing.ban_until;
        const isExpired = existing.ban_until && new Date(existing.ban_until).getTime() < Date.now();
        if (isPermanent || !isExpired) {
          return errorResponse(403, 'Vous êtes banni de ce serveur.');
        }
      }

      if (existing && !existing.is_banned) {
        return Response.json({ data: existing });
      }

      const member = await sdk.asServiceRole.entities.ServerMember.create({
        server_id: serverId,
        user_email: user.email,
        user_name: user.full_name || user.email.split('@')[0],
        user_avatar: user.avatar_url,
        role: 'member',
        is_banned: false,
      });
      await sdk.asServiceRole.entities.Server.update(serverId, {
        members_count: (server.members_count || 1) + 1,
      });

      // Post welcome message if enabled and a channel is configured
      if (server.welcome_enabled && server.welcome_channel_id) {
        const memberName = user.full_name || user.email.split('@')[0];
        const welcomeText = (server.welcome_message || 'Bienvenue {user} ! 🎉')
          .replace(/\{user\}/g, memberName);
        await sdk.asServiceRole.entities.ServerMessage.create({
          server_id: serverId,
          channel_id: server.welcome_channel_id,
          author_email: 'system@matrix.app',
          author_name: 'MATRIX Bot',
          author_avatar: '',
          content: welcomeText,
          type: 'system',
          interactive_buttons: server.interactive_buttons || [],
        });
      }

      return Response.json({ data: member });
    }

    if (action === 'leave') {
      const serverId = sanitizeText(body?.serverId, 100);
      if (!serverId) return errorResponse(400, 'ID du serveur manquant.');

      const leaveMembers = await sdk.asServiceRole.entities.ServerMember.filter(
        { server_id: serverId, user_email: user.email },
        null,
        1
      );
      const member = (Array.isArray(leaveMembers) ? leaveMembers : leaveMembers?.items || [])[0];
      if (!member) return Response.json({ data: { ok: true } });

      let server;
      try { server = await sdk.asServiceRole.entities.Server.get(serverId); }
      catch { server = null; }
      if (server && server.owner_email === user.email) {
        return errorResponse(400, 'Le propriétaire ne peut pas quitter son propre serveur.');
      }

      await sdk.asServiceRole.entities.ServerMember.delete(member.id);
      if (server) {
        await sdk.asServiceRole.entities.Server.update(serverId, {
          members_count: Math.max(0, (server.members_count || 1) - 1),
        });
      }
      return Response.json({ data: { ok: true } });
    }

    if (action === 'getMembers') {
      const serverId = sanitizeText(body?.serverId, 100);
      if (!serverId) return errorResponse(400, 'ID du serveur manquant.');

      const members = await sdk.asServiceRole.entities.ServerMember.filter(
        { server_id: serverId },
        '-created_date',
        200
      );
      const memberList = Array.isArray(members) ? members : members?.items || [];
      return Response.json({ members: memberList });
    }

    if (action === 'updateMember') {
      const memberId = sanitizeText(body?.memberId, 100);
      const serverId = sanitizeText(body?.serverId, 100);
      if (!memberId || !serverId) return errorResponse(400, 'Paramètres manquants.');

      let server;
      try { server = await sdk.asServiceRole.entities.Server.get(serverId); }
      catch { return errorResponse(404, 'Serveur introuvable.'); }
      if (!server) return errorResponse(404, 'Serveur introuvable.');

      let target;
      try { target = await sdk.asServiceRole.entities.ServerMember.get(memberId); }
      catch { return errorResponse(404, 'Membre introuvable.'); }
      if (!target || target.server_id !== serverId) return errorResponse(404, 'Membre introuvable.');

      if (target.user_email === server.owner_email) {
        return errorResponse(403, 'Impossible de modifier le propriétaire du serveur.');
      }

      const isOwner = server.owner_email === user.email;
      const isPlatformAdmin = user.role === 'admin';

      const callerMembers = await sdk.asServiceRole.entities.ServerMember.filter(
        { server_id: serverId, user_email: user.email },
        null,
        1
      );
      const callerMember = (Array.isArray(callerMembers) ? callerMembers : callerMembers?.items || [])[0];
      const isServerAdmin = callerMember?.role === 'admin';
      const isModerator = callerMember?.role === 'moderator';

      if (!isOwner && !isPlatformAdmin && !isServerAdmin && !isModerator) {
        return errorResponse(403, 'Permissions insuffisantes.');
      }

      const update: Record<string, any> = {};
      const newRole = sanitizeText(body?.role, 20);

      if (newRole) {
        if (!['member', 'moderator', 'admin'].includes(newRole)) {
          return errorResponse(400, 'Rôle invalide.');
        }
        if (!isOwner && !isPlatformAdmin && newRole === 'admin') {
          return errorResponse(403, 'Seul le propriétaire peut attribuer le rôle admin.');
        }
        if (!isOwner && !isPlatformAdmin && !isServerAdmin) {
          return errorResponse(403, 'Permissions insuffisantes pour modifier le rôle.');
        }
        update.role = newRole;
      }

      if (typeof body?.is_banned === 'boolean') {
        update.is_banned = body.is_banned;
        update.ban_until = body.ban_until === null ? null : sanitizeText(body?.ban_until, 30);
      }
      if (typeof body?.is_muted_text === 'boolean') {
        update.is_muted_text = body.is_muted_text;
        update.mute_text_until = body.mute_text_until === null ? null : sanitizeText(body?.mute_text_until, 30);
      }
      if (typeof body?.is_muted_voice === 'boolean') {
        update.is_muted_voice = body.is_muted_voice;
        update.mute_voice_until = body.mute_voice_until === null ? null : sanitizeText(body?.mute_voice_until, 30);
      }

      if (Object.keys(update).length === 0) {
        return errorResponse(400, 'Aucune modification spécifiée.');
      }

      const updated = await sdk.asServiceRole.entities.ServerMember.update(memberId, update);
      return Response.json({ data: updated });
    }

    return errorResponse(400, `Action inconnue: ${action}`);
  } catch (err) {
    if (err instanceof HttpError) return errorResponse(err.status, err.message);
    console.error('[serverMembership] error:', err);
    return errorResponse(500, 'Erreur lors de la gestion des membres.');
  }
}