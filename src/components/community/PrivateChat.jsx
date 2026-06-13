import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Private messages stored as ServerMessages with server_id = "dm__user1__user2" (sorted emails)
function getDmId(emailA, emailB) {
  return "dm__" + [emailA, emailB].sort().join("__");
}

export default function PrivateChat({ user, friend, onClose }) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const qc = useQueryClient();

  const dmId = getDmId(user.email, friend.friend_email || friend.email);
  const friendName = friend.friend_name || friend.full_name || friend.email;

  const { data: messages = [] } = useQuery({
    queryKey: ["dm-messages", dmId],
    queryFn: () => base44.entities.ServerMessage.filter(
      { server_id: dmId, channel_id: "dm" },
      "created_date",
      100
    ),
    refetchInterval: 2000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    await base44.entities.ServerMessage.create({
      server_id: dmId,
      channel_id: "dm",
      author_email: user.email,
      author_name: user.full_name || user.email.split("@")[0],
      author_avatar: user.avatar_url || "",
      content,
      type: "text",
    });
    setInput("");
    setSending(false);
    qc.invalidateQueries({ queryKey: ["dm-messages", dmId] });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "hsl(var(--background))" }}>
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border flex items-center gap-3">
        <button onClick={onClose} className="text-muted-foreground hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0">
          {friendName[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm text-white">{friendName}</p>
          <p className="text-[10px] text-muted-foreground">Message privé</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-bold">Début de votre conversation avec {friendName}</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.author_email === user.email;
          return (
            <div key={msg.id} className={cn("flex gap-2", isMe ? "justify-end" : "justify-start")}>
              {!isMe && (
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                  {(msg.author_name || "?")[0]}
                </div>
              )}
              <div className={cn("max-w-[75%] px-3 py-2 rounded-2xl text-sm",
                isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-white rounded-bl-sm")}>
                {msg.content}
                <p className={cn("text-[9px] mt-0.5", isMe ? "text-primary-foreground/60" : "text-muted-foreground")}>
                  {format(new Date(msg.created_date), "HH:mm")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 px-4 rounded-2xl border border-border bg-secondary/40">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message à ${friendName}...`}
            className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-white/30 outline-none"
          />
          <button onClick={send} disabled={!input.trim() || sending}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition disabled:opacity-30 bg-primary/20 text-primary">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}