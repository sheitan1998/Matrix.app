import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const PRODUCTION_SERVER_URL = 'https://matrix-hub.app';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: PRODUCTION_SERVER_URL,
  requiresAuth: false,
  appBaseUrl: PRODUCTION_SERVER_URL
});