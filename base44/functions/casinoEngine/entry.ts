import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';

// ===== Configuration =====
const JACKPOT_BASE = 1_000_000;
const GROWTH_PER_SECOND = 50;
const BET_CONTRIBUTION_RATE = 0.05;
const JACKPOT_WIN_CHANCE = 0.0005;
const WIN_RATE = 0.49;
const INITIAL_BALANCE = 5000;
const XP_PER_LEVEL = 5000;

// ===== Slots symbol table (mirrors client) =====
const SLOTS_SYMBOLS = [
  { s: '7',    mult: 50, rare: 1 },
  { s: '💎',   mult: 30, rare: 1 },
  { s: 'WILD', mult: 20, rare: 2 },
  { s: 'BAR',  mult: 15, rare: 2 },
  { s: '🍒',   mult: 8,  rare: 5 },
  { s: '🍇',   mult: 5,  rare: 6 },
  { s: '🍉',   mult: 4,  rare: 6 },
];

// ===== Casino achievements (Nexus Game specific) =====
const CASINO_ACHIEVEMENTS = [
  { id: "first_spin",   emoji: "🎰", label: "Premier Spin",     desc: "Jouez pour la première fois",     check: (s: any) => (s.total_bets || 0) >= 1 },
  { id: "spin_10",     emoji: "🎯", label: "Joueur Régulier",   desc: "10 parties jouées",               check: (s: any) => (s.total_bets || 0) >= 10 },
  { id: "spin_50",     emoji: "🔥", label: "Accro du Casino",   desc: "50 parties jouées",               check: (s: any) => (s.total_bets || 0) >= 50 },
  { id: "spin_100",    emoji: "💯", label: "Centurion",         desc: "100 parties jouées",              check: (s: any) => (s.total_bets || 0) >= 100 },
  { id: "win_big",     emoji: "💰", label: "Gros Gain",         desc: "Gagnez 10 000 jetons d'un coup",  check: (s: any) => (s.biggest_win || 0) >= 10000 },
  { id: "win_50k",     emoji: "👑", label: "Roi du Casino",     desc: "Gagnez 50 000 jetons d'un coup",  check: (s: any) => (s.biggest_win || 0) >= 50000 },
  { id: "high_roller", emoji: "💎", label: "High Roller",       desc: "Misez 5 000+ en une partie",      check: (s: any) => (s.max_bet || 0) >= 5000 },
  { id: "level_5",     emoji: "⭐", label: "Vétéran",           desc: "Atteignez le niveau 5",           check: (s: any) => (s.level || 1) >= 5 },
  { id: "level_10",    emoji: "🌟", label: "Légende",           desc: "Atteignez le niveau 10",          check: (s: any) => (s.level || 1) >= 10 },
  { id: "level_25",    emoji: "🔱", label: "Mythe",             desc: "Atteignez le niveau 25",          check: (s: any) => (s.level || 1) >= 25 },
];

// ===== Helpers =====

function computeLevel(totalXp: number): number {
  return Math.floor((totalXp || 0) / XP_PER_LEVEL) + 1;
}

function computeXpInLevel(totalXp: number): number {
  return (totalXp || 0) % XP_PER_LEVEL;
}

function checkAchievements(stats: any): string[] {
  return CASINO_ACHIEVEMENTS.filter(a => a.check(stats)).map(a => a.id);
}

async function getJackpotRecord(base44: any) {
  const records = await base44.asServiceRole.entities.CasinoJackpot.list('-created_date', 1);
  if (records.length > 0) return records[0];
  const now = new Date().toISOString();
  return await base44.asServiceRole.entities.CasinoJackpot.create({
    amount: JACKPOT_BASE,
    base_amount: JACKPOT_BASE,
    last_updated: now,
    total_contributions: 0,
    total_bets: 0,
    win_count: 0,
  });
}

function computeEffectiveAmount(record: any) {
  const lastUpdated = record.last_updated ? new Date(record.last_updated).getTime() : Date.now();
  const elapsed = Math.max(0, (Date.now() - lastUpdated) / 1000);
  const timeGrowth = Math.floor(elapsed * GROWTH_PER_SECOND);
  return (record.amount || JACKPOT_BASE) + timeGrowth;
}

async function getPlayer(base44: any, user: any) {
  const records = await base44.asServiceRole.entities.CasinoPlayer.filter({ user_email: user.email });
  if (records.length > 0) return records[0];
  return await base44.asServiceRole.entities.CasinoPlayer.create({
    user_email: user.email,
    balance: INITIAL_BALANCE,
    level: 1,
    xp: 0,
    total_xp: 0,
    total_bets: 0,
    total_wagered: 0,
    total_won: 0,
    biggest_win: 0,
    max_bet: 0,
    jackpot_wins: 0,
    achievements: [],
  });
}

function pickSlotsSymbol() {
  const pool: any[] = [];
  SLOTS_SYMBOLS.forEach(sym => { for (let i = 0; i < sym.rare; i++) pool.push(sym); });
  return pool[Math.floor(Math.random() * pool.length)];
}

