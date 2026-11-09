import React, { useState } from "react";
import { Copy, Check, ExternalLink, QrCode } from "lucide-react";
import { toast } from "sonner";

const isImageUrl = (value) => /^https?:\/\/[^\s]+\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(value || "");

/**
 * Actions Snapchat : pseudo copiable en un clic + accès direct au lien ou au QR code.
 */
export default function SnapchatChannelActions({ creator, accent = "#FFFC00" }) {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const pseudo = (creator.snapchat_username || "").replace(/^@/, "");
  const link = creator.snapchat_link || creator.channel_url || "";
  const qrImage = isImageUrl(link) ? link : "";

  const copyPseudo = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!pseudo) return;
    try {
      await navigator.clipboard.writeText(pseudo);
      setCopied(true);
      toast.success(`@${pseudo} copié`);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Copie impossible");
    }
  };

  if (!pseudo && !link) return null;

  return (
    <>
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        {pseudo && (
          <button
            type="button"
            onClick={copyPseudo}
            title="Copier le pseudo Snapchat"
            className="flex items-center gap-1 h-6 pl-2 pr-1.5 rounded-md text-[10px] font-bold text-white transition hover:opacity-90 tap-sm"
            style={{ background: "rgba(10,5,15,0.65)", border: `1px solid ${accent}55`, color: accent }}
          >
            @{pseudo}
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        )}

        {qrImage ? (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQrOpen(true); }}
            className="flex items-center gap-1 h-6 px-2 rounded-md text-[10px] font-bold text-white tap-sm"
            style={{ background: "rgba(10,5,15,0.6)", border: "1px solid rgba(255,255,255,0.16)" }}
          >
            <QrCode className="w-3 h-3" style={{ color: accent }} />
            QR code
          </button>
        ) : link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 h-6 px-2 rounded-md text-[10px] font-bold text-white/80 hover:text-white transition tap-sm"
            style={{ background: "rgba(10,5,15,0.6)", border: "1px solid rgba(255,255,255,0.16)" }}
          >
            <ExternalLink className="w-3 h-3" style={{ color: accent }} />
            Ouvrir
          </a>
        ) : null}
      </div>

      {qrOpen && qrImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          style={{ background: "rgba(10,5,15,0.88)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQrOpen(false); }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#12091c", border: `1px solid ${accent}55`, boxShadow: `0 0 30px ${accent}33` }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={qrImage} alt={`QR code Snapchat de ${pseudo || creator.name}`} className="w-64 h-64 object-contain bg-white" />
            <div className="px-4 py-2.5 flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-white/70">{pseudo ? `@${pseudo}` : "QR code Snapchat"}</span>
              <button
                type="button"
                onClick={() => setQrOpen(false)}
                className="text-[10px] font-black uppercase tracking-wider"
                style={{ color: accent }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}