// Structure de réglages Discord attendue par le bot, par serveur :
// { settings: { welcome, leave, boost, birthday }, dm, tickets, mod, levels }
// Les champs pilotés par la page /live-bot sont recopiés ; les autres sont
// conservés tels quels (ou initialisés avec des valeurs par défaut saines).

import { sanitizeSettings } from './botSettings.ts';

const isPlain = (value: any) => !!value && typeof value === 'object' && !Array.isArray(value);

const hex = (value: any, fallback: string) => (/^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : fallback);

const snowflake = (value: any) => String(value || '').replace(/\D/g, '').slice(0, 25);

const snowflakes = (value: any) => (Array.isArray(value) ? value : []).map(snowflake).filter(Boolean).slice(0, 25);

const text = (value: any, max: number) => (typeof value === 'string' ? value.slice(0, max) : '');

const num = (value: any, min: number, max: number, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
};

const DEFAULT_COLOR = '#57f287';

const MESSAGE_DEFAULTS: Record<string, string> = {
  welcome: 'Bienvenue {user} sur {server} ! Nous sommes {count} membres.',
  leave: 'Au revoir {user}, à bientôt sur {server}.',
  boost: 'Merci {user} pour le boost de {server} ({boosts} boosts) !',
  birthday: 'Joyeux anniversaire {user} ! 🎉',
};

function memberBlock(kind: string, previous: any, overrides: Record<string, any> = {}) {
  const entry = isPlain(previous) ? previous : {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(overrides, key);
  return {
    enabled: has('enabled') ? overrides.enabled === true : entry.enabled === true,
    channelId: has('channelId') ? snowflake(overrides.channelId) : snowflake(entry.channelId),
    message: has('message')
      ? (text(overrides.message, 500) || MESSAGE_DEFAULTS[kind])
      : (text(entry.message, 500) || MESSAGE_DEFAULTS[kind]),
    title: text(entry.title, 120),
    color: hex(entry.color, DEFAULT_COLOR),
    thumbnail: entry.thumbnail === true,
    image: text(entry.image, 400),
  };
}

function ticketBlock(discord: any, previous: any, config: any) {
  const entry = isPlain(previous) ? previous : {};
  const panel = isPlain(discord?.panels?.tickets) ? discord.panels.tickets : {};
  const published = isPlain(config?.discord_panels?.tickets) ? config.discord_panels.tickets : {};
  const opening = isPlain(entry.opening) ? entry.opening : {};
  const maxPerUser = [1, 2, 3, 5].includes(Number(entry.maxPerUser)) ? Number(entry.maxPerUser) : 1;

  return {
    categoryId: snowflake(entry.categoryId),
    logChannelId: snowflake(entry.logChannelId),
    supportRoleIds: snowflakes(entry.supportRoleIds),
    askSubject: entry.askSubject !== false,
    maxPerUser,
    panel: {
      title: text(panel.title, 120) || 'Support Matrix',
      description: text(panel.description, 1800) || 'Ouvre un ticket, un membre de l’équipe te répondra.',
      color: hex(panel.color, '#5865f2'),
      buttonLabel: text(panel.buttonLabel, 80) || 'Ouvrir un ticket',
      buttonEmoji: text(panel.buttonEmoji, 32) || '🎫',
    },
    opening: {
      message: text(opening.message, 800) || 'Bienvenue {user} ! Un membre du staff va te répondre.',
      color: hex(opening.color, DEFAULT_COLOR),
    },
    panelChannelId: snowflake(published.channel_id || published.channelId || panel.channelId),
    panelMessageId: snowflake(published.message_id || published.messageId || panel.messageId),
  };
}

function modBlock(discord: any, previous: any) {
  const entry = isPlain(previous) ? previous : {};
  return {
    reportChannelId: snowflake(entry.reportChannelId),
    warnLogChannelId: snowflake(discord?.moderationLogChannelId) || snowflake(entry.warnLogChannelId),
    announceChannelId: snowflake(discord?.announceChannelId) || snowflake(entry.announceChannelId),
    warnThreshold: num(entry.warnThreshold, 0, 20, 0),
    timeoutMinutes: num(entry.timeoutMinutes, 0, 40320, 10),
  };
}

function levelsBlock(previous: any) {
  const entry = isPlain(previous) ? previous : {};
  return {
    enabled: entry.enabled === true,
    xpMin: num(entry.xpMin, 1, 1000, 15),
    xpMax: num(entry.xpMax, 1, 1000, 25),
    cooldownSec: num(entry.cooldownSec, 0, 86400, 60),
    voiceEnabled: entry.voiceEnabled !== false,
    voiceXpPerMin: num(entry.voiceXpPerMin, 0, 1000, 5),
    announceChannelId: snowflake(entry.announceChannelId),
    announceMessage: text(entry.announceMessage, 400) || 'GG {user}, tu passes niveau {level} !',
    stackRewards: entry.stackRewards === true,
    rewards: (Array.isArray(entry.rewards) ? entry.rewards : [])
      .map((reward: any) => ({ level: num(reward?.level, 1, 500, 1), roleId: snowflake(reward?.roleId) }))
      .filter((reward: any) => reward.roleId)
      .slice(0, 50),
  };
}

function dmBlock(previous: any) {
  const entry = isPlain(previous) ? previous : {};
  return {
    enabled: entry.enabled === true,
    message: text(entry.message, 800) || 'Bienvenue {user} sur {server} !',
    color: hex(entry.color, DEFAULT_COLOR),
  };
}

export function buildGuildConfig(settingsInput: any, config: any = {}, existing: any = {}) {
  const discord: any = sanitizeSettings(isPlain(settingsInput) ? settingsInput : {}).discord;
  const previous = isPlain(existing) ? existing : {};
  const previousSettings = isPlain(previous.settings) ? previous.settings : {};

  return {
    settings: {
      welcome: memberBlock('welcome', previousSettings.welcome, {
        enabled: discord.welcomeEnabled === true,
        channelId: discord.welcomeChannelId,
        message: discord.welcomeMessage,
      }),
      leave: memberBlock('leave', previousSettings.leave),
      boost: memberBlock('boost', previousSettings.boost),
      birthday: memberBlock('birthday', previousSettings.birthday),
    },
    dm: dmBlock(previous.dm),
    tickets: ticketBlock(discord, previous.tickets, config),
    mod: modBlock(discord, previous.mod),
    levels: levelsBlock(previous.levels),
  };
}

// Fusionne la configuration d'un serveur dans la carte { [guildId]: {...} }.
export function withGuildConfig(config: any, guildId: string, guildConfig: any) {
  const stored = isPlain(config?.guilds) ? config.guilds : {};
  const id = snowflake(guildId);
  if (!id) return stored;
  return { ...stored, [id]: guildConfig };
}