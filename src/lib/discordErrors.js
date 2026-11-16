const MESSAGES = {
  discord_oauth_non_configure: "Connecte d'abord l'application Discord : le secret DISCORD_CLIENT_SECRET est requis pour l'OAuth utilisateur.",
  redirect_invalid: "Adresse de retour Discord invalide : utilise la page /live-bot.",
  state_mismatch: "Connexion Discord interrompue : relance la connexion.",
  code_missing: "Autorisation Discord incomplète : relance la connexion.",
  discord_oauth_refused: "Discord a refusé la connexion : vérifie l'URL de redirection déclarée dans ton application Discord.",
  user_not_connected: "Connecte ton compte Discord pour voir tes serveurs.",
  user_token_expired: "Session Discord expirée : reconnecte ton compte.",
  guild_not_allowed: "Ce serveur n'est pas dans tes serveurs administrateur.",
  guild_required: "Choisis d'abord un serveur Discord.",
  channel_required: "Choisis le salon où publier le panneau.",
  panel_invalid: "Panneau inconnu.",
  missing_permissions: "Le bot n'a pas les permissions nécessaires dans ce salon : ajoute « Voir le salon », « Envoyer des messages » et « Intégrer des liens ».",
  missing_access: "Salon introuvable : le bot n'a pas accès à ce salon ou il a été supprimé.",
  bot_not_in_guild: "Le bot Matrix n'est pas sur ce serveur : invite-le avant de publier.",
  bot_refused: "Le bot Discord refuse la requête : vérifie le secret DISCORD_BOT_TOKEN.",
  discord_non_configure: "Bot Discord non configuré : ajoute DISCORD_CLIENT_ID et DISCORD_BOT_TOKEN.",
  discord_refused: "Discord n'a pas répondu correctement. Réessaie dans un instant.",
};

export function discordErrorMessage(code) {
  if (!code) return "Erreur Discord inconnue.";
  return MESSAGES[code] || String(code).replace(/_/g, " ");
}