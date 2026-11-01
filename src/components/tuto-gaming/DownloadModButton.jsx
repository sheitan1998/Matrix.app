import React, { useState } from 'react';
import { Download, Loader2, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { startNativeModDownload } from '@/components/tuto-gaming/nativeModDownload';

export default function DownloadModButton({ mod }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');

  async function download(e) {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    setError('');
    setFallbackUrl('');
    try {
      const { data } = await base44.functions.invoke('farmingModApi', { action: 'prepareDownload', modId: mod.id });
      if (data.error) {
        setError(data.error);
        // Provide a direct fallback link to the GIANTS mod page
        setFallbackUrl(`https://www.farming-simulator.com/mod.php?mod_id=${mod.id}&title=fs2025`);
        return;
      }
      startNativeModDownload(data.endpoint, mod.id);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Impossible de démarrer le téléchargement. Réessayez.');
      setFallbackUrl(`https://www.farming-simulator.com/mod.php?mod_id=${mod.id}&title=fs2025`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={download}
        disabled={loading}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold bg-primary text-primary-foreground disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Télécharger le Mod (.zip)
      </button>
      {error && <p role="alert" className="text-xs text-destructive mt-2">{error}</p>}
      {fallbackUrl && (
        <a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ouvrir la page ModHub officielle
        </a>
      )}
    </div>
  );
}