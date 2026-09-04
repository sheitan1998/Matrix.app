import React, { useState } from "react";
import { createPortal } from "react-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { X, Send, Bug, UserCircle, CreditCard, ShieldAlert, HelpCircle, Paperclip, Loader2, Download } from "lucide-react";
import { useProgression } from "@/context/ProgressionContext";

const CATEGORIES = [
  { id: "bug", label: "Bug / Technique", icon: Bug, color: "#ef4444" },
  { id: "account", label: "Compte / Profil", icon: UserCircle, color: "#3b82f6" },
  { id: "payment", label: "Paiement / Boutique", icon: CreditCard, color: "#f59e0b" },
  { id: "harassment", label: "Harcèlement / Signalement", icon: ShieldAlert, color: "#ec4899" },
  { id: "other", label: "Autre", icon: HelpCircle, color: "#a855f7" },
];

export default function SupportTicketModal({ user, onClose }) {
  const { trackActivity } = useProgression();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("other");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setAttachments(prev => [...prev, { file_url, file_name: file.name }]);
      }
    } catch {
      toast.error("Erreur lors de l'upload du fichier.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Veuillez remplir le sujet et le message");
      return;
    }
    setLoading(true);
    try {
      const ticket = await base44.entities.SupportTicket.create({
        user_email: user.email,
        user_name: user.full_name || user.pseudo || user.email,
        user_avatar: user.avatar_url || "",
        subject: subject.trim(),
        category,
        message: message.trim(),
        status: "open",
        priority: category === "harassment" ? "urgent" : "medium",
      });

      // Create the first TicketMessage with attachments
      await base44.entities.TicketMessage.create({
        ticket_id: ticket.id,
        author_email: user.email,
        author_name: user.full_name || user.pseudo || user.email,
        author_avatar: user.avatar_url || "",
        author_role: "user",
        content: message.trim(),
        attachments,
      });

      toast.success("Ticket envoyé ! L'équipe support vous répondra dans la messagerie.");
      trackActivity("tickets_created");
      trackActivity("help_community");
      onClose();
    } catch {
      toast.error("Erreur lors de l'envoi du ticket");
    }
    setLoading(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl overflow-hidden flex flex-col" style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.2)", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)" }}>
              <Send className="w-4 h-4" style={{ color: "#a855f7" }} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Contacter le Support</h2>
              <p className="text-[10px] text-white/40">Réponse dans la messagerie intégrée</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition" style={{ background: "rgba(255,255,255,0.05)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Subject */}
          <div>
            <label className="text-xs font-bold text-white/60 mb-1.5 block">Sujet</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Résumez votre demande en quelques mots..."
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/30 outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-white/60 mb-1.5 block">Catégorie</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition"
                  style={{
                    background: category === c.id ? `${c.color}20` : "rgba(255,255,255,0.03)",
                    border: category === c.id ? `1px solid ${c.color}60` : "1px solid rgba(255,255,255,0.06)",
                    color: category === c.id ? c.color : "rgba(255,255,255,0.5)",
                  }}
                >
                  <c.icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-bold text-white/60 mb-1.5 block">Message détaillé</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Expliquez en détail la raison de votre contact..."
              rows={5}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/30 outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <p className="text-[10px] text-white/30 mt-1 text-right">{message.length}/2000</p>
          </div>

          {/* Attachments */}
          <div>
            <label className="text-xs font-bold text-white/60 mb-1.5 block">Pièces jointes (optionnel)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((att, i) => (
                <div key={i} className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <Download className="w-3 h-3 text-white/40" />
                  <span className="text-[10px] text-white/60 truncate max-w-[120px]">{att.file_name}</span>
                  <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-white/30 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white/60 cursor-pointer hover:text-white transition" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
              {uploading ? "Upload..." : "Ajouter un fichier"}
              <input type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 flex gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/60 hover:text-white transition" style={{ background: "rgba(255,255,255,0.05)" }}>
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={loading || uploading || !subject.trim() || !message.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}