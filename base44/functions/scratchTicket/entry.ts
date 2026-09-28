import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// ===== Default Configuration (fallback if no entity record) =====
const INITIAL_BALANCE = 5000;
const DEFAULT_TICKET_PRICE = 10000;
const DEFAULT_WIN_RATE = 0.30;
const DEFAULT_RESET_HOUR = 15;

const DEFAULT_REWARDS = [
  { type: "relance",  label: "🎯 Relance !",            desc: "Un nouveau ticket gratuit pour rejouer", weight: 40, amount: 0 },
  { type: "tokens",   label: "💰 10 000 jetons",         desc: "Petit gain",                             weight: 30, amount: 10000 },
  { type: "tokens",   label: "💰 50 000 jetons",         desc: "Beau gain",                              weight: 20, amount: 50000 },
  { type: "tokens",   label: "💰 100 000 jetons",        desc: "Gros gain",                              weight: 8,  amount: 100000 },
  { type: "tokens",   label: "💎 1 000 000 jetons",      desc: "Gain exceptionnel !",                    weight: 2,  amount: 1000000 },
];

// ===== Helpers =====

function getLastResetTime(resetHour) {
  const hour = resetHour !== undefined ? resetHour : DEFAULT_RESET_HOUR;
  const now = new Date();
  const reset = new Date(now);
  reset.setUTCHours(hour, 0, 0, 0);
  if (now.getTime() < reset.getTime()) {
    reset.setUTCDate(reset.getUTCDate() - 1);
  }
  return reset;
}

function isFreeTicketAvailable(freeTicketDate, resetHour) {
  if (!freeTicketDate) return true;
  const lastReset = getLastResetTime(resetHour);
  return new Date(freeTicketDate).getTime() < lastReset.getTime();
}

async function getPlayer(base44, user) {
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
    won_24h: 0,
    achievements: [],
    purchased_tickets: 0,
  });
}

async function getGameConfig(base44) {
  try {
    const records = await base44.asServiceRole.entities.CasinoGameConfig.filter({ game_key: "scratch" });
    if (records.length > 0) return records[0];
  } catch { /* entity may not exist yet */ }
  return null;
}

function buildRewards(config) {
  if (config?.rewards && Array.isArray(config.rewards) && config.rewards.length > 0) {
    return config.rewards;
  }
  return DEFAULT_REWARDS;
}

function selectReward(rewards) {
  const totalWeight = rewards.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const reward of rewards) {
    roll -= reward.weight;
    if (roll <= 0) return reward;
  }
  return rewards[0];
}

// ===== Handler =====

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, ticketType } = body;
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const player = await getPlayer(base44, user);
    const config = await getGameConfig(base44);
    const TICKET_PRICE = config?.ticket_price || DEFAULT_TICKET_PRICE;
    const WIN_RATE = config?.win_rate !== undefined ? config.win_rate / 100 : DEFAULT_WIN_RATE;
    const RESET_HOUR = config?.reset_hour_utc !== undefined ? config.reset_hour_utc : DEFAULT_RESET_HOUR;
    const rewards = buildRewards(config);

    switch (action) {

      case 'getTicketStatus': {
        const freeAvailable = isFreeTicketAvailable(player.free_ticket_date, RESET_HOUR);
        const nextReset = getLastResetTime(RESET_HOUR);
        nextReset.setUTCDate(nextReset.getUTCDate() + 1);
        return Response.json({
          balance: player.balance || 0,
          freeTicketAvailable: freeAvailable,
          purchasedTickets: player.purchased_tickets || 0,
          nextResetTime: nextReset.toISOString(),
        });
      }

      case 'buyTicket': {
        const currentBalance = player.balance || 0;
        if (currentBalance < TICKET_PRICE) {
          return Response.json({
            error: 'Solde insuffisant',
            balance: currentBalance,
            cost: TICKET_PRICE,
          }, { status: 400 });
        }
        const newBalance = currentBalance - TICKET_PRICE;
        const newTickets = (player.purchased_tickets || 0) + 1;
        await base44.asServiceRole.entities.CasinoPlayer.update(player.id, {
          balance: newBalance,
          purchased_tickets: newTickets,
        });
        console.log('[scratchTicket] buyTicket by', user.email, '| balance:', newBalance, '| tickets:', newTickets);
        return Response.json({ success: true, balance: newBalance, purchasedTickets: newTickets });
      }

      case 'scratch': {
        const updates = {};
        const freeAvailable = isFreeTicketAvailable(player.free_ticket_date, RESET_HOUR);

        if (ticketType === 'free') {
          if (!freeAvailable) {
            return Response.json({ error: 'Ticket quotidien déjà utilisé. Revenez plus tard.' }, { status: 400 });
          }
          updates.free_ticket_date = new Date().toISOString();
        } else if (ticketType === 'purchased') {
          if ((player.purchased_tickets || 0) < 1) {
            return Response.json({ error: 'Aucun ticket acheté disponible' }, { status: 400 });
          }
          updates.purchased_tickets = (player.purchased_tickets || 0) - 1;
        } else {
          return Response.json({ error: 'Type de ticket invalide' }, { status: 400 });
        }

        const isWin = Math.random() < WIN_RATE;
        let result;

        if (isWin) {
          result = selectReward(rewards);
          if (result.type === 'relance') {
            updates.free_ticket_date = null;
          } else if (result.type === 'tokens') {
            updates.balance = (player.balance || 0) + result.amount;
            updates.total_won = (player.total_won || 0) + result.amount;
            if (result.amount > (player.biggest_win || 0)) {
              updates.biggest_win = result.amount;
            }
          }
        } else {
          result = { type: 'lose', label: 'Perdu', desc: 'Réessayez !', amount: 0 };
        }

        await base44.asServiceRole.entities.CasinoPlayer.update(player.id, updates);

        const newBalance = updates.balance !== undefined ? updates.balance : (player.balance || 0);
        const newPurchasedTickets = updates.purchased_tickets !== undefined ? updates.purchased_tickets : (player.purchased_tickets || 0);
        const newFreeAvailable = updates.free_ticket_date === null ? true : (updates.free_ticket_date ? false : freeAvailable);

        console.log('[scratchTicket] scratch by', user.email, '| ticket:', ticketType, '| win:', isWin, '| result:', result.label);

        return Response.json({
          success: true,
          isWin,
          result,
          balance: newBalance,
          purchasedTickets: newPurchasedTickets,
          freeTicketAvailable: newFreeAvailable,
        });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}