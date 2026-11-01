export function farmingDownloadError(message, status, requestId) {
  if (!/^[a-f0-9-]{36}$/i.test(String(requestId || ''))) return Response.json({ error: message }, { status });
  const nonce = crypto.randomUUID();
  const payload = JSON.stringify({ type: 'matrix-fs25-download-error', requestId, message }).replace(/</g, '\\u003c');
  return new Response(`<!doctype html><html lang="fr"><meta charset="utf-8"><title>Téléchargement indisponible</title><script nonce="${nonce}">parent.postMessage(${payload}, '*');</script><p>Le téléchargement est indisponible. Réessayez depuis MATRIX.</p></html>`, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}