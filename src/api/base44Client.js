import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

/**
 * In Tauri production, the webview serves static files from an internal origin
 * (tauri://localhost or http://tauri.localhost) with no backend to proxy /api routes.
 * We must point the SDK to the absolute Base44 server URL so auth, entities, and
 * integrations resolve correctly. On localhost (Vite dev proxy) and on the Base44
 * web platform (backend serves /api), relative URLs work and we keep serverUrl empty.
 */
function resolveServerUrl() {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.base44.app')) return '';
  return 'https://matrix-hub.base44.app';
}

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: resolveServerUrl(),
  requiresAuth: false,
  appBaseUrl
});