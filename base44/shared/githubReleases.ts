// Shared GitHub releases utilities used by both githubReleases and getLatestRelease functions

export const GITHUB_REPO = 'sheitan1998/Matrix.app';
export const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO}`;

export const GITHUB_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'Matrix-App',
};

export function authHeaders(token?: string): Record<string, string> {
  return token ? { ...GITHUB_HEADERS, Authorization: `Bearer ${token}` } : GITHUB_HEADERS;
}

/** Compares semantic versions (v1.0.4 > v0.1.0). Returns -1, 0, or 1. */
export function compareSemver(a: string, b: string): number {
  const normalize = (v: string) => v.replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);
  const pa = normalize(a);
  const pb = normalize(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

/** Fetches ALL releases with full pagination (follows Link headers). */
export async function fetchAllReleases(token?: string): Promise<any[]> {
  const all: any[] = [];
  let url: string | null = `${GITHUB_API_BASE}/releases?per_page=100&page=1`;

  while (url) {
    const resp = await fetch(url, { headers: authHeaders(token) });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`GitHub releases API error ${resp.status}: ${text}`);
    }

    const batch = await resp.json() as any[];
    if (!Array.isArray(batch) || batch.length === 0) break;

    all.push(...batch);

    const linkHeader = resp.headers.get('link') || '';
    const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    url = nextMatch ? nextMatch[1] : null;
  }

  return all;
}

/** Fetches ALL git tags (follows Link headers). */
export async function fetchAllTags(token?: string): Promise<any[]> {
  const all: any[] = [];
  let url: string | null = `${GITHUB_API_BASE}/tags?per_page=100&page=1`;

  while (url) {
    const resp = await fetch(url, { headers: authHeaders(token) });
    if (!resp.ok) break;

    const batch = await resp.json() as any[];
    if (!Array.isArray(batch) || batch.length === 0) break;

    all.push(...batch);

    const linkHeader = resp.headers.get('link') || '';
    const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    url = nextMatch ? nextMatch[1] : null;
  }

  return all;
}

/** Finds the best installer asset from a release's assets list. */
export function findInstallerAsset(assets: any[]): any | null {
  if (!Array.isArray(assets) || assets.length === 0) return null;
  return (
    assets.find((a) => a.name?.endsWith('-setup.exe')) ||
    assets.find((a) => a.name?.endsWith('.msi')) ||
    assets.find((a) => a.name?.endsWith('.exe')) ||
    assets[0]
  );
}