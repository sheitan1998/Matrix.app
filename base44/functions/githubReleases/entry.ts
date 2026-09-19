import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const GITHUB_REPO = 'sheitan1998/Matrix';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=100`;

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    // GitHub API allows 60 req/h without authentication — sufficient for a manually-refreshed admin dashboard.
    // If GITHUB_TOKEN is set as an env var, use it for higher rate limits.
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const resp = await fetch(GITHUB_API, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Matrix-Admin-Dashboard',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return Response.json({ error: `GitHub API error: ${resp.status}`, details: text }, { status: 502 });
    }

    const releases = await resp.json() as any[];

    const versionData = releases.map((release) => {
      const assets = (release.assets || []).map((asset: any) => ({
        name: asset.name,
        download_count: asset.download_count,
        size: asset.size,
        download_url: asset.browser_download_url,
      }));
      const versionTotal = assets.reduce((sum: number, a: any) => sum + (a.download_count || 0), 0);
      return {
        tag: release.tag_name,
        name: release.name || release.tag_name,
        published_at: release.published_at,
        prerelease: release.prerelease,
        draft: release.draft,
        download_count: versionTotal,
        assets,
      };
    });

    const totalDownloads = versionData.reduce((sum, v) => sum + v.download_count, 0);
    const latestRelease = versionData.find((v) => !v.prerelease && !v.draft) || versionData[0] || null;

    return Response.json({
      repo: GITHUB_REPO,
      total_downloads: totalDownloads,
      release_count: versionData.length,
      latest_version: latestRelease?.tag || null,
      latest_published_at: latestRelease?.published_at || null,
      versions: versionData,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}