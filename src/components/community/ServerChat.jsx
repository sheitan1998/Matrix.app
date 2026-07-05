import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Hash, Image, Trash2, Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { NitroAvatar } from "@/components/NitroAvatarPicker";
import { useProgression } from "@/context/ProgressionContext";

export default function ServerChat({ server, channel, theme, user }) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null); // { id, content }
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const qc = useQueryClient();
  const { trackActivity } = useProgression();

  const REACTIONS = ["❤️", "😂", "🔥", "👏", "😮", "😢"];

  useEffect(() => {
    const close = () => setContextMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const isOwner = server?.owner_email === user?.email;

  const queryKey = ["server-messages", server.id, channel.id];

  const { data: messages = [] } = useQuery({
    queryKey,
    queryFn: () => base44.entities.ServerMessage.filter(
      { server_id: server.id, channel_id: channel.id },
      "created_date",
      100
    ),
    refetchInterval: 2000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const settings = channel.settings || {};
  const canSendMessages = settings.send_messages !== false;
  const canSendImages = settings.embed_links !== false; // reuse embed_links for images
  const canMentionEveryone = settings.mention_everyone !== false;

  const send = async (fileUrl = null) => {
    const content = input.trim();
    if ((!content && !fileUrl) || sending) return;
    if (!canSendMessages) { toast.error("Envoi de messages désactivé dans ce salon"); return; }
    if (fileUrl && !canSendImages) { toast.error("Les images ne sont pas autorisées dans ce salon"); return; }
    setSending(true);
    await base44.entities.ServerMessage.create({
      server_id: server.id,
      channel_id: channel.id,
      author_email: user.email,
      author_name: user.full_name || user.email.split("@")[0],
      author_avatar: user.animated_avatar || user.avatar_url || "",
      content: fileUrl ? `[Image] ${content}` : content || "[Image]",
      type: fileUrl ? "file" : "text",
      file_url: fileUrl || "",
    });

    if (content && content.includes("@everyone") && !canMentionEveryone) {
      toast.error("Vous n'êtes pas autorisé à mentionner @everyone");
      setSending(false);
      return;
    }

    if (content && content.includes("@everyone")) {
      toast.info("@everyone envoyé — tous les membres seront notifiés");
      base44.entities.ServerMember.filter({ server_id: server.id }, "-created_date", 200)
        .then(async (members) => {
          for (const m of members) {
            if (m.user_email !== user.email) {
              base44.entities.Notification.create({
                user_email: m.user_email,
                type: "mention",
                title: `@everyone dans #${channel.name}`,
                body: `${user.full_name || "Quelqu'un"}: ${content}`,
                server_id: server.id,
                channel_id: channel.id,
                is_read: false,
                icon: "📢",
              });
            }
          }
        });
    } else if (content) {
      const mentionRegex = /@(\S+)/g;
      let match;
      while ((match = mentionRegex.exec(content)) !== null) {
        const mentioned = match[1].toLowerCase();
        if (mentioned !== "everyone" && mentioned !== user.full_name?.toLowerCase()) {
        base44.entities.Notification.create({
          user_email: mentioned.includes("@") ? mentioned : `${mentioned}@matrix.app`,
          type: "mention",
          title: `@${user.full_name || "Quelqu'un"} t'a mentionné`,
          body: content,
          server_id: server.id,
          channel_id: channel.id,
          is_read: false,
        });
        }
      }
    }

    setInput("");
    setSending(false);
    trackActivity("send_message");
    qc.invalidateQueries({ queryKey });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    // Compress image to stay within field size limits
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 600;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
      await send(dataUrl);
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    img.src = objectUrl;
  };

  const deleteMessage = async (msg) => {
    if (msg.author_email !== user?.email && !isOwner) return;
    await base44.entities.ServerMessage.delete(msg.id);
    qc.invalidateQueries({ queryKey });
    toast.success("Message supprimé");
    setContextMenu(null);
  };

  const saveEdit = async () => {
    if (!editingMsg) return;
    await base44.entities.ServerMessage.update(editingMsg.id, { content: editingMsg.content });
    qc.invalidateQueries({ queryKey });
    setEditingMsg(null);
    toast.success("Message modifié");
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ msg, x: Math.min(e.clientX, window.innerWidth - 200), y: Math.min(e.clientY, window.innerHeight - 220) });
  };

  const accent = theme?.accent || "hsl(135 100% 50%)";

  // Group messages by author+time
  const grouped = messages.reduce((acc, msg, i) => {
    const prev = messages[i - 1];
    const isContinuation = prev && prev.author_email === msg.author_email &&
      new Date(msg.created_date) - new Date(prev.created_date) < 5 * 60 * 1000;
    acc.push({ ...msg, isContinuation });
    return acc;
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Channel header */}
      <div className="shrink-0 px-4 py-2.5 border-b flex items-center gap-2"
        style={{ borderColor: theme?.border || "hsl(var(--border))" }}>
        <Hash className="w-4 h-4 text-muted-foreground" />
        <span className="font-bold text-sm text-white">{channel.name}</span>
        <span className="text-xs text-muted-foreground ml-1">salon textuel</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-0.5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Hash className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-bold">Début de #{channel.name}</p>
            <p className="text-xs mt-1">Sois le premier à envoyer un message ici</p>
          </div>
        )}
        {grouped.map((msg) => (
          <div key={msg.id}
            className={cn("flex gap-3 group relative", msg.isContinuation ? "mt-0.5" : "mt-3")}
            onContextMenu={(e) => handleContextMenu(e, msg)}>
            {!msg.isContinuation ? (
              <NitroAvatar url={msg.author_avatar} name={msg.author_name} size="sm" className="mt-0.5 shrink-0" />
            ) : <div className="w-7 shrink-0" />}
            <div className="flex-1 min-w-0">
              {!msg.isContinuation && (
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-sm font-bold text-white">{msg.author_name || msg.author_email}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(msg.created_date), "HH:mm")}
                  </span>
                </div>
              )}
              {editingMsg?.id === msg.id ? (
                <div className="flex gap-2 items-center">
                  <input
                    value={editingMsg.content}
                    onChange={(e) => setEditingMsg(prev => ({ ...prev, content: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingMsg(null); }}
                    className="flex-1 bg-white/10 rounded-lg px-2 py-1 text-sm text-white outline-none border border-white/20"
                    autoFocus
                  />
                  <button onClick={saveEdit} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingMsg(null)} className="text-muted-foreground hover:text-white"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <p className="text-sm text-white/80 leading-relaxed break-words">
                  {msg.type === "file" && msg.file_url ? (
                    <img src={msg.file_url} alt="Uploaded" className="max-w-xs max-h-64 rounded-xl mb-1 border border-white/10" />
                  ) : msg.content.split(/(@\S+)/g).map((part, i) =>
                    part.startsWith("@")
                      ? <span key={i} className="font-bold px-1 rounded" style={{ color: accent, background: accent + "20" }}>{part}</span>
                      : <React.Fragment key={i}>{part}</React.Fragment>
                  )}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 px-4 rounded-2xl border"
          style={{ borderColor: theme?.border || "hsl(var(--border))", background: "rgba(255,255,255,0.05)" }}>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage || !canSendMessages}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition text-white/40 hover:text-white disabled:opacity-30"
            title="Envoyer une image">
            {uploadingImage ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <Image className="w-4 h-4" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={canSendMessages ? `Message #${channel.name}` : "Envoi désactivé dans ce salon"}
            disabled={!canSendMessages}
            className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-white/30 outline-none disabled:opacity-50"
          />
          <button onClick={() => send()} disabled={(!input.trim() || sending) && !uploadingImage}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition disabled:opacity-30"
            style={{ background: input.trim() ? accent + "30" : "transparent", color: accent }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[999] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          style={{ top: contextMenu.y, left: contextMenu.x, background: "hsl(var(--card))", minWidth: "180px" }}
          onClick={(e) => e.stopPropagation()}>
          <div className="p-2 flex gap-1 border-b border-white/10">
            {REACTIONS.map(emoji => (
              <button key={emoji} onClick={() => { toast.info(`Réaction ${emoji} ajoutée`); setContextMenu(null); }}
                className="text-xl hover:scale-125 transition p-0.5">{emoji}</button>
            ))}
          </div>
          {contextMenu.msg.author_email === user?.email && (
            <button
              onClick={() => { setEditingMsg({ id: contextMenu.msg.id, content: contextMenu.msg.content }); setContextMenu(null); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition">
              <Pencil className="w-4 h-4" /> Modifier
            </button>
          )}
          {(contextMenu.msg.author_email === user?.email || isOwner) && (
            <button
              onClick={() => deleteMessage(contextMenu.msg)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition">
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
}