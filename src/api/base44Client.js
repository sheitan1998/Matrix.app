import { createClient } from '@base44/sdk';
import { appParams, resolveBase44ServerUrl } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: resolveBase44ServerUrl(appBaseUrl),
  requiresAuth: false,
  appBaseUrl
});