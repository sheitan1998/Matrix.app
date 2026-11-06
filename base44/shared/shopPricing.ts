export type ShopDiscountConfig = {
  global_promo_enabled?: boolean;
  global_discount_percent?: number;
  global_promo_ends_at?: string;
  special_offer_enabled?: boolean;
  special_offer_ends_at?: string;
};

// Une promotion sans date de fin reste active ; une date dépassée la désactive.
export function isPromoActive(endsAt?: string, now = Date.now()): boolean {
  if (!endsAt) return true;
  const ts = new Date(endsAt).getTime();
  return Number.isNaN(ts) ? true : ts > now;
}

export type ShopPricedItem = {
  price_trix?: number;
  price_euros?: number;
  discount_percent?: number;
};

export function effectiveDiscountPercent(item: ShopPricedItem, config: ShopDiscountConfig = {}): number {
  const own = Number(item?.discount_percent) || 0;
  if (own > 0) return Math.min(95, own);
  const global = Number(config?.global_discount_percent) || 0;
  if (config?.global_promo_enabled && global > 0 && isPromoActive(config.global_promo_ends_at)) {
    return Math.min(95, global);
  }
  return 0;
}

export function effectivePrices(item: ShopPricedItem, config: ShopDiscountConfig = {}) {
  const discountPercent = effectiveDiscountPercent(item, config);
  const baseTrix = Math.max(0, Number(item?.price_trix) || 0);
  const baseEuros = Number(item?.price_euros) > 0 ? Number(item.price_euros) : baseTrix / 100;
  const factor = 1 - discountPercent / 100;
  return {
    discountPercent,
    baseTrix,
    baseEuros: Math.round(baseEuros * 100) / 100,
    priceTrix: Math.round(baseTrix * factor),
    priceEuros: Math.round(baseEuros * factor * 100) / 100,
  };
}