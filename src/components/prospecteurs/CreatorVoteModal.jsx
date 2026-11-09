import React, { useState } from "react";
import { X, ArrowUp, Clock, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CREATOR_PLATFORMS } from "./CreatorPlatformCards";

export default function CreatorVoteModal({ creator, voteStatus, onClose, onVoted }) {
  const [pseudo, setPseudo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const platform = CREATOR_PLATFORMS[creator.platform] || CREATOR_PLATFORMS.youtube;
  const accent = platform.color;

  const handleSubmit = async () => {
    if (!pseudo.trim()) {
      setError("Veuillez saisir votre pseudo pour voter.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await base44.functions.invoke("creatorSearch", {
        action: "vote",
        creatorId: creator.id,
        voterPseudo: pseudo.trim(),
      });
      if (res.data?.success) {
        onVoted({
          votes: res.data.votes,
          votes_month: res.data.votes_month,
          effective_cooldown_hours: res.data.effective_cooldown_hours,
        });
        setConfirmed(true);
        setTimeout(onClose, 4000);
      } else if (res.data?.error === "cooldown") {
        setError(`Reviens dans ${res.data.remainingTime.h}h ${res.data.remainingTime.m}m pour revoter.`);
      } else {
        setError("Erreur lors du vote. Réessaie dans un instant.");
      }
    } catch {
      setError("Erreur lors du vote. Réessaie dans un instant.");
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n) => String(n).padStart(2, "0");

  if (confirmed) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm rounded-2xl overflow-hidden text-center"
          style={{ background: "#12091c", border: "1px solid rgba(34,197,94,0.4)", boxShadow: "0 0 40px rgba(34,197,94,0.15)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #22c55e, #16a34a)" }} />
          <div className="px-6 py-8">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.3)" }}
            >
              <CheckCircle2 className="w-8 h-8" style={{ color: "#22c55e" }} />
            </div>
            <h2 className="text-lg font-black text-white mb-1">Merci pour votre vote !</h2>
            <p className="text-xs text-white/50">
              Votre vote pour <span className="font-bold text-white">{creator.name}</span> a bien été enregistré.
            </p>
            <button
              onClick={onClose}
              className="mt-6 h-9 px-6 rounded-lg text-[11px] font-bold transition tap-sm"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: "#12091c", border: `1px solid ${accent}55` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(138,79,255,0.2)" }}>
          <h2 className="text-sm font-black tracking-wider uppercase text-white">Voter pour cette chaîne</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition tap-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(138,79,255,0.1)" }}>
          <div
            className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-sm font-black text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${accent}, #1a0a2e)` }}
          >
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              creator.name?.[0]?.toUpperCase() || "C"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{creator.name}</p>
            <p className="text-[9px] text-white/40">{creator.votes || 0} votes totaux</p>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-bold" style={{ color: accent }}>
            <ArrowUp className="w-3 h-3" />
            {creator.votes_month || 0}
          </div>
        </div>

        {!voteStatus.canVote ? (
          <div className="p-5 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-white/20" />
            <p className="text-xs text-white/50 mb-1">Tu as déjà voté récemment</p>
            <p className="text-sm font-black text-white">
              {fmt(voteStatus.remaining.h)}:{fmt(voteStatus.remaining.m)}:{fmt(voteStatus.remaining.s)}
            </p>
            <p className="text-[9px] text-white/30 mt-1">Reviens plus tard pour revoter</p>
            <button
              onClick={onClose}
              className="mt-4 h-9 px-6 rounded-lg text-[11px] font-bold transition tap-sm"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Fermer
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">
                Ton pseudo *
              </label>
              <input
                type="text"
                maxLength={30}
                value={pseudo}
                onChange={(e) => { setPseudo(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Ex: ProGamer123"
                autoFocus
                className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
                style={{ background: "rgba(138,79,255,0.05)", border: "1px solid rgba(138,79,255,0.2)" }}
              />
            </div>

            {error && <p className="text-[10px] text-red-400">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting || !pseudo.trim()}
              className="w-full h-10 rounded-lg text-xs font-black tracking-wider uppercase transition disabled:opacity-50 tap-sm"
              style={{ background: `linear-gradient(135deg, ${accent}, #6d28d9)`, color: "#fff", boxShadow: `0 0 15px ${accent}55` }}
            >
              {submitting ? "Envoi..." : "Valider mon vote"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}