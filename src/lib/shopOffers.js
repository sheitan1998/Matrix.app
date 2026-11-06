// Offres vendues directement dans les rayons de la Boutique Matrix.
// Les prix affichés ici reflètent les catalogues serveur (stripePayment).

export const TRIX_OFFERS = [
  { id: "pack_500", name: "500 TRIX", price: "4,99 €", icon: "🪙", accent: "#fbbf24", perks: ["500 Trix crédités immédiatement"], checkout: { functionName: "stripePayment", params: { action: "createTrixPurchase", packId: "pack_500" } } },
  { id: "pack_1400", name: "1 200 TRIX", price: "9,99 €", icon: "🪙", accent: "#fbbf24", badge: "Populaire", perks: ["1 200 Trix", "+200 Trix bonus offerts"], checkout: { functionName: "stripePayment", params: { action: "createTrixPurchase", packId: "pack_1400" } } },
  { id: "pack_3750", name: "3 000 TRIX", price: "24,99 €", icon: "🪙", accent: "#fbbf24", perks: ["3 000 Trix", "+750 Trix bonus offerts"], checkout: { functionName: "stripePayment", params: { action: "createTrixPurchase", packId: "pack_3750" } } },
  { id: "pack_9000", name: "7 000 TRIX", price: "49,99 €", icon: "🪙", accent: "#fbbf24", badge: "Meilleure offre", perks: ["7 000 Trix", "+2 000 Trix bonus offerts"], checkout: { functionName: "stripePayment", params: { action: "createTrixPurchase", packId: "pack_9000" } } },
  { id: "pack_20000", name: "15 000 TRIX", price: "99,99 €", icon: "🪙", accent: "#fbbf24", perks: ["15 000 Trix", "+5 000 Trix bonus offerts"], checkout: { functionName: "stripePayment", params: { action: "createTrixPurchase", packId: "pack_20000" } } },
  { id: "pack_55000", name: "40 000 TRIX", price: "249,99 €", icon: "🐋", accent: "#fbbf24", badge: "Whale", perks: ["40 000 Trix", "+15 000 Trix bonus offerts"], checkout: { functionName: "stripePayment", params: { action: "createTrixPurchase", packId: "pack_55000" } } },
];

export const NEXUS_OFFERS = [
  { id: "nexus_500", name: "500 Jetons M", price: "1,99 €", icon: "🎰", accent: "#C5A059", perks: ["500 jetons Nexus Game"], checkout: { functionName: "stripePayment", params: { action: "createCasinoCoinPurchase", packId: "pack_500" } } },
  { id: "nexus_2000", name: "2 000 Jetons M", price: "4,99 €", icon: "🎰", accent: "#C5A059", badge: "Populaire", perks: ["2 000 jetons", "+400 jetons bonus"], checkout: { functionName: "stripePayment", params: { action: "createCasinoCoinPurchase", packId: "pack_2000" } } },
  { id: "nexus_5000", name: "5 000 Jetons M", price: "9,99 €", icon: "🎰", accent: "#C5A059", perks: ["5 000 jetons", "+1 500 jetons bonus"], checkout: { functionName: "stripePayment", params: { action: "createCasinoCoinPurchase", packId: "pack_5000" } } },
  { id: "nexus_15000", name: "15 000 Jetons M", price: "24,99 €", icon: "🎰", accent: "#C5A059", perks: ["15 000 jetons", "+6 000 jetons bonus"], checkout: { functionName: "stripePayment", params: { action: "createCasinoCoinPurchase", packId: "pack_15000" } } },
  { id: "nexus_50000", name: "50 000 Jetons M", price: "49,99 €", icon: "🎰", accent: "#C5A059", badge: "Meilleure offre", perks: ["50 000 jetons", "+25 000 jetons bonus"], checkout: { functionName: "stripePayment", params: { action: "createCasinoCoinPurchase", packId: "pack_50000" } } },
];

export const BOOST_OFFERS = [
  { id: "flash_1", name: "Boost Flash ×1", price: "2,50 €", trixPrice: 250, icon: "⚡", accent: "#a855f7", perks: ["1 boost Flash pour un serveur Nexus"], checkout: { functionName: "stripePayment", params: { action: "createNexusItemPurchase", itemId: "flash_1" } }, trixCheckout: { functionName: "stripePayment", params: { action: "buyFlashPackWithTrix", itemId: "flash_1" } } },
  { id: "flash_3", name: "Boost Flash ×3", price: "7,50 €", trixPrice: 750, icon: "⚡", accent: "#a855f7", badge: "Populaire", perks: ["3 boosts Flash", "Idéal pour faire décoller un serveur"], checkout: { functionName: "stripePayment", params: { action: "createNexusItemPurchase", itemId: "flash_3" } }, trixCheckout: { functionName: "stripePayment", params: { action: "buyFlashPackWithTrix", itemId: "flash_3" } } },
  { id: "flash_10", name: "Boost Flash ×10", price: "20,00 €", trixPrice: 2000, icon: "⚡", accent: "#a855f7", badge: "Pack premium", perks: ["10 boosts Flash", "Visibilité maximale"], checkout: { functionName: "stripePayment", params: { action: "createNexusItemPurchase", itemId: "flash_10" } }, trixCheckout: { functionName: "stripePayment", params: { action: "buyFlashPackWithTrix", itemId: "flash_10" } } },
];

