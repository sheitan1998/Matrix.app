// ============================================================
// MATRIX Progression — 200 Achievements (Trophies + XP)
// Progressive difficulty: higher index = harder = more rewards.
// Trophies: 1–10, XP: 100–1000, total = trophies + xp.
// ============================================================

const TROPHY_IMG = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/6e448bdc9_Gemini_Generated_Image_9q71zn9q71zn9q71-removebg-preview.png";

// Raw seed definitions grouped by theme.
// Each entry: { name, stat, baseVal, tiers:[{mult, suffix}] }
// tiers multiply baseVal to create progressive achievements.
const SEEDS = [
  { name: "Premier pas", stat: "total_actions", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: " ×10" }, { mult: 50, suffix: " ×50" }, { mult: 100, suffix: " ×100" }, { mult: 250, suffix: " ×250" }, { mult: 500, suffix: " ×500" }, { mult: 1000, suffix: " ×1k" }, { mult: 2500, suffix: " ×2.5k" }, { mult: 5000, suffix: " ×5k" }, { mult: 10000, suffix: " ×10k" }] },
  { name: "Commentateur", stat: "comment", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }, { mult: 5000, suffix: "s" }, { mult: 10000, suffix: "s" }] },
  { name: "Stream live", stat: "create_live", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }] },
  { name: "Vidéos publiées", stat: "publish_video", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }] },
  { name: "Serveurs créés", stat: "create_server", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 2, suffix: "s" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 15, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }] },
  { name: "Messages envoyés", stat: "send_message", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }, { mult: 5000, suffix: "s" }, { mult: 10000, suffix: "s" }] },
  { name: "Réactions données", stat: "like", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }, { mult: 5000, suffix: "s" }, { mult: 10000, suffix: "s" }] },
  { name: "J'aime reçus", stat: "receive_like", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }, { mult: 5000, suffix: "s" }, { mult: 10000, suffix: "s" }] },
  { name: "Abonnés gagnés", stat: "receive_subscriber", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }] },
  { name: "Utilisation IA", stat: "use_ai", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }] },
  { name: "Amis invités", stat: "invite_friend", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 2, suffix: "s" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 15, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }] },
  { name: "Événements", stat: "participate_event", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 3, suffix: "s" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 15, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 150, suffix: "s" }] },
  { name: "Aide communauté", stat: "help_community", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 200, suffix: "s" }, { mult: 300, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }] },
  { name: "Temps en vocal", stat: "voice_channel", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }] },
  { name: "Connexions quotidiennes", stat: "daily_login", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 7, suffix: "s" }, { mult: 30, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 200, suffix: "s" }, { mult: 365, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 730, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 1500, suffix: "s" }] },
  { name: "Vidéos regardées", stat: "watch_video", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }, { mult: 5000, suffix: "s" }, { mult: 10000, suffix: "s" }] },
  { name: "Lives regardés", stat: "watch_live", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 250, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }, { mult: 2500, suffix: "s" }] },
  { name: "Temps sur la plateforme", stat: "time_spent", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 10, suffix: " ×10" }, { mult: 50, suffix: " ×50" }, { mult: 100, suffix: " ×100" }, { mult: 250, suffix: " ×250" }, { mult: 500, suffix: " ×500" }, { mult: 1000, suffix: " ×1k" }, { mult: 2500, suffix: " ×2.5k" }, { mult: 5000, suffix: " ×5k" }, { mult: 10000, suffix: " ×10k" }] },
  { name: "Missions complétées", stat: "missions_completed", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 100, suffix: "s" }, { mult: 200, suffix: "s" }, { mult: 300, suffix: "s" }, { mult: 500, suffix: "s" }, { mult: 1000, suffix: "s" }] },
  { name: "Tournois remportés", stat: "tournaments_won", baseVal: 1, tiers: [{ mult: 1, suffix: "" }, { mult: 2, suffix: "s" }, { mult: 3, suffix: "s" }, { mult: 5, suffix: "s" }, { mult: 10, suffix: "s" }, { mult: 15, suffix: "s" }, { mult: 25, suffix: "s" }, { mult: 50, suffix: "s" }, { mult: 75, suffix: "s" }, { mult: 100, suffix: "s" }] },
];

// Build the 200 achievements (20 seeds × 10 tiers)
const _ACHIEVEMENTS = [];
SEEDS.forEach((seed) => {
  seed.tiers.forEach((tier, idx) => {
    const val = Math.max(1, Math.round(seed.baseVal * tier.mult));
    const globalIdx = _ACHIEVEMENTS.length;
    // Progressive difficulty: trophies 1..10, XP 100..1000 (step ~100)
    const trophies = Math.min(10, Math.max(1, Math.floor(globalIdx / 20) + 1));
    const xp = Math.min(1000, Math.max(100, Math.round((Math.floor(globalIdx / 20) + 1) * 100)));
    _ACHIEVEMENTS.push({
      id: `ach_${seed.stat}_${tier.mult}`,
      name: `${seed.name}${tier.suffix}`,
      category: seed.name,
      stat: seed.stat,
      target: val,
      trophies,
      xp,
      total: trophies + xp,
      icon: TROPHY_IMG,
    });
  });
});

export const ACHIEVEMENTS = _ACHIEVEMENTS;
export const TROPHY_IMAGE = TROPHY_IMG;