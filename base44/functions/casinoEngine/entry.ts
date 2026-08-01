import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';

// ===== Configuration =====
const JACKPOT_BASE = 1_000_000;
const GROWTH_PER_SECOND = 50;        // +50 coins/sec — slow, steady, persistent
const BET_CONTRIBUTION_RATE = 0.05;  // 5% of each bet feeds the jackpot
const JACKPOT_WIN_CHANCE = 0.0005;   // 0.05% chance per bet to hit the jackpot
const WIN_RATE = 0.49;               // 49% global win probability
const INITIAL_BALANCE = 5000;

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

// ===== Helpers =====

async function getJackpotRecord(base44) {
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

function computeEffectiveAmount(record) {
  const lastUpdated = record.last_updated ? new Date(record.last_updated).getTime() : Date.now();
  const elapsed = Math.max(0, (Date.now() - lastUpdated) / 1000);
  const timeGrowth = Math.floor(elapsed * GROWTH_PER_SECOND);
  return (record.amount || JACKPOT_BASE) + timeGrowth;
}

async function getPlayer(base44, user) {
  const records = await base44.asServiceRole.entities.CasinoPlayer.filter({ user_email: user.email });
  if (records.length > 0) return records[0];
  return await base44.asServiceRole.entities.CasinoPlayer.create({
    user_email: user.email,
    balance: INITIAL_BALANCE,
    total_bets: 0,
    total_wagered: 0,
    total_won: 0,
    biggest_win: 0,
    jackpot_wins: 0,
  });
}

function pickSlotsSymbol() {
  const pool = [];
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
        return Response.json({ balance: player.balance || 0 });
      }

      // ---- Add coins (shop purchase) ----
      case 'addCoins': {
        const amount = Math.floor(params.amount);
        if (!amount || amount <= 0) return Response.json({ error: 'Invalid amount' }, { status: 400 });
        const player = await getPlayer(base44, user);
        const newBalance = (player.balance || 0) + amount;
        await base44.asServiceRole.entities.CasinoPlayer.update(player.id, {
          balance: newBalance,
          total_won: (player.total_won || 0) + amount,
        });
        return Response.json({ balance: newBalance });
      }

      // ---- Place a bet (server-side outcome, 49% win rate) ----
      case 'placeBet': {
        const { game, bet, betType } = params;
        const betAmount = Math.floor(bet);
        if (!betAmount || betAmount <= 0) {
          return Response.json({ error: 'Invalid bet' }, { status: 400 });
        }

        // Get player record
        const player = await getPlayer(base44, user);
        if ((player.balance || 0) < betAmount) {
          return Response.json({ error: 'Solde insuffisant' }, { status: 400 });
        }

        // Get jackpot record (for contribution + potential win)
        const jackpotRecord = await getJackpotRecord(base44);
        const effectiveJackpot = computeEffectiveAmount(jackpotRecord);
        const contribution = Math.floor(betAmount * BET_CONTRIBUTION_RATE);

        // Determine outcome (49% win rate)
        const isWin = Math.random() < WIN_RATE;
        // Separate jackpot roll (0.05%)
        const isJackpotWin = Math.random() < JACKPOT_WIN_CHANCE;

        let payout = 0;
        let multiplier = 0;
        let slotsSymbol = null;

        if (isJackpotWin) {
          // Jackpot win! Payout = entire jackpot
          payout = effectiveJackpot;
        } else if (isWin) {
          // Normal win — game-specific payout
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

        // Update player balance
        const newBalance = (player.balance || 0) - betAmount + payout;

        // Update player stats
        const playerUpdate = {
          balance: newBalance,
          total_bets: (player.total_bets || 0) + 1,
          total_wagered: (player.total_wagered || 0) + betAmount,
          total_won: (player.total_won || 0) + payout,
          biggest_win: Math.max(player.biggest_win || 0, payout),
        };
        if (isJackpotWin) playerUpdate.jackpot_wins = (player.jackpot_wins || 0) + 1;
        await base44.asServiceRole.entities.CasinoPlayer.update(player.id, playerUpdate);

        // Update jackpot
        const now = new Date().toISOString();
        if (isJackpotWin) {
          // Reset jackpot to base
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
          // Add time-growth + bet contribution
          await base44.asServiceRole.entities.CasinoJackpot.update(jackpotRecord.id, {
            amount: effectiveJackpot + contribution,
            last_updated: now,
            total_contributions: (jackpotRecord.total_contributions || 0) + contribution,
            total_bets: (jackpotRecord.total_bets || 0) + 1,
          });
        }

        // Record transaction (async, non-blocking)
        const netGain = payout - betAmount;
        waitUntil(base44.asServiceRole.entities.WalletTransaction.create({
          user_email: user.email,
          type: isJackpotWin ? 'casino_win' : (isWin ? 'casino_win' : 'casino_loss'),
          amount: netGain,
          description: isJackpotWin
            ? `🎰 JACKPOT ${game}! +${payout.toLocaleString()}`
            : `${game}: ${netGain >= 0 ? '+' + netGain : netGain}`,
          universe: 'casino',
        }).catch(() => {}));

        return Response.json({
          win: isWin || isJackpotWin,
          jackpot: isJackpotWin,
          payout,
          multiplier,
          slotsSymbol,
          netGain,
          newBalance,
          jackpotAmount: isJackpotWin ? JACKPOT_BASE : (effectiveJackpot + contribution),
        });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}