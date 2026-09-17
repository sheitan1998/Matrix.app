import { secrets } from 'base44:runtime';

type ProviderConfig = {
  authorizationUrl: string;
  tokenUrl: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  redirectUriEnv?: string;
  scopes: string[];
  authorizationParams?: Record<string, string>;
};

const DESKTOP_OAUTH_BRIDGE_ORIGINS = new Set([
  'http://127.0.0.1:48923',
  'http://localhost:48923',
]);
const DESKTOP_OAUTH_CALLBACK_PATH = '/oauth/callback';
const DESKTOP_OAUTH_DEEP_LINK_PROTOCOL = 'matrix:';
const DESKTOP_OAUTH_DEEP_LINK_HOST = 'oauth';
const DESKTOP_OAUTH_DEEP_LINK_PATH = '/callback';

const PROVIDERS: Record<string, ProviderConfig> = {
  google: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    redirectUriEnv: 'GOOGLE_REDIRECT_URI',
    scopes: ['openid', 'email', 'profile'],
    authorizationParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
  microsoft: {
    authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    clientIdEnv: 'MICROSOFT_CLIENT_ID',
    clientSecretEnv: 'MICROSOFT_CLIENT_SECRET',
    redirectUriEnv: 'MICROSOFT_REDIRECT_URI',
    scopes: ['openid', 'profile', 'email', 'offline_access', 'User.Read'],
    authorizationParams: {
      prompt: 'select_account',
    },
  },
  facebook: {
    authorizationUrl: 'https://www.facebook.com/v23.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v23.0/oauth/access_token',
    clientIdEnv: 'FACEBOOK_CLIENT_ID',
    clientSecretEnv: 'FACEBOOK_CLIENT_SECRET',
    redirectUriEnv: 'FACEBOOK_REDIRECT_URI',
    scopes: ['email', 'public_profile'],
  },
  apple: {
    authorizationUrl: 'https://appleid.apple.com/auth/authorize',
    tokenUrl: 'https://appleid.apple.com/auth/token',
    clientIdEnv: 'APPLE_CLIENT_ID',
    clientSecretEnv: 'APPLE_CLIENT_SECRET',
    redirectUriEnv: 'APPLE_REDIRECT_URI',
    scopes: ['name', 'email'],
    authorizationParams: {
      response_mode: 'query',
    },
  },
  twitch: {
    authorizationUrl: 'https://id.twitch.tv/oauth2/authorize',
    tokenUrl: 'https://id.twitch.tv/oauth2/token',
    clientIdEnv: 'TWITCH_CLIENT_ID',
    clientSecretEnv: 'TWITCH_CLIENT_SECRET',
    redirectUriEnv: 'TWITCH_REDIRECT_URI',
    scopes: ['user:read:email', 'user:read:follows'],
  },
};

class HttpError extends Error {
  status: number;
  details?: Record<string, unknown>;

  constructor(status: number, message: string, details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function trimToEmpty(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getServerSecret(name: string): string {
  return trimToEmpty(secrets.get(name) || process.env[name]);
}

function requireServerSecret(name: string, minLength = 1): string {
  const value = getServerSecret(name);

  if (!value) {
    throw new HttpError(
      500,
      `${name} is not configured. Add it in Dashboard → Settings → Environment Variables.`
    );
  }

  if (value.length < minLength) {
    throw new HttpError(
      500,
      `${name} is invalid or appears truncated. Update it in Dashboard → Settings → Environment Variables.`
    );
  }

  return value;
}

function requireNonEmptyString(fieldName: string, value: unknown, maxLength = 4096): string {
  const normalized = trimToEmpty(value);

  if (!normalized) {
    throw new HttpError(400, `Missing required field: ${fieldName}.`);
  }

  if (normalized.length > maxLength) {
    throw new HttpError(400, `Invalid field: ${fieldName} is too long.`);
  }

  return normalized;
}

function normalizeProvider(value: unknown): string {
  const provider = requireNonEmptyString('provider', value, 100).toLowerCase();
  if (!PROVIDERS[provider]) {
    throw new HttpError(400, `Unsupported OAuth provider: ${provider}.`);
  }
  return provider;
}

function normalizeRedirectUri(value: unknown): string {
  const redirectUri = requireNonEmptyString('redirectUri', value, 2048);

  let parsed: URL;
  try {
    parsed = new URL(redirectUri);
  } catch {
    throw new HttpError(400, 'Invalid redirectUri: absolute URL expected.');
  }

  const isHttpRedirect = ['http:', 'https:'].includes(parsed.protocol);
  const isDesktopDeepLink =
    parsed.protocol === DESKTOP_OAUTH_DEEP_LINK_PROTOCOL &&
    parsed.hostname === DESKTOP_OAUTH_DEEP_LINK_HOST &&
    parsed.pathname === DESKTOP_OAUTH_DEEP_LINK_PATH;

  if (!isHttpRedirect && !isDesktopDeepLink) {
    throw new HttpError(
      400,
      'Invalid redirectUri: only http, https, or the trusted desktop callback are supported.'
    );
  }

  return parsed.toString();
}

function isTrustedDesktopRedirectUri(redirectUri: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(redirectUri);
  } catch {
    return false;
  }

  if (
    ['http:', 'https:'].includes(parsed.protocol) &&
    DESKTOP_OAUTH_BRIDGE_ORIGINS.has(parsed.origin) &&
    parsed.pathname === DESKTOP_OAUTH_CALLBACK_PATH
  ) {
    return true;
  }

  return (
    parsed.protocol === DESKTOP_OAUTH_DEEP_LINK_PROTOCOL &&
    parsed.hostname === DESKTOP_OAUTH_DEEP_LINK_HOST &&
    parsed.pathname === DESKTOP_OAUTH_DEEP_LINK_PATH
  );
}

function normalizeCodeVerifier(value: unknown): string {
  const codeVerifier = requireNonEmptyString('codeVerifier', value, 256);

  if (codeVerifier.length < 43 || codeVerifier.length > 128) {
    throw new HttpError(400, 'Invalid codeVerifier: PKCE verifier length must be between 43 and 128 characters.');
  }

  return codeVerifier;
}

function resolveProviderConfig(provider: string) {
  const providerConfig = PROVIDERS[provider];
  const clientId = requireServerSecret(providerConfig.clientIdEnv, 4);
  const clientSecret = requireServerSecret(providerConfig.clientSecretEnv, 8);
  const configuredRedirectUri = providerConfig.redirectUriEnv
    ? normalizeRedirectUri(requireServerSecret(providerConfig.redirectUriEnv, 8))
    : '';

  return {
    ...providerConfig,
    clientId,
    clientSecret,
    configuredRedirectUri,
  };
}

function resolveRedirectUri(
  providerConfig: ReturnType<typeof resolveProviderConfig>,
  requestedRedirectUri: string
): string {
  const configuredRedirectUri = providerConfig.configuredRedirectUri;

  if (!configuredRedirectUri) {
    return requestedRedirectUri;
  }

  if (configuredRedirectUri !== requestedRedirectUri && !isTrustedDesktopRedirectUri(requestedRedirectUri)) {
    throw new HttpError(
      400,
      'OAuth redirect URI mismatch. Check the provider configuration and the app callback URL.'
    );
  }

  // For trusted desktop redirect URIs (localhost bridge or deep link),
  // use the requested URI — the token exchange must match the authorization request.
  if (isTrustedDesktopRedirectUri(requestedRedirectUri)) {
    return requestedRedirectUri;
  }

  return configuredRedirectUri;
}

async function readJsonBody(req: Request) {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, 'Invalid JSON payload.');
  }
}

function buildProviderError(
  provider: string,
  providerStatus: number,
  providerBody: Record<string, any>
) {
  const providerMessage =
    trimToEmpty(providerBody.error_description) ||
    trimToEmpty(providerBody.message) ||
    trimToEmpty(providerBody.error?.message) ||
    trimToEmpty(providerBody.error) ||
    `OAuth provider returned HTTP ${providerStatus}.`;

  console.error('[oauthExchange] provider token exchange failed', {
    provider,
    providerStatus,
    providerError: trimToEmpty(providerBody.error) || null,
    providerMessage,
  });

  return Response.json(
    {
      error: 'OAuth token exchange failed.',
      provider,
      provider_status: providerStatus,
      provider_error: trimToEmpty(providerBody.error) || null,
      provider_message: providerMessage,
    },
    { status: providerStatus >= 500 ? 502 : providerStatus }
  );
}

export default async function(req: Request): Promise<Response> {
  try {
    const body = await readJsonBody(req);
    const action = trimToEmpty(body?.action) || 'exchangeCode';
    const provider = normalizeProvider(body?.provider);
    const providerConfig = resolveProviderConfig(provider);

    if (action === 'getOAuthConfig') {
      return Response.json({
        data: {
          provider,
          client_id: providerConfig.clientId,
          authorization_url: providerConfig.authorizationUrl,
          redirect_uri: providerConfig.configuredRedirectUri || null,
          scopes: providerConfig.scopes,
          authorization_params: providerConfig.authorizationParams || {},
        },
        _source: 'oauth',
      });
    }

    if (action !== 'exchangeCode') {
      throw new HttpError(400, `Unknown action: ${action}.`);
    }

    const code = requireNonEmptyString('code', body?.code);
    const codeVerifier = normalizeCodeVerifier(body?.codeVerifier);
    const requestedRedirectUri = normalizeRedirectUri(body?.redirectUri);
    const redirectUri = resolveRedirectUri(providerConfig, requestedRedirectUri);

    const tokenRequestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: providerConfig.clientId,
      client_secret: providerConfig.clientSecret,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    const providerResponse = await fetch(providerConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: tokenRequestBody.toString(),
    });

    const rawProviderBody = await providerResponse.text();
    let providerBody: Record<string, any> = {};

    if (rawProviderBody) {
      try {
        providerBody = JSON.parse(rawProviderBody);
      } catch {
        providerBody = { message: rawProviderBody };
      }
    }

    if (!providerResponse.ok) {
      return buildProviderError(provider, providerResponse.status, providerBody);
    }

    return Response.json({
      data: {
        provider,
        redirect_uri: redirectUri,
        access_token: providerBody.access_token || null,
        refresh_token: providerBody.refresh_token || null,
        id_token: providerBody.id_token || null,
        token_type: providerBody.token_type || null,
        scope: providerBody.scope || null,
        expires_in: providerBody.expires_in ?? null,
      },
      _source: 'oauth',
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(
        { error: error.message, ...(error.details || {}) },
        { status: error.status }
      );
    }

    console.error('[oauthExchange] unexpected error', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    return Response.json(
      { error: error instanceof Error ? error.message : 'Unexpected OAuth exchange error.' },
      { status: 500 }
    );
  }
}