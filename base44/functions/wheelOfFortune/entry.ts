import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// ===== Configuration =====
const INITIAL_BALANCE = 5000;
const SPIN_COST = 20000; // Coût d'un lancer supplémentaire (après le gratuit quotidien)

// Récompenses avec poids relatifs (normalisés côté serveur)
// L'ordre des index correspond à la position sur la roue (sens horaire depuis le haut)
const REWARDS = [
  { index: 0, id: "perdu",     label: "Perdu",           desc: "Réessayez !",         amount: 0,       weight: 65,    type: "lose" },
  { index: 1, id: "1000",      label: "1 000 jetons",    desc: "Petit gain",           amount: 1000,    weight: 55,    type: "tokens" },
  { index: 2, id: "20000",     label: "20 000 jetons",   desc: "Beau gain",            amount: 20000,   weight: 35,    type: "tokens" },
  { index: 3, id: "50000",     label: "50 000 jetons",   desc: "Gros gain",            amount: 50000,   weight: 30,    type: "tokens" },
  { index: 4, id: "100000",    label: "100 000 jetons",  desc: "Très gros gain",       amount: 100000,  weight: 20,    type: "tokens" },
  { index: 5, id: "1000000",   label: "1 000 000 jetons", desc: "Gain exceptionnel !", amount: 1000000, weight: 1,     type: "tokens" },
  { index: 6, id: "trix100",   label: "100 Trix",        desc: "Gain ultra rare !",    amount: 100,     weight: 0.001, type: "trix" },
];

// ===== Helpers =====

function selectReward() {
  const totalWeight = REWARDS.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const reward of REWARDS) {
    roll -= reward.weight;
    if (roll <= 0) return reward;
  }
  return REWARDS[0];
}

/**
 * Retourne la limite de réinitialisation (midi UTC) la plus récente déjà passée.
 * Le lancer gratuit se réinitialise chaque jour à 12h00 (midi) UTC.
 */
function getNoonBoundaryUTC() {
  const now = new Date();
  const todayNoon = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0, 0));
  // Si on est avant midi aujourd'hui, la limite est midi hier
  return now.getTime() >= todayNoon.getTime() ? todayNoon : new Date(todayNoon.getTime() - 24 * 60 * 60 * 1000);
}

/**
 * Détermine si le lancer gratuit est disponible.
 * Disponible si jamais utilisé OU si le dernier lancer est antérieur à la limite de midi la plus récente.
 */
function isFreeSpinAvailable(lastFreeSpinISO) {
  if (!lastFreeSpinISO) return true;
  const boundary = getNoonBoundaryUTC();
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

// ===== Handler =====

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const player = await getPlayer(base44, user);

    switch (action) {

      case 'getStatus': {
        const freeAvailable = isFreeSpinAvailable(player.last_free_wheel_spin);
        const nextReset = new Date(getNoonBoundaryUTC().getTime() + 24 * 60 * 60 * 1000);
        return Response.json({
          balance: player.balance || 0,
          freeSpinAvailable: freeAvailable,
          spinCost: SPIN_COST,
          nextResetAt: nextReset.toISOString(),
        });
      }

      case 'spin': {
        const freeAvailable = isFreeSpinAvailable(player.last_free_wheel_spin);
        let isFree = freeAvailable;

        // Si pas de lancer gratuit, vérifier le solde pour un lancer payant
        if (!isFree) {
          if ((player.balance || 0) < SPIN_COST) {
            return Response.json({ error: `Solde insuffisant. Il faut ${SPIN_COST} jetons pour un lancer supplémentaire.` }, { status: 400 });
          }
          isFree = false;
        }

        // 1. Déterminer le résultat (pondéré, sécurisé côté serveur)
        const result = selectReward();
        const updates = {};

        // 2. Appliquer la récompense
        if (result.type === 'tokens' && result.amount > 0) {
          updates.balance = (player.balance || 0) + result.amount;
          updates.total_won = (player.total_won || 0) + result.amount;
          if (result.amount > (player.biggest_win || 0)) {
            updates.biggest_win = result.amount;
          }
        }

        // 3. Gérer le coût du lancer
        if (freeAvailable) {
          // Lancer gratuit : enregistrer la date d'utilisation
          updates.last_free_wheel_spin = new Date().toISOString();
        } else {
          // Lancer payant : déduire le coût
          updates.balance = (updates.balance !== undefined ? updates.balance : (player.balance || 0)) - SPIN_COST;
          updates.total_wagered = (player.total_wagered || 0) + SPIN_COST;
        }

        // 4. Appliquer les mises à jour
        if (Object.keys(updates).length > 0) {
          await base44.asServiceRole.entities.CasinoPlayer.update(player.id, updates);
        }

        // 5. Créer une transaction Trix pour la récompense rare
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
          nextFreeSpinAvailable: false, // Le gratuit vient d'être utilisé
        });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}