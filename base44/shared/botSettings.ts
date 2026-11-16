// Réglages du bot Matrix Live — forme exacte attendue par le worker,
// complétée par les blocs twitch / youtube / discord de la page de configuration.

const ESCALATION = () => [
  { type: 'delete', message: '$(user), merci de respecter les règles du chat.' },
  { type: 'timeout', seconds: 60 },
  { type: 'timeout', seconds: 600 },
];

export const TWITCH_ALERTS = () => ({
  follow: { enabled: false, message: 'Merci {user} pour le follow !' },
  sub: { enabled: false, message: 'Merci {user} pour l’abonnement !' },
  giftSub: { enabled: false, message: 'Merci pour le sub cadeau offert à la communauté !' },
  raid: { enabled: false, minViewers: 5, message: 'Raid de {user} avec {viewers} viewers, on lâche des emotes !' },
  bits: { enabled: false, message: 'Merci {user} pour les bits !' },
});

export const YOUTUBE_ALERTS = () => ({
  member: { enabled: false, message: 'Bienvenue {user} dans la chaîne !' },
  superChat: { enabled: false, message: 'Merci {user} pour le Super Chat !' },
  superSticker: { enabled: false, message: 'Merci {user} pour le Super Sticker !' },
});

const FILTERS = () => ({
  blacklist: { enabled: false, exempt: 'regulars', words: [], offenseWindowMinutes: 30, escalation: ESCALATION() },
  caps: { enabled: false, exempt: 'regulars', minLength: 15, maxPercent: 70, offenseWindowMinutes: 30, escalation: ESCALATION() },
  emotes: { enabled: false, exempt: 'regulars', maxEmotes: 10, offenseWindowMinutes: 30, escalation: ESCALATION() },
  links: { enabled: false, exempt: 'regulars', whitelist: [], allowClips: false, offenseWindowMinutes: 30, escalation: ESCALATION() },
  symbols: { enabled: false, exempt: 'regulars', minLength: 10, maxPercent: 50, maxConsecutive: 10, offenseWindowMinutes: 30, escalation: ESCALATION() },
  repetitions: { enabled: false, exempt: 'regulars', maxSameMessages: 3, windowSeconds: 60, maxRepeatedChars: 15, maxRepeatedWords: 6, offenseWindowMinutes: 30, escalation: ESCALATION() },
});

const MODERATION = () => ({
  action: 'delete',
  warning: '{user}, ce message n’est pas autorisé ici.',
});

export function defaultSettings() {
  return {
    prefix: '!',
    globalCooldown: 5,
    userCooldown: 15,
    modsBypassCooldown: true,
    regulars: [],
    defaults: {
      commands: { enabled: true, level: 'everyone' },
      uptime: { enabled: true, level: 'everyone' },
      permit: { enabled: true, level: 'moderators', seconds: 60 },
    },
    commands: [],
    filters: FILTERS(),
    moderation: MODERATION(),
    timers: [],
    timersOnlyWhenLive: true,
    alerts: TWITCH_ALERTS(),
    youtube: {
      videoId: '',
      liveChatEnabled: true,
      quotaLimit: 10000,
      commands: [],
      filters: FILTERS(),
      moderation: MODERATION(),
      timers: [],
      alerts: YOUTUBE_ALERTS(),
    },
    twitch: {
      liveAlertEnabled: false,
      liveAlertChannelId: '',
      liveAlertMessage: '🔴 {channel} est en direct : {title}',
    },
    discord: {
      announceChannelId: '',
      announceLiveEnabled: false,
      announceMessage: '🔴 {channel} est en live sur {platform} : {link}',
      announceMention: 'none',
      announceEmbedTitle: '',
      announceEmbedColor: '#a855f7',
      announceShowThumbnail: true,
      announceWatchButton: true,
      announceDeleteAfterLive: false,
      welcomeEnabled: false,
      welcomeChannelId: '',
      welcomeMessage: 'Bienvenue {user} sur {server} ! Nous sommes {memberCount} membres.',
      welcomeRoleId: '',
      moderationEnabled: false,
      moderationLogChannelId: '',
      moderationAntiInvite: true,
      moderationAntiSpam: true,
      moderationWords: [],
      slashCommandsEnabled: true,
      slashHelp: true,
      slashLive: true,
      slashRank: true,
      slashClear: true,
      customSlash: [],
      panels: {
        tickets: { channelId: '', title: 'Support Matrix', description: 'Ouvre un ticket, un membre de l’équipe te répondra.', color: '#5865f2', buttonLabel: 'Ouvrir un ticket', buttonEmoji: '🎫' },
        rules: { channelId: '', title: 'Règlement du serveur', description: 'Merci de lire et respecter ces règles.', color: '#22c55e', buttonLabel: 'J’accepte le règlement', buttonEmoji: '✅' },
        roles: { channelId: '', title: 'Choisis tes rôles', description: 'Sélectionne le rôle qui te correspond.', color: '#a855f7', placeholder: 'Choisis ton rôle', options: [] },
      },
      ticketChannelId: '',
      ticketPanelMessageId: '',
      ticketPanelTitle: 'Support Matrix',
      ticketPanelDescription: 'Ouvre un ticket, un membre de l’équipe te répondra.',
      ticketFixedPanel: true,
    },
  };
}

