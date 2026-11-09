import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { GITHUB_REPO, fetchAllReleases, compareSemver, findInstallerAsset } from '../../shared/githubReleases.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    // Fetch all releases with pagination (same logic as admin githubReleases).
    // If the configured token is rejected, retry anonymously (public repo).
    let all: any[];
    try {
      all = await fetchAllReleases(token);
    } catch (error) {
      all = await fetchAllReleases(undefined);
    }

    // Sort by semver descending (newest first)
    const sorted = all.sort((a, b) => compareSemver(b.tag_name || '', a.tag_name || ''));

    // Published, non-prerelease, non-draft releases only
    const published = sorted.filter((r) => !r.prerelease && !r.draft);

    // Windows installer of a given release (exe first, then msi)
    const findWindowsAsset = (release: any) => {
      const assets = release?.assets || [];
      return (
        assets.find((a: any) => /-setup\.exe$/i.test(a.name || '')) ||
        assets.find((a: any) => /\.exe$/i.test(a.name || '')) ||
        assets.find((a: any) => /\.msi$/i.test(a.name || '')) ||
        null
      );
    };

    // Newest release that actually ships a Windows installer — the download
    // button must always lead straight to an executable, never to GitHub.
    const releaseWithInstaller = published.find((r) => findWindowsAsset(r));
    const latestRelease = releaseWithInstaller || published[0] || sorted[0] || null;

    if (!latestRelease) {
      return Response.json({ version: null, download_url: null, release_page: `https://github.com/${GITHUB_REPO}/releases` });
    }

    const tag = latestRelease.tag_name?.replace(/^v/i, '') || '';
    const windowsAsset = findWindowsAsset(latestRelease);
    const asset = windowsAsset || findInstallerAsset(latestRelease.assets || []);

    return Response.json({
      version: tag,
      download_url: asset?.browser_download_url || null,
      installer_available: !!windowsAsset,
      release_page: latestRelease.html_url || `https://github.com/${GITHUB_REPO}/releases`,
      published_at: latestRelease.published_at || null,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}