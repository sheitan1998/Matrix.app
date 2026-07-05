import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Trash2 } from "lucide-react";
import { formatTimeAgo } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProgression } from "@/context/ProgressionContext";

const COMMENT_REACTIONS = ["❤️", "😂", "🔥", "👏", "😮"];

export default function PostComments({ postId, user }) {
  const [text, setText] = useState("");
  const [reactions, setReactions] = useState({});
  const [myReactions, setMyReactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("matrix_comment_reactions") || "{}"); } catch { return {}; }
  });
  const qc = useQueryClient();
  const { trackActivity } = useProgression();

  const { data: comments = [] } = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: () => base44.entities.PostComment.filter({ post_id: postId }, "created_date", 50),
  });

  useEffect(() => {
    if (comments.length > 0) {
      const serverReactions = {};
      comments.forEach(c => { if (c.reactions) serverReactions[c.id] = c.reactions; });
      setReactions(prev => ({ ...serverReactions, ...prev }));
    }
  }, [comments]);

  const toggleCommentReaction = (commentId, emoji) => {
    const currentReactions = myReactions[commentId] || [];
    const commentReactions = reactions[commentId] || {};
    const hasEmoji = currentReactions.includes(emoji);

    let newMyReactions;
    let updatedReactions;
    if (hasEmoji) {
      newMyReactions = currentReactions.filter(e => e !== emoji);
      updatedReactions = { ...commentReactions, [emoji]: Math.max(0, (commentReactions[emoji] || 0) - 1) };
    } else {
      newMyReactions = [...currentReactions, emoji];
      updatedReactions = { ...commentReactions, [emoji]: (commentReactions[emoji] || 0) + 1 };
    }

    setReactions((r) => ({ ...r, [commentId]: updatedReactions }));
    const newMyAll = { ...myReactions, [commentId]: newMyReactions };
    setMyReactions(newMyAll);
    localStorage.setItem("matrix_comment_reactions", JSON.stringify(newMyAll));
    base44.entities.PostComment.update(commentId, { reactions: updatedReactions }).catch(() => {});
  };

  const send = async () => {
    if (!text.trim() || !user) return;
    await base44.entities.PostComment.create({
      post_id: postId,
      author_email: user.email,
      author_name: user.full_name,
      author_avatar: user.avatar_url,
      content: text.trim(),
    });
    const posts = await base44.entities.Post.filter({ id: postId });
    if (posts[0]) await base44.entities.Post.update(postId, { comments_count: (posts[0].comments_count || 0) + 1 });
    setText("");
    qc.invalidateQueries({ queryKey: ["post-comments", postId] });
    qc.invalidateQueries({ queryKey: ["posts"] });
    trackActivity("comment");
  };

  const deleteComment = async (comment) => {
    await base44.entities.PostComment.delete(comment.id);
    const posts = await base44.entities.Post.filter({ id: postId });
    if (posts[0]) await base44.entities.Post.update(postId, { comments_count: Math.max(0, (posts[0].comments_count || 1) - 1) });
    qc.invalidateQueries({ queryKey: ["post-comments", postId] });
    qc.invalidateQueries({ queryKey: ["posts"] });
    toast.success("Commentaire supprimé");
  };

  return (
    <div className="border-t border-border bg-secondary/20 px-4 py-4 space-y-3">
      {comments.map((c) => {
        const isOwn = user?.email === c.author_email;
        return (
          <div key={c.id} className="flex gap-2.5 text-sm group">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
              {c.author_avatar ? <img src={c.author_avatar} alt="" className="w-full h-full object-cover" /> : (c.author_name?.[0] || "?")}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-xs">{c.author_name}</span>
                <span className="text-[10px] text-muted-foreground">{formatTimeAgo(c.created_date)}</span>
              </div>
              <p className="text-muted-foreground text-xs mt-0.5">{c.content}</p>
              {/* Comment reactions */}
              <div className="flex gap-0.5 flex-wrap mt-1.5">
                {COMMENT_REACTIONS.map(emoji => {
                  const count = reactions[c.id]?.[emoji] || 0;
                  const active = (myReactions[c.id] || []).includes(emoji);
                  if (count === 0 && !active) return null;
                  return (
                    <button key={emoji}
                      onClick={() => user && toggleCommentReaction(c.id, emoji)}
                      className={cn("flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] transition hover:scale-110",
                        active ? "bg-premium/20 border border-premium/30" : "hover:bg-secondary/60 border border-transparent")}>
                      <span>{emoji}</span>
                      {count > 0 && <span className="text-[9px] text-muted-foreground font-mono">{count}</span>}
                    </button>
                  );
                })}
                <button onClick={() => user && toggleCommentReaction(c.id, COMMENT_REACTIONS[0])}
                  className="px-1.5 py-0.5 rounded-full text-[10px] text-muted-foreground hover:bg-secondary/60 transition">+</button>
              </div>
            </div>
            {isOwn && (
              <button
                onClick={() => deleteComment(c)}
                className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
      {user && (
        <div className="flex gap-2 pt-1">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ajouter un commentaire..."
            className="flex-1 h-8 rounded-lg bg-secondary/60 border border-border px-3 text-xs"
          />
          <button onClick={send} className="px-3 h-8 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}