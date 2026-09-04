import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, X, Trash2, Pencil, Check, Reply } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useProgression } from "@/context/ProgressionContext";
import { cn } from "@/lib/utils";

const REACTIONS = ["❤️", "😂", "🔥", "👏", "😮", "😢"];

// Private messages stored as ServerMessages with server_id = "dm__user1__user2" (sorted emails)
function getDmId(emailA, emailB) {
  return "dm__" + [emailA, emailB].sort().join("__");
}

export default function PrivateChat({ user, friend, onClose }) {
  const { trackActivity } = useProgression();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const bottomRef = useRef(null);
  const qc = useQueryClient();

  useEffect(() => {
    const close = () => setContextMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

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

  const deleteMessage = async (msg) => {
    await base44.entities.ServerMessage.delete(msg.id);
    qc.invalidateQueries({ queryKey: ["dm-messages", dmId] });
    toast.success("Message supprimé");
    setContextMenu(null);
  };

  const saveEdit = async () => {
    if (!editingMsg) return;
    await base44.entities.ServerMessage.update(editingMsg.id, { content: editingMsg.content });
    qc.invalidateQueries({ queryKey: ["dm-messages", dmId] });
    setEditingMsg(null);
    toast.success("Message modifié");
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ msg, x: Math.min(e.clientX, window.innerWidth - 200), y: Math.min(e.clientY, window.innerHeight - 220) });
  };

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
    // Send notification to the friend
    base44.entities.Notification.create({
      user_email: friend.friend_email || friend.email,
      type: "new_message",
      title: `Nouveau message de ${user.full_name || "Quelqu'un"}`,
      body: content.slice(0, 100),
      icon: "💬",
      is_read: false,
    });
    setInput("");
    setSending(false);
    if (replyingTo) setReplyingTo(null);
    trackActivity("dm_sent");
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
          const isEditing = editingMsg?.id === msg.id;
          return (
            <div key={msg.id} className={cn("flex gap-2 group", isMe ? "justify-end" : "justify-start")}
              onContextMenu={(e) => handleContextMenu(e, msg)}>
              {!isMe && (
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                  {(msg.author_name || "?")[0]}
                </div>
              )}
              <div className={cn("max-w-[75%]", isMe && "flex flex-col items-end")}>
                {msg.reply_to && (
                  <div className="text-[10px] text-muted-foreground mb-1 px-1 border-l-2 border-primary/40 pl-2 italic">
                    ↳ {msg.reply_to}
                  </div>
                )}
                {isEditing ? (
                  <div className="flex gap-2 items-center">
                    <input
                      value={editingMsg.content}
                      onChange={(e) => setEditingMsg(prev => ({ ...prev, content: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingMsg(null); }}
                      className="bg-white/10 rounded-lg px-2 py-1 text-sm text-white outline-none border border-white/20 min-w-[120px]"
                      autoFocus />
                    <button onClick={saveEdit} className="text-green-400 hover:text-green-300"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditingMsg(null)} className="text-muted-foreground hover:text-white"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <div className={cn("px-3 py-2 rounded-2xl text-sm",
                    isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-white rounded-bl-sm")}>
                    {msg.content}
                    <p className={cn("text-[9px] mt-0.5", isMe ? "text-primary-foreground/60" : "text-muted-foreground")}>
                      {format(new Date(msg.created_date), "HH:mm")}
                    </p>
                  </div>
                )}
                {/* Reply button on hover */}
                <button
                  onClick={() => setReplyingTo(msg)}
                  className="opacity-0 group-hover:opacity-100 transition text-[10px] text-muted-foreground hover:text-white mt-0.5">
                  <Reply className="w-3 h-3 inline mr-0.5" /> Répondre
                </button>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2">
        {replyingTo && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs">
            <span className="text-muted-foreground">↳ Réponse à :</span>
            <span className="text-white truncate flex-1">{replyingTo.content?.slice(0, 40)}...</span>
            <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-white"><X className="w-3 h-3" /></button>
          </div>
        )}
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

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[999] rounded-2xl overflow-hidden shadow-2xl border border-border"
          style={{ top: contextMenu.y, left: contextMenu.x, background: "hsl(var(--card))", minWidth: "180px" }}
          onClick={(e) => e.stopPropagation()}>
          <div className="p-2 flex gap-1 border-b border-border">
            {REACTIONS.map(emoji => (
              <button key={emoji} onClick={() => { toast.info(`Réaction ${emoji}`); setContextMenu(null); }}
                className="text-xl hover:scale-125 transition p-0.5">{emoji}</button>
            ))}
          </div>
          <button
            onClick={() => { setReplyingTo(contextMenu.msg); setContextMenu(null); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-secondary transition">
            <Reply className="w-4 h-4" /> Répondre
          </button>
          {contextMenu.msg.author_email === user?.email && (
            <button
              onClick={() => { setEditingMsg({ id: contextMenu.msg.id, content: contextMenu.msg.content }); setContextMenu(null); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-secondary transition">
              <Pencil className="w-4 h-4" /> Modifier
            </button>
          )}
          <button
            onClick={() => deleteMessage(contextMenu.msg)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition">
            <Trash2 className="w-4 h-4" /> Supprimer
          </button>
        </div>
      )}
    </div>
  );
}