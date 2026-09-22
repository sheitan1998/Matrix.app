import React, { useState, useEffect, useRef } from "react";
import { X, ExternalLink, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { normalizeExternalUrl } from "@/lib/urlUtils";

export default function PartnerWebModal({ partner, onClose }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const iframeRef = useRef(null);
  const url = normalizeExternalUrl(partner.href) || partner.href;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setFailed(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [loading]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-w-6xl m-4 rounded-2xl overflow-hidden bg-[#0a0a0f] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#101015] border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-white font-bold truncate">{partner.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition tap-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Navigateur
            </a>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition tap-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative bg-white">
          {loading && !failed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0f]">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <p className="text-white/50 text-sm">Chargement de {partner.name}...</p>
            </div>
          )}
          {failed ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0a0a0f] px-8 text-center">
              <p className="text-white/60 text-sm max-w-md">
                Ce site ne peut pas être affiché directement dans l'application.
                Vous pouvez l'ouvrir dans votre navigateur.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}
              >
                <ExternalLink className="w-4 h-4" />
                Ouvrir dans le navigateur
              </a>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={url}
              title={partner.name}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
              allow="clipboard-read; clipboard-write; geolocation; encrypted-media; picture-in-picture; fullscreen"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}