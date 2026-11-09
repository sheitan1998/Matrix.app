import React, { useState } from "react";
import { Link2, Copy, Check, Users } from "lucide-react";
import { toast } from "sonner";
import { referralLink } from "@/lib/affiliateProgram";

export default function ReferralLinkCard({ code, count = 0, variant = "standard" }) {
  const [copied, setCopied] = useState(false);
  const advanced = variant === "advanced";
  const link = code ? referralLink(code) : "";

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Lien d'affiliation copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  return (
    <div className="p-5 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.18)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4" style={{ color: "#a855f7" }} />
        <p className="text-sm font-black text-white">
          {advanced ? "Lien d'affiliation avancé" : "Votre lien d'affiliation personnel"}
        </p>
        <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide"
          style={{ background: "rgba(168,85,247,0.15)", color: "#c4b5fd", border: "1px solid rgba(168,85,247,0.3)" }}>
          {advanced ? "Tracking avancé" : "Personnel"}
        </span>
      </div>

      {link ? (
        <div className="flex gap-2">
          <input
            readOnly
            value={link}
            onFocus={(e) => e.target.select()}
            className="flex-1 min-w-0 h-10 px-3 rounded-xl font-mono text-xs text-white outline-none"
            style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
          <button
            onClick={copy}
            className="h-10 px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold shrink-0 transition"
            style={copied
              ? { background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }
              : { background: "linear-gradient(135deg, #a855f7, #6d28d9)", color: "#fff" }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-white/50 py-2">
          Activez votre statut affilié pour générer votre lien personnel.
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-white/40" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Filleuls inscrits</p>
            <p className="text-[11px] text-white/50">
              {advanced ? "Inscriptions et impact de votre communauté" : "Chaque inscription via votre lien"}
            </p>
          </div>
        </div>
        <p className="text-2xl font-black text-white">{count}</p>
      </div>
    </div>
  );
}