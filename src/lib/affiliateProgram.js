export const PARTNER_VIEWS = 100000;
export const PARTNER_MIN_CONTENT = 5;
export const PARTNER_SUBSCRIBERS = 10000;
export const PARTNER_TRIX_MONTHLY = 1000;

export const PARTNER_PERKS = [
  { icon: "💎", title: "Versement mensuel de jetons Trix", desc: "1 000 Trix versés chaque mois tant que votre statut Partenaire est actif." },
  { icon: "⭐", title: "Badge & rôle distinctif", desc: "Un badge exclusif sur votre profil et à côté de vos messages." },
  { icon: "🚀", title: "Visibilité renforcée", desc: "Vos mods et maps sont mis en avant sur la plateforme." },
  { icon: "🎯", title: "Avantages serveurs communautaires", desc: "Des avantages exclusifs sur les serveurs de la communauté Matrix." },
];

export const PARTNER_COMMITMENTS = [
  "Parler de l'application Matrix en live",
  "Afficher le logo et le lien de Matrix sur vos streams",
  "Maintenir une activité créative régulière",
];

export function getPartnerEligibility(stats) {
  const viewsOk = stats.totalViews >= PARTNER_VIEWS;
  const contentOk = stats.contentCount >= PARTNER_MIN_CONTENT;
  const subscribersOk = stats.subscriberCount >= PARTNER_SUBSCRIBERS;
  return {
    viewsOk,
    contentOk,
    subscribersOk,
    eligible: viewsOk && contentOk && subscribersOk,
    progress: Math.min(100, Math.round(
      (Math.min(stats.totalViews / PARTNER_VIEWS, 1) +
        Math.min(stats.contentCount / PARTNER_MIN_CONTENT, 1) +
        Math.min(stats.subscriberCount / PARTNER_SUBSCRIBERS, 1)) / 3 * 100
    )),
  };
}

/** Code stable utilisé dans le lien ?ref= */
export function buildReferralCode(user) {
  const raw = user?.pseudo || (user?.email ? user.email.split("@")[0] : "");
  const code = String(raw).trim().replace(/\s+/g, "").replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 32);
  return code;
}

export function referralLink(code) {
  return `https://matrix-hub.app/?ref=${encodeURIComponent(code || "")}`;
}