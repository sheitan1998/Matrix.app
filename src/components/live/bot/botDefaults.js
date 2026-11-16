// Valeurs par défaut affichées dans l'interface (le serveur normalise à l'enregistrement).
export const TWITCH_ALERTS = {
  follow: { message: "Merci {user} pour le follow !" },
  sub: { message: "Merci {user} pour l’abonnement !" },
  giftSub: { message: "Merci pour le sub cadeau offert à la communauté !" },
  raid: { message: "Raid de {user} avec {viewers} viewers, on lâche des emotes !", minViewers: 5 },
  bits: { message: "Merci {user} pour les bits !" },
};

export const YOUTUBE_ALERTS = {
  member: { message: "Bienvenue {user} dans la chaîne !" },
  superChat: { message: "Merci {user} pour le Super Chat !" },
  superSticker: { message: "Merci {user} pour le Super Sticker !" },
};

export const MODERATION_WARNING = "{user}, ce message n’est pas autorisé ici.";

export const TWITCH_ACTIONS = [
  { key: "delete", label: "Supprimer le message" },
  { key: "timeout60", label: "Timeout 60 s" },
  { key: "timeout600", label: "Timeout 10 min" },
  { key: "ban", label: "Bannir" },
];

export const YOUTUBE_ACTIONS = [
  { key: "delete", label: "Supprimer le message" },
  { key: "timeout300", label: "Exclusion temporaire 5 min" },
  { key: "ban", label: "Bannir de la chaîne" },
];

export const COMMAND_LEVELS = [
  { key: "everyone", label: "Tout le monde" },
  { key: "subscribers", label: "Abonnés" },
  { key: "vips", label: "VIP" },
  { key: "moderators", label: "Modérateurs" },
];