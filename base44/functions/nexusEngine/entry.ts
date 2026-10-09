import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';
import { requireUser, rateLimitByIp, sanitizeText, errorResponse, HttpError } from '../../shared/security.ts';
import {
  loadRegistry, getMember, resolveServerPermissions, resolveChannelPermissions,
  resolveExtensions, extensionOn, allowed, findChannel, rows,
} from '../../shared/nexusAccess.ts';
import { dispatchEvent } from '../../shared/nexusEngine.ts';

const EFFECTS = ['none', 'glow', 'rainbow', 'fire', 'sparkle', 'pulse', 'shake'];
const IMAGE_RE = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i;

function cleanContent(value: unknown, max = 4000) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '').trim().slice(0, max);
}

function deny(message: string): never {
  throw new HttpError(403, message);
}

async function loadServer(sdk: any, serverId: string) {
  if (!serverId) throw new HttpError(400, 'ID du serveur manquant.');
  let server;
  try { server = await sdk.asServiceRole.entities.Server.get(serverId); } catch { server = null; }
  if (!server) throw new HttpError(404, 'Serveur introuvable.');
  return server;
}

/** Load everything needed to evaluate a user's rights on a server. */
async function loadContext(sdk: any, server: any, user: any) {
  const [registry, member] = await Promise.all([loadRegistry(sdk), getMember(sdk, server.id, user.email)]);
  const access = resolveServerPermissions({ server, member, user, registry });
  const extensions = resolveExtensions(server, registry);
  return { registry, member, access, extensions };
}