const isPlain = (value: any) => !!value && typeof value === 'object' && !Array.isArray(value);

export function deepMerge(base: any, patch: any): any {
  if (!isPlain(patch)) return Array.isArray(patch) ? JSON.parse(JSON.stringify(patch)) : patch;
  const out = isPlain(base) ? { ...base } : {};
  for (const [key, value] of Object.entries(patch)) {
    out[key] = isPlain(value) && isPlain(out[key]) ? deepMerge(out[key], value) : deepMerge(undefined, value);
  }
  return out;
}

const num = (value: any, min: number, max: number, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed * 100) / 100));
};

const text = (value: any, max: number) => (typeof value === 'string' ? value.slice(0, max) : '');

const bool = (value: any, fallback: boolean) => (typeof value === 'boolean' ? value : fallback);

const LEVELS = ['everyone', 'subscribers', 'vips', 'regulars', 'moderators'];
const EXEMPTS = ['regulars', 'subscribers', 'moderators'];
const STEP_TYPES = ['delete', 'timeout', 'warn'];
const ACTIONS = ['delete', 'timeout60', 'timeout300', 'timeout600', 'ban'];

function sanitizeEscalation(steps: any) {
  return (Array.isArray(steps) ? steps : []).slice(0, 10).map((step: any) => ({
    type: STEP_TYPES.includes(step?.type) ? step.type : 'delete',
    ...(step?.type === 'timeout' || step?.seconds ? { seconds: num(step?.seconds, 0, 86400, 60) } : {}),
    ...(typeof step?.message === 'string' && step.message ? { message: text(step.message, 300) } : {}),
  }));
}

