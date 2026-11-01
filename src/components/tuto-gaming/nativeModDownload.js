import { base44 } from '@/api/base44Client';

export async function downloadModArchive(mod, onError = () => {}) {
  let delivery = mod;
  if (!delivery.downloadEndpoint) {
    const { data } = await base44.functions.invoke('farmingModApi', { action: 'prepareDownload', modId: String(mod.id) });
    if (data.error) throw new Error(data.error);
    delivery = { ...mod, ...data };
  }
  const endpoint = new URL(delivery.downloadEndpoint);
  if (endpoint.protocol !== 'https:' || endpoint.pathname !== '/functions/fs25Download') throw new Error('Adresse de téléchargement invalide.');
  // Keep a stable GET URL so browser caching and byte-range resumption work.
  endpoint.searchParams.set('modId', String(mod.id));
  endpoint.searchParams.set('native', '1');
  if (delivery.downloadUrl) endpoint.searchParams.set('downloadUrl', delivery.downloadUrl);
  const frame = document.createElement('iframe');
  frame.hidden = true;
  frame.setAttribute('aria-hidden', 'true');
  frame.title = 'Téléchargement du mod FS25';
  let timeout;
  const cleanup = () => { clearTimeout(timeout); window.removeEventListener('message', receiveError); frame.remove(); };
  const receiveError = event => {
    if (event.origin !== endpoint.origin || event.source !== frame.contentWindow || event.data?.type !== 'matrix-fs25-download-error') return;
    onError(new Error(event.data.message));
    cleanup();
  };
  window.addEventListener('message', receiveError);
  // Native attachments save incoming bytes directly, without a whole-file Blob.
  frame.src = endpoint.href;
  document.body.appendChild(frame);
  timeout = setTimeout(cleanup, 10 * 60 * 1000);
}