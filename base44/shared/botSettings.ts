// Réglages du bot Matrix Live — forme exacte attendue par le worker,
// complétée par les blocs twitch / youtube / discord de la page de configuration.

const ESCALATION = () => [
  { type: 'delete', message: '$(user), merci de respecter les règles du chat.' },
  { type: 'timeout', seconds: 60 },
  { type: 'timeout', seconds: 600 },
];

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
    filters: {
      blacklist: { enabled: false, exempt: 'regulars', words: [], offenseWindowMinutes: 30, escalation: ESCALATION() },
      caps: { enabled: false, exempt: 'regulars', minLength: 15, maxPercent: 70, offenseWindowMinutes: 30, escalation: ESCALATION() },
      emotes: { enabled: false, exempt: 'regulars', maxEmotes: 10, offenseWindowMinutes: 30, escalation: ESCALATION() },
      links: { enabled: false, exempt: 'regulars', whitelist: [], offenseWindowMinutes: 30, escalation: ESCALATION() },
      symbols: { enabled: false, exempt: 'regulars', minLength: 10, maxPercent: 50, maxConsecutive: 10, offenseWindowMinutes: 30, escalation: ESCALATION() },
      repetitions: { enabled: false, exempt: 'regulars', maxSameMessages: 3, windowSeconds: 60, maxRepeatedChars: 15, maxRepeatedWords: 6, offenseWindowMinutes: 30, escalation: ESCALATION() },
    },
    timers: [],
    timersOnlyWhenLive: true,
    youtube: { videoId: '', liveChatEnabled: true, quotaLimit: 10000 },
    twitch: {
      liveAlertEnabled: false,
      liveAlertChannelId: '',
      liveAlertMessage: '🔴 {channel} est en direct : {title}',
    },
    discord: {
      announceChannelId: '',
      announceLiveEnabled: false,
      announceMessage: '🔴 {channel} est en live sur {platform} : {link}',
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

const LEVELS = ['everyone', 'regulars', 'moderators'];
const EXEMPTS = ['regulars', 'subscribers', 'moderators'];
const STEP_TYPES = ['delete', 'timeout', 'warn'];

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
  if (key === 'links') filter.whitelist = (Array.isArray(filter.whitelist) ? filter.whitelist : []).map((w: any) => text(String(w || '').trim(), 120)).filter(Boolean).slice(0, 200);
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

  merged.commands = (Array.isArray(merged.commands) ? merged.commands : []).map((cmd: any) => ({
    name: String(cmd?.name || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32),
    response: text(cmd?.response, 400),
    level: LEVELS.includes(cmd?.level) ? cmd.level : 'everyone',
    enabled: cmd?.enabled !== false,
    cooldown: cmd?.cooldown === null || cmd?.cooldown === '' || cmd?.cooldown === undefined
      ? null
      : num(cmd.cooldown, 0, 3600, 0),
  })).filter((cmd: any) => cmd.name && cmd.response).slice(0, 200);

  const baseFilters = defaultSettings().filters as any;
  merged.filters = merged.filters || {};
  for (const key of Object.keys(baseFilters)) {
    merged.filters[key] = sanitizeFilter(key, merged.filters[key], baseFilters[key]);
  }

  merged.timers = (Array.isArray(merged.timers) ? merged.timers : []).map((timer: any, index: number) => ({
    id: text(timer?.id, 40) || `timer-${index + 1}`,
    name: text(timer?.name, 80) || `Minuteur ${index + 1}`,
    messages: (Array.isArray(timer?.messages) ? timer.messages : [])
      .map((m: any) => text(String(m || '').trim(), 400)).filter(Boolean).slice(0, 20),
    intervalMinutes: num(timer?.intervalMinutes, 1, 1440, 15),
    minLines: num(timer?.minLines, 0, 500, 5),
    enabled: timer?.enabled !== false,
  })).filter((timer: any) => timer.messages.length > 0).slice(0, 100);

  merged.timersOnlyWhenLive = merged.timersOnlyWhenLive !== false;

  merged.youtube = merged.youtube || {};
  merged.youtube.videoId = text(String(merged.youtube.videoId || '').trim(), 40);
  merged.youtube.liveChatEnabled = merged.youtube.liveChatEnabled !== false;
  merged.youtube.quotaLimit = num(merged.youtube.quotaLimit, 0, 1000000, 10000);

  merged.twitch = merged.twitch || {};
  merged.twitch.liveAlertEnabled = merged.twitch.liveAlertEnabled === true;
  merged.twitch.liveAlertChannelId = text(String(merged.twitch.liveAlertChannelId || '').trim(), 64);
  merged.twitch.liveAlertMessage = text(merged.twitch.liveAlertMessage, 400);

  merged.discord = merged.discord || {};
  merged.discord.announceChannelId = text(String(merged.discord.announceChannelId || '').trim(), 64);
  merged.discord.announceLiveEnabled = merged.discord.announceLiveEnabled === true;
  merged.discord.announceMessage = text(merged.discord.announceMessage, 400);
  merged.discord.ticketChannelId = text(String(merged.discord.ticketChannelId || '').trim(), 64);
  merged.discord.ticketPanelMessageId = text(String(merged.discord.ticketPanelMessageId || '').trim(), 64);
  merged.discord.ticketPanelTitle = text(merged.discord.ticketPanelTitle, 120);
  merged.discord.ticketPanelDescription = text(merged.discord.ticketPanelDescription, 800);
  merged.discord.ticketFixedPanel = merged.discord.ticketFixedPanel !== false;

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