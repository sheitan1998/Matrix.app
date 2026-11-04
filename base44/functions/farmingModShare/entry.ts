import { getGiantsMod } from '../../shared/giantsMedia.ts';

const DEFAULT_TITLE = 'Mods Farming Simulator 25 — MATRIX';
const DEFAULT_DESCRIPTION =
  'Catalogue de mods Farming Simulator 25 : véhicules, maps, outils et usines partagés par la communauté MATRIX.';
const DEFAULT_IMAGE =
  'https://media.base44.com/images/public/69e14a987a927963a9924d5a/d423a042e_Code_Generated_Image1.png';
const FALLBACK_ORIGIN = 'https://matrix-hub.base44.app';

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

function clip(value, max) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function resolveOrigin(raw) {
  try {
    const parsed = new URL(String(raw || ''));
    if (parsed.protocol === 'https:' && !parsed.username && !parsed.password) return parsed.origin;
  } catch {
    // origine invalide : on essaie la suivante
  }
  return null;
}

export default async function (req: Request): Promise<Response> {
  const requestUrl = new URL(req.url);
  const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
  const modId = String(requestUrl.searchParams.get('id') || body?.id || '');
  // On privilégie le domaine qui sert le lien (domaine personnalisé inclus).
  const origin =
    resolveOrigin(requestUrl.origin) || resolveOrigin(req.headers.get('X-Base44-App-Url')) || FALLBACK_ORIGIN;
  const appUrl = `${origin}/farming?mod=${encodeURIComponent(modId)}`;

  let mod = null;
  if (/^\d{1,10}$/.test(modId)) {
    const resolved = await getGiantsMod(modId).catch((error) => {
      console.error('[farmingModShare]', error instanceof Error ? error.message : error);
      return null;
    });
    // Une page d'erreur du ModHub ne doit jamais devenir le titre du partage.
    if (resolved?.title && !/^(error|not found|mod fs25)/i.test(resolved.title.trim())) mod = resolved;
  }

  const ogTitle = mod?.title || DEFAULT_TITLE;
  const pageTitle = mod?.title ? `${mod.title} — Mod Farming Simulator 25` : DEFAULT_TITLE;
  const description =
    clip(mod?.description, 200) ||
    (mod?.title ? `${mod.title} sur MATRIX — mods Farming Simulator 25.` : DEFAULT_DESCRIPTION);
  const rawImage = mod?.hdImg || mod?.img || '';
  const image = /^https:\/\//i.test(rawImage) ? rawImage : DEFAULT_IMAGE;

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:site_name" content="MATRIX">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(ogTitle)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:alt" content="${escapeHtml(ogTitle)}">
<meta property="og:url" content="${escapeHtml(appUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(ogTitle)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<link rel="canonical" href="${escapeHtml(appUrl)}">
<meta http-equiv="refresh" content="0;url=${escapeHtml(appUrl)}">
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a050f;color:#fff;font-family:Inter,Arial,sans-serif;text-align:center;padding:24px}
  main{max-width:460px}
  img{width:100%;border-radius:16px;margin-bottom:18px}
  h1{font-size:18px;line-height:1.35;margin:0 0 10px}
  a{display:inline-block;margin-top:14px;padding:12px 20px;border-radius:10px;background:#a3a3a3;color:#000;text-decoration:none;font-weight:700}
</style>
</head>
<body>
<main>
${mod?.title ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(mod.title)}">` : ''}
<h1>${escapeHtml(pageTitle)}</h1>
<a href="${escapeHtml(appUrl)}">Ouvrir la fiche du mod sur MATRIX</a>
</main>
<script>location.replace(${JSON.stringify(appUrl)});</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
}