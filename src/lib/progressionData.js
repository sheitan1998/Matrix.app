// ============================================================
// MATRIX Progression System — Data Configuration
// Fully extensible: add entries to arrays to extend the system.
// ============================================================

// XP needed to advance from `level` to `level + 1`
export const XP_FORMULA = (level) => Math.floor(100 * Math.pow(level, 1.4));

// XP awarded per action
export const XP_REWARDS = {
  daily_login: 50,
  time_spent: 10,
  live_time: 15,
  watch_video: 20,
  watch_live: 15,
  create_live: 100,
  publish_video: 80,
  create_server: 150,
  voice_channel: 5,
  send_message: 2,
  comment: 5,
  like: 1,
  receive_like: 3,
  receive_subscriber: 50,
  use_ai: 10,
  invite_friend: 200,
  participate_event: 100,
  participate_tournament: 150,
  popular_content: 500,
  valid_report: 30,
  help_community: 25,
};

// Anti-spam: minimum ms between XP gains for the same action
export const ANTI_SPAM = {
  time_spent: 300000,
  live_time: 300000,
  voice_channel: 300000,
  watch_video: 60000,
  watch_live: 60000,
  send_message: 30000,
  comment: 30000,
  like: 10000,
  receive_like: 5000,
  use_ai: 60000,
  create_live: 60000,
  publish_video: 60000,
  create_server: 60000,
  invite_friend: 60000,
  participate_event: 60000,
  participate_tournament: 60000,
  popular_content: 3600000,
  valid_report: 60000,
  help_community: 60000,
  receive_subscriber: 10000,
  daily_login: 3600000,
};

// ============================================================
// Ranks — auto-assigned based on level
// ============================================================
export const RANKS = [
  { id: 'recruit',    name: 'Recrue MATRIX',             icon: '🌑', minLevel: 1,   color: '#94a3b8' },
  { id: 'explorer',   name: 'Explorateur',                icon: '🛰', minLevel: 10,  color: '#60a5fa' },
  { id: 'pilot',      name: 'Pilote Stellaire',           icon: '🚀', minLevel: 25,  color: '#22c55e' },
  { id: 'guardian',   name: 'Gardien Galactique',         icon: '🌌', minLevel: 50,  color: '#a855f7' },
  { id: 'commander',  name: 'Commandant MATRIX',          icon: '⚡', minLevel: 100, color: '#fbbf24' },
  { id: 'elite',      name: 'Élite MATRIX',               icon: '💎', minLevel: 200, color: '#06b6d4' },
  { id: 'legend',     name: 'Légende MATRIX',             icon: '👑', minLevel: 400, color: '#f43f5e' },
  { id: 'architect',  name: 'Architecte du Multivers',    icon: '🌠', minLevel: 800, color: '#e879f9' },
];

export function getRank(level) {
  return [...RANKS].reverse().find(r => level >= r.minLevel) || RANKS[0];
}

// ============================================================
// Rarities
// ============================================================
export const RARITIES = {
  common:    { name: 'Commun',      color: '#94a3b8', glow: false, icon: '⚪' },
  uncommon:  { name: 'Peu commun',  color: '#22c55e', glow: false, icon: '🟢' },
  rare:      { name: 'Rare',        color: '#3b82f6', glow: true,  icon: '🔵' },
  epic:      { name: 'Épique',      color: '#a855f7', glow: true,  icon: '🟣' },
  legendary: { name: 'Légendaire',  color: '#f97316', glow: true,  icon: '🟠' },
  mythic:    { name: 'Mythique',    color: '#ef4444', glow: true,  icon: '🔴' },
  cosmic:    { name: 'Cosmique',    color: '#e879f9', glow: true,  icon: '✨' },
};

// ============================================================
// Badges
// ============================================================
export const BADGE_CATEGORIES = [
  { id: 'beginner',   name: 'Débutant',   icon: '🌱' },
  { id: 'creator',    name: 'Créateur',   icon: '🎨' },
  { id: 'streaming',  name: 'Streaming',  icon: '📡' },
  { id: 'ai',         name: 'IA',         icon: '🤖' },
  { id: 'community',  name: 'Communauté', icon: '👥' },
  { id: 'events',     name: 'Événements', icon: '🏆' },
  { id: 'premium',    name: 'Premium',    icon: '💎' },
  { id: 'secret',     name: 'Secrets',    icon: '🔒' },
];