export default async function(req: Request): Promise<Response> {
  try {
    const sdk = createClientFromRequest(req);
    const user = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (!rateLimitByIp(req, `nexusEngine:${user.email}`, 120, 60_000)) {
      return errorResponse(429, 'Trop de requêtes. Réessayez dans un instant.');
    }

    // ---- Resolved permissions for every channel + extension states (used by the UI) ----
    if (action === 'resolveAccess') {
      const server = await loadServer(sdk, sanitizeText(body?.serverId, 100));
      const { access, extensions } = await loadContext(sdk, server, user);
      const channels: Record<string, any> = {};
      for (const ch of server.channels || []) channels[ch.id] = resolveChannelPermissions(ch, access);
      const { perms, ...flags } = access;
      return Response.json({ access: flags, permissions: perms, channels, extensions });
    }

    // ---- Send a message: every permission, mute, slowmode and extension is enforced here ----
    if (action === 'sendMessage') {
      const server = await loadServer(sdk, sanitizeText(body?.serverId, 100));
      const channelId = sanitizeText(body?.channelId, 100);
      if (!channelId) return errorResponse(400, 'Salon manquant.');
      const { registry, access, extensions } = await loadContext(sdk, server, user);
      const channel = findChannel(server, channelId);
      const perms = resolveChannelPermissions(channel, access);

      if (!access.isMember) deny('Vous devez être membre du serveur.');
      if (access.mutedText) deny('Vous êtes rendu muet sur ce serveur.');
      if (!perms.view) deny("Vous n'avez pas accès à ce salon.");
      if (!allowed(perms, 'send_messages')) deny('Envoi de messages désactivé dans ce salon.');

      const content = cleanContent(body?.content);
      const fileUrl = sanitizeText(body?.file_url, 2000);
      const kind = sanitizeText(body?.kind, 20);
      const type = ['text', 'file', 'voice'].includes(body?.type) ? body.type : (fileUrl ? 'file' : 'text');
      const isThread = body?.is_thread_starter === true;
      if (!content && !fileUrl) return errorResponse(400, 'Message vide.');

      if (type === 'voice') {
        if (!extensionOn(extensions, 'voice_messaging')) deny('Les messages vocaux sont désactivés sur ce serveur.');
        if (!allowed(perms, 'send_voice')) deny('Messages vocaux non autorisés dans ce salon.');
      }
      if (type === 'file') {
        if (!allowed(perms, 'attach_files')) deny('Les fichiers ne sont pas autorisés dans ce salon.');
        if ((kind === 'image' || IMAGE_RE.test(fileUrl)) && !extensionOn(extensions, 'image_sharing')) {
          deny("Le partage d'images est désactivé sur ce serveur.");
        }
      }
      if (kind === 'gif' && !allowed(perms, 'use_gifs')) deny('Les GIFs ne sont pas autorisés dans ce salon.');
      if (kind === 'sticker' && !allowed(perms, 'use_stickers')) deny('Les stickers ne sont pas autorisés dans ce salon.');
      if (type === 'text' && !kind && /https?:\/\//i.test(content) && !allowed(perms, 'embed_links')) {
        deny('Les liens ne sont pas autorisés dans ce salon.');
      }
      if (/@(everyone|here)\b/.test(content) && !allowed(perms, 'mention_everyone')) {
        deny("Vous n'êtes pas autorisé à mentionner @everyone.");
      }
      if (isThread && !extensionOn(extensions, 'forum_channels')) deny('Les salons forum sont désactivés sur ce serveur.');

      const slowmode = Number(channel.slowmode_seconds || 0);
      if (slowmode > 0 && !allowed(perms, 'ignore_slowmode')) {
        const since = new Date(Date.now() - slowmode * 1000).toISOString();
        const recent = await sdk.asServiceRole.entities.ServerMessage.filter(
          { server_id: server.id, channel_id: channelId, author_email: user.email, created_date: { $gte: since } }, '-created_date', 1
        );
        if (rows(recent).length > 0) throw new HttpError(429, `Mode lent actif : patientez ${slowmode}s entre deux messages.`);
      }

      const effect = EFFECTS.includes(body?.effect) && type === 'text' && extensionOn(extensions, 'message_effects') ? body.effect : 'none';

      const msg = await sdk.asServiceRole.entities.ServerMessage.create({
        server_id: server.id,
        channel_id: channelId,
        author_email: user.email,
        author_name: user.full_name || user.email.split('@')[0],
        author_avatar: user.animated_avatar || user.avatar_url || '',
        content: content || sanitizeText(body?.file_name, 200),
        type,
        effect,
        file_url: fileUrl,
        file_name: sanitizeText(body?.file_name, 200),
        transcript: type === 'voice' ? cleanContent(body?.transcript, 4000) : '',
        reply_to_id: sanitizeText(body?.reply_to_id, 100),
        reply_to_name: sanitizeText(body?.reply_to_name, 100),
        reply_to_content: cleanContent(body?.reply_to_content, 300),
        ...(isThread ? { is_thread_starter: true, thread_title: sanitizeText(body?.thread_title, 200), thread_replies: 0, thread_pinned: false } : {}),
      });

      waitUntil(dispatchEvent(sdk, {
        server, registry, trigger: 'message_sent', eventId: msg.id,
        actorName: String(user.pseudo || user.full_name || '').split('#')[0] || 'Membre',
        vars: { channel: channel.name || '' },
      }));

      return Response.json({ data: msg });
    }

    // ---- Toggle a reaction or click an interactive button ----
    if (action === 'react') {
      const messageId = sanitizeText(body?.messageId, 100);
      let msg;
      try { msg = await sdk.asServiceRole.entities.ServerMessage.get(messageId); } catch { msg = null; }
      if (!msg) return errorResponse(404, 'Message introuvable.');
      const server = await loadServer(sdk, msg.server_id);
      const { access, extensions } = await loadContext(sdk, server, user);
      const perms = resolveChannelPermissions(findChannel(server, msg.channel_id), access);
      if (!access.isMember) deny('Vous devez être membre du serveur.');
      if (!perms.view) deny("Vous n'avez pas accès à ce salon.");

      let emoji = sanitizeText(body?.emoji, 50);
      const buttonId = sanitizeText(body?.buttonId, 100);
      if (buttonId) {
        if (!extensionOn(extensions, 'interactive_buttons')) deny('Les boutons interactifs sont désactivés sur ce serveur.');
        const btn = (msg.interactive_buttons || []).find((b: any) => b.id === buttonId);
        if (!btn) return errorResponse(404, 'Bouton introuvable.');
        emoji = btn.emoji || btn.label;
      }
      if (!emoji) return errorResponse(400, 'Réaction manquante.');

      const reactions = msg.reactions || [];
      const mine = reactions.some((r: any) => r.emoji === emoji && r.user_email === user.email);
      if (!mine && !allowed(perms, 'add_reactions')) deny('Les réactions sont désactivées dans ce salon.');
      const updated = mine
        ? reactions.filter((r: any) => !(r.emoji === emoji && r.user_email === user.email))
        : [...reactions, { emoji, user_email: user.email, user_name: user.full_name || user.email.split('@')[0] }];
      await sdk.asServiceRole.entities.ServerMessage.update(msg.id, { reactions: updated });
      return Response.json({ data: { reactions: updated } });
    }

    // ---- Delete a message: author, or manage_messages permission in that channel ----
    if (action === 'deleteMessage') {
      const messageId = sanitizeText(body?.messageId, 100);
      let msg;
      try { msg = await sdk.asServiceRole.entities.ServerMessage.get(messageId); } catch { msg = null; }
      if (!msg) return errorResponse(404, 'Message introuvable.');
      if (msg.author_email !== user.email) {
        const server = await loadServer(sdk, msg.server_id);
        const { access } = await loadContext(sdk, server, user);
        const perms = resolveChannelPermissions(findChannel(server, msg.channel_id), access);
        if (!allowed(perms, 'manage_messages')) deny('Permission "Gérer les messages" requise.');
      }
      await sdk.asServiceRole.entities.ServerMessage.delete(msg.id);
      return Response.json({ data: { ok: true } });
    }

    return errorResponse(400, `Action inconnue: ${action}`);
  } catch (err) {
    if (err instanceof HttpError) return errorResponse(err.status, err.message);
    console.error('[nexusEngine] error:', err);
    return errorResponse(500, "Erreur du moteur d'exécution Nexus.");
  }
}