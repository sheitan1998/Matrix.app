import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { listOf } from '../../shared/botAuth.ts';

// Connexion Discord du bot : lien d'invitation + serveurs où le bot est présent.
// Isolée de botConfig pour que la page reste fonctionnelle si Discord n'est pas configuré.
const DISCORD_API = 'https://discord.com/api/v10';
const DISCORD_PERMISSIONS = '1099780287510';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((error) => (error?.status === 401 ? null : Promise.reject(error)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({} as any));
    const action = String(body?.action || '');
    const now = new Date().toISOString();

    const existing = listOf(
      await base44.entities.BotConfig.filter({ owner_email: user.email }, { limit: 1 }),
    )[0] || null;

    const save = async (patch: Record<string, any>) => {
      if (existing) return await base44.entities.BotConfig.update(existing.id, { ...patch, updated_at: now });
      return await base44.entities.BotConfig.create({ owner_email: user.email, ...patch, updated_at: now });
    };

    if (action === 'invite') {
      const clientId = secrets.get('DISCORD_CLIENT_ID');
      if (!clientId) return Response.json({ error: 'discord_non_configure' }, { status: 400 });
      const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${DISCORD_PERMISSIONS}&scope=bot%20applications.commands`;
      await save({ discord_invite_url: url });
      return Response.json({ url });
    }

    if (action === 'servers') {
      const token = secrets.get('DISCORD_BOT_TOKEN');
      if (!token) return Response.json({ error: 'discord_non_configure', guilds: [] }, { status: 400 });

      const guildRes = await fetch(`${DISCORD_API}/users/@me/guilds`, {
        headers: { Authorization: `Bot ${token}` },
        signal: AbortSignal.timeout(15000),
      });
      const guildData = await guildRes.json().catch(() => []);
      if (!guildRes.ok) return Response.json({ error: 'discord_refused', guilds: [] }, { status: 502 });

      const list = Array.isArray(guildData) ? guildData.slice(0, 12) : [];
      const guilds = await Promise.all(list.map(async (guild: any) => {
        let memberCount = 0;
        try {
          const detail = await fetch(`${DISCORD_API}/guilds/${guild.id}?with_counts=true`, {
            headers: { Authorization: `Bot ${token}` },
            signal: AbortSignal.timeout(10000),
          }).then((res) => res.json());
          memberCount = Number(detail?.approximate_member_count) || Number(detail?.member_count) || 0;
        } catch {
          memberCount = 0;
        }
        return {
          id: String(guild.id),
          name: guild.name || 'Serveur Discord',
          icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128` : '',
          member_count: memberCount,
          bot_present: true,
        };
      }));

      await save({ discord_guilds: guilds });
      return Response.json({ guilds });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}