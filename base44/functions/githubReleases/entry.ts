import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const GITHUB_REPO = 'sheitan1998/Matrix.app';
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO}`;

const GITHUB_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'Matrix-Admin-Dashboard',
};

function authHeaders(token?: string) {
  return token ? { ...GITHUB_HEADERS, Authorization: `Bearer ${token}` } : GITHUB_HEADERS;
}

/** Fetches ALL releases with full pagination (follows Link headers). */
async function fetchAllReleases(token?: string): Promise<any[]> {
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

    // Follow Link header for pagination: <https://api.github.com/.../releases?per_page=100&page=2>; rel="next"
    const linkHeader = resp.headers.get('link') || '';
    const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    url = nextMatch ? nextMatch[1] : null;
  }

  return all;
}

/** Fetches ALL git tags (follows Link headers). */
async function fetchAllTags(token?: string): Promise<any[]> {
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

/** Compares semantic versions (v1.0.4 > v0.1.0). Returns -1, 0, or 1. */
function compareSemver(a: string, b: string): number {
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

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    // Fetch all releases AND all tags in parallel
    const [releases, tags] = await Promise.all([
      fetchAllReleases(token),
      fetchAllTags(token).catch(() => [] as any[]),
    ]);

    // Build version map from releases (published + drafts if token present)
    const versionMap = new Map<string, any>();

    for (const release of releases) {
      const assets = (release.assets || []).map((asset: any) => ({
        name: asset.name,
        download_count: asset.download_count || 0,
        size: asset.size,
        download_url: asset.browser_download_url,
      }));
      const versionTotal = assets.reduce((sum: number, a: any) => sum + (a.download_count || 0), 0);

      versionMap.set(release.tag_name, {
        tag: release.tag_name,
        name: release.name || release.tag_name,
        published_at: release.published_at,
        prerelease: release.prerelease,
        draft: release.draft,
        download_count: versionTotal,
        assets,
        has_release: true,
      });
    }

    // Merge tags that don't have an associated release (show as 0-download versions)
    for (const tag of tags) {
      if (!versionMap.has(tag.name)) {
        versionMap.set(tag.name, {
          tag: tag.name,
          name: tag.name,
          published_at: null,
          prerelease: false,
          draft: false,
          download_count: 0,
          assets: [],
          has_release: false,
        });
      }
    }

    // Sort by semver descending (newest first)
    const versionData = Array.from(versionMap.values()).sort((a, b) => compareSemver(b.tag, a.tag));

    const totalDownloads = versionData.reduce((sum, v) => sum + v.download_count, 0);
    const latestRelease = versionData.find((v) => v.has_release && !v.prerelease && !v.draft) || versionData.find((v) => v.has_release) || versionData[0] || null;

    return Response.json({
      repo: GITHUB_REPO,
      total_downloads: totalDownloads,
      release_count: versionData.filter(v => v.has_release).length,
      tag_count: versionData.length,
      latest_version: latestRelease?.tag || null,
      latest_published_at: latestRelease?.published_at || null,
      versions: versionData,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}