export const SUBSCRIPTION_OFFERS = [
  { id: "premium", name: "MATRIX Premium", price: "9,99 €", period: "/mois", icon: "💎", accent: "#c084fc", badge: "Sans pub", perks: ["Zéro publicité", "+500 Trix chaque mois", "Badge Premium exclusif", "Qualité 4K prioritaire"], checkout: { functionName: "stripePayment", params: { action: "createPremiumSubscription", planId: "monthly" } } },
  { id: "ai_explorer", name: "AI Studio — Explorer", price: "4,99 €", period: "/mois", icon: "🤖", accent: "#38bdf8", perks: ["100 messages / jour", "6 modes créatifs", "Historique 30 jours"], checkout: { functionName: "stripePayment", params: { action: "createAISubscription", planId: "explorer" } } },
  { id: "ai_creator", name: "AI Studio — Creator", price: "9,99 €", period: "/mois", icon: "🤖", accent: "#38bdf8", badge: "Populaire", perks: ["500 messages / jour", "Tous les modes créatifs", "Génération d'images incluse"], checkout: { functionName: "stripePayment", params: { action: "createAISubscription", planId: "creator" } } },
  { id: "ai_pro", name: "AI Studio — Pro", price: "19,99 €", period: "/mois", icon: "🤖", accent: "#38bdf8", perks: ["Messages illimités", "Modèle IA le plus puissant", "Support dédié"], checkout: { functionName: "stripePayment", params: { action: "createAISubscription", planId: "pro" } } },
  { id: "community_booster", name: "Communauté Booster", price: "10,00 €", period: "/mois", icon: "🚀", accent: "#a855f7", perks: ["3 serveurs Nexus", "2 boosts inclus / mois", "Badge Booster exclusif"], checkout: { functionName: "stripePayment", params: { action: "createCommunitySubscription", planId: "booster" } } },
  { id: "community_vip", name: "Communauté VIP", price: "25,00 €", period: "/mois", icon: "👑", accent: "#fbbf24", perks: ["10 serveurs Nexus", "8 boosts inclus / mois", "Modération avancée"], checkout: { functionName: "stripePayment", params: { action: "createCommunitySubscription", planId: "vip" } } },
  { id: "photo_pro", name: "Éditeur Photo Pro", price: "4,99 €", period: "/mois", icon: "📸", accent: "#f472b6", perks: ["Outils photo avancés", "30 jours d'accès"], checkout: { functionName: "stripePayment", params: { action: "createPhotoProSubscription", planId: "photo_pro" } } },
];

export const VIP_OFFERS = [
  { id: "vip_bronze", name: "VIP Bronze", price: "4,99 €", period: "/mois", icon: "🥉", accent: "#cd7f32", perks: ["Badge VIP Bronze", "2 boosts Flash", "+10% XP", "5 000 jetons Nexus Game"], checkout: { functionName: "stripePayment", params: { action: "createVIPSubscription", plan: "vip_bronze" } } },
  { id: "vip_silver", name: "VIP Silver", price: "9,99 €", period: "/mois", icon: "🥈", accent: "#c0c0c0", badge: "Populaire", perks: ["Badge VIP Silver", "5 boosts Flash", "+25% XP", "15 000 jetons Nexus Game"], checkout: { functionName: "stripePayment", params: { action: "createVIPSubscription", plan: "vip_silver" } } },
  { id: "vip_gold", name: "VIP Gold", price: "19,99 €", period: "/mois", icon: "🥇", accent: "#ffd700", perks: ["Badge VIP Gold", "15 boosts Flash", "+50% XP", "Cosmétique exclusif"], checkout: { functionName: "stripePayment", params: { action: "createVIPSubscription", plan: "vip_gold" } } },
  { id: "vip_yearly", name: "VIP Annuel", price: "49,99 €", period: "/an", icon: "💎", accent: "#ffd700", badge: "2 mois offerts", perks: ["Tous les avantages VIP", "2 mois offerts", "Frame animée exclusive"], checkout: { functionName: "stripePayment", params: { action: "createVIPSubscription", plan: "yearly" } } },
];

export const OFFERS_BY_CATEGORY = {
  trix: TRIX_OFFERS,
  nexus: NEXUS_OFFERS,
  boosts: BOOST_OFFERS,
  subscriptions: SUBSCRIPTION_OFFERS,
  vip: VIP_OFFERS,
};

export const OFFER_CATEGORIES = Object.keys(OFFERS_BY_CATEGORY);

export const OFFER_NOTES = {
  trix: "Trix crédités immédiatement sur ton solde.",
  nexus: "Jetons fictifs réservés au Nexus Game, réservé aux 18+.",
  boosts: "Boosts cumulables sur tous tes serveurs Nexus.",
  subscriptions: "Renouvellement mensuel, résiliable à tout moment.",
  vip: "Avantages actifs dès le premier paiement.",
};