export const BADGES = [
  // Débutant
  { id: 'first_step',      name: 'Premier pas',           icon: '👣', rarity: 'common',   category: 'beginner',  condition: { stat: 'total_actions', op: '>=', val: 1 } },
  { id: 'first_comment',   name: 'Premier commentaire',    icon: '💬', rarity: 'common',   category: 'beginner',  condition: { stat: 'comment', op: '>=', val: 1 } },
  { id: 'first_live',      name: 'Premier live',           icon: '🔴', rarity: 'common',   category: 'beginner',  condition: { stat: 'create_live', op: '>=', val: 1 } },
  { id: 'first_video',     name: 'Première vidéo',         icon: '🎬', rarity: 'common',   category: 'beginner',  condition: { stat: 'publish_video', op: '>=', val: 1 } },
  { id: 'first_server',    name: 'Premier serveur',        icon: '🏰', rarity: 'common',   category: 'beginner',  condition: { stat: 'create_server', op: '>=', val: 1 } },

  // Créateur
  { id: 'creator_bronze',   name: 'Créateur Bronze',   icon: '🥉', rarity: 'uncommon',  category: 'creator', condition: { stat: 'publish_video', op: '>=', val: 10 } },
  { id: 'creator_silver',   name: 'Créateur Argent',   icon: '🥈', rarity: 'rare',      category: 'creator', condition: { stat: 'publish_video', op: '>=', val: 50 } },
  { id: 'creator_gold',     name: 'Créateur Or',       icon: '🥇', rarity: 'epic',      category: 'creator', condition: { stat: 'publish_video', op: '>=', val: 100 } },
  { id: 'creator_platinum', name: 'Créateur Platine',  icon: '💿', rarity: 'legendary', category: 'creator', condition: { stat: 'publish_video', op: '>=', val: 500 } },
  { id: 'creator_diamond',  name: 'Créateur Diamant',  icon: '💎', rarity: 'mythic',    category: 'creator', condition: { stat: 'publish_video', op: '>=', val: 1000 } },
  { id: 'creator_legend',   name: 'Créateur Légende',  icon: '👑', rarity: 'cosmic',    category: 'creator', condition: { stat: 'publish_video', op: '>=', val: 5000 } },

  // Streaming
  { id: 'stream_100h',   name: '100 heures de live',   icon: '⏱',  rarity: 'uncommon',  category: 'streaming', condition: { stat: 'live_stream_minutes', op: '>=', val: 6000 } },
  { id: 'stream_500h',   name: '500 heures',            icon: '🕐', rarity: 'rare',      category: 'streaming', condition: { stat: 'live_stream_minutes', op: '>=', val: 30000 } },
  { id: 'stream_1000h',  name: '1000 heures',           icon: '🕒', rarity: 'epic',      category: 'streaming', condition: { stat: 'live_stream_minutes', op: '>=', val: 60000 } },
  { id: 'stream_5000h',  name: '5000 heures',           icon: '🗓',  rarity: 'legendary', category: 'streaming', condition: { stat: 'live_stream_minutes', op: '>=', val: 300000 } },
  { id: 'stream_10000h', name: '10000 heures',          icon: '♾',  rarity: 'cosmic',    category: 'streaming', condition: { stat: 'live_stream_minutes', op: '>=', val: 600000 } },

  // IA
  { id: 'ai_expert',    name: 'Expert IA',       icon: '🧠', rarity: 'rare',      category: 'ai', condition: { stat: 'use_ai', op: '>=', val: 100 } },
  { id: 'ai_master',    name: 'Maître IA',       icon: '🔮', rarity: 'epic',      category: 'ai', condition: { stat: 'use_ai', op: '>=', val: 500 } },
  { id: 'ai_architect', name: 'Architecte IA',   icon: '⚙',  rarity: 'legendary', category: 'ai', condition: { stat: 'use_ai', op: '>=', val: 1000 } },
  { id: 'ai_oracle',    name: 'Oracle MATRIX',   icon: '👁',  rarity: 'cosmic',    category: 'ai', condition: { stat: 'use_ai', op: '>=', val: 5000 } },

  // Communauté
  { id: 'friends_100',  name: '100 amis',    icon: '🤝', rarity: 'uncommon',  category: 'community', condition: { stat: 'total_friends', op: '>=', val: 100 } },
  { id: 'friends_500',  name: '500 amis',    icon: '💚', rarity: 'rare',      category: 'community', condition: { stat: 'total_friends', op: '>=', val: 500 } },
  { id: 'friends_1000', name: '1000 amis',   icon: '💙', rarity: 'epic',      category: 'community', condition: { stat: 'total_friends', op: '>=', val: 1000 } },
  { id: 'mentor',       name: 'Mentor',      icon: '🎓', rarity: 'rare',      category: 'community', condition: { stat: 'help_community', op: '>=', val: 50 } },
  { id: 'leader',       name: 'Leader',      icon: '🚩', rarity: 'epic',      category: 'community', condition: { stat: 'help_community', op: '>=', val: 200 } },
  { id: 'founder',      name: 'Fondateur',   icon: '🏛',  rarity: 'legendary', category: 'community', condition: { stat: 'create_server', op: '>=', val: 10 } },

  // Événements
  { id: 'event_participant',   name: 'Participant',        icon: '🎫', rarity: 'common',   category: 'events', condition: { stat: 'participate_event', op: '>=', val: 1 } },
  { id: 'event_champion',      name: 'Champion',           icon: '🏅', rarity: 'rare',     category: 'events', condition: { stat: 'tournaments_won', op: '>=', val: 1 } },
  { id: 'event_organizer',     name: 'Organisateur',       icon: '🎪', rarity: 'epic',     category: 'events', condition: { stat: 'events_organized', op: '>=', val: 5 } },
  { id: 'tournament_winner',   name: 'Tournoi remporté',   icon: '🏆', rarity: 'legendary', category: 'events', condition: { stat: 'tournaments_won', op: '>=', val: 10 } },

  // Premium
  { id: 'supporter_bronze',  name: 'Supporter Bronze',  icon: '🥉', rarity: 'uncommon',  category: 'premium', condition: { stat: 'premium_tier', op: '>=', val: 1 } },
  { id: 'supporter_silver',  name: 'Supporter Argent',  icon: '🥈', rarity: 'rare',      category: 'premium', condition: { stat: 'premium_tier', op: '>=', val: 2 } },
  { id: 'supporter_gold',    name: 'Supporter Or',      icon: '🥇', rarity: 'epic',      category: 'premium', condition: { stat: 'premium_tier', op: '>=', val: 3 } },
  { id: 'vip',               name: 'VIP',               icon: '💠', rarity: 'legendary', category: 'premium', condition: { stat: 'premium_tier', op: '>=', val: 4 } },
  { id: 'founder_premium',   name: 'Founder',           icon: '🎖',  rarity: 'mythic',    category: 'premium', condition: { stat: 'is_founder', op: '==', val: true } },
  { id: 'premium_plus',      name: 'Premium+',          icon: '🌟', rarity: 'cosmic',    category: 'premium', condition: { stat: 'premium_tier', op: '>=', val: 5 } },

  // Secrets (hidden until unlocked)
  { id: 'galactic_traveler', name: 'Voyageur Galactique',    icon: '👽', rarity: 'cosmic',  category: 'secret', secret: true, condition: { stat: 'secret_galactic', op: '>=', val: 1 } },
  { id: 'cosmic_explorer',   name: 'Explorateur Cosmique',   icon: '🌌', rarity: 'cosmic',  category: 'secret', secret: true, condition: { stat: 'secret_cosmic', op: '>=', val: 1 } },
  { id: 'survivor',          name: 'Survivant',              icon: '☄',  rarity: 'mythic',  category: 'secret', secret: true, condition: { stat: 'secret_survivor', op: '>=', val: 1 } },
  { id: 'matrix_legend',     name: 'Légende MATRIX',         icon: '⚡', rarity: 'cosmic',  category: 'secret', secret: true, condition: { stat: 'secret_legend', op: '>=', val: 1 } },
  { id: 'the_chosen',        name: 'Le Choisi',              icon: '👑', rarity: 'cosmic',  category: 'secret', secret: true, condition: { stat: 'secret_chosen', op: '>=', val: 1 } },
  { id: 'star_guardian',     name: 'Gardien des Étoiles',    icon: '🛰', rarity: 'mythic',  category: 'secret', secret: true, condition: { stat: 'secret_guardian', op: '>=', val: 1 } },
  { id: 'first_contact',     name: 'Premier Contact',        icon: '🛸', rarity: 'cosmic',  category: 'secret', secret: true, condition: { stat: 'secret_contact', op: '>=', val: 1 } },
];

