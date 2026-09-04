import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Hash, Image, Trash2, Pencil, Check, X, Smile, Paperclip, File, Download, Reply, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { NitroAvatar } from "@/components/NitroAvatarPicker";
import { useProgression } from "@/context/ProgressionContext";
import UserProfilePopup from "@/components/profile/UserProfilePopup";

const EMOJI_LIST = ["😀","😂","🥰","😎","🤔","😢","😡","👍","👎","❤️","🔥","🎉","🎮","🏆","✨","💎","🚀","💯","🤣","😍","🤝","👏","🙌","💀","🫡","😴","🤯","🥳","😱","🤩"];

export default function ServerChat({ server, channel, theme, user }) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null); // { id, content }
  const [profileUser, setProfileUser] = useState(null); // { userId, email }
  const [replyTo, setReplyTo] = useState(null); // message being replied to
  const [showReactionPicker, setShowReactionPicker] = useState(null); // message id
  const fileInputRef = useRef(null);
  const docFileInputRef = useRef(null);
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

  const send = async (attachment = null) => {
    const content = input.trim();
    if ((!content && !attachment) || sending) return;
    if (!canSendMessages) { toast.error("Envoi de messages désactivé dans ce salon"); return; }
    if (attachment && !canSendImages) { toast.error("Les fichiers ne sont pas autorisés dans ce salon"); return; }
    if (content && content.includes("@everyone") && !canMentionEveryone) {
      toast.error("Vous n'êtes pas autorisé à mentionner @everyone");
      return;
    }
    setSending(true);
    await base44.entities.ServerMessage.create({
      server_id: server.id,
      channel_id: channel.id,
      author_email: user.email,
      author_name: user.full_name || user.email.split("@")[0],
      author_avatar: user.animated_avatar || user.avatar_url || "",
      content: content || (attachment ? attachment.name : ""),
      type: attachment ? "file" : "text",
      file_url: attachment?.url || "",
      file_name: attachment?.name || "",
      reply_to_id: replyTo?.id || "",
      reply_to_name: replyTo?.author_name || "",
      reply_to_content: replyTo?.content || "",
    });

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
    setReplyTo(null);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await send({ url: file_url, name: file.name });
    } catch {
      toast.error("Erreur lors de l'upload du fichier");
    } finally {
      setUploadingFile(false);
      if (docFileInputRef.current) docFileInputRef.current.value = "";
    }
  };

  const deleteMessage = async (msg) => {
    if (msg.author_email !== user?.email && !isOwner) return;
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "deleteServerMessage",
        messageId: msg.id,
      });
      if (res.data?.success) {
        qc.invalidateQueries({ queryKey });
        toast.success("Message supprimé");
      } else {
        toast.error(res.data?.error || "Suppression impossible");
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    }
    setContextMenu(null);
  };

  const saveEdit = async () => {
    if (!editingMsg) return;
    await base44.entities.ServerMessage.update(editingMsg.id, { content: editingMsg.content });
    qc.invalidateQueries({ queryKey });
    setEditingMsg(null);
    toast.success("Message modifié");
  };

  const toggleReaction = async (msg, emoji) => {
    const reactions = msg.reactions || [];
    const existing = reactions.find(r => r.emoji === emoji && r.user_email === user.email);
    let updated;
    if (existing) {
      updated = reactions.filter(r => !(r.emoji === emoji && r.user_email === user.email));
    } else {
      updated = [...reactions, { emoji, user_email: user.email, user_name: user.full_name || user.email.split("@")[0] }];
      trackActivity("like");
    }
    await base44.entities.ServerMessage.update(msg.id, { reactions: updated });
    qc.invalidateQueries({ queryKey });
    setShowReactionPicker(null);
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
        {grouped.map((msg) => {
          const msgReactions = msg.reactions || [];
          // Group reactions by emoji with count
          const reactionGroups = msgReactions.reduce((acc, r) => {
            const existing = acc.find(g => g.emoji === r.emoji);
            if (existing) { existing.count++; existing.users.push(r.user_email); }
            else acc.push({ emoji: r.emoji, count: 1, users: [r.user_email] });
            return acc;
          }, []);
          const isOwn = msg.author_email === user?.email;
          return (
          <div key={msg.id}
            className={cn("flex gap-3 group relative", msg.isContinuation ? "mt-0.5" : "mt-3")}
            onContextMenu={(e) => handleContextMenu(e, msg)}>
            {!msg.isContinuation ? (
              <NitroAvatar url={msg.author_avatar} name={msg.author_name} size="sm" className="mt-0.5 shrink-0" />
            ) : <div className="w-7 shrink-0" />}
            <div className="flex-1 min-w-0">
              {!msg.isContinuation && (
                <div className="flex items-baseline gap-2 mb-0.5">
                  <button
                    onClick={() => setProfileUser({ email: msg.author_email })}
                    className="text-sm font-bold text-white hover:underline">
                    {msg.author_name || msg.author_email}
                  </button>
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
                <div className="text-sm text-white/80 leading-relaxed break-words">
                  {/* Reply preview */}
                  {msg.reply_to_id && (
                    <div className="flex items-center gap-2 mb-1 pl-2 py-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", borderLeft: `2px solid ${accent}` }}>
                      <Reply className="w-3 h-3 shrink-0 text-white/30" />
                      <span className="text-[11px] font-bold" style={{ color: accent }}>{msg.reply_to_name}</span>
                      <span className="text-[11px] text-white/40 truncate max-w-[200px]">{msg.reply_to_content}</span>
                    </div>
                  )}
                  {msg.type === "file" && msg.file_url ? (
                    msg.file_url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) ? (
                      <img src={msg.file_url} alt="Uploaded" className="max-w-xs max-h-64 rounded-xl mb-1 border border-white/10" />
                    ) : (
                      <a href={msg.file_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl mb-1 transition hover:opacity-80"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <File className="w-4 h-4 shrink-0" style={{ color: accent }} />
                        <span className="text-xs text-white/80 truncate max-w-[200px]">{msg.file_name || "Fichier"}</span>
                        <Download className="w-3.5 h-3.5 shrink-0 text-white/40" />
                      </a>
                    )
                  ) : null}
                  {msg.content && msg.content !== msg.file_name && (
                    <p>{msg.content.split(/(@\S+)/g).map((part, i) =>
                      part.startsWith("@")
                        ? <span key={i} className="font-bold px-1 rounded" style={{ color: accent, background: accent + "20" }}>{part}</span>
                        : <React.Fragment key={i}>{part}</React.Fragment>
                    )}</p>
                  )}
                </div>
              )}

              {/* Reactions display */}
              {reactionGroups.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {reactionGroups.map(rg => {
                    const reacted = rg.users.includes(user.email);
                    return (
                      <button key={rg.emoji} onClick={() => toggleReaction(msg, rg.emoji)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition hover:scale-105"
                        style={{
                          background: reacted ? accent + "20" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${reacted ? accent + "50" : "rgba(255,255,255,0.1)"}`,
                        }}>
                        <span>{rg.emoji}</span>
                        <span className="text-white/60 font-bold">{rg.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Hover toolbar */}
              <div className="absolute -top-5 right-0 flex items-center gap-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition"
                style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="relative">
                  <button onClick={() => setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id)}
                    className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white transition"
                    title="Réagir">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                  {showReactionPicker === msg.id && (
                    <div className="absolute bottom-full left-0 mb-1 flex gap-1 p-1.5 rounded-xl z-50"
                      style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.1)" }}
                      onClick={(e) => e.stopPropagation()}>
                      {REACTIONS.map(emoji => (
                        <button key={emoji} onClick={() => toggleReaction(msg, emoji)}
                          className="text-lg hover:scale-125 transition p-0.5">{emoji}</button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setReplyTo(msg)}
                  className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white transition"
                  title="Répondre">
                  <Reply className="w-3.5 h-3.5" />
                </button>
                {isOwn && (
                  <button onClick={() => setEditingMsg({ id: msg.id, content: msg.content })}
                    className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white transition"
                    title="Modifier">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {(isOwn || isOwner) && (
                  <button onClick={() => deleteMessage(msg)}
                    className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-300 transition"
                    title="Supprimer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2 relative">
        {replyTo && (
          <div className="flex items-center gap-2 mb-1 px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", borderLeft: `2px solid ${accent}` }}>
            <Reply className="w-3 h-3 shrink-0 text-white/40" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold" style={{ color: accent }}>{replyTo.author_name}</span>
              <p className="text-[11px] text-white/40 truncate">{replyTo.content}</p>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-white/40 hover:text-white"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}
        {showEmojis && (
          <div className="absolute bottom-full left-4 mb-2 p-2 rounded-xl grid grid-cols-8 gap-1 z-50"
            style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.1)" }}>
            {EMOJI_LIST.map((emoji) => (
              <button key={emoji} onClick={() => { setInput(prev => prev + emoji); setShowEmojis(false); }}
                className="text-lg hover:scale-125 transition p-1">{emoji}</button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 px-4 rounded-2xl border"
          style={{ borderColor: theme?.border || "hsl(var(--border))", background: "rgba(255,255,255,0.05)" }}>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          <input type="file" ref={docFileInputRef} onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage || !canSendMessages}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition text-white/40 hover:text-white disabled:opacity-30"
            title="Envoyer une image">
            {uploadingImage ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <Image className="w-4 h-4" />}
          </button>
          <button onClick={() => docFileInputRef.current?.click()} disabled={uploadingFile || !canSendMessages}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition text-white/40 hover:text-white disabled:opacity-30"
            title="Envoyer un fichier">
            {uploadingFile ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <Paperclip className="w-4 h-4" />}
          </button>
          <button onClick={() => setShowEmojis(!showEmojis)} disabled={!canSendMessages}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition text-white/40 hover:text-white disabled:opacity-30"
            title="Emojis">
            <Smile className="w-4 h-4" />
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
              <button key={emoji} onClick={() => { toggleReaction(contextMenu.msg, emoji); setContextMenu(null); }}
                className="text-xl hover:scale-125 transition p-0.5">{emoji}</button>
            ))}
          </div>
          <button
            onClick={() => { setReplyTo(contextMenu.msg); setContextMenu(null); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition">
            <Reply className="w-4 h-4" /> Répondre
          </button>
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

      {/* User profile popup */}
      {profileUser && (
        <UserProfilePopup
          userId={profileUser.userId}
          userEmail={profileUser.email}
          open={!!profileUser}
          onClose={() => setProfileUser(null)}
          onOpenDm={() => setProfileUser(null)}
        />
      )}
    </div>
  );
}