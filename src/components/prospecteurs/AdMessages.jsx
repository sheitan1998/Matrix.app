import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AdMessages({ adId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchMessages = async () => {
    try {
      const msgs = await base44.entities.AdMessage.filter({ ad_id: adId });
      setMessages(msgs);
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    if (showMessages) fetchMessages();
  }, [showMessages, adId]);

  const handleSend = async () => {
    if (!content.trim() || !currentUser) return;
    setPosting(true);
    try {
      const newMsg = await base44.entities.AdMessage.create({
        ad_id: adId,
        author_email: currentUser.email,
        author_name: currentUser.full_name || currentUser.email.split("@")[0],
        author_avatar: currentUser.avatar_url || "",
        content: content.trim(),
      });
      setMessages((prev) => [...prev, newMsg]);
      setContent("");
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteMsg = async (msgId) => {
    try {
      await base44.entities.AdMessage.delete(msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch {
      toast.error("Erreur");
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={() => setShowMessages(!showMessages)}
        className="flex items-center gap-1 text-[9px] text-white/40 hover:text-white/60 transition tap-sm"
      >
        <MessageSquare className="w-3 h-3" />
        {messages.length > 0
          ? `${messages.length} message${messages.length > 1 ? "s" : ""}`
          : "Messages"}
      </button>
      {showMessages && (
        <div className="mt-2 space-y-2">
          {messages.length === 0 ? (
            <p className="text-[9px] text-white/30 text-center py-1">
              Aucun message pour le moment
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-start gap-1.5 p-1.5 rounded"
                style={{ background: "rgba(138, 79, 255, 0.05)" }}
              >
                <div
                  className="w-5 h-5 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[8px] font-black text-white"
                  style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
                >
                  {msg.author_avatar ? (
                    <img src={msg.author_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    msg.author_name?.[0]?.toUpperCase() || "J"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-white/70 truncate">
                      {msg.author_name || "Joueur"}
                    </span>
                    {currentUser?.email === msg.author_email && (
                      <button
                        onClick={() => handleDeleteMsg(msg.id)}
                        className="text-white/20 hover:text-red-400 transition tap-sm"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-white/50 leading-tight">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {currentUser && (
            <div className="flex gap-1">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Écrire un message..."
                maxLength={200}
                className="flex-1 h-7 px-2 rounded text-[9px] text-white placeholder:text-white/30 outline-none"
                style={{
                  background: "rgba(138, 79, 255, 0.05)",
                  border: "1px solid rgba(138, 79, 255, 0.15)",
                }}
              />
              <button
                onClick={handleSend}
                disabled={posting || !content.trim()}
                className="w-7 h-7 rounded flex items-center justify-center transition tap-sm disabled:opacity-30"
                style={{ background: "rgba(138, 79, 255, 0.15)", color: "#8a4fff" }}
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}