// ============================================================
// Level Rewards — unlocked automatically on level-up
// ============================================================
export const LEVEL_REWARDS = [
  { level: 5,   id: 'reward_color_5',   name: 'Nouvelle couleur de profil',  icon: '🎨' },
  { level: 10,  id: 'reward_frame_10',  name: 'Cadre de profil animé',       icon: '🖼' },
  { level: 20,  id: 'reward_avatar_20', name: 'Avatar exclusif',            icon: '🎭' },
  { level: 30,  id: 'reward_bg_30',     name: 'Fond de profil',             icon: '🌌' },
  { level: 40,  id: 'reward_emoji_40',  name: "Pack d'émojis",              icon: '😃' },
  { level: 50,  id: 'reward_effect_50', name: 'Effets de messages',         icon: '✨' },
  { level: 75,  id: 'reward_title_75',  name: 'Titre personnalisé',         icon: '🏷' },
  { level: 100, id: 'reward_prestige',  name: 'Badge Prestige',             icon: '🔮' },
  { level: 250, id: 'reward_anim_250',  name: 'Animation de profil',        icon: '🎬' },
  { level: 500, id: 'reward_title_500', name: 'Titre Légendaire',           icon: '👑' },
  { level: 1000,id: 'reward_cosmic',    name: 'Badge Cosmique exclusif',    icon: '🌠' },
];

