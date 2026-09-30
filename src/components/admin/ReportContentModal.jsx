import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Flag, X, Send } from "lucide-react";
import { toast } from "sonner";

const REASONS = [
  { id: "nudity", label: "Nudité / Contenu sexuel", icon: "🔞" },
  { id: "violence", label: "Violence", icon: " Violence" },
  { id: "hate_speech", label: "Discours haineux", icon: "💬" },
  { id: "harassment", label: "Harcèlement", icon: "⚠️" },
  { id: "spam", label: "Spam", icon: "📧" },
  { id: "illegal", label: "Contenu illégal", icon: "🚫" },
  { id: "other", label: "Autre", icon: "❓" },
];

export default function ReportContentModal({ open, onClose, contentType, contentId, contentPreview, authorEmail, authorName, reporterUser }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!reason) {
      toast.error("Veuillez sélectionner une raison");
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.ContentReport.create({
        reporter_email: reporterUser?.email || "",
        reporter_name: reporterUser?.full_name || reporterUser?.pseudo || reporterUser?.email?.split("@")[0] || "",
        content_type: contentType || "other",
        content_id: contentId || "",
        content_preview: contentPreview || "",
        author_email: authorEmail || "",
        author_name: authorName || "",
        reason,
        description: description.trim(),
        status: "pending",
      });
      toast.success("Signalement envoyé. Merci de votre contribution.");
      onClose();
      setReason("");
      setDescription("");
    } catch {
      toast.error("Erreur lors de l'envoi du signalement");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.2)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-black text-white">Signaler ce contenu</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/5 transition tap-sm">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Content preview */}
          {contentPreview && (
            <div className="p-2 rounded-lg" style={{ background: "rgba(0,0,0,0.3)" }}>
              {contentPreview.startsWith("http") ? (
                <img src={contentPreview} alt="Aperçu" className="max-h-24 rounded-lg" />
              ) : (
                <p className="text-xs text-white/50 italic truncate">"{contentPreview}"</p>
              )}
            </div>
          )}

          {/* Author info */}
          {authorName && (
            <p className="text-[11px] text-white/40">
              Contenu de <span className="text-white/60 font-bold">{authorName}</span>
            </p>
          )}

          {/* Reason selection */}
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase mb-2">Raison du signalement</p>
            <div className="space-y-1.5">
              {REASONS.map(r => (
                <button
                  key={r.id}
                  onClick={() => setReason(r.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${reason === r.id ? "text-white" : "text-white/50 hover:text-white/70"}`}
                  style={reason === r.id ? { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" } : { background: "rgba(255,255,255,0.03)", border: "1px solid transparent" }}
                >
                  <span>{r.icon}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase mb-2">Description (optionnel)</p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ajoutez des détails..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/5 text-white placeholder:text-white/30 outline-none text-xs resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 shrink-0 flex gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white/50 hover:text-white/70 transition tap-sm" style={{ background: "rgba(255,255,255,0.03)" }}>
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={!reason || submitting}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition disabled:opacity-40 flex items-center justify-center gap-1.5 tap-sm"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
          >
            <Send className="w-3.5 h-3.5" /> {submitting ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}