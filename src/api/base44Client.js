import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { CANONICAL_APP_ORIGIN } from '@/lib/canonicalOrigin';

const { appId, token, functionsVersion } = appParams;

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: CANONICAL_APP_ORIGIN,
  requiresAuth: false,
  appBaseUrl: CANONICAL_APP_ORIGIN
});