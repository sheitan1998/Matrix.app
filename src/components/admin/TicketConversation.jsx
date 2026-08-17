import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Send, Paperclip, Lock, Unlock, X, Download, Loader2 } from "lucide-react";

const STATUS_CONFIG = {
  open: { label: "Ouvert", color: "#3b82f6" },
  in_progress: { label: "En cours", color: "#f59e0b" },
  resolved: { label: "Résolu", color: "#22C55E" },
  closed: { label: "Fermé", color: "#6b7280" },
};

export default function TicketConversation({ ticket, user, isAdmin, onRefresh }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const isLocked = ticket.is_locked || ticket.status === "closed";

  const fetchMessages = useCallback(async () => {
    try {
      const msgs = await base44.entities.TicketMessage.filter({ ticket_id: ticket.id }, "created_date", 200);
      setMessages(msgs);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [ticket.id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const unsub = base44.entities.TicketMessage.subscribe(() => fetchMessages());
    return unsub;
  }, [fetchMessages]);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachments((prev) => [...prev, { file_url, file_name: file.name }]);
    } catch {
      toast.error("Erreur lors de l'upload du fichier.");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!content.trim() && attachments.length === 0) return;
    if (isLocked) {
      toast.error("Ce ticket est verrouillé (clôturé).");
      return;
    }
    setSending(true);
    try {
      await base44.entities.TicketMessage.create({
        ticket_id: ticket.id,
        author_email: user.email,
        author_name: user.full_name || user.pseudo || user.email,
        author_avatar: user.avatar_url || "",
        author_role: isAdmin ? "admin" : "user",
        content: content.trim(),
        attachments,
      });

      // If admin responds, send internal DM to the user (no email)
      if (isAdmin) {
        await base44.entities.DirectMessage.create({
          sender_email: user.email,
          sender_name: user.full_name || "Support Matrix",
          sender_avatar: user.avatar_url || "",
          recipient_email: ticket.user_email,
          recipient_name: ticket.user_name || "",
          content: `🎫 Support — ${ticket.subject}\n\n${content.trim()}`,
        });
        // Mark ticket as in_progress if it was open
        if (ticket.status === "open") {
          await base44.entities.SupportTicket.update(ticket.id, { status: "in_progress" });
        }
      }

      setContent("");
      setAttachments([]);
      toast.success("Message envoyé.");
      fetchMessages();
      if (onRefresh) onRefresh();
    } catch {
      toast.error("Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  const toggleLock = async () => {
    try {
      const newLocked = !isLocked;
      await base44.entities.SupportTicket.update(ticket.id, {
        is_locked: newLocked,
        status: newLocked ? "closed" : "open",
      });

      // Create system message
      await base44.entities.TicketMessage.create({
        ticket_id: ticket.id,
        author_email: user.email,
        author_name: user.full_name || "Système",
        author_role: "admin",
        content: newLocked ? "Ticket clôturé et verrouillé." : "Ticket rouvert.",
        is_system: true,
      });

      toast.success(newLocked ? "Ticket verrouillé." : "Ticket rouvert.");
      fetchMessages();
      if (onRefresh) onRefresh();
    } catch {
      toast.error("Erreur.");
    }
  };

  return (
    <div className="space-y-3">
      {/* Lock banner */}
      {isLocked && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(107,114,128,0.1)", border: "1px solid rgba(107,114,128,0.3)" }}>
          <Lock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-400 font-bold">Ticket verrouillé — lecture seule</span>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
        ) : (
          <>
            {/* Original ticket message */}
            <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] font-bold text-white/40 mb-1">Message initial:</p>
              <p className="text-xs text-white/80 whitespace-pre-wrap">{ticket.message}</p>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl ${msg.is_system ? "text-center" : ""}`}
                style={
                  msg.is_system
                    ? { background: "rgba(107,114,128,0.08)", border: "1px solid rgba(107,114,128,0.15)" }
                    : msg.author_role === "admin"
                    ? { background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)" }
                    : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }
                }
              >
                {msg.is_system ? (
                  <p className="text-[10px] text-gray-400 italic">{msg.content}</p>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full overflow-hidden shrink-0" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                        {msg.author_avatar ? <img src={msg.author_avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] bg-secondary text-white">{msg.author_name?.[0]?.toUpperCase()}</div>}
                      </div>
                      <span className="text-[10px] font-bold text-white/60">{msg.author_name}</span>
                      {msg.author_role === "admin" && <span className="px-1 py-0.5 rounded text-[8px] font-bold" style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc" }}>ADMIN</span>}
                    </div>
                    <p className="text-xs text-white/80 whitespace-pre-wrap">{msg.content}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.attachments.map((att, i) => (
                          <a key={i} href={att.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-white/60 hover:text-white transition" style={{ background: "rgba(255,255,255,0.05)" }}>
                            <Download className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{att.file_name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Admin lock toggle */}
      {isAdmin && (
        <button
          onClick={toggleLock}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition tap-sm"
          style={{
            background: isLocked ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)",
            color: isLocked ? "#22C55E" : "#9ca3af",
            border: `1px solid ${isLocked ? "rgba(34,197,94,0.3)" : "rgba(107,114,128,0.3)"}`,
          }}
        >
          {isLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          {isLocked ? "Rouvrir le ticket" : "Clôturer et verrouiller"}
        </button>
      )}

      {/* Reply area */}
      {!isLocked && (
        <div className="space-y-2">
          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <div key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <Paperclip className="w-3 h-3 text-white/40" />
                  <span className="text-[10px] text-white/60 truncate max-w-[100px]">{att.file_name}</span>
                  <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-white/30 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <label className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer text-white/40 hover:text-white transition shrink-0" style={{ background: "rgba(255,255,255,0.05)" }}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
              <input type="file" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tapez votre message..."
              rows={2}
              className="flex-1 px-3 py-2 rounded-xl text-xs text-white placeholder:text-white/30 outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <button
              onClick={handleSend}
              disabled={sending || (!content.trim() && attachments.length === 0)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white transition hover:opacity-90 disabled:opacity-30 shrink-0"
              style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}