function sanitizeFilter(key: string, raw: any, base: any) {
  const filter = deepMerge(base, isPlain(raw) ? raw : {});
  filter.enabled = filter.enabled === true;
  filter.exempt = EXEMPTS.includes(filter.exempt) ? filter.exempt : 'regulars';
  filter.offenseWindowMinutes = num(filter.offenseWindowMinutes, 1, 1440, 30);
  filter.escalation = sanitizeEscalation(filter.escalation);
  if (key === 'blacklist') filter.words = (Array.isArray(filter.words) ? filter.words : []).map((w: any) => text(String(w || '').trim(), 64)).filter(Boolean).slice(0, 500);
  if (key === 'links') {
    filter.whitelist = (Array.isArray(filter.whitelist) ? filter.whitelist : []).map((w: any) => text(String(w || '').trim(), 120)).filter(Boolean).slice(0, 200);
    filter.allowClips = filter.allowClips === true;
  }
  if (key === 'caps' || key === 'symbols') {
    filter.minLength = num(filter.minLength, 1, 500, key === 'caps' ? 15 : 10);
    filter.maxPercent = num(filter.maxPercent, 1, 100, key === 'caps' ? 70 : 50);
  }
  if (key === 'symbols') filter.maxConsecutive = num(filter.maxConsecutive, 1, 100, 10);
  if (key === 'emotes') filter.maxEmotes = num(filter.maxEmotes, 1, 100, 10);
  if (key === 'repetitions') {
    filter.maxSameMessages = num(filter.maxSameMessages, 1, 50, 3);
    filter.windowSeconds = num(filter.windowSeconds, 5, 600, 60);
    filter.maxRepeatedChars = num(filter.maxRepeatedChars, 2, 200, 15);
    filter.maxRepeatedWords = num(filter.maxRepeatedWords, 1, 50, 6);
  }
  return filter;
}

function sanitizeFilters(raw: any) {
  const base = FILTERS() as any;
  const merged = isPlain(raw) ? raw : {};
  const out: any = {};
  for (const key of Object.keys(base)) out[key] = sanitizeFilter(key, merged[key], base[key]);
  return out;
}

function sanitizeModeration(raw: any) {
  const merged = deepMerge(MODERATION(), isPlain(raw) ? raw : {});
  return {
    action: ACTIONS.includes(merged.action) ? merged.action : 'delete',
    warning: text(merged.warning, 300),
  };
}

function sanitizeCommands(list: any) {
  return (Array.isArray(list) ? list : []).map((cmd: any) => ({
    name: String(cmd?.name || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32),
    response: text(cmd?.response, 400),
    level: LEVELS.includes(cmd?.level) ? cmd.level : 'everyone',
    enabled: cmd?.enabled !== false,
    cooldown: cmd?.cooldown === null || cmd?.cooldown === '' || cmd?.cooldown === undefined
      ? null
      : num(cmd.cooldown, 0, 3600, 0),
  })).filter((cmd: any) => cmd.name && cmd.response).slice(0, 200);
}

function sanitizeTimers(list: any) {
  return (Array.isArray(list) ? list : []).map((timer: any, index: number) => ({
    id: text(timer?.id, 40) || `timer-${index + 1}`,
    name: text(timer?.name, 80) || `Minuteur ${index + 1}`,
    messages: (Array.isArray(timer?.messages) ? timer.messages : [])
      .map((m: any) => text(String(m || '').trim(), 400)).filter(Boolean).slice(0, 20),
    intervalMinutes: num(timer?.intervalMinutes, 1, 1440, 15),
    minLines: num(timer?.minLines, 0, 500, 5),
    enabled: timer?.enabled !== false,
  })).filter((timer: any) => timer.messages.length > 0).slice(0, 100);
}

function sanitizeAlerts(raw: any, base: any) {
  const merged = deepMerge(base, isPlain(raw) ? raw : {});
  const out: any = {};
  for (const [key, def] of Object.entries(base as any)) {
    const entry: any = isPlain((merged as any)[key]) ? (merged as any)[key] : {};
    out[key] = { enabled: entry.enabled === true, message: text(entry.message, 300) };
    if ('minViewers' in (def as any)) out[key].minViewers = num(entry.minViewers, 1, 100000, (def as any).minViewers);
  }
  return out;
}

