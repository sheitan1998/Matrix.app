import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// ===== Configuration =====
const INITIAL_BALANCE = 5000;
const TICKET_PRICE = 10000;
const WIN_RATE = 0.30; // 30% de chances de gagner

// Récompenses possibles parmi les 30% gagnants (poids relatifs)
const REWARDS = [
  { type: "relance",  label: "🎯 Relance !",            desc: "Un nouveau ticket gratuit pour rejouer", weight: 40, amount: 0 },
  { type: "tokens",   label: "💰 10 000 jetons",         desc: "Petit gain",                             weight: 30, amount: 10000 },
  { type: "tokens",   label: "💰 50 000 jetons",         desc: "Beau gain",                              weight: 20, amount: 50000 },
  { type: "tokens",   label: "💰 100 000 jetons",        desc: "Gros gain",                              weight: 8,  amount: 100000 },
  { type: "tokens",   label: "💎 1 000 000 jetons",      desc: "Gain exceptionnel !",                    weight: 2,  amount: 1000000 },
];

// ===== Helpers =====

/**
 * Calcule l'horodatage du dernier réarmement du ticket gratuit (15h00 UTC).
 * Si l'heure actuelle est avant 15h00, le dernier réarmement était hier à 15h00.
 * Si l'heure actuelle est après 15h00, le dernier réarmement était aujourd'hui à 15h00.
 */
function getLastResetTime(): Date {
  const now = new Date();
  const reset = new Date(now);
  reset.setUTCHours(15, 0, 0, 0);
  if (now.getTime() < reset.getTime()) {
    reset.setUTCDate(reset.getUTCDate() - 1);
  }
  return reset;
}

/**
 * Vérifie si le ticket gratuit quotidien est disponible.
 * Disponible si: jamais utilisé, ou utilisé avant le dernier réarmement à 15h00.
 */
function isFreeTicketAvailable(freeTicketDate: string | null | undefined): boolean {
  if (!freeTicketDate) return true;
  const lastReset = getLastResetTime();
  return new Date(freeTicketDate).getTime() < lastReset.getTime();
}

/**
 * Récupère ou crée le profil CasinoPlayer de l'utilisateur.
 */
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
    won_24h: 0,
    achievements: [],
    purchased_tickets: 0,
  });
}

/**
 * Sélectionne une récompense aléatoirement parmi les gagnants (pondéré).
 */
function selectReward() {
  const totalWeight = REWARDS.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const reward of REWARDS) {
    roll -= reward.weight;
    if (roll <= 0) return reward;
  }
  return REWARDS[0];
}

// ===== Handler =====

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, ticketType } = body;
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const player = await getPlayer(base44, user);

    switch (action) {

      // ---- Statut des tickets ----
      case 'getTicketStatus': {
        const freeAvailable = isFreeTicketAvailable(player.free_ticket_date);
        const nextReset = getLastResetTime();
        nextReset.setUTCDate(nextReset.getUTCDate() + 1); // prochain réarmement
        return Response.json({
          balance: player.balance || 0,
          freeTicketAvailable: freeAvailable,
          purchasedTickets: player.purchased_tickets || 0,
          nextResetTime: nextReset.toISOString(),
        });
      }

      // ---- Acheter un ticket (10 000 jetons) ----
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

      // ---- Gratter un ticket (logique sécurisée côté serveur) ----
      case 'scratch': {
        const updates: any = {};
        const freeAvailable = isFreeTicketAvailable(player.free_ticket_date);

        // 1. Valider et consommer le ticket
        if (ticketType === 'free') {
          if (!freeAvailable) {
            return Response.json({ error: 'Ticket quotidien déjà utilisé. Revenez à 15h00.' }, { status: 400 });
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

        // 2. Déterminer le résultat (30% de gain)
        const isWin = Math.random() < WIN_RATE;
        let result;

        if (isWin) {
          result = selectReward();
          // 3. Appliquer la récompense
          if (result.type === 'relance') {
            // Relance = un nouveau ticket gratuit (free_ticket_date remis à null)
            updates.free_ticket_date = null;
          } else if (result.type === 'tokens') {
            updates.balance = (player.balance || 0) + result.amount;
            updates.total_won = (player.total_won || 0) + result.amount;
            if (result.amount > (player.biggest_win || 0)) {
              updates.biggest_win = result.amount;
            }
          }
        } else {
          result = { type: 'lose', label: 'Perdu', desc: 'Réessayez demain !', amount: 0 };
        }

        // 4. Appliquer les mises à jour en une seule opération
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