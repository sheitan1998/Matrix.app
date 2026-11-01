import React from 'react';
import { Download, ExternalLink } from 'lucide-react';

/**
 * Bouton de téléchargement qui ouvre directement la fiche officielle du mod
 * sur le ModHub GIANTS dans un nouvel onglet, sans passer par des routes internes
 * susceptibles de générer des erreurs 502.
 */
export default function DownloadModButton({ mod }) {
  const officialUrl = mod.detailUrl || `https://www.farming-simulator.com/mod.php?mod_id=${mod.id}&title=fs2025`;
  const directZipUrl = mod.downloadUrl;

  return (
    <div className="w-full space-y-2">
      <a
        href={officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition"
      >
        <Download className="w-4 h-4" />
        Télécharger le Mod (.zip)
      </a>
      {directZipUrl && (
        <a
          href={directZipUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Lien direct CDN GIANTS
        </a>
      )}
    </div>
  );
}