function sanitizePanels(raw: any) {
  const base = defaultSettings().discord.panels as any;
  const merged = deepMerge(base, isPlain(raw) ? raw : {});
  const hex = (value: any, fallback: string) => (/^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : fallback);
  const channel = (value: any) => text(String(value || '').trim().replace(/\D/g, ''), 25);

  return {
    tickets: {
      channelId: channel(merged?.tickets?.channelId),
      title: text(merged?.tickets?.title, 120) || base.tickets.title,
      description: text(merged?.tickets?.description, 1800) || base.tickets.description,
      color: hex(merged?.tickets?.color, base.tickets.color),
      buttonLabel: text(merged?.tickets?.buttonLabel, 80) || base.tickets.buttonLabel,
      buttonEmoji: text(merged?.tickets?.buttonEmoji, 32),
      messageId: text(String(merged?.tickets?.messageId || '').replace(/\D/g, ''), 25),
    },
    rules: {
      channelId: channel(merged?.rules?.channelId),
      title: text(merged?.rules?.title, 120) || base.rules.title,
      description: text(merged?.rules?.description, 1800) || base.rules.description,
      color: hex(merged?.rules?.color, base.rules.color),
      buttonLabel: text(merged?.rules?.buttonLabel, 80) || base.rules.buttonLabel,
      buttonEmoji: text(merged?.rules?.buttonEmoji, 32),
      messageId: text(String(merged?.rules?.messageId || '').replace(/\D/g, ''), 25),
    },
    roles: {
      channelId: channel(merged?.roles?.channelId),
      title: text(merged?.roles?.title, 120) || base.roles.title,
      description: text(merged?.roles?.description, 1800) || base.roles.description,
      color: hex(merged?.roles?.color, base.roles.color),
      placeholder: text(merged?.roles?.placeholder, 100) || base.roles.placeholder,
      messageId: text(String(merged?.roles?.messageId || '').replace(/\D/g, ''), 25),
      options: (Array.isArray(merged?.roles?.options) ? merged.roles.options : [])
        .map((option: any) => ({
          roleId: text(String(option?.roleId || '').replace(/\D/g, ''), 25),
          label: text(option?.label, 80),
          emoji: text(option?.emoji, 32),
        }))
        .filter((option: any) => option.roleId)
        .slice(0, 25),
    },
  };
}

function sanitizeYoutube(raw: any) {
  const base = defaultSettings().youtube as any;
  const merged = deepMerge(base, isPlain(raw) ? raw : {});
  return {
    videoId: text(String(merged.videoId || '').trim(), 40),
    liveChatEnabled: merged.liveChatEnabled !== false,
    quotaLimit: num(merged.quotaLimit, 0, 1000000, 10000),
    commands: sanitizeCommands(merged.commands),
    filters: sanitizeFilters(merged.filters),
    moderation: sanitizeModeration(merged.moderation),
    timers: sanitizeTimers(merged.timers),
    alerts: sanitizeAlerts(merged.alerts, YOUTUBE_ALERTS()),
  };
}

