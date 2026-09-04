import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import {
  XP_FORMULA, XP_REWARDS, ANTI_SPAM, BADGES, LEVEL_REWARDS,
  MISSION_TEMPLATES, SHOP_ITEMS, RANKS, PRESTIGE_TIERS, checkCondition, getRank,
} from '@/lib/progressionData';
import { ACHIEVEMENTS } from '@/lib/achievementsData';
import LevelUpAnimation from '@/components/progression/LevelUpAnimation';

const ProgressionContext = createContext(null);
export const useProgression = () => useContext(ProgressionContext);

// --- Mission generation helpers ---
function generateMissions(type, count) {
  const pool = [...(MISSION_TEMPLATES[type] || [])];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(m => ({ ...m, progress: 0, completed: false, claimed: false }));
}

function ensureMissions(progress) {
  // Daily missions: renew at 15:00 UTC
  const now = new Date();
  const dailyKey = (() => {
    // If before 15:00, missions belong to previous day's 15:00 cycle
    const d = new Date(now);
    if (d.getHours() < 15) d.setDate(d.getDate() - 1);
    return d.toDateString();
  })();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const missions = { ...(progress.missions || {}) };
  let changed = false;

  // Daily missions: renew at 15:00
  if (missions.daily_date !== dailyKey) {
    missions.daily = generateMissions('daily', 4);
    missions.daily_date = dailyKey;
    changed = true;
  }
  // Weekly missions: renew every month
  if (missions.weekly_date !== monthKey) {
    missions.weekly = generateMissions('weekly', 3);
    missions.weekly_date = monthKey;
    changed = true;
  }
  return { missions, changed };
}

// --- Get active XP boost (checks expiry) ---
function getActiveBoost(progress) {
  const boost = progress?.active_xp_boost;
  if (!boost) return null;
  if (new Date(boost.expires_at).getTime() <= Date.now()) return null; // expired
  return boost;
}

// --- Pure computation: apply XP gain to progress (with active boost multiplier) ---
function applyXP(progress, xpAmount, action) {
  const now = Date.now();
  const lastGains = progress.last_xp_gains || {};
  if (action && ANTI_SPAM[action] && now - (lastGains[action] || 0) < ANTI_SPAM[action]) {
    return null; // anti-spam blocked
  }
  // Apply active XP boost multiplier
  const activeBoost = getActiveBoost(progress);
  const finalXP = activeBoost ? Math.round(xpAmount * activeBoost.multiplier) : xpAmount;

  let { level = 1, xp = 0, total_xp = 0, coins = 0, badges = [], achievements = [], unlocked_rewards = [], stats = {}, active_xp_boost } = progress;
  xp += finalXP;
  total_xp += finalXP;
  badges = [...badges];
  achievements = [...achievements];
  unlocked_rewards = [...unlocked_rewards];

  // Clear expired boost
  if (progress.active_xp_boost && !activeBoost) active_xp_boost = null;

  const levelUps = [];
  const checkLevels = () => {
    while (xp >= XP_FORMULA(level)) {
      xp -= XP_FORMULA(level);
      level += 1;
      levelUps.push(level);
      const r = LEVEL_REWARDS.find(r => r.level === level);
      if (r && !unlocked_rewards.includes(r.id)) unlocked_rewards.push(r.id);
    }
  };
  checkLevels();
  BADGES.forEach(b => { if (!badges.includes(b.id) && checkCondition(b.condition, stats)) badges.push(b.id); });
  ACHIEVEMENTS.forEach(a => {
    if (achievements.includes(a.id)) return;
    if (checkCondition(a.condition, stats)) {
      achievements.push(a.id);
      if (a.badge_reward && !badges.includes(a.badge_reward)) badges.push(a.badge_reward);
    }
  });
  checkLevels();

  return {
    data: { level, xp, total_xp, coins, badges, achievements, unlocked_rewards, stats, last_xp_gains: { ...lastGains, [action]: now }, active_xp_boost },
    levelUps,
  };
}

