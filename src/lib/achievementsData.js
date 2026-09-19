// ============================================================
// MATRIX Progression — Achievements (Trophies + XP)
// 330 achievements across 33 thematic seeds (10 tiers each).
// Fully independent of YouTube, Twitch, tournaments & events.
// Trophies: 1–10, XP: 100–1000.
// ============================================================

const TROPHY_IMG = "/media/tuto-gaming/6e448bdc9_Gemini_Generated_Image_9q71zn9q71zn9q71-removebg-preview.png";

// Each seed: { name, stat, baseVal, tiers:[{mult, suffix}] }
const SEEDS = [
  // ─── Existing / core stats (13) ───
  { name: "Premier pas", stat: "total_actions", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: " ×10" }, { mult: 50, suffix: " ×50" }, { mult: 100, suffix: " ×100" }, { mult: 250, suffix: " ×250" }, { mult: 500, suffix: " ×500" }, { mult: 1000, suffix: " ×1k" }, { mult: 2500, suffix: " ×2.5k" }, { mult: 5000, suffix: " ×5k" }, { mult: 10000, suffix: " ×10k" }] },
  { name: "Commentateur", stat: "comment", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }, { mult: 5000, suffix: "s" }, { mult: 10000, suffix: "s" }] },
  { name: "Serveurs créés", stat: "create_server", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 2, suffix: "s" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 15, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }] },
  { name: "Messages envoyés", stat: "send_message", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }, { mult: 5000, suffix: "s" }, { mult: 10000, suffix: "s" }] },
  { name: "Réactions données", stat: "like", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }, { mult: 5000, suffix: "s" }, { mult: 10000, suffix: "s" }] },
  { name: "J'aime reçus", stat: "receive_like", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }, { mult: 5000, suffix: "s" }, { mult: 10000, suffix: "s" }] },
  { name: "Sondages participés", stat: "participate_poll", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }] },
  { name: "Amis invités", stat: "invite_friend", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 2, suffix: "s" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 15, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }] },
  { name: "Aide communauté", stat: "help_community", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 200, suffix: "s" }, { mult: 300, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }] },
  { name: "Temps en vocal", stat: "voice_channel", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }] },
  { name: "Connexions quotidiennes", stat: "daily_logins", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 7, suffix: "s" }, { mult: 30, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 200, suffix: "s" }, { mult: 365, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 730, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 1500, suffix: "s" }] },
  { name: "Temps sur la plateforme", stat: "time_spent", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: " ×10" }, { mult: 50, suffix: " ×50" }, { mult: 100, suffix: " ×100" }, { mult: 250, suffix: " ×250" }, { mult: 500, suffix: " ×500" }, { mult: 1000, suffix: " ×1k" }, { mult: 2500, suffix: " ×2.5k" }, { mult: 5000, suffix: " ×5k" }, { mult: 10000, suffix: " ×10k" }] },
  { name: "Missions complétées", stat: "missions_completed", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 200, suffix: "s" }, { mult: 300, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }] },

  // ─── New thematic seeds (20) — 200 new achievements ───
  { name: "Cosmétiques collectionnés", stat: "cosmetics_owned", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }, { mult: 200, suffix: "s" }, { mult: 300, suffix: "s" }] },
  { name: "Cosmétiques équipés", stat: "cosmetics_equipped", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 20, suffix: "s" }, { mult: 30, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }, { mult: 200, suffix: "s" }] },
  { name: "Badges obtenus", stat: "badges_earned", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 15, suffix: "s" }, { mult: 20, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 30, suffix: "s" }, { mult: 40, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }] },
  { name: "Amis ajoutés", stat: "friends_added", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 200, suffix: "s" }, { mult: 300, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }] },
  { name: "Messages privés envoyés", stat: "dm_sent", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }, { mult: 5000, suffix: "s" }, { mult: 10000, suffix: "s" }] },
  { name: "Serveurs rejoins", stat: "servers_joined", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 3, suffix: "s" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 20, suffix: "s" }, { mult: 30, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }] },
  { name: "Publications créées", stat: "posts_created", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 200, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }] },
  { name: "Profil visité", stat: "profile_views", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }, { mult: 5000, suffix: "s" }, { mult: 10000, suffix: "s" }] },
  { name: "Canaux créés", stat: "channels_created", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 3, suffix: "s" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 20, suffix: "s" }, { mult: 30, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }] },
  { name: "Sondages créés", stat: "polls_created", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 3, suffix: "s" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 15, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }] },
  { name: "Shorts visionnés", stat: "shorts_watched", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }, { mult: 5000, suffix: "s" }, { mult: 10000, suffix: "s" }] },
  { name: "Projets vidéo créés", stat: "video_projects", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 3, suffix: "s" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 15, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }] },
  { name: "Boosters activés", stat: "boosters_used", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 3, suffix: "s" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 15, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }] },
  { name: "Niveau atteint", stat: "level_reached", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: " ×10" }, { mult: 25, suffix: " ×25" }, { mult: 50, suffix: " ×50" }, { mult: 100, suffix: " ×100" }, { mult: 150, suffix: " ×150" }, { mult: 200, suffix: " ×200" }, { mult: 300, suffix: " ×300" }, { mult: 500, suffix: " ×500" }, { mult: 1000, suffix: " ×1k" }] },
  { name: "Outils utilisés", stat: "tools_used", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 200, suffix: "s" }, { mult: 300, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }] },
  { name: "Annonces marketplace", stat: "marketplace_listings", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 3, suffix: "s" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 15, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }] },
  { name: "Tickets support", stat: "tickets_created", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 3, suffix: "s" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 15, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }] },
  { name: "Parties Nexus Game", stat: "nexus_games", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }, { mult: 5000, suffix: "s" }, { mult: 10000, suffix: "s" }] },
  { name: "Assistant IA utilisé", stat: "use_ai", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 200, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }] },
  { name: "Boosts de serveur", stat: "server_boosts", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 3, suffix: "s" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 15, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }] },
  { name: "Succès débloqués", stat: "achievements_unlocked", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }, { mult: 200, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 330, suffix: "s" }] },
];

// Build achievements (33 seeds × 10 tiers = 330)
const _ACHIEVEMENTS = [];
SEEDS.forEach((seed) => {
  seed.tiers.forEach((tier, idx) => {
    const val = Math.max(1, Math.round(seed.baseVal * tier.mult));
    const globalIdx = _ACHIEVEMENTS.length;
    const trophies = Math.min(10, Math.max(1, Math.floor(globalIdx / 33) + 1));
    const xp = Math.min(1000, Math.max(100, Math.round((Math.floor(globalIdx / 33) + 1) * 100)));
    _ACHIEVEMENTS.push({
      id: `ach_${seed.stat}_${tier.mult}`,
      name: `${seed.name}${tier.suffix}`,
      category: seed.name,
      stat: seed.stat,
      target: val,
      condition: { stat: seed.stat, op: '>=', val },
      trophies,
      xp,
      total: trophies + xp,
      icon: TROPHY_IMG,
    });
  });
});

export const ACHIEVEMENTS = _ACHIEVEMENTS;
export const TROPHY_IMAGE = TROPHY_IMG;