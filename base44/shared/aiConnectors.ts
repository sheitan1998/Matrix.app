// Connecteurs Matrix AI : catalogue par catégories et Webhooks utilisateur.
// Module pur partagé entre le serveur (aiConnectors, matrixAi) et l'interface : aucun secret ici.
import { WebFetchError, assertSafeUrl, defaultResolver, type DnsResolver } from './aiWeb.ts';

export const MAX_WEBHOOKS_PER_USER = 5;
export const MAX_WEBHOOK_NAME_LENGTH = 40;
export const MAX_WEBHOOK_URL_LENGTH = 500;
export const MAX_WEBHOOKS_PER_MESSAGE = 2;
export const WEBHOOK_TIMEOUT_MS = 8000;
export const WEBHOOK_TEST_COOLDOWN_MS = 5000;

export type CatalogStatus = 'available' | 'soon';

export interface CatalogItem {
  id: string;
  name: string;
  action: string;
  status: CatalogStatus;
}

export interface CatalogCategory {
  id: string;
  label: string;
  items: CatalogItem[];
}

// Seul « webhook » est fonctionnel ; les autres services sont affichés « Bientôt disponible » sans fausse connexion.
export const CONNECTOR_CATALOG: CatalogCategory[] = [
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

// ---------- Validation ----------

export type WebhookErrorCode = 'invalid_name' | 'invalid_url' | 'blocked' | 'network';

export class WebhookError extends Error {
  code: WebhookErrorCode;
  constructor(code: WebhookErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export function normalizeWebhookName(raw: unknown): string {
  const name = String(raw ?? '').replace(/\s+/g, ' ').trim();
  if (!name) throw new WebhookError('invalid_name', 'Donne un nom à ton webhook.');
  if (name.length > MAX_WEBHOOK_NAME_LENGTH) {
    throw new WebhookError('invalid_name', `Le nom est limité à ${MAX_WEBHOOK_NAME_LENGTH} caractères.`);
  }
  return name;
}

/** URL https publique uniquement : refuse localhost, IP privées, identifiants et ports non standards (anti-SSRF). */
export async function validateWebhookUrl(raw: unknown, resolver: DnsResolver = defaultResolver): Promise<string> {
  const value = String(raw ?? '').trim();
  if (!value || value.length > MAX_WEBHOOK_URL_LENGTH) {
    throw new WebhookError('invalid_url', "L'URL du webhook est invalide.");
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new WebhookError('invalid_url', "L'URL du webhook est invalide.");
  }
  if (parsed.protocol !== 'https:') {
    throw new WebhookError('invalid_url', "L'URL du webhook doit commencer par https://.");
  }
  try {
    const safe = await assertSafeUrl(parsed.toString(), resolver);
    safe.hash = '';
    return safe.toString();
  } catch (error) {
    if (error instanceof WebFetchError) {
      if (error.code === 'network') {
        throw new WebhookError('network', "Nom de domaine introuvable pour ce webhook.");
      }
      throw new WebhookError('blocked', 'Cette adresse est refusée : seules les URL https publiques (port 443) sont autorisées.');
    }
    throw error;
  }
}

/** Affichage sans secret : l'URL complète d'un webhook contient souvent un jeton. */
export function maskWebhookUrl(url: string): string {
  try {
    return `${new URL(url).hostname}/…`;
  } catch {
    return '…';
  }
}

// ---------- Envoi ----------

export interface WebhookSendContext {
  pseudo?: string;
  kind: 'message' | 'test';
}

export interface WebhookResult {
  ok: boolean;
  status?: number;
  error?: string;
}

export type WebhookFlavor = 'discord' | 'slack' | 'generic';

export function detectWebhookFlavor(url: string): WebhookFlavor {
  try {
    const { hostname, pathname } = new URL(url);
    const host = hostname.toLowerCase();
    if (/(^|\.)(discord|discordapp)\.com$/.test(host) && pathname.startsWith('/api/webhooks/')) return 'discord';
    if (host === 'hooks.slack.com') return 'slack';
  } catch {
    // URL invalide : format générique.
  }
  return 'generic';
}

export function buildWebhookPayload(url: string, text: string, context: WebhookSendContext) {
  const flavor = detectWebhookFlavor(url);
  const clean = String(text || '').trim();
  if (flavor === 'discord') {
    return { username: 'Matrix AI', content: clean.slice(0, 1900), allowed_mentions: { parse: [] } };
  }
  if (flavor === 'slack') return { text: clean.slice(0, 3500) };
  const body = clean.slice(0, 4000);
  return {
    source: 'matrix-ai',
    event: context.kind,
    text: body,
    content: body,
    message: body,
    user: context.pseudo || 'membre Matrix',
    sent_at: new Date().toISOString(),
  };
}

export interface SendWebhookOptions {
  fetchImpl?: typeof fetch;
  resolver?: DnsResolver;
  timeoutMs?: number;
}

/** Envoie le message vers le webhook (revalidation SSRF, délai borné, aucune redirection suivie). */
export async function sendWebhook(
  url: string,
  text: string,
  context: WebhookSendContext,
  options: SendWebhookOptions = {},
): Promise<WebhookResult> {
  let safeUrl: string;
  try {
    safeUrl = await validateWebhookUrl(url, options.resolver);
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
  const doFetch = options.fetchImpl || fetch;
  try {
    const response = await doFetch(safeUrl, {
      method: 'POST',
      redirect: 'manual',
      signal: AbortSignal.timeout(options.timeoutMs ?? WEBHOOK_TIMEOUT_MS),
      headers: { 'content-type': 'application/json', 'user-agent': 'MatrixAI-Webhook/1.0 (+https://matrix-hub.app)' },
      body: JSON.stringify(buildWebhookPayload(safeUrl, text, context)),
    });
    await response.body?.cancel().catch(() => undefined);
    if (response.status >= 200 && response.status < 300) return { ok: true, status: response.status };
    if (response.status >= 300 && response.status < 400) {
      return { ok: false, status: response.status, error: 'Le webhook redirige vers une autre adresse (refusé par sécurité).' };
    }
    return { ok: false, status: response.status, error: `Le service a répondu par une erreur HTTP ${response.status}.` };
  } catch (error) {
    const name = (error as { name?: string })?.name;
    if (name === 'TimeoutError' || name === 'AbortError') {
      return { ok: false, error: `Délai dépassé (${Math.round((options.timeoutMs ?? WEBHOOK_TIMEOUT_MS) / 1000)} s) : le service ne répond pas.` };
    }
    return { ok: false, error: 'Service injoignable.' };
  }
}

/** Envoie, puis enregistre le dernier résultat sur le connecteur (sans jamais bloquer sur une erreur d'écriture). */
export async function runWebhookConnector(
  base44,
  connector,
  text: string,
  context: WebhookSendContext,
  options: SendWebhookOptions = {},
): Promise<WebhookResult> {
  const result = await sendWebhook(connector.webhook_url, text, context, options);
  await base44.asServiceRole.entities.AiConnector.update(connector.id, {
    status: result.ok ? 'ok' : 'error',
    last_error: result.ok ? '' : String(result.error || '').slice(0, 200),
    last_triggered_at: new Date().toISOString(),
  }).catch(() => null);
  return result;
}

// ---------- Détection d'intention ----------

/** Garde-fou serveur : un webhook n'est déclenché que si le message de l'utilisateur demande une action sortante. */
export function looksLikeWebhookRequest(text: unknown): boolean {
  return /(webhook|envoie|envoyer|envoi|poste|poster|publie|publier|notifie|notifier|pr[ée]viens|alerte|d[ée]clenche|d[ée]clencher|trigger|send|post |notify|alert|discord|make|zapier|n8n|slack)/i.test(
    String(text || ''),
  );
}

export function describeWebhookOutcome(name: string, result: WebhookResult): string {
  return result.ok
    ? `✅ Webhook « ${name} » : message envoyé avec succès.`
    : `⚠️ Webhook « ${name} » : échec de l'envoi — ${result.error || 'erreur inconnue'}`;
}