// --- Pure computation: track activity (stats + missions + XP + badges) ---
function applyActivity(progress, action, count = 1) {
  const stats = { ...(progress.stats || {}) };
  stats[action] = (stats[action] || 0) + count;
  stats.total_actions = (stats.total_actions || 0) + 1;

  const missions = JSON.parse(JSON.stringify(progress.missions || {}));
  ['daily', 'weekly'].forEach(period => {
    (missions[period] || []).forEach(m => {
      if (m.action === action && !m.completed) {
        m.progress = Math.min((m.progress || 0) + count, m.target);
        if (m.progress >= m.target) m.completed = true;
      }
    });
  });

  let base = { ...progress, stats, missions };
  const now = Date.now();
  const lastGains = progress.last_xp_gains || {};
  const canXP = !action || !ANTI_SPAM[action] || now - (lastGains[action] || 0) >= ANTI_SPAM[action];
  const xpAmount = canXP ? (XP_REWARDS[action] || 0) : 0;

  if (xpAmount > 0) {
    const result = applyXP(base, xpAmount, action);
    if (result) return { data: result.data, levelUps: result.levelUps };
  }
  // Still check badges with updated stats even without XP
  const badges = [...(base.badges || [])];
  BADGES.forEach(b => { if (!badges.includes(b.id) && checkCondition(b.condition, stats)) badges.push(b.id); });
  const achievements = [...(base.achievements || [])];
  let coins = base.coins || 0;
  let xp = base.xp || 0;
  let total_xp = base.total_xp || 0;
  let level = base.level || 1;
  const unlocked_rewards = [...(base.unlocked_rewards || [])];
  const levelUps = [];
  ACHIEVEMENTS.forEach(a => {
    if (achievements.includes(a.id)) return;
    if (checkCondition(a.condition, stats)) {
      achievements.push(a.id);
      if (a.badge_reward && !badges.includes(a.badge_reward)) badges.push(a.badge_reward);
    }
  });
  while (xp >= XP_FORMULA(level)) {
    xp -= XP_FORMULA(level);
    level += 1;
    levelUps.push(level);
    const r = LEVEL_REWARDS.find(r => r.level === level);
    if (r && !unlocked_rewards.includes(r.id)) unlocked_rewards.push(r.id);
  }
  return { data: { ...base, stats, missions, badges, achievements, unlocked_rewards, xp, total_xp, level, coins }, levelUps };
}

