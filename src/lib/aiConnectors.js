// Catalogue des connecteurs Matrix AI côté interface (les limites doivent rester alignées avec base44/shared/aiConnectors.ts).

export const MAX_WEBHOOKS_PER_USER = 5;
export const MAX_WEBHOOK_NAME_LENGTH = 40;

// Seul « webhook » est fonctionnel ; les autres services sont affichés « Bientôt disponible » sans fausse connexion.
export const CONNECTOR_CATALOG = [
  {
    id: 'actions',
    label: 'Actions externes',
    items: [
      { id: 'webhook', name: 'Webhook', action: 'Envoie un message vers Discord, Make, Zapier, n8n ou ton URL.', status: 'available' },
    ],
  },
  {
    id: 'messaging',
    label: 'Messagerie',
    items: [
      { id: 'slack', name: 'Slack', action: 'Publie des messages dans tes canaux.', status: 'soon' },
      { id: 'telegram', name: 'Telegram', action: 'Envoie des alertes à ton bot.', status: 'soon' },
    ],
  },
  {
    id: 'automation',
    label: 'Automatisation',
    items: [
      { id: 'make', name: 'Make', action: 'Déclenche tes scénarios (en attendant, utilise un Webhook).', status: 'soon' },
      { id: 'zapier', name: 'Zapier', action: 'Lance tes Zaps (en attendant, utilise un Webhook).', status: 'soon' },
      { id: 'n8n', name: 'n8n', action: 'Démarre tes workflows (en attendant, utilise un Webhook).', status: 'soon' },
    ],
  },
  {
    id: 'productivity',
    label: 'Productivité',
    items: [
      { id: 'notion', name: 'Notion', action: 'Ajoute des notes à tes pages.', status: 'soon' },
      { id: 'calendar', name: 'Google Agenda', action: 'Crée des événements.', status: 'soon' },
    ],
  },
];