// ============================================================
// Prestige Tiers (I–X) — available from level 100
// ============================================================
export const PRESTIGE_TIERS = [
  { tier: 1,  name: 'Prestige I',    icon: '①', color: '#60a5fa' },
  { tier: 2,  name: 'Prestige II',   icon: '②', color: '#22c55e' },
  { tier: 3,  name: 'Prestige III',  icon: '③', color: '#a855f7' },
  { tier: 4,  name: 'Prestige IV',   icon: '④', color: '#fbbf24' },
  { tier: 5,  name: 'Prestige V',    icon: '⑤', color: '#f97316' },
  { tier: 6,  name: 'Prestige VI',   icon: '⑥', color: '#ef4444' },
  { tier: 7,  name: 'Prestige VII',  icon: '⑦', color: '#e879f9' },
  { tier: 8,  name: 'Prestige VIII', icon: '⑧', color: '#06b6d4' },
  { tier: 9,  name: 'Prestige IX',   icon: '⑨', color: '#f43f5e' },
  { tier: 10, name: 'Prestige X',    icon: '⑩', color: '#ffd700' },
];

// ============================================================
// Achievements
// ============================================================
export const ACHIEVEMENTS = [
  { id: 'create_100_videos',     name: 'Créer 100 vidéos',           icon: '🎬', xp: 500,  trophies: 3, condition: { stat: 'publish_video', op: '>=', val: 100 } },
  { id: 'create_100_lives',      name: 'Créer 100 lives',            icon: '🔴', xp: 500,  trophies: 3, condition: { stat: 'create_live', op: '>=', val: 100 } },
  { id: '1000_subscribers',      name: 'Obtenir 1000 abonnés',       icon: '📊', xp: 1000, trophies: 5, condition: { stat: 'receive_subscriber', op: '>=', val: 1000 } },
  { id: 'watch_500h',            name: 'Regarder 500h de contenu',   icon: '👁',  xp: 750,  trophies: 4, condition: { stat: 'watch_minutes', op: '>=', val: 30000 } },
  { id: 'create_50_servers',     name: 'Créer 50 serveurs',          icon: '🏰', xp: 1000, trophies: 5, condition: { stat: 'create_server', op: '>=', val: 50 } },
  { id: 'use_ai_1000',           name: 'Utiliser MATRIX AI 1000×',   icon: '🤖', xp: 800,  trophies: 4, condition: { stat: 'use_ai', op: '>=', val: 1000 } },
  { id: 'participate_100_events',name: 'Participer à 100 événements',icon: '🏆', xp: 1000, trophies: 5, condition: { stat: 'participate_event', op: '>=', val: 100 } },
  { id: 'complete_100_missions', name: 'Compléter 100 missions',     icon: '✅', xp: 1200, trophies: 6, badge_reward: 'matrix_legend', condition: { stat: 'missions_completed', op: '>=', val: 100 } },
];

