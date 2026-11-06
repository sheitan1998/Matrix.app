export const DEFAULT_CATEGORIES = [
  { key: "cosmetics", label: "Cosmétiques", description: "Badges, animations et couvertures exclusives.", icon: "🧥", accent_color: "#a855f7", cta_label: "Voir la catégorie", sort_order: 1 },
  { key: "trix", label: "Jetons Trix", description: "Rechargez votre solde et débloquez plus de contenu.", icon: "🪙", accent_color: "#8b5cf6", cta_label: "Voir la catégorie", sort_order: 2 },
  { key: "nexus", label: "Jetons Nexus Game", description: "Obtenez plus de jetons Nexus Game pour vos achats.", icon: "🪙", accent_color: "#a855f7", cta_label: "Voir la catégorie", sort_order: 3 },
  { key: "boosts", label: "Boosts Flash", description: "Faites décoller votre serveur et votre visibilité.", icon: "⚡", accent_color: "#f59e0b", cta_label: "Voir la catégorie", sort_order: 3 },
  { key: "subscriptions", label: "Abonnements", description: "Accès Premium, sans engagement, résiliable.", icon: "👑", accent_color: "#c084fc", cta_label: "Voir la catégorie", sort_order: 4 },
  { key: "vip", label: "VIP", description: "Le club privé MATRIX et ses avantages uniques.", icon: "💎", accent_color: "#fbbf24", cta_label: "Voir la catégorie", sort_order: 5 },
  { key: "tickets", label: "Tickets & Offres", description: "Tickets à gratter et offres limitées.", icon: "🎫", accent_color: "#eab308", cta_label: "Voir la catégorie", sort_order: 6 },
  { key: "other", label: "Autres Produits", description: "Coffrets, goodies et surprises MATRIX.", icon: "🎁", accent_color: "#a78bfa", cta_label: "Voir la catégorie", sort_order: 7 },
];

export const SECTION_KEYS = DEFAULT_CATEGORIES.map((c) => c.key);

export function sectionOf(item) {
  return item?.shop_section || "cosmetics";
}

export function effectiveDiscountPercent(item, config = {}) {
  const own = Number(item?.discount_percent) || 0;
  if (own > 0) return Math.min(95, own);
  const global = Number(config?.global_discount_percent) || 0;
  if (config?.global_promo_enabled && global > 0) return Math.min(95, global);
  return 0;
}

export function effectivePrices(item, config = {}) {
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

export function formatEuro(value) {
  return `${(Math.round((Number(value) || 0) * 100) / 100).toFixed(2).replace(".", ",")}€`;
}

export function buildSpecialOffer(config = {}, items = []) {
  if (!config?.special_offer_enabled) return null;
  const product = items.find((i) => i.id === config.special_offer_product_id) || null;
  const discountPercent = Math.min(95, Math.max(0, Number(config.special_offer_discount_percent) || 0));

  const baseOld = product
    ? Number(product.price_euros) > 0 ? Number(product.price_euros) : (Number(product.price_trix) || 0) / 100
    : Number(config.special_offer_old_price) || 0;

  const oldPrice = Math.round(baseOld * 100) / 100;
  const computed = Math.round(oldPrice * (1 - discountPercent / 100) * 100) / 100;
  const price = !product && Number(config.special_offer_price) > 0 ? Number(config.special_offer_price) : computed;

  return {
    product,
    title: config.special_offer_title || product?.name || "Offre Spéciale",
    description: config.special_offer_description || product?.description || "",
    image: config.special_offer_image || product?.preview_image || "",
    discountPercent,
    oldPrice,
    price: Math.round(price * 100) / 100,
    cta: config.special_offer_cta || "Profiter de l'offre",
  };
}