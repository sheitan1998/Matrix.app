import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// ===== Default Configuration (fallback if no entity record) =====
const INITIAL_BALANCE = 5000;
const DEFAULT_SPIN_COST = 20000;
const DEFAULT_RESET_HOUR = 12;

const DEFAULT_REWARDS = [
  { index: 0, id: "perdu",     label: "Perdu",           desc: "Réessayez !",         amount: 0,       weight: 65,    type: "lose" },
  { index: 1, id: "1000",      label: "1 000 jetons",    desc: "Petit gain",           amount: 1000,    weight: 55,    type: "tokens" },
  { index: 2, id: "20000",     label: "20 000 jetons",   desc: "Beau gain",            amount: 20000,   weight: 35,    type: "tokens" },
  { index: 3, id: "50000",     label: "50 000 jetons",   desc: "Gros gain",            amount: 50000,   weight: 30,    type: "tokens" },
  { index: 4, id: "100000",    label: "100 000 jetons",  desc: "Très gros gain",       amount: 100000,  weight: 20,    type: "tokens" },
  { index: 5, id: "1000000",   label: "1 000 000 jetons", desc: "Gain exceptionnel !", amount: 1000000, weight: 1,     type: "tokens" },
  { index: 6, id: "trix100",   label: "100 Trix",        desc: "Gain ultra rare !",    amount: 100,     weight: 0.001, type: "trix" },
];

// ===== Helpers =====

function selectReward(rewards) {
  const totalWeight = rewards.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const reward of rewards) {
    roll -= reward.weight;
    if (roll <= 0) return reward;
  }
  return rewards[0];
}

function getResetBoundary(resetHour) {
  const hour = resetHour !== undefined ? resetHour : DEFAULT_RESET_HOUR;
  const now = new Date();
  const todayBoundary = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, 0, 0, 0));
  return now.getTime() >= todayBoundary.getTime() ? todayBoundary : new Date(todayBoundary.getTime() - 24 * 60 * 60 * 1000);
}

function isFreeSpinAvailable(lastFreeSpinISO, resetHour) {
  if (!lastFreeSpinISO) return true;
  const boundary = getResetBoundary(resetHour);
  return new Date(lastFreeSpinISO).getTime() < boundary.getTime();
}

async function getPlayer(base44, user) {
  const records = await base44.asServiceRole.entities.CasinoPlayer.filter({ user_email: user.email });
  if (records.length > 0) return records[0];
  return await base44.asServiceRole.entities.CasinoPlayer.create({
    user_email: user.email,
    balance: INITIAL_BALANCE,
    purchased_tickets: 0,
  });
}

async function getGameConfig(base44) {
  try {
    const records = await base44.asServiceRole.entities.CasinoGameConfig.filter({ game_key: "wheel" });
    if (records.length > 0) return records[0];
  } catch { /* entity may not exist yet */ }
  return null;
}

function buildRewards(config) {
  if (config?.rewards && Array.isArray(config.rewards) && config.rewards.length > 0) {
    return config.rewards.map((r, i) => ({ ...r, index: i }));
  }
  return DEFAULT_REWARDS;
}

// ===== Handler =====

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const player = await getPlayer(base44, user);
    const config = await getGameConfig(base44);
    const SPIN_COST = config?.spin_cost || DEFAULT_SPIN_COST;
    const RESET_HOUR = config?.reset_hour_utc !== undefined ? config.reset_hour_utc : DEFAULT_RESET_HOUR;
    const rewards = buildRewards(config);

    switch (action) {

      case 'getStatus': {
        const freeAvailable = isFreeSpinAvailable(player.last_free_wheel_spin, RESET_HOUR);
        const nextReset = new Date(getResetBoundary(RESET_HOUR).getTime() + 24 * 60 * 60 * 1000);
        return Response.json({
          balance: player.balance || 0,
          freeSpinAvailable: freeAvailable,
          spinCost: SPIN_COST,
          nextResetAt: nextReset.toISOString(),
        });
      }

      case 'spin': {
        const freeAvailable = isFreeSpinAvailable(player.last_free_wheel_spin, RESET_HOUR);
        let isFree = freeAvailable;

        if (!isFree) {
          if ((player.balance || 0) < SPIN_COST) {
            return Response.json({ error: `Solde insuffisant. Il faut ${SPIN_COST} jetons pour un lancer supplémentaire.` }, { status: 400 });
          }
        }

        const result = selectReward(rewards);
        const updates = {};

        if (result.type === 'tokens' && result.amount > 0) {
          updates.balance = (player.balance || 0) + result.amount;
          updates.total_won = (player.total_won || 0) + result.amount;
          if (result.amount > (player.biggest_win || 0)) {
            updates.biggest_win = result.amount;
          }
        }

        if (freeAvailable) {
          updates.last_free_wheel_spin = new Date().toISOString();
        } else {
          updates.balance = (updates.balance !== undefined ? updates.balance : (player.balance || 0)) - SPIN_COST;
          updates.total_wagered = (player.total_wagered || 0) + SPIN_COST;
        }

        if (Object.keys(updates).length > 0) {
          await base44.asServiceRole.entities.CasinoPlayer.update(player.id, updates);
        }

        if (result.type === 'trix' && result.amount > 0) {
          await base44.asServiceRole.entities.TrixTransaction.create({
            user_email: user.email,
            type: 'donation',
            amount: result.amount,
            description: 'Récompense Roue de la Fortune',
          });
        }

        console.log('[wheelOfFortune] spin by', user.email, '| result:', result.label, '| index:', result.index, '| free:', freeAvailable);

        return Response.json({
          success: true,
          result: {
            index: result.index,
            id: result.id,
            label: result.label,
            desc: result.desc,
            amount: result.amount,
            type: result.type,
          },
          balance: updates.balance !== undefined ? updates.balance : (player.balance || 0),
          freeSpinUsed: freeAvailable,
          nextFreeSpinAvailable: false,
        });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}