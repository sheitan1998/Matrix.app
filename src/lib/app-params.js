const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map(), location: { href: '', search: '', pathname: '/', hash: '' } } : window;
const storage = windowObj.localStorage;
const DEFAULT_APP_BASE_URL = 'https://matrix-hub.app';

const ABSOLUTE_URL_PROTOCOL = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

const isAbsoluteUrl = (value) => ABSOLUTE_URL_PROTOCOL.test(value);

const normalizeBaseUrl = (value) => {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed || !isAbsoluteUrl(trimmed)) return '';
  try {
    return new URL(trimmed).origin;
  } catch {
    return '';
  }
};

const isNativeWebviewHost = (host) =>
  host === 'tauri.localhost' || host.endsWith('.tauri.localhost');

/**
 * Detects Tauri production webview across all platforms:
 * - macOS: protocol is "tauri:" and hostname is "localhost"
 * - Windows/Linux: hostname is "tauri.localhost"
 */
const isTauriWebview = () => {
  if (typeof window === 'undefined') return false;
  if (window.location.protocol === 'tauri:') return true;
  const host = window.location.hostname;
  return isNativeWebviewHost(host);
};

/**
 * In Tauri production, the webview origin (tauri://localhost or http://tauri.localhost)
 * is not a valid redirect target for OAuth or post-login returnTo. Use the published
 * web app URL as the base for all auth redirect flows.
 */
export function resolveFromUrl(appBaseUrl = DEFAULT_APP_BASE_URL) {
  if (isNode) return '';
  if (isTauriWebview()) {
    return normalizeBaseUrl(appBaseUrl) || DEFAULT_APP_BASE_URL;
  }
  return window.location.href;
}

export function resolveBase44ServerUrl(appBaseUrl = DEFAULT_APP_BASE_URL) {
  if (typeof window === 'undefined') return '';
  if (isTauriWebview()) {
    return normalizeBaseUrl(appBaseUrl) || DEFAULT_APP_BASE_URL;
  }
  return '';
}

export function resolveAssetUrl(assetUrl, appBaseUrl = DEFAULT_APP_BASE_URL) {
  if (!assetUrl || typeof assetUrl !== 'string') return assetUrl;
  const trimmed = assetUrl.trim();
  if (!trimmed) return trimmed;
  if (isAbsoluteUrl(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  // Local paths (e.g. /media/...) are bundled in the frontend dist and must
  // resolve locally in both web and Tauri — never rewrite them to a remote URL.
  if (trimmed.startsWith('/media/')) {
    return trimmed;
  }
  // All other relative paths (e.g. /uploads/...) must resolve to the production server
  const base = normalizeBaseUrl(appBaseUrl) || DEFAULT_APP_BASE_URL;
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${normalizedPath}`;
}

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	const appBaseUrlValue = getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL });
	const appBaseUrl = normalizeBaseUrl(appBaseUrlValue) || DEFAULT_APP_BASE_URL;
	return {
		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: resolveFromUrl(appBaseUrl) }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
		appBaseUrl,
	}
}


export const appParams = {
	...getAppParams()
}