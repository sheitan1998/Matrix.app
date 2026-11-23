// Source unique des paliers Matrix AI : limites, prix et avantages (utilisé par matrixAi et stripePayment).

export const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEK_MS = 7 * DAY_MS;

export type AiTier = 'starter' | 'plus' | 'ultra';

export interface AiPlan {
  tier: AiTier;
  label: string;
  priceCents: number;
  window: 'day' | 'week';
  limit: number;
  memory: boolean;
  connectors: boolean;
  priority: boolean;
  earlyAccess: boolean;
}

export const AI_TIER_PLANS: Record<AiTier, AiPlan> = {
  starter: {
    tier: 'starter',
    label: 'Starter',
    priceCents: 0,
    window: 'day',
    limit: 10,
    memory: false,
    connectors: false,
    priority: false,
    earlyAccess: false,
  },
  plus: {
    tier: 'plus',
    label: 'Matrix Plus',
    priceCents: 999,
    window: 'day',
    limit: 100,
    memory: true,
    connectors: true,
    priority: false,
    earlyAccess: false,
  },
  ultra: {
    tier: 'ultra',
    label: 'Matrix Ultra',
    priceCents: 7000,
    window: 'week',
    limit: 7000,
    memory: true,
    connectors: true,
    priority: true,
    earlyAccess: true,
  },
};

// Plans achetables via Stripe (abonnement mensuel récurrent).
export const MATRIX_AI_PLANS: Record<string, { priceCents: number; label: string; tier: AiTier }> = {
  plus: {
    priceCents: AI_TIER_PLANS.plus.priceCents,
    label: 'Matrix Plus — 100 messages IA / 24h, mémoire et connecteurs',
    tier: 'plus',
  },
  ultra: {
    priceCents: AI_TIER_PLANS.ultra.priceCents,
    label: 'Matrix Ultra — 7 000 messages IA / semaine, accès prioritaire et nouveautés en avance',
    tier: 'ultra',
  },
};

export function normalizeTier(value: unknown): AiTier {
  return value === 'plus' || value === 'ultra' ? value : 'starter';
}
