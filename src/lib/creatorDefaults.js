// Visuels par défaut (cyberpunk) pour les plateformes dont les images
// ne peuvent pas être récupérées automatiquement depuis l'URL.
export const MANUAL_VISUAL_PLATFORMS = ["tiktok", "instagram"];

export const CREATOR_DEFAULT_VISUALS = {
  tiktok: {
    avatar_url: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/99e2821b9_generated_image.png",
    banner_url: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/af1775fa0_generated_image.png",
  },
  instagram: {
    avatar_url: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/25c2457b7_generated_image.png",
    banner_url: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/82fad7e83_generated_image.png",
  },
  snapchat: {
    avatar_url: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/3c66adb1c_generated_image.png",
    banner_url: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/ed2b995ee_generated_image.png",
  },
};

export const needsManualVisuals = (platform) => MANUAL_VISUAL_PLATFORMS.includes(platform);

// Renvoie toujours un logo et une bannière exploitables : les images saisies
// sinon les visuels cyberpunk par défaut de la plateforme.
export function resolveCreatorVisuals(creator) {
  const fallback = CREATOR_DEFAULT_VISUALS[creator?.platform] || {};
  return {
    avatar_url: creator?.avatar_url || fallback.avatar_url || "",
    banner_url: creator?.banner_url || fallback.banner_url || "",
  };
}