// Seed data for all dynamic Nexus entities — injected on first load when the entity is empty.
// This ensures every admin tab is pre-populated with the full standard permission/rule/block/extension set.

export const SEED_PERMISSIONS = [
  // Général
  { key: "view_channels", label: "Voir les salons", category: "Général", default_value: true, sort_order: 0, is_active: true },
  { key: "manage_channels", label: "Gérer les salons", category: "Général", default_value: false, sort_order: 1, is_active: true },
  { key: "manage_roles", label: "Gérer les rôles", category: "Général", default_value: false, sort_order: 2, is_active: true },
  { key: "manage_emojis", label: "Créer et gérer les expressions (émojis/stickers)", category: "Général", default_value: false, sort_order: 3, is_active: true },
  { key: "view_logs", label: "Voir les logs", category: "Général", default_value: false, sort_order: 4, is_active: true },
  { key: "create_invite", label: "Créer une invitation", category: "Général", default_value: true, sort_order: 5, is_active: true },
  { key: "change_nicknames", label: "Changer le pseudo des membres", category: "Général", default_value: false, sort_order: 6, is_active: true },
  { key: "manage_channel", label: "Gérer le salon (par salon)", category: "Général", default_value: false, sort_order: 7, is_active: true, description: "Permissions par salon" },
  { key: "manage_permissions", label: "Gérer les permissions (par salon)", category: "Général", default_value: false, sort_order: 8, is_active: true },
  { key: "manage_webhooks", label: "Gérer les webhooks", category: "Général", default_value: false, sort_order: 9, is_active: true },
  { key: "administrator", label: "Administrateur global du serveur", category: "Général", default_value: false, highlight: true, sort_order: 10, is_active: true },

  // Membres
  { key: "kick_members", label: "Expulser des membres", category: "Membres", default_value: false, sort_order: 0, is_active: true },
  { key: "accept_members", label: "Accepter ou refuser des membres", category: "Membres", default_value: false, sort_order: 1, is_active: true },
  { key: "ban_members", label: "Bannir des membres", category: "Membres", default_value: false, sort_order: 2, is_active: true },
  { key: "timeout_members", label: "Exclure temporairement (timeout)", category: "Membres", default_value: false, sort_order: 3, is_active: true },

  // Messages
  { key: "send_messages", label: "Envoyer des messages", category: "Messages", default_value: true, sort_order: 0, is_active: true },
  { key: "attach_files", label: "Joindre des fichiers", category: "Messages", default_value: true, sort_order: 1, is_active: true },
  { key: "embed_links", label: "Intégrer des liens", category: "Messages", default_value: true, sort_order: 2, is_active: true },
  { key: "add_reactions", label: "Ajouter des réactions", category: "Messages", default_value: true, sort_order: 3, is_active: true },
  { key: "use_emojis", label: "Utiliser des émojis", category: "Messages", default_value: true, sort_order: 4, is_active: true },
  { key: "use_stickers", label: "Utiliser des stickers", category: "Messages", default_value: true, sort_order: 5, is_active: true },
  { key: "use_gifs", label: "Utiliser des GIFs", category: "Messages", default_value: true, sort_order: 6, is_active: true },
  { key: "use_external_emoji", label: "Utiliser des émojis externes", category: "Messages", default_value: true, sort_order: 7, is_active: true },
  { key: "use_external_stickers", label: "Utiliser des autocollants externes", category: "Messages", default_value: true, sort_order: 8, is_active: true },
  { key: "mention_everyone", label: "Mentionner @everyone, @here et tous les rôles", category: "Messages", default_value: true, sort_order: 9, is_active: true },
  { key: "manage_messages", label: "Gérer les messages", category: "Messages", default_value: false, sort_order: 10, is_active: true },
  { key: "ignore_slowmode", label: "Ignorer le mode lent", category: "Messages", default_value: false, sort_order: 11, is_active: true },
  { key: "read_history", label: "Voir les anciens messages", category: "Messages", default_value: true, sort_order: 12, is_active: true },
  { key: "send_tts", label: "Envoyer des messages de synthèse vocale", category: "Messages", default_value: false, sort_order: 13, is_active: true },
  { key: "send_voice", label: "Envoyer des messages vocaux", category: "Messages", default_value: true, sort_order: 14, is_active: true },
  { key: "create_polls", label: "Créer des sondages", category: "Messages", default_value: true, sort_order: 15, is_active: true },

  // Vocal
  { key: "voice_connect", label: "Se connecter aux salons vocaux", category: "Vocal", default_value: true, sort_order: 0, is_active: true },
  { key: "voice_speak", label: "Parler dans les salons vocaux", category: "Vocal", default_value: true, sort_order: 1, is_active: true },
  { key: "voice_video", label: "Partager la vidéo", category: "Vocal", default_value: false, sort_order: 2, is_active: true },
  { key: "voice_soundboard", label: "Utiliser la Soundboard", category: "Vocal", default_value: true, sort_order: 3, is_active: true },
  { key: "voice_external_sounds", label: "Utiliser des sons externes", category: "Vocal", default_value: true, sort_order: 4, is_active: true },
  { key: "voice_activity", label: "Utiliser la détection de la voix", category: "Vocal", default_value: true, sort_order: 5, is_active: true },
  { key: "voice_priority", label: "Voix prioritaire", category: "Vocal", default_value: false, sort_order: 6, is_active: true },
  { key: "voice_mute_members", label: "Rendre les membres muets", category: "Vocal", default_value: false, sort_order: 7, is_active: true },
  { key: "voice_deafen_members", label: "Mettre en sourdine des membres", category: "Vocal", default_value: false, sort_order: 8, is_active: true },
  { key: "voice_move_members", label: "Déplacer des membres", category: "Vocal", default_value: false, sort_order: 9, is_active: true },
  { key: "voice_set_status", label: "Définir un statut pour le salon vocal", category: "Vocal", default_value: false, sort_order: 10, is_active: true },

  // Événements
  { key: "create_events", label: "Créer des événements", category: "Événements", default_value: true, sort_order: 0, is_active: true },
  { key: "manage_events", label: "Gérer les événements", category: "Événements", default_value: false, sort_order: 1, is_active: true },
];

