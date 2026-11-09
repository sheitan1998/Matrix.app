import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { GITHUB_REPO, fetchAllReleases, compareSemver } from '../../shared/githubReleases.ts';

type Platform = 'windows' | 'macos' | 'linux';

const WINDOWS_PATTERNS = [/-setup\.exe$/i, /\.exe$/i, /\.msi$/i];
const MACOS_PATTERNS = [/\.dmg$/i, /\.app\.tar\.gz$/i];
const LINUX_PATTERNS = [/\.AppImage$/i, /\.deb$/i, /\.rpm$/i];

function pickAsset(release: any, patterns: RegExp[]) {
  const assets = release?.assets || [];
  for (const pattern of patterns) {
    const asset = assets.find((a: any) => pattern.test(a.name || ''));
    if (asset) return asset;
  }
  return null;
}

function platformOf(os: string): Platform {
  if (os === 'macos' || os === 'mac' || os === 'darwin') return 'macos';
  if (os === 'linux') return 'linux';
  return 'windows';
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let os = '';
    try {
      if (req.method === 'POST') {
        const body = await req.json().catch(() => ({}));
        os = String(body?.os || '');
      }
    } catch { /* no body */ }
    if (!os) {
      try { os = new URL(req.url).searchParams.get('os') || ''; } catch { /* ignore */ }
    }
    const platform = platformOf(os.toLowerCase());

    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

    // If the configured token is rejected, retry anonymously (public repo).
    let all: any[];
    try {
      all = await fetchAllReleases(token);
    } catch {
      all = await fetchAllReleases(undefined);
    }

    const sorted = all
      .filter((r) => !r.draft && !r.prerelease)
      .sort((a, b) => compareSemver(b.tag_name || '', a.tag_name || ''));

    if (sorted.length === 0) {
      return Response.json({
        version: null,
        latest_version: null,
        download_url: null,
        filename: null,
        installer_available: false,
        platform,
      });
    }

    const latest = sorted[0];
    const latestVersion = (latest.tag_name || '').replace(/^v/i, '');

    // Newest release that actually ships an installer for the requested OS.
    // A release may be published without a Windows build (failed CI job), so we
    // never point the download button at a GitHub page as a fallback.
    const withAsset = sorted.find((r) => pickAsset(r, platform === 'windows' ? WINDOWS_PATTERNS : platform === 'macos' ? MACOS_PATTERNS : LINUX_PATTERNS));
    const target = withAsset || null;

    const patterns = platform === 'windows' ? WINDOWS_PATTERNS : platform === 'macos' ? MACOS_PATTERNS : LINUX_PATTERNS;
    const asset = target ? pickAsset(target, patterns) : null;

    const perPlatform: Record<string, any> = {};
    (['windows', 'macos', 'linux'] as Platform[]).forEach((p) => {
      const pats = p === 'windows' ? WINDOWS_PATTERNS : p === 'macos' ? MACOS_PATTERNS : LINUX_PATTERNS;
      const release = sorted.find((r) => pickAsset(r, pats));
      const found = release ? pickAsset(release, pats) : null;
      perPlatform[p] = release && found
        ? {
            version: (release.tag_name || '').replace(/^v/i, ''),
            url: found.browser_download_url || null,
            filename: found.name || null,
          }
        : null;
    });

    return Response.json({
      version: target ? (target.tag_name || '').replace(/^v/i, '') : null,
      latest_version: latestVersion,
      download_url: asset?.browser_download_url || null,
      filename: asset?.name || null,
      installer_available: !!asset,
      platform,
      downloads: perPlatform,
      release_page: latest.html_url || `https://github.com/${GITHUB_REPO}/releases`,
      published_at: target?.published_at || latest.published_at || null,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}