// ============================================================
// Missions — randomly selected per period
// ============================================================
export const MISSION_TEMPLATES = {
  daily: [
    { id: 'd_watch_live',     name: 'Regarder un live',       action: 'watch_live',      target: 1,  xp: 50,  trophies: 1 },
    { id: 'd_comment',        name: 'Poster un commentaire',  action: 'comment',         target: 1,  xp: 30,  trophies: 1 },
    { id: 'd_use_ai',         name: 'Utiliser MATRIX AI',     action: 'use_ai',          target: 1,  xp: 40,  trophies: 1 },
    { id: 'd_publish_video',  name: 'Publier une vidéo',      action: 'publish_video',   target: 1,  xp: 100, trophies: 2 },
    { id: 'd_invite_friend',  name: 'Inviter un ami',         action: 'invite_friend',   target: 1,  xp: 200, trophies: 3 },
    { id: 'd_send_message',   name: 'Envoyer 5 messages',     action: 'send_message',    target: 5,  xp: 25,  trophies: 1 },
    { id: 'd_like',           name: 'Réagir à 10 contenus',   action: 'like',            target: 10, xp: 20,  trophies: 1 },
  ],
  weekly: [
    { id: 'w_create_3',       name: 'Créer 3 contenus',       action: 'publish_video',   target: 3,  xp: 300, trophies: 3 },
    { id: 'w_lives_5',        name: 'Participer à 5 lives',   action: 'watch_live',      target: 5,  xp: 250, trophies: 2 },
    { id: 'w_subscribers_10', name: 'Gagner 10 abonnés',      action: 'receive_subscriber', target: 10, xp: 500, trophies: 4 },
    { id: 'w_event',          name: 'Participer à un événement', action: 'participate_event', target: 1, xp: 400, trophies: 3 },
    { id: 'w_ai_10',          name: 'Utiliser MATRIX AI 10×',  action: 'use_ai',         target: 10, xp: 200, trophies: 2 },
    { id: 'w_comments_15',    name: 'Poster 15 commentaires',  action: 'comment',        target: 15, xp: 200, trophies: 2 },
  ],
  monthly: [
    { id: 'm_create_20',      name: 'Créer 20 contenus',       action: 'publish_video',   target: 20,  xp: 2000, trophies: 5 },
    { id: 'm_help_50',        name: 'Défi communautaire (50)', action: 'help_community',  target: 50,  xp: 3000, trophies: 5 },
    { id: 'm_ai_50',          name: 'Défi IA (50 utilisations)',action: 'use_ai',         target: 50,  xp: 1500, trophies: 4 },
    { id: 'm_live_20',        name: 'Défi streaming (20 lives)',action: 'create_live',    target: 20,  xp: 2500, trophies: 5 },
  ],
};

// ============================================================
// Shop Items
// ============================================================
export const SHOP_CATEGORIES = [
  { id: 'frames',       name: 'Cadres',         icon: '🖼' },
  { id: 'backgrounds',  name: 'Fonds',          icon: '🌌' },
  { id: 'animations',   name: 'Animations',     icon: '🎬' },
  { id: 'colors',       name: 'Couleurs',       icon: '🎨' },
  { id: 'titles',       name: 'Titres',         icon: '🏷' },
  { id: 'effects',      name: 'Effets de pseudo',icon: '✨' },
];

