import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link2, Copy, Check, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { referralLink } from "@/lib/affiliateProgram";

const GOAL = 50;

export default function ReferralTracker({ code, email, variant = "standard" }) {
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const advanced = variant === "advanced";
  const link = code ? referralLink(code) : "";

  const { data: count = 0 } = useQuery({
    queryKey: ["referral-count", email],
    queryFn: () => base44.entities.Referral.count({ referrer_email: email }),
    enabled: !!email,
  });

  // Compteur en temps réel : chaque nouveau filleul rafraîchit la jauge.
  useEffect(() => {
    if (!email) return;
    return base44.entities.Referral.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["referral-count", email] });
    });
  }, [email, qc]);

  const pct = Math.min(100, Math.round((count / GOAL) * 100));

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
    <div
      className="p-5 rounded-2xl"
      style={{
        background: "linear-gradient(160deg, rgba(26,13,44,0.85), rgba(15,10,25,0.85))",
        border: "1px solid rgba(168,85,247,0.22)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4" style={{ color: "#a855f7" }} />
        <p className="text-sm font-black text-white">
          {advanced ? "Votre lien d'affiliation (Partenaire)" : "Votre lien d'affiliation personnel"}
        </p>
        <span
          className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0"
          style={{
            background: advanced ? "rgba(255,215,0,0.12)" : "rgba(168,85,247,0.15)",
            color: advanced ? "#FFD700" : "#c4b5fd",
            border: `1px solid ${advanced ? "rgba(255,215,0,0.3)" : "rgba(168,85,247,0.3)"}`,
          }}
        >
          Actif
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
        <p className="text-xs text-white/50 py-2">Complétez votre demande pour générer votre lien personnel.</p>
      )}

      {/* Compteur + barre de suivi dynamique */}
      <div className="mt-5">
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/40" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Filleuls inscrits</p>
              <p className="text-[11px] text-white/50">Chaque inscription via votre lien</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-white leading-none">{count}</p>
            <p className="text-[10px] text-white/40 mt-1 font-mono">{count} / {GOAL}</p>
          </div>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: advanced
                ? "linear-gradient(90deg, #FFD700, #FFA500)"
                : "linear-gradient(90deg, #00F2FF, #a855f7)",
              boxShadow: advanced ? "0 0 10px rgba(255,215,0,0.5)" : "0 0 10px rgba(168,85,247,0.5)",
            }}
          />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-white/40">
          <TrendingUp className="w-3 h-3" />
          {count >= GOAL ? "Palier atteint — merci pour votre communauté !" : `Prochain palier : ${GOAL} filleuls`}
        </p>
      </div>
    </div>
  );
}