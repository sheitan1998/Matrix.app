import { base44 } from '@/api/base44Client';

export async function downloadModArchive(modId) {
  const response = await base44.functions.fetch('/fs25Download', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modId: String(modId) }),
  });
  if (!response.ok || !/application\/(?:zip|octet-stream)/i.test(response.headers.get('content-type') || '')) {
    const problem = await response.json().catch(() => null);
    throw new Error(problem?.error || `Téléchargement indisponible (${response.status}). Réessayez ici dans un instant.`);
  }
  const blob = await response.blob();
  const signature = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  if (signature[0] !== 80 || signature[1] !== 75) throw new Error('Le fichier reçu n’est pas une archive ZIP.');
  const filename = response.headers.get('content-disposition')?.match(/filename="([^"]+)"/)?.[1] || `FS25_${modId}.zip`;
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  anchor.hidden = true;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}