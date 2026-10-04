export const AFFILIATE_VIEWS = 1000;
export const PARTNER_VIEWS = 10000;
export const PARTNER_LIKES = 100;
export const PARTNER_MIN_CONTENT = 5;
export const PARTNER_TRIX_MONTHLY = 1000;

export const PARTNER_PERKS = [
  { icon: "💎", title: "1 000 TRIX / mois", desc: "Versement automatique chaque mois tant que vous êtes Partenaire actif." },
  { icon: "⭐", title: "Rôle Partenaire distinctif", desc: "Badge et rôle exclusif affichés sur votre profil et vos messages." },
  { icon: "🚀", title: "Visibilité renforcée", desc: "Mise en avant de vos mods, maps et contenus sur la plateforme." },
  { icon: "🎯", title: "Avantages serveur", desc: "Priorité dans les recommandations et sections dédiées." },
];

export const PARTNER_COMMITMENTS = [
  "Parler de l'application Matrix en live",
  "Afficher le logo et le lien de Matrix sur vos streams",
  "Maintenir une activité créative régulière",
];

export function getPartnerEligibility(stats) {
  const viewsOk = stats.totalViews >= PARTNER_VIEWS;
  const likesOk = stats.totalLikes >= PARTNER_LIKES;
  const contentOk = stats.contentCount >= PARTNER_MIN_CONTENT;
  return {
    viewsOk, likesOk, contentOk,
    eligible: viewsOk && likesOk && contentOk,
    progress: Math.min(100, Math.round(
      (Math.min(stats.totalViews / PARTNER_VIEWS, 1) +
        Math.min(stats.totalLikes / PARTNER_LIKES, 1) +
        Math.min(stats.contentCount / PARTNER_MIN_CONTENT, 1)) / 3 * 100
    )),
  };
}

export function getAffiliateEligibility(stats) {
  return {
    eligible: stats.totalViews >= AFFILIATE_VIEWS,
    progress: Math.min(100, Math.round((stats.totalViews / AFFILIATE_VIEWS) * 100)),
  };
}