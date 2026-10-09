import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { requireUser, rateLimitByIp, sanitizeText, errorResponse, HttpError } from '../../shared/security.ts';
import { loadRegistry, getMember, resolveServerPermissions, allowed, findCustomRole } from '../../shared/nexusAccess.ts';
import { dispatchEvent } from '../../shared/nexusEngine.ts';

function displayName(user: any) {
  return String(user.pseudo || user.full_name || user.email.split('@')[0]).split('#')[0].trim();
}

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

      // Run the dynamic member_join rules (welcome message + buttons, auto-role, ...)
      await dispatchEvent(sdk, {
        server,
        trigger: 'member_join',
        member,
        actorName: displayName(user),
        eventId: `${serverId}:${user.email}`,
      });

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

        // Run the dynamic member_leave rules (goodbye message, ...)
        await dispatchEvent(sdk, {
          server,
          trigger: 'member_leave',
          member,
          actorName: member.user_name || displayName(user),
          eventId: `${serverId}:${user.email}`,
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

      // Dynamic permission check: the caller's resolved permissions (roles + custom roles + registry)
      const registry = await loadRegistry(sdk);
      const callerMember = await getMember(sdk, serverId, user.email);
      const caller = resolveServerPermissions({ server, member: callerMember, user, registry });
      const isTopLevel = caller.isOwner || user.role === 'admin';

      if (!caller.isMember) return errorResponse(403, 'Permissions insuffisantes.');
      if (target.role === 'admin' && !isTopLevel) {
        return errorResponse(403, 'Seul le propriétaire peut modifier un administrateur.');
      }

      const update: Record<string, any> = {};
      const newRole = sanitizeText(body?.role, 20);

      if (newRole) {
        if (!['member', 'moderator', 'admin'].includes(newRole)) {
          return errorResponse(400, 'Rôle invalide.');
        }
        if (!allowed(caller.perms, 'manage_roles')) {
          return errorResponse(403, 'Permission "Gérer les rôles" requise.');
        }
        if (newRole === 'admin' && !isTopLevel) {
          return errorResponse(403, 'Seul le propriétaire peut attribuer le rôle admin.');
        }
        update.role = newRole;
      }

      if (body?.custom_role !== undefined) {
        if (!allowed(caller.perms, 'manage_roles')) {
          return errorResponse(403, 'Permission "Gérer les rôles" requise.');
        }
        if (body.custom_role === null || body.custom_role === '') {
          update.custom_role = null;
        } else {
          const customRole = findCustomRole(server, sanitizeText(body.custom_role, 100));
          if (!customRole) return errorResponse(400, 'Rôle personnalisé introuvable.');
          if (customRole.permissions?.administrator && !isTopLevel) {
            return errorResponse(403, 'Seul le propriétaire peut attribuer un rôle administrateur.');
          }
          update.custom_role = customRole.name;
        }
      }

      if (typeof body?.is_banned === 'boolean') {
        if (!allowed(caller.perms, 'ban_members')) return errorResponse(403, 'Permission "Bannir des membres" requise.');
        update.is_banned = body.is_banned;
        update.ban_until = body.ban_until === null ? null : sanitizeText(body?.ban_until, 30);
      }
      if (typeof body?.is_muted_text === 'boolean') {
        if (!allowed(caller.perms, 'timeout_members')) return errorResponse(403, 'Permission "Exclure temporairement" requise.');
        update.is_muted_text = body.is_muted_text;
        update.mute_text_until = body.mute_text_until === null ? null : sanitizeText(body?.mute_text_until, 30);
      }
      if (typeof body?.is_muted_voice === 'boolean') {
        if (!allowed(caller.perms, 'voice_mute_members') && !allowed(caller.perms, 'timeout_members')) {
          return errorResponse(403, 'Permission "Rendre les membres muets" requise.');
        }
        update.is_muted_voice = body.is_muted_voice;
        update.mute_voice_until = body.mute_voice_until === null ? null : sanitizeText(body?.mute_voice_until, 30);
      }

      if (Object.keys(update).length === 0) {
        return errorResponse(400, 'Aucune modification spécifiée.');
      }

      const updated = await sdk.asServiceRole.entities.ServerMember.update(memberId, update);

      // Run the dynamic role_assigned rules when a role actually changed
      const assigned = (update.custom_role && update.custom_role !== target.custom_role && update.custom_role)
        || (update.role && update.role !== target.role && update.role);
      if (assigned) {
        await dispatchEvent(sdk, {
          server,
          registry,
          trigger: 'role_assigned',
          member: { ...target, ...update },
          actorName: target.user_name || target.user_email.split('@')[0],
          eventId: `${memberId}:${assigned}`,
          vars: { role: assigned },
        });
      }

      return Response.json({ data: updated });
    }

    return errorResponse(400, `Action inconnue: ${action}`);
  } catch (err) {
    if (err instanceof HttpError) return errorResponse(err.status, err.message);
    console.error('[serverMembership] error:', err);
    return errorResponse(500, 'Erreur lors de la gestion des membres.');
  }
}