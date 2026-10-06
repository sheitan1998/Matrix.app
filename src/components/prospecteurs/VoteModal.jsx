import React, { useState } from "react";
import { X, ArrowUp, Flame, Loader2, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function VoteModal({ server, voteStatus, onClose, onVoted }) {
  const [pseudo, setPseudo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!pseudo.trim()) {
      setError("Veuillez saisir votre pseudo pour voter.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "vote",
        serverAdId: server.id,
        voterPseudo: pseudo.trim(),
      });
      if (res.data?.success) {
        toast.success("Vote enregistré !");
        onVoted({ votes: res.data.votes, votes_month: res.data.votes_month, clicks: res.data.clicks, clicks_month: res.data.clicks_month });
        onClose();
      } else if (res.data?.error === "cooldown") {
        toast.error(`Reviens dans ${res.data.remainingTime.h}h ${res.data.remainingTime.m}m`);
        onClose();
      } else {
        setError(res.data?.error || "Erreur lors du vote");
      }
    } catch {
      setError("Erreur lors du vote");
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n) => String(n).padStart(2, "0");
  const logoUrl = server.logo_url || server.profile_image || server.server_icon;
  const initial = server.title?.[0]?.toUpperCase() || "S";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: "#12091c", border: "1px solid rgba(138,79,255,0.3)" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(138,79,255,0.2)" }}>
          <h2 className="text-sm font-black tracking-wider uppercase text-white">Voter pour ce serveur</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition tap-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Server preview */}
        <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(138,79,255,0.1)" }}>
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}>
            {logoUrl ? <img src={logoUrl} alt="" className="w-full h-full object-cover" /> : initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{server.title}</p>
            <p className="text-[9px] text-white/40">{server.votes || 0} votes totaux</p>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-bold" style={{ color: "#8a4fff" }}>
            <ArrowUp className="w-3 h-3" />
            {server.votes_month || 0}
          </div>
        </div>

        {/* Cooldown check */}
        {!voteStatus.canVote ? (
          <div className="p-5 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-white/20" />
            <p className="text-xs text-white/50 mb-1">Tu as déjà voté récemment</p>
            <p className="text-sm font-black text-white">
              {fmt(voteStatus.remaining.h)}:{fmt(voteStatus.remaining.m)}:{fmt(voteStatus.remaining.s)}
            </p>
            <p className="text-[9px] text-white/30 mt-1">Reviens plus tard pour revoter</p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1 block">
                Ton pseudo (en jeu ou de vote) *
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

            {error && (
              <p className="text-[10px] text-red-400">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !pseudo.trim()}
              className="w-full h-10 rounded-lg text-xs font-black tracking-wider uppercase transition disabled:opacity-50 flex items-center justify-center gap-1.5 tap-sm"
              style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)", color: "#fff", boxShadow: "0 0 15px rgba(138,79,255,0.3)" }}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Vote en cours...</>
              ) : (
                <><ArrowUp className="w-4 h-4" /> Confirmer mon vote</>
              )}
            </button>

            <p className="text-[9px] text-white/30 text-center">
              <Flame className="w-2.5 h-2.5 inline mr-1" style={{ color: "#fbbf24" }} />
              Cooldown: 2h (1h avec VIP)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}