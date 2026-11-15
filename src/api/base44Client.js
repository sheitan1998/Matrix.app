import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { RUNTIME_APP_ORIGIN } from '@/lib/canonicalOrigin';

const { appId, token, functionsVersion } = appParams;

// Same-origin: l'API doit être appelée sur l'origine qui sert l'application
// (preview, domaine publié ou domaine personnalisé), jamais sur un domaine
// externe qui ne route pas /api.
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: RUNTIME_APP_ORIGIN,
  requiresAuth: false,
  appBaseUrl: RUNTIME_APP_ORIGIN
});