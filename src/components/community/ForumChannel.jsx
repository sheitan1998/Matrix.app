import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Plus, Pin, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

export default function ForumChannel({ channel, server, theme, user }) {
  const [threads, setThreads] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [creating, setCreating] = useState(false);

  const accent = theme?.accent || "hsl(var(--primary))";

  useEffect(() => {
    if (!channel?.id || !server?.id) return;
    base44.entities.ServerMessage.filter({ server_id: server.id, channel_id: channel.id, is_thread_starter: true }, "-created_date", 100)
      .then(setThreads)
      .catch(() => setThreads([]));
  }, [channel?.id, server?.id]);

  const createThread = async (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !user) return;
    setCreating(true);
    try {
      const msg = await base44.entities.ServerMessage.create({
        server_id: server.id,
        channel_id: channel.id,
        author_email: user.email,
        author_name: user.full_name || user.email?.split("@")[0],
        author_avatar: user.avatar_url || "",
        content: newThreadContent.trim() || newThreadTitle.trim(),
        is_thread_starter: true,
        thread_title: newThreadTitle.trim(),
        thread_replies: 0,
        thread_pinned: false,
      });
      setThreads(prev => [msg, ...prev]);
      setNewThreadTitle("");
      setNewThreadContent("");
      setShowCreate(false);
      toast.success("Discussion créée !");
    } catch {
      toast.error("Erreur lors de la création");
    }
    setCreating(false);
  };

  const togglePin = async (thread) => {
    try {
      await base44.entities.ServerMessage.update(thread.id, { thread_pinned: !thread.thread_pinned });
      setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, thread_pinned: !t.thread_pinned } : t));
    } catch {}
  };

  const sortedThreads = [...threads].sort((a, b) => (b.thread_pinned ? 1 : 0) - (a.thread_pinned ? 1 : 0));

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: theme?.border || "hsl(var(--border))" }}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accent + "20" }}>
            <MessageSquare className="w-4 h-4" style={{ color: accent }} />
          </div>
          <div>
            <h2 className="font-black text-white text-sm">{channel?.name}</h2>
            {channel?.topic && <p className="text-[11px] text-muted-foreground">{channel.topic}</p>}
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition hover:opacity-90 tap-sm"
          style={{ background: accent }}
        >
          <Plus className="w-3.5 h-3.5" /> Nouvelle discussion
        </button>
      </div>

      {/* Create thread form */}
      {showCreate && (
        <form onSubmit={createThread} className="rounded-2xl p-4 space-y-3" style={{ background: theme?.card + "40" || "rgba(0,0,0,0.2)", border: `1px solid ${accent}30` }}>
          <input
            value={newThreadTitle}
            onChange={e => setNewThreadTitle(e.target.value)}
            autoFocus
            placeholder="Titre de la discussion"
            className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-white placeholder:text-muted-foreground outline-none text-sm focus:border-primary"
          />
          <textarea
            value={newThreadContent}
            onChange={e => setNewThreadContent(e.target.value)}
            rows={3}
            placeholder="Contenu (optionnel)"
            className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-white placeholder:text-muted-foreground outline-none text-sm focus:border-primary resize-none"
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-white transition">
              Annuler
            </button>
            <button type="submit" disabled={!newThreadTitle.trim() || creating} className="flex-1 py-2 rounded-xl font-bold text-xs text-white transition disabled:opacity-50" style={{ background: accent }}>
              {creating ? "Création..." : "Créer la discussion"}
            </button>
          </div>
        </form>
      )}

      {/* Thread list */}
      <div className="space-y-2">
        {sortedThreads.map(thread => (
          <div key={thread.id} className="rounded-2xl p-3 transition hover:bg-white/5" style={{ background: theme?.card + "20" || "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shrink-0" style={{ background: accent + "20", border: `1px solid ${accent}40` }}>
                {thread.author_avatar ? <img src={thread.author_avatar} className="w-full h-full object-cover" alt="" /> : <span className="text-white">{(thread.author_name || "?")[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white truncate">{thread.thread_title}</p>
                  {thread.thread_pinned && <Pin className="w-3 h-3 text-yellow-400 shrink-0" fill="currentColor" />}
                </div>
                <p className="text-[10px] text-muted-foreground">{thread.author_name} · {thread.thread_replies || 0} réponse{(thread.thread_replies || 0) > 1 ? "s" : ""}</p>
                {thread.content && <p className="text-xs text-white/70 mt-1 line-clamp-2">{thread.content}</p>}
              </div>
              {server?.owner_email === user?.email && (
                <button onClick={() => togglePin(thread)} className="text-muted-foreground hover:text-yellow-400 transition shrink-0 tap-sm" title="Épingler">
                  <Pin className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {threads.length === 0 && !showCreate && (
          <div className="text-center py-12">
            <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mt-2">Aucune discussion pour le moment</p>
            <p className="text-[11px] text-muted-foreground/60">Crée la première discussion !</p>
          </div>
        )}
      </div>
    </div>
  );
}