export function ProgressionProvider({ children }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [levelUpData, setLevelUpData] = useState(null);
  const ref = useRef(null);
  const unsubRef = useRef(null);
  const timeSpentRef = useRef(null);

  const set = useCallback((data) => { ref.current = data; setProgress(data); }, []);

  const save = useCallback(async (updates, levelUps = []) => {
    if (!ref.current?.id) return;
    const next = { ...ref.current, ...updates };
    set(next);
    try { await base44.entities.UserProgress.update(ref.current.id, updates); } catch (e) { console.error('Progression save error:', e); }
    if (levelUps.length > 0) {
      setLevelUpData({
        level: levelUps[levelUps.length - 1],
        prestige: next.prestige || 0,
        rewards: levelUps.map(l => LEVEL_REWARDS.find(r => r.level === l)).filter(Boolean),
      });
    }
  }, [set]);

  const trackActivity = useCallback(async (action, count = 1) => {
    if (!ref.current) return;
    const { data, levelUps } = applyActivity(ref.current, action, count);
    await save(data, levelUps);
  }, [save]);

  const claimAchievement = useCallback(async (achievementId) => {
    if (!ref.current) return;
    const claimed = ref.current.claimed_achievements || [];
    if (claimed.includes(achievementId)) return;
    const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!ach) return;
    const owned = ref.current.achievements || [];
    if (!owned.includes(achievementId)) return;

    const newClaimed = [...claimed, achievementId];
    let { xp = 0, total_xp = 0, level = 1, unlocked_rewards = [], stats = {} } = ref.current;
    xp += ach.xp || 0;
    total_xp += ach.xp || 0;
    const trophies = (stats.total_trophies || 0) + (ach.trophies || 0);
    stats = { ...stats, total_trophies: trophies, achievements_claimed: (stats.achievements_claimed || 0) + 1 };

    const levelUps = [];
    while (xp >= XP_FORMULA(level)) {
      xp -= XP_FORMULA(level);
      level += 1;
      levelUps.push(level);
      const r = LEVEL_REWARDS.find(r => r.level === level);
      if (r && !unlocked_rewards.includes(r.id)) unlocked_rewards.push(r.id);
    }
    await save({ claimed_achievements: newClaimed, xp, total_xp, level, unlocked_rewards, stats }, levelUps);
  }, [save]);

  const claimMission = useCallback(async (period, missionId) => {
    if (!ref.current) return;
    const missions = JSON.parse(JSON.stringify(ref.current.missions || {}));
    const mission = (missions[period] || []).find(m => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;

    mission.claimed = true;
    let { xp = 0, total_xp = 0, level = 1, unlocked_rewards = [], stats = {} } = ref.current;
    xp += mission.xp || 0;
    total_xp += mission.xp || 0;
    stats = { ...stats, missions_completed: (stats.missions_completed || 0) + 1, total_trophies: (stats.total_trophies || 0) + (mission.trophies || 0) };

    const levelUps = [];
    while (xp >= XP_FORMULA(level)) {
      xp -= XP_FORMULA(level);
      level += 1;
      levelUps.push(level);
      const r = LEVEL_REWARDS.find(r => r.level === level);
      if (r && !unlocked_rewards.includes(r.id)) unlocked_rewards.push(r.id);
    }

    // Re-evaluate badges & achievements with updated stats (missions_completed fix)
    let badges = [...(ref.current.badges || [])];
    BADGES.forEach(b => { if (!badges.includes(b.id) && checkCondition(b.condition, stats)) badges.push(b.id); });
    let achievements = [...(ref.current.achievements || [])];
    ACHIEVEMENTS.forEach(a => {
      if (!achievements.includes(a.id) && checkCondition(a.condition, stats)) {
        achievements.push(a.id);
        if (a.badge_reward && !badges.includes(a.badge_reward)) badges.push(a.badge_reward);
      }
    });

    await save({ missions, xp, total_xp, level, unlocked_rewards, stats, badges, achievements }, levelUps);
  }, [save]);

  const buyItem = useCallback(async (itemId) => {
    if (!ref.current) return;
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item || (ref.current.coins || 0) < item.price) return;
    const owned = ref.current.unlocked_rewards || [];
    if (owned.includes(`shop_${itemId}`)) return;
    await save({
      coins: ref.current.coins - item.price,
      unlocked_rewards: [...owned, `shop_${itemId}`],
    });
  }, [save]);

  const equipItem = useCallback(async (category, itemId) => {
    if (!ref.current) return;
    const owned = ref.current.unlocked_rewards || [];
    if (!owned.includes(`shop_${itemId}`)) return;
    const equipped = { ...(ref.current.equipped || {}), [category]: itemId };
    await save({ equipped });
  }, [save]);

  const prestige = useCallback(async () => {
    if (!ref.current || ref.current.level < 100) return;
    const newPrestige = (ref.current.prestige || 0) + 1;
    if (newPrestige > 10) return;
    await save({
      level: 1, xp: 0, prestige: newPrestige,
      unlocked_rewards: [...(ref.current.unlocked_rewards || []), `prestige_${newPrestige}`],
    });
  }, [save]);

  const buyXPBooster = useCallback(async (booster) => {
    if (!ref.current) return;
    // Deduct Trix from user balance
    const me = await base44.auth.me();
    const currentBalance = me.trix_balance || 0;
    if (currentBalance < booster.price_trix) {
      throw new Error('Insufficient Trix balance');
    }
    await base44.auth.updateMe({ trix_balance: currentBalance - booster.price_trix });
    // Record transaction
    await base44.entities.TrixTransaction.create({
      user_email: me.email,
      type: 'purchase',
      amount: -booster.price_trix,
      description: `Booster XP x${booster.multiplier} (${booster.duration_label})`,
    });
    // Add to inventory
    const boosters = [...(ref.current.xp_boosters || []), {
      id: booster.id,
      multiplier: booster.multiplier,
      duration_hours: booster.duration_hours,
      purchased_at: new Date().toISOString(),
    }];
    await save({ xp_boosters: boosters });
  }, [save]);

  const activateXPBooster = useCallback(async (booster, quantity = 1) => {
    if (!ref.current) return;
    const inventory = ref.current.xp_boosters || [];

    // Find matching boosters (same id, multiplier, duration_hours)
    const matching = inventory.filter(b => b.id === booster.id && b.multiplier === booster.multiplier && b.duration_hours === booster.duration_hours);
    const toActivate = Math.min(quantity, matching.length);
    if (toActivate <= 0) return;

    // Remove `toActivate` boosters from inventory
    let removed = 0;
    const newInventory = inventory.filter(b => {
      if (removed < toActivate && b.id === booster.id && b.multiplier === booster.multiplier && b.duration_hours === booster.duration_hours) {
        removed++;
        return false;
      }
      return true;
    });

    // Total duration to add (hours → ms)
    const durationMs = (booster.duration_hours || 1) * 3600000 * toActivate;

    // Accumulate onto existing active boost (if same multiplier) or start fresh
    const existing = getActiveBoost(ref.current);
    let newBoost;
    if (existing && existing.multiplier === booster.multiplier) {
      // Extend the existing boost's expiry
      const currentExpiry = new Date(existing.expires_at).getTime();
      const baseTime = Math.max(currentExpiry, Date.now());
      newBoost = {
        multiplier: existing.multiplier,
        expires_at: new Date(baseTime + durationMs).toISOString(),
        booster_id: existing.booster_id,
      };
    } else if (existing) {
      // Different multiplier — replace the active boost (don't stack different multipliers)
      newBoost = {
        multiplier: booster.multiplier,
        expires_at: new Date(Date.now() + durationMs).toISOString(),
        booster_id: booster.id,
      };
    } else {
      newBoost = {
        multiplier: booster.multiplier,
        expires_at: new Date(Date.now() + durationMs).toISOString(),
        booster_id: booster.id,
      };
    }

    await save({
      xp_boosters: newInventory,
      active_xp_boost: newBoost,
    });
  }, [save]);

  // Init: load or create progress, ensure missions, daily login bonus
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (!user?.email) { setLoading(false); return; }
        const records = await base44.entities.UserProgress.filter({ user_email: user.email });
        let p;
        if (records.length > 0) {
          p = records[0];
          // Sync pseudo if missing or outdated
          if (!p.pseudo || p.pseudo !== user.pseudo) {
            await base44.entities.UserProgress.update(p.id, { pseudo: user.pseudo || '' });
            p = { ...p, pseudo: user.pseudo || '' };
          }
        } else {
          p = await base44.entities.UserProgress.create({
            user_email: user.email, pseudo: user.pseudo || '', level: 1, xp: 0, total_xp: 0, coins: 500,
            prestige: 0, badges: [], achievements: [], claimed_achievements: [], unlocked_rewards: [],
            stats: {}, missions: {}, last_xp_gains: {}, equipped: {},
          });
        }
        // Ensure missions
        const { missions, changed } = ensureMissions(p);
        if (changed) {
          await base44.entities.UserProgress.update(p.id, { missions });
          p = { ...p, missions };
        }
        if (!mounted) return;
        set(p);
        // Real-time: subscribe to own progress changes
        const unsub = base44.entities.UserProgress.subscribe((event) => {
          if (event?.data?.id === ref.current?.id) {
            set({ ...ref.current, ...event.data });
          }
        });
        unsubRef.current = unsub;
        // Daily login bonus
        const today = new Date().toDateString();
        if (p.stats?.last_login_date !== today) {
          const dailyLogins = (p.stats?.daily_logins || 0) + 1;
          const stats = { ...(p.stats || {}), last_login_date: today, daily_logins: dailyLogins, daily_login: dailyLogins };
          await base44.entities.UserProgress.update(p.id, { stats });
          set({ ...p, stats });
          // Award daily login XP
          const result = applyXP({ ...p, stats }, XP_REWARDS.daily_login || 50, 'daily_login');
          if (result) await save(result.data, result.levelUps);
        }
      } catch (e) { console.error('Progression init error:', e); }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
      if (timeSpentRef.current) clearInterval(timeSpentRef.current);
    };
  }, []);

  // Time spent tracking — increments time_spent stat every 5 minutes
  useEffect(() => {
    if (!progress) return;
    timeSpentRef.current = setInterval(() => {
      trackActivity('time_spent');
    }, 300000); // 5 minutes
    return () => { if (timeSpentRef.current) clearInterval(timeSpentRef.current); };
  }, [progress, trackActivity]);

  const rank = progress ? getRank(progress.level) : null;
  const xpNeeded = progress ? XP_FORMULA(progress.level) : 100;
  const xpPercent = progress ? Math.min(100, (progress.xp / xpNeeded) * 100) : 0;
  const prestigeInfo = progress?.prestige ? PRESTIGE_TIERS.find(t => t.tier === progress.prestige) : null;
  const activeBoost = progress ? getActiveBoost(progress) : null;

  const value = {
    progress, loading, rank, xpNeeded, xpPercent, prestigeInfo, activeBoost,
    trackActivity, claimMission, claimAchievement, buyItem, equipItem, prestige,
    buyXPBooster, activateXPBooster,
    levelUpData, setLevelUpData,
  };

  return (
    <ProgressionContext.Provider value={value}>
      {children}
      {levelUpData && <LevelUpAnimation data={levelUpData} onClose={() => setLevelUpData(null)} />}
    </ProgressionContext.Provider>
  );
}