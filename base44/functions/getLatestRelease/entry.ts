import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { GITHUB_REPO, fetchAllReleases, compareSemver, findInstallerAsset } from '../../shared/githubReleases.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    // Fetch all releases with pagination (same logic as admin githubReleases)
    const all = await fetchAllReleases(token);

    // Sort by semver descending (newest first)
    const sorted = all.sort((a, b) => compareSemver(b.tag_name || '', a.tag_name || ''));

    // Find the latest published, non-prerelease, non-draft release
    const latestRelease = sorted.find((r) => !r.prerelease && !r.draft) || sorted.find((r) => !r.draft) || sorted[0] || null;

    if (!latestRelease) {
      return Response.json({ version: null, download_url: null, release_page: `https://github.com/${GITHUB_REPO}/releases` });
    }

    const tag = latestRelease.tag_name?.replace(/^v/i, '') || '';
    const asset = findInstallerAsset(latestRelease.assets || []);

    return Response.json({
      version: tag,
      download_url: asset?.browser_download_url || latestRelease.html_url || null,
      release_page: latestRelease.html_url || `https://github.com/${GITHUB_REPO}/releases`,
      published_at: latestRelease.published_at || null,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}