export function sanitizeSettings(input: any) {
  const merged: any = deepMerge(defaultSettings(), isPlain(input) ? input : {});

  merged.prefix = text(merged.prefix || '!', 3) || '!';
  merged.globalCooldown = num(merged.globalCooldown, 0, 3600, 5);
  merged.userCooldown = num(merged.userCooldown, 0, 3600, 15);
  merged.modsBypassCooldown = merged.modsBypassCooldown !== false;
  merged.regulars = (Array.isArray(merged.regulars) ? merged.regulars : [])
    .map((r: any) => text(String(r || '').trim(), 64)).filter(Boolean).slice(0, 200);

  merged.defaults = merged.defaults || {};
  for (const key of ['commands', 'uptime', 'permit']) {
    const entry = merged.defaults[key] || {};
    merged.defaults[key] = {
      enabled: entry.enabled !== false,
      level: LEVELS.includes(entry.level) ? entry.level : 'everyone',
      ...(key === 'permit' ? { seconds: num(entry.seconds, 1, 86400, 60) } : {}),
    };
  }

  merged.commands = sanitizeCommands(merged.commands);
  merged.filters = sanitizeFilters(merged.filters);
  merged.moderation = sanitizeModeration(merged.moderation);
  merged.timers = sanitizeTimers(merged.timers);
  merged.timersOnlyWhenLive = merged.timersOnlyWhenLive !== false;
  merged.alerts = sanitizeAlerts(merged.alerts, TWITCH_ALERTS());

  merged.youtube = sanitizeYoutube(merged.youtube);

  merged.twitch = merged.twitch || {};
  merged.twitch.liveAlertEnabled = merged.twitch.liveAlertEnabled === true;
  merged.twitch.liveAlertChannelId = text(String(merged.twitch.liveAlertChannelId || '').trim(), 64);
  merged.twitch.liveAlertMessage = text(merged.twitch.liveAlertMessage, 400);

  const discord = deepMerge(defaultSettings().discord, isPlain(merged.discord) ? merged.discord : {});
  merged.discord = {
    announceChannelId: text(String(discord.announceChannelId || '').trim(), 64),
    announceLiveEnabled: discord.announceLiveEnabled === true,
    announceMessage: text(discord.announceMessage, 400),
    announceMention: text(String(discord.announceMention || 'none').trim(), 64) || 'none',
    announceEmbedTitle: text(discord.announceEmbedTitle, 120),
    announceEmbedColor: /^#[0-9a-fA-F]{6}$/.test(String(discord.announceEmbedColor || '')) ? discord.announceEmbedColor : '#a855f7',
    announceShowThumbnail: bool(discord.announceShowThumbnail, true),
    announceWatchButton: bool(discord.announceWatchButton, true),
    announceDeleteAfterLive: discord.announceDeleteAfterLive === true,
    welcomeEnabled: discord.welcomeEnabled === true,
    welcomeChannelId: text(String(discord.welcomeChannelId || '').trim(), 64),
    welcomeMessage: text(discord.welcomeMessage, 400),
    welcomeRoleId: text(String(discord.welcomeRoleId || '').trim(), 64),
    moderationEnabled: discord.moderationEnabled === true,
    moderationLogChannelId: text(String(discord.moderationLogChannelId || '').trim(), 64),
    moderationAntiInvite: bool(discord.moderationAntiInvite, true),
    moderationAntiSpam: bool(discord.moderationAntiSpam, true),
    moderationWords: (Array.isArray(discord.moderationWords) ? discord.moderationWords : [])
      .map((w: any) => text(String(w || '').trim(), 64)).filter(Boolean).slice(0, 200),
    slashCommandsEnabled: bool(discord.slashCommandsEnabled, true),
    slashHelp: bool(discord.slashHelp, true),
    slashLive: bool(discord.slashLive, true),
    slashRank: bool(discord.slashRank, true),
    slashClear: bool(discord.slashClear, true),
    customSlash: (Array.isArray(discord.customSlash) ? discord.customSlash : []).map((entry: any) => ({
      name: String(entry?.name || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32),
      response: text(entry?.response, 400),
    })).filter((entry: any) => entry.name && entry.response).slice(0, 50),
    panels: sanitizePanels(discord.panels),
    ticketChannelId: text(String(discord.ticketChannelId || '').trim(), 64),
    ticketPanelMessageId: text(String(discord.ticketPanelMessageId || '').trim(), 64),
    ticketPanelTitle: text(discord.ticketPanelTitle, 120),
    ticketPanelDescription: text(discord.ticketPanelDescription, 800),
    ticketFixedPanel: discord.ticketFixedPanel !== false,
  };

  return merged;
}

// Clés qui ne doivent jamais sortir vers le navigateur.
export function stripSecrets(record: any) {
  if (!record || typeof record !== 'object') return record;
  const { access_token, refresh_token, token_expires_at, ...safe } = record;
  return safe;
}

export function normalizeDay(value: any) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return new Date().toISOString().slice(0, 10);
}

export function numericMap(value: any, limit = 50) {
  if (!isPlain(value)) return {};
  const out: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value).slice(0, limit)) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) out[text(key, 80)] = Math.round(parsed);
  }
  return out;
}