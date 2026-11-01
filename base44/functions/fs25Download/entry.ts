import { fetchGiants, resolveGiantsDownload, MAX_GIANTS_ZIP_BYTES } from '../../shared/giantsMedia.ts';
import { rateLimitByIp } from '../../shared/security.ts';
import { farmingDownloadError } from '../../shared/farmingDownloadError.ts';

export default async function(req) {
  let native;
  try {
    if (!['GET', 'POST'].includes(req.method)) return Response.json({ error: 'Méthode non autorisée.' }, { status: 405, headers: { Allow: 'GET, POST' } });
    const body = req.method === 'GET' ? Object.fromEntries(new URL(req.url).searchParams)
      : req.headers.get('content-type')?.includes('application/x-www-form-urlencoded') ? Object.fromEntries(await req.formData())
      : await req.json().catch(() => ({}));
    native = body.native;
    const fail = (message, status) => farmingDownloadError(message, status, native);
    const id = String(body.modId || '');
    if (!/^\d{1,10}$/.test(id)) return fail('Identifiant du mod invalide.', 400);
    if (!rateLimitByIp(req, 'fs25Download', 12, 60000)) return fail('Trop de téléchargements. Réessayez dans une minute.', 429);
    const range = req.headers.get('range');
    if (range && !/^bytes=(?:\d+-\d*|-\d+)$/.test(range)) return fail('Plage de téléchargement invalide.', 416);
    const file = await resolveGiantsDownload(id, body.downloadUrl);
    if (body.prepare || body.probe) return Response.json(file);
    // GIANTS rejects third-party Referers: retain only this zero-buffer relay.
    // No HEAD request, binary probe, whole-file Blob or second archive request.
    const upstream = await fetchGiants(file.url, { range, ifRange: req.headers.get('if-range'), timeout: 240000 });
    if (upstream.status === 416) {
      await upstream.body?.cancel();
      return new Response(null, { status: 416, headers: { 'Content-Range': upstream.headers.get('content-range') || 'bytes */*', 'Cache-Control': 'no-store' } });
    }
    if (!upstream.ok || !upstream.body) {
      await upstream.body?.cancel();
      return fail(`GIANTS ne fournit pas le ZIP (${upstream.status}). Réessayez.`, upstream.status === 404 ? 404 : 502);
    }
    const type = upstream.headers.get('content-type') || '';
    const length = Number(upstream.headers.get('content-length')) || 0;
    if (!/^application\/(?:zip|x-zip-compressed|octet-stream)(?:;|$)/i.test(type)) {
      await upstream.body.cancel();
      return fail('GIANTS ne renvoie pas de fichier ZIP.', 502);
    }
    if (length > MAX_GIANTS_ZIP_BYTES) {
      await upstream.body.cancel();
      return fail('Ce ZIP dépasse la limite de téléchargement de 2 Gio.', 413);
    }
    const headers = {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${file.filename}"`,
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Mod-Source': 'GIANTS ModHub',
    };
    for (const name of ['Content-Length', 'Content-Range', 'Accept-Ranges', 'ETag', 'Last-Modified']) {
      const value = upstream.headers.get(name);
      if (value) headers[name] = value;
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (error) {
    return farmingDownloadError(error.message || 'Téléchargement indisponible.', 502, native);
  }
}