export const SEED_AUTOMATION_RULES = [
  { key: "welcome_message", name: "Message de bienvenue", description: "Envoie automatiquement un message de bienvenue lorsqu'un membre rejoint le serveur", trigger_type: "member_join", action_type: "send_message", config: { message: "Bienvenue {user} sur le serveur ! 🎉", buttons: [{ id: "coucou", label: "Coucou", emoji: "👋" }] }, is_active: true, sort_order: 0 },
  { key: "auto_role_on_join", name: "Rôle automatique à l'arrivée", description: "Attribue automatiquement le rôle Membre aux nouveaux arrivants", trigger_type: "member_join", action_type: "assign_role", config: { role: "member" }, is_active: true, sort_order: 1 },
  { key: "goodbye_message", name: "Message d'adieu", description: "Notifie le salon système lorsqu'un membre quitte le serveur", trigger_type: "member_leave", action_type: "send_message", config: { message: "{user} a quitté le serveur." }, is_active: false, sort_order: 2 },
  { key: "boost_thanks", name: "Remerciement de boost", description: "Remercie automatiquement un membre qui boost le serveur", trigger_type: "boost_received", action_type: "send_message", config: { message: "Merci {user} pour le boost ! 🚀" }, is_active: true, sort_order: 3 },
  { key: "welcome_coucou_button", name: "Bouton Coucou interactif", description: "Ajoute un bouton interactif 'Coucou 👋' sous le message de bienvenue", trigger_type: "member_join", action_type: "send_message", config: { buttons: [{ id: "coucou", label: "Coucou", emoji: "👋" }] }, is_active: true, sort_order: 4 },
];

export const SEED_PROFILE_BLOCKS = [
  { key: "stats", name: "Statistiques", description: "Niveau, XP et trophées du joueur", block_type: "stats", is_visible: true, sort_order: 0 },
  { key: "badges", name: "Badges", description: "Badges et cosmétiques équipés", block_type: "badges", is_visible: true, sort_order: 1 },
  { key: "activity", name: "Activité", description: "Statut et activité en cours (jeu, streaming)", block_type: "activity", is_visible: true, sort_order: 2 },
  { key: "roles", name: "Rôles", description: "Rôles serveur et personnalisés", block_type: "roles", is_visible: true, sort_order: 3 },
  { key: "custom_status", name: "Statut personnalisé", description: "Statut personnalisé défini par l'utilisateur", block_type: "custom_status", is_visible: true, sort_order: 4 },
  { key: "dm_input", name: "Champ de message privé", description: "Permet d'envoyer un MP depuis le pop-up", block_type: "dm_input", is_visible: true, sort_order: 5 },
  { key: "trophies", name: "Trophées", description: "Trophées de progression débloqués", block_type: "trophies", is_visible: true, sort_order: 6 },
  { key: "friend_status", name: "Statut d'ami", description: "Indique si l'utilisateur est ami, en attente ou bloqué", block_type: "friend_status", is_visible: true, sort_order: 7 },
  { key: "report_button", name: "Bouton de signalement", description: "Permet de signaler l'utilisateur depuis son profil", block_type: "report_button", is_visible: true, sort_order: 8 },
];

export const SEED_GLOBAL_EXTENSIONS = [
  { key: "voice_messaging", name: "Messages vocaux", description: "Enregistrement et envoi de messages vocaux dans les salons texte", category: "Communication", is_active: true, sort_order: 0, config: {} },
  { key: "image_sharing", name: "Partage d'images", description: "Envoi d'images compressées en base64 dans le chat", category: "Communication", is_active: true, sort_order: 1, config: {} },
  { key: "interactive_buttons", name: "Boutons interactifs", description: "Boutons cliquables sous les messages de bienvenue et annonces", category: "Engagement", is_active: true, sort_order: 2, config: {} },
  { key: "message_effects", name: "Effets de message", description: "Effets visuels animés (glow, rainbow, fire, sparkle) sur les messages", category: "Engagement", is_active: true, sort_order: 3, config: {} },
  { key: "custom_emojis", name: "Emojis personnalisés", description: "Emojis serveur personnalisés (max 10 au Niveau 1, 50 au Niveau 4)", category: "Personnalisation", is_active: true, sort_order: 4, config: {} },
  { key: "custom_themes", name: "Thèmes personnalisés", description: "Thèmes visuels personnalisés par serveur (max 10 au Niveau 3)", category: "Personnalisation", is_active: true, sort_order: 5, config: {} },
  { key: "server_boosts", name: "Boosts de serveur", description: "Système de boosts Flash et Trix avec paliers de récompenses", category: "Monétisation", is_active: true, sort_order: 6, config: {} },
  { key: "welcome_automation", name: "Automatisation de bienvenue", description: "Message de bienvenue automatique avec boutons interactifs", category: "Automatisation", is_active: true, sort_order: 7, config: {} },
  { key: "forum_channels", name: "Salons forum", description: "Discussions thématiques avec fils de discussion épinglables", category: "Communication", is_active: true, sort_order: 8, config: {} },
  { key: "voice_rooms", name: "Salons vocaux temps réel", description: "Salons vocaux WebRTC avec détection de parole et partage d'écran", category: "Communication", is_active: true, sort_order: 9, config: {} },
];