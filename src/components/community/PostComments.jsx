import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { formatTimeAgo } from "@/lib/format";

export default function PostComments({ postId, user }) {
  const [text, setText] = useState("");
  const qc = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: () => base44.entities.PostComment.filter({ post_id: postId }, "created_date", 50),
  });

  const send = async () => {
    if (!text.trim() || !user) return;
    await base44.entities.PostComment.create({
      post_id: postId,
      author_email: user.email,
      author_name: user.full_name,
      author_avatar: user.avatar_url,
      content: text.trim(),
    });
    // bump count
    const posts = await base44.entities.Post.filter({ id: postId });
    if (posts[0]) await base44.entities.Post.update(postId, { comments_count: (posts[0].comments_count || 0) + 1 });
    setText("");
    qc.invalidateQueries({ queryKey: ["post-comments", postId] });
    qc.invalidateQueries({ queryKey: ["posts"] });
  };

  return (
    <div className="border-t border-border bg-secondary/20 px-4 py-4 space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-2.5 text-sm">
          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
            {c.author_avatar ? <img src={c.author_avatar} alt="" className="w-full h-full object-cover" /> : (c.author_name?.[0] || "?")}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-xs">{c.author_name}</span>
              <span className="text-[10px] text-muted-foreground">{formatTimeAgo(c.created_date)}</span>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">{c.content}</p>
          </div>
        </div>
      ))}
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