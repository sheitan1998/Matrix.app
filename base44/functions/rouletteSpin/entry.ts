import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const MAX_BETS = 40;
const OUTSIDE_KEYS = new Set([
  'red', 'black', 'even', 'odd', 'low', 'high',
  'dozen1', 'dozen2', 'dozen3', 'col1', 'col2', 'col3',
]);

function isValidKey(key) {
  if (OUTSIDE_KEYS.has(key)) return true;
  if (!key.startsWith('n:')) return false;
  const value = Number(key.slice(2));
  return Number.isInteger(value) && value >= 0 && value <= 36;
}

// Tirage uniforme 0-36 sans biais de modulo (rejection sampling).
function spinNumber() {
  const limit = Math.floor(0x100000000 / 37) * 37;
  const buffer = new Uint32Array(1);
  let value = 0;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % 37;
}

// Returns the total returned to the player (stake included), or -1 if the key is invalid.
function payoutFor(key, number) {
  if (key.startsWith('n:')) {
    const value = Number(key.slice(2));
    if (!Number.isInteger(value) || value < 0 || value > 36) return -1;
    return value === number ? 30 : 0;
  }
  if (number === 0) return 0;
  const red = RED.has(number);
  switch (key) {
    case 'red': return red ? 1.6 : 0;
    case 'black': return red ? 0 : 1.6;
    case 'even': return number % 2 === 0 ? 1.6 : 0;
    case 'odd': return number % 2 === 1 ? 1.6 : 0;
    case 'low': return number <= 18 ? 1.6 : 0;
    case 'high': return number >= 19 ? 1.6 : 0;
    case 'dozen1': return number <= 12 ? 2.2 : 0;
    case 'dozen2': return number >= 13 && number <= 24 ? 2.2 : 0;
    case 'dozen3': return number >= 25 ? 2.2 : 0;
    case 'col1': return number % 3 === 1 ? 2.2 : 0;
    case 'col2': return number % 3 === 2 ? 2.2 : 0;
    case 'col3': return number % 3 === 0 ? 2.2 : 0;
    default: return -1;
  }
}

async function getPlayer(base44, user) {
  const records = await base44.asServiceRole.entities.CasinoPlayer.filter({ user_email: user.email });
  if (records.length > 0) return records[0];
  return base44.asServiceRole.entities.CasinoPlayer.create({
    user_email: user.email,
    balance: 5000,
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

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const rawBets = Array.isArray(body?.bets) ? body.bets : [];
    if (rawBets.length === 0 || rawBets.length > MAX_BETS) {
      return Response.json({ error: 'Invalid bets' }, { status: 400 });
    }

    const bets = [];
    let stake = 0;
    for (const entry of rawBets) {
      const key = String(entry?.key || '');
      const amount = Math.floor(Number(entry?.amount));
      if (!Number.isFinite(amount) || amount <= 0) {
        return Response.json({ error: 'Invalid bet amount' }, { status: 400 });
      }
      if (!isValidKey(key)) {
        return Response.json({ error: `Invalid bet key: ${key}` }, { status: 400 });
      }
      stake += amount;
      bets.push({ key, amount });
    }

    const player = await getPlayer(base44, user);
    if ((player.balance || 0) < stake) {
      return Response.json({ error: 'Solde insuffisant' }, { status: 400 });
    }

    const number = spinNumber();
    let payout = 0;
    const wins = [];
    for (const bet of bets) {
      const multiplier = payoutFor(bet.key, number);
      if (multiplier > 0) {
        const gain = Math.floor(bet.amount * multiplier);
        payout += gain;
        wins.push({ key: bet.key, amount: gain });
      }
    }

    const net = payout - stake;
    const balance = (player.balance || 0) - stake + payout;
    const totalXp = (player.total_xp || 0) + (net > 0 ? 10 : 0);

    await base44.asServiceRole.entities.CasinoPlayer.update(player.id, {
      balance,
      total_bets: (player.total_bets || 0) + 1,
      total_wagered: (player.total_wagered || 0) + stake,
      total_won: (player.total_won || 0) + payout,
      biggest_win: Math.max(player.biggest_win || 0, net),
      max_bet: Math.max(player.max_bet || 0, stake),
      total_xp: totalXp,
      xp: totalXp % 100,
    });

    return Response.json({
      number,
      color: number === 0 ? 'green' : RED.has(number) ? 'red' : 'black',
      stake,
      payout,
      net,
      balance,
      wins,
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'Roulette error' }, { status: 500 });
  }
}