export const SHOP_ITEMS = [
  // Frames
  { id: 'frame_neon',    name: 'Cadre Néon',       category: 'frames', price: 500,   icon: '🟣', rarity: 'rare' },
  { id: 'frame_galaxy',  name: 'Cadre Galaxie',    category: 'frames', price: 1500,  icon: '🌌', rarity: 'epic' },
  { id: 'frame_matrix',  name: 'Cadre Matrix',     category: 'frames', price: 3000,  icon: '🟢', rarity: 'legendary' },
  { id: 'frame_gold',    name: 'Cadre Or',         category: 'frames', price: 5000,  icon: '🟡', rarity: 'mythic' },
  { id: 'frame_cosmic',  name: 'Cadre Cosmique',   category: 'frames', price: 10000, icon: '✨', rarity: 'cosmic' },
  // Backgrounds
  { id: 'bg_nebula',     name: 'Fond Nébuleuse',   category: 'backgrounds', price: 800,  icon: '🌠', rarity: 'rare' },
  { id: 'bg_matrix',     name: 'Fond Matrix',      category: 'backgrounds', price: 2000, icon: '🟢', rarity: 'epic' },
  { id: 'bg_galaxy',     name: 'Fond Galaxie',     category: 'backgrounds', price: 4000, icon: '🌌', rarity: 'legendary' },
  { id: 'bg_void',       name: 'Fond Néant',       category: 'backgrounds', price: 8000, icon: '⚫', rarity: 'cosmic' },
  // Animations
  { id: 'anim_glow',     name: 'Animation Glow',   category: 'animations', price: 600,  icon: '💫', rarity: 'rare' },
  { id: 'anim_pulse',    name: 'Animation Pulse',  category: 'animations', price: 1200, icon: '💓', rarity: 'epic' },
  { id: 'anim_particles',name: 'Animation Particules', category: 'animations', price: 3000, icon: '🎆', rarity: 'legendary' },
  { id: 'anim_cosmic',   name: 'Animation Cosmique',category: 'animations', price: 6000, icon: '✨', rarity: 'cosmic' },
  // Colors
  { id: 'color_violet',  name: 'Violet Néon',      category: 'colors', price: 300,  icon: '🟣', rarity: 'uncommon' },
  { id: 'color_green',   name: 'Vert Matrix',      category: 'colors', price: 300,  icon: '🟢', rarity: 'uncommon' },
  { id: 'color_blue',    name: 'Bleu Électrique',  category: 'colors', price: 300,  icon: '🔵', rarity: 'uncommon' },
  { id: 'color_gold',    name: 'Or',               category: 'colors', price: 500,  icon: '🟡', rarity: 'rare' },
  { id: 'color_rainbow', name: 'Arc-en-ciel',      category: 'colors', price: 2000, icon: '🌈', rarity: 'cosmic' },
  // Titles
  { id: 'title_pioneer', name: 'Pionnier',         category: 'titles', price: 1000,  icon: '🚀', rarity: 'rare' },
  { id: 'title_veteran', name: 'Vétéran',          category: 'titles', price: 2500,  icon: '🎖',  rarity: 'epic' },
  { id: 'title_master',  name: 'Maître',           category: 'titles', price: 5000,  icon: '👑', rarity: 'legendary' },
  { id: 'title_godlike', name: 'Divin',            category: 'titles', price: 10000, icon: '⚡', rarity: 'cosmic' },
  // Effects
  { id: 'effect_glow',     name: 'Effet Glow',         category: 'effects', price: 400,  icon: '🌟', rarity: 'uncommon' },
  { id: 'effect_shake',    name: 'Effet Vibration',    category: 'effects', price: 800,  icon: '📳', rarity: 'rare' },
  { id: 'effect_rainbow',  name: 'Effet Arc-en-ciel',  category: 'effects', price: 3000, icon: '🌈', rarity: 'cosmic' },
];

// ============================================================
// Leaderboard types
// ============================================================
export const LEADERBOARD_TYPES = [
  { id: 'level',       name: 'Top Niveau',      icon: '📈', field: 'level' },
  { id: 'trophies',    name: 'Top Trophées',    icon: '🏆', field: 'stats.total_trophies' },
  { id: 'xp',          name: 'Top XP',          icon: '⚡', field: 'total_xp' },
  { id: 'coins',       name: 'Top Jetons',      icon: '🪙', field: 'coins' },
];

// ============================================================
// Helper: evaluate a badge/achievement condition against stats
// ============================================================
export function checkCondition(condition, stats) {
  if (!condition) return false;
  const val = stats?.[condition.stat];
  if (val === undefined || val === null) return false;
  switch (condition.op) {
    case '>=': return val >= condition.val;
    case '>':  return val >  condition.val;
    case '==': return val === condition.val;
    case '<=': return val <= condition.val;
    case '<':  return val <  condition.val;
    default:   return false;
  }
}