// ===== Main handler =====
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, ...params } = body;

    switch (action) {

      // ---- Get global jackpot (public, real-time) ----
      case 'getJackpot': {
        const record = await getJackpotRecord(base44);
        const effective = computeEffectiveAmount(record);
        return Response.json({
          amount: effective,
          base_amount: record.base_amount || JACKPOT_BASE,
          total_contributions: record.total_contributions || 0,
          total_bets: record.total_bets || 0,
          win_count: record.win_count || 0,
          last_winner: record.last_winner_email ? {
            email: record.last_winner_email,
            name: record.last_winner_name,
            amount: record.last_winner_amount,
            won_at: record.last_won_at,
          } : null,
        });
      }

      // ---- Get player balance ----
      case 'getBalance': {
        const player = await getPlayer(base44, user);
        // Check 24h reset
        const nowMs = Date.now();
        const lastResetMs = player.last_reset_24h ? new Date(player.last_reset_24h).getTime() : 0;
        const hoursSinceReset = (nowMs - lastResetMs) / (1000 * 60 * 60);
        let won24h = player.won_24h || 0;
        if (hoursSinceReset >= 24) {
          won24h = 0;
          if (player.id) {
            await base44.asServiceRole.entities.CasinoPlayer.update(player.id, { won_24h: 0, last_reset_24h: new Date().toISOString() });
          }
        }
        return Response.json({ balance: player.balance || 0, won_24h: won24h });
      }

      // ---- Get player profile (level, XP, achievements, stats) ----
      case 'getProfile': {
        const player = await getPlayer(base44, user);
        const level = computeLevel(player.total_xp || 0);
        const xpInLevel = computeXpInLevel(player.total_xp || 0);
        const statsForCheck = { ...player, level };
        const allAchievements = checkAchievements(statsForCheck);

        // Sync achievements + level if changed
        const currentAchievements = player.achievements || [];
        const newAchievements = allAchievements.filter(id => !currentAchievements.includes(id));
        if (newAchievements.length > 0 || (player.level || 1) !== level) {
          await base44.asServiceRole.entities.CasinoPlayer.update(player.id, {
            achievements: allAchievements,
            level,
            xp: xpInLevel,
          });
        }

        return Response.json({
          balance: player.balance || 0,
          level,
          xp: xpInLevel,
          xp_needed: XP_PER_LEVEL,
          total_xp: player.total_xp || 0,
          total_bets: player.total_bets || 0,
          total_wagered: player.total_wagered || 0,
          total_won: player.total_won || 0,
          biggest_win: player.biggest_win || 0,
          max_bet: player.max_bet || 0,
          jackpot_wins: player.jackpot_wins || 0,
          won_24h: player.won_24h || 0,
          achievements: allAchievements,
          achievement_defs: CASINO_ACHIEVEMENTS,
        });
      }

      // ---- Place a bet (server-side outcome, 49% win rate) ----
      case 'placeBet': {
        const { game, bet, betType, theme_key } = params;
        const betAmount = Math.floor(bet);
        if (!betAmount || betAmount <= 0) {
          return Response.json({ error: 'Invalid bet' }, { status: 400 });
        }

        const player = await getPlayer(base44, user);
        if ((player.balance || 0) < betAmount) {
          return Response.json({ error: 'Solde insuffisant' }, { status: 400 });
        }

        const jackpotRecord = await getJackpotRecord(base44);
        const effectiveJackpot = computeEffectiveAmount(jackpotRecord);
        const contribution = Math.floor(betAmount * BET_CONTRIBUTION_RATE);

        // Fetch win_rate from SlotThemeConfig (default 49%)
        let effectiveWinRate = WIN_RATE;
        if (theme_key) {
          try {
            const themeConfigs = await base44.asServiceRole.entities.SlotThemeConfig.filter({ theme_key });
            if (themeConfigs.length > 0 && themeConfigs[0].win_rate != null) {
              effectiveWinRate = themeConfigs[0].win_rate / 100;
            }
          } catch {}
        }
        const isWin = Math.random() < effectiveWinRate;
        const isJackpotWin = Math.random() < JACKPOT_WIN_CHANCE;

        let payout = 0;
        let multiplier = 0;
        let slotsSymbol = null;

        if (isJackpotWin) {
          payout = effectiveJackpot;
        } else if (isWin) {
          if (game === 'slots') {
            const sym = pickSlotsSymbol();
            multiplier = sym.mult;
            slotsSymbol = sym.s;
            payout = betAmount * multiplier;
          } else if (game === 'roulette') {
            payout = betAmount * 2;
            multiplier = 2;
          } else if (game === 'blackjack') {
            payout = betAmount * 2;
            multiplier = 2;
          } else if (game === 'baccarat') {
            if (betType === 'tie') { payout = betAmount * 8; multiplier = 8; }
            else if (betType === 'banker') { payout = Math.floor(betAmount * 1.95); multiplier = 1.95; }
            else { payout = betAmount * 2; multiplier = 2; }
          } else if (game === 'bingo') {
            payout = betAmount * 10;
            multiplier = 10;
          } else {
            payout = betAmount * 2;
            multiplier = 2;
          }
        }

        const netGain = payout - betAmount;
        const newBalance = (player.balance || 0) - betAmount + payout;

        // XP: 10 XP casino + 1 XP global per win only
        const casinoXpGained = (isWin || isJackpotWin) ? 10 : 0;
        const globalXpGained = (isWin || isJackpotWin) ? 1 : 0;
        const newTotalXp = (player.total_xp || 0) + casinoXpGained;
        const newLevel = computeLevel(newTotalXp);
        const newXpInLevel = computeXpInLevel(newTotalXp);

        // Update global profile XP (1 XP per win)
        if (globalXpGained > 0) {
          try {
            const progressRecords = await base44.asServiceRole.entities.UserProgress.filter({ user_email: user.email });
            if (progressRecords.length > 0) {
              const progress = progressRecords[0];
              await base44.asServiceRole.entities.UserProgress.update(progress.id, {
                total_xp: (progress.total_xp || 0) + globalXpGained,
              });
            }
          } catch {}
        }

        // Track 24h gains
        const nowMs = Date.now();
        const lastResetMs = player.last_reset_24h ? new Date(player.last_reset_24h).getTime() : 0;
        const hoursSinceReset = (nowMs - lastResetMs) / (1000 * 60 * 60);
        let newWon24h = player.won_24h || 0;
        if (payout > 0) {
          if (hoursSinceReset >= 24) {
            newWon24h = payout;
          } else {
            newWon24h = (player.won_24h || 0) + payout;
          }
        }

        // Update player stats
        const playerUpdate: any = {
          balance: newBalance,
          level: newLevel,
          xp: newXpInLevel,
          total_xp: newTotalXp,
          total_bets: (player.total_bets || 0) + 1,
          total_wagered: (player.total_wagered || 0) + betAmount,
          total_won: (player.total_won || 0) + payout,
          biggest_win: Math.max(player.biggest_win || 0, payout),
          max_bet: Math.max(player.max_bet || 0, betAmount),
          won_24h: newWon24h,
          last_reset_24h: hoursSinceReset >= 24 ? new Date().toISOString() : (player.last_reset_24h || new Date().toISOString()),
        };
        if (isJackpotWin) playerUpdate.jackpot_wins = (player.jackpot_wins || 0) + 1;

        // Check achievements
        const statsForCheck = { ...player, ...playerUpdate, level: newLevel };
        const allAchievements = checkAchievements(statsForCheck);
        const currentAchievements = player.achievements || [];
        const newAchievements = allAchievements.filter(id => !currentAchievements.includes(id));
        if (newAchievements.length > 0) {
          playerUpdate.achievements = allAchievements;
        }

        await base44.asServiceRole.entities.CasinoPlayer.update(player.id, playerUpdate);

        // Update jackpot
        const now = new Date().toISOString();
        if (isJackpotWin) {
          await base44.asServiceRole.entities.CasinoJackpot.update(jackpotRecord.id, {
            amount: JACKPOT_BASE,
            last_updated: now,
            total_bets: (jackpotRecord.total_bets || 0) + 1,
            win_count: (jackpotRecord.win_count || 0) + 1,
            last_winner_email: user.email,
            last_winner_name: user.full_name || user.email.split('@')[0],
            last_winner_amount: effectiveJackpot,
            last_won_at: now,
          });
        } else {
          await base44.asServiceRole.entities.CasinoJackpot.update(jackpotRecord.id, {
            amount: effectiveJackpot + contribution,
            last_updated: now,
            total_contributions: (jackpotRecord.total_contributions || 0) + contribution,
            total_bets: (jackpotRecord.total_bets || 0) + 1,
          });
        }

        return Response.json({
          win: isWin || isJackpotWin,
          jackpot: isJackpotWin,
          payout,
          multiplier,
          slotsSymbol,
          netGain,
          newBalance,
          jackpotAmount: isJackpotWin ? JACKPOT_BASE : (effectiveJackpot + contribution),
          level: newLevel,
          xp: newXpInLevel,
          xp_needed: XP_PER_LEVEL,
          total_xp: newTotalXp,
          newAchievements: newAchievements.length > 0 ? newAchievements : [],
          achievementDefs: newAchievements.length > 0
            ? CASINO_ACHIEVEMENTS.filter(a => newAchievements.includes(a.id))
            : [],
        });
      }

      // ---- Get sports betting odds (AI-enriched) ----
      case 'getSportsOdds': {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: "Génère des cotes réalistes pour 6 matchs sportifs du jour (foot, tennis, basket). Format JSON.",
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              matches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    sport: { type: "string" },
                    league: { type: "string" },
                    home: { type: "string" },
                    away: { type: "string" },
                    time: { type: "string" },
                    odds: {
                      type: "object",
                      properties: {
                        home: { type: "number" },
                        draw: { type: "number" },
                        away: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          },
        });
        return Response.json({ matches: result.matches || [] });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}