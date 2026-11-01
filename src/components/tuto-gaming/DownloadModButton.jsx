import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { downloadModArchive } from '@/components/tuto-gaming/nativeModDownload';

export default function DownloadModButton({ mod }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const download = async () => {
    if (downloading) return;
    setDownloading(true);
    setError('');
    setStatus('');
    try {
      await downloadModArchive(mod, failure => { setStatus(''); setError(failure.message); });
      setStatus('Demande de téléchargement transmise au navigateur.');
    }
    catch (failure) { setError(failure.message || 'Téléchargement indisponible. Réessayez.'); }
    finally { setDownloading(false); }
  };
  return (
    <div className="w-full space-y-2">
      <button type="button" onClick={download} disabled={downloading} aria-busy={downloading} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-2 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
        {downloading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Download className="h-4 w-4 shrink-0" />}
        {downloading ? 'Démarrage…' : 'Télécharger le Mod (.zip)'}
      </button>
      {status && !error && <p role="status" className="text-xs text-muted-foreground">{status}</p>}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}