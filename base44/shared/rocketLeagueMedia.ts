export const MAX_ROCKET_IMAGE_BYTES = 8 * 1024 * 1024;
export const ROCKET_IMAGE_TYPES = /^image\/(avif|jpeg|png|webp)(?:;|$)/i;

export class RocketMediaError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = 'RocketMediaError';
    this.code = code;
    this.status = status;
  }
}

export function parseRocketImageHosts(value: unknown) {
  return new Set(String(value || '')
    .split(',')
    .map(host => host.trim().toLowerCase())
    .filter(host => /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host)));
}

export function validateRocketImageMetadata(type: unknown, declaredSize: unknown) {
  const contentType = String(type || '');
  const size = Number(declaredSize || 0);
  if (!ROCKET_IMAGE_TYPES.test(contentType)) {
    throw new RocketMediaError('invalid_type', 'La source ne renvoie pas une image autorisée.', 415);
  }
  if (!Number.isFinite(size) || size < 0 || size > MAX_ROCKET_IMAGE_BYTES) {
    throw new RocketMediaError('too_large', 'Le visuel dépasse 8 Mio.', 413);
  }
  return { contentType, declaredSize: size };
}

export function validateRocketImageBytes(bytes: ArrayBuffer, type: string) {
  const data = new Uint8Array(bytes);
  const ascii = (start: number, length: number) => String.fromCharCode(...data.slice(start, start + length));
  const valid = type.toLowerCase().startsWith('image/png')
    ? data.length >= 8 && ascii(1, 3) === 'PNG'
    : type.toLowerCase().startsWith('image/jpeg')
      ? data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff
      : type.toLowerCase().startsWith('image/webp')
        ? data.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP'
        : type.toLowerCase().startsWith('image/avif')
          ? data.length >= 12 && ascii(4, 4) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 4))
          : false;
  if (!valid) {
    throw new RocketMediaError('invalid_content', 'Le contenu reçu n’est pas une image valide.', 422);
  }
}

export function isPrivateNetworkAddress(value: string) {
  const address = String(value || '').trim().toLowerCase().split('%')[0];
  const ipv4 = address.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const octets = ipv4.slice(1).map(Number);
    if (octets.some(part => part > 255)) return true;
    const [a, b, c] = octets;
    return a === 0
      || a === 10
      || a === 127
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && (b === 0 || b === 168))
      || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100)))
      || (a === 203 && b === 0 && c === 113)
      || a >= 224;
  }
  if (!address.includes(':')) return false;
  return address === '::'
    || address === '::1'
    || /^(?:0+:){7}1$/.test(address)
    || address.startsWith('fc')
    || address.startsWith('fd')
    || /^fe[89ab]/.test(address)
    || address.startsWith('ff')
    || address.startsWith('2001:db8:')
    || address.startsWith('::ffff:')
    || /^(?:0+:){5}ffff:/.test(address);
}

export function allowedRocketImageUrl(value: unknown, allowedHosts: ReadonlySet<string>) {
  const rawValue = String(value || '');
  if (!rawValue || rawValue.length > 2048) {
    throw new RocketMediaError('invalid_url', 'Adresse de visuel invalide.');
  }
  let url;
  try {
    url = new URL(rawValue);
  } catch {
    throw new RocketMediaError('invalid_url', 'Adresse de visuel invalide.');
  }

  if (
    url.protocol !== 'https:'
    || url.username
    || url.password
    || url.port
    || url.hash
    || !allowedHosts.has(url.hostname.toLowerCase())
    || isPrivateNetworkAddress(url.hostname)
  ) {
    throw new RocketMediaError('forbidden_source', 'Source de visuel non autorisée.', 403);
  }
  return url;
}

export async function readRocketImageBytes(response: Response, maxBytes = MAX_ROCKET_IMAGE_BYTES) {
  if (!response.body) {
    throw new RocketMediaError('empty_response', 'La source du visuel a renvoyé une réponse vide.', 422);
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new RocketMediaError('too_large', 'Le visuel dépasse 8 Mio.', 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes.buffer;
}

async function defaultResolveHost(hostname: string) {
  const deno = (globalThis as any).Deno;
  if (!deno?.resolveDns) {
    throw new RocketMediaError('dns_unavailable', 'Validation DNS indisponible.', 503);
  }
  const results = await Promise.allSettled([
    deno.resolveDns(hostname, 'A'),
    deno.resolveDns(hostname, 'AAAA'),
  ]);
  return results.flatMap(result => result.status === 'fulfilled' ? result.value : []);
}

export async function assertPublicRocketImageHost(
  url: URL,
  resolveHost: (hostname: string) => Promise<string[]> = defaultResolveHost,
) {
  let addresses;
  try {
    addresses = await resolveHost(url.hostname);
  } catch (error) {
    if (error instanceof RocketMediaError) throw error;
    throw new RocketMediaError('dns_failed', 'La source du visuel ne peut pas être résolue.', 502);
  }
  if (!addresses.length || addresses.some(isPrivateNetworkAddress)) {
    throw new RocketMediaError('private_network', 'La source du visuel pointe vers un réseau privé.', 403);
  }
}

export async function fetchRocketImage(
  value: unknown,
  {
    allowedHosts,
    fetchImpl = fetch,
    resolveHost = defaultResolveHost,
    timeoutMs = 8_000,
  }: {
    allowedHosts: ReadonlySet<string>;
    fetchImpl?: typeof fetch;
    resolveHost?: (hostname: string) => Promise<string[]>;
    timeoutMs?: number;
  },
) {
  let target = allowedRocketImageUrl(value, allowedHosts);
  for (let redirects = 0; redirects <= 2; redirects += 1) {
    await assertPublicRocketImageHost(target, resolveHost);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetchImpl(target.href, {
        headers: {
          Accept: 'image/avif,image/webp,image/png,image/jpeg',
          'User-Agent': 'MATRIX-RocketLeague-Media/1.0',
        },
        redirect: 'manual',
        signal: controller.signal,
      });
    } catch (error) {
      throw new RocketMediaError(
        error?.name === 'AbortError' ? 'timeout' : 'network_error',
        error?.name === 'AbortError'
          ? 'La source du visuel ne répond pas.'
          : 'La source du visuel est indisponible.',
        502,
      );
    } finally {
      clearTimeout(timeout);
    }
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get('location');
    await response.body?.cancel();
    if (!location || redirects === 2) {
      throw new RocketMediaError('invalid_redirect', 'Redirection de visuel invalide.', 502);
    }
    target = allowedRocketImageUrl(new URL(location, target).href, allowedHosts);
  }
  throw new RocketMediaError('redirect_limit', 'Trop de redirections de visuel.', 502);
}
