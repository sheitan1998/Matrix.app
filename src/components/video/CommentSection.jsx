import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { fetchYouTube, mergeYouTubeLocal } from "@/hooks/useYouTube";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatTimeAgo } from "@/lib/format";
import { Crown, ThumbsUp } from "lucide-react";

export default function CommentSection({ videoId, user }) {
  const [text, setText] = useState("");
  const qc = useQueryClient();

  const { data: comments } = useQuery({
    queryKey: ["comments", videoId],
    queryFn: async () => {
      const [local, yt] = await Promise.all([
        base44.entities.Comment.filter({ video_id: videoId }, "-created_date", 100),
        fetchYouTube("comments", { videoId, maxResults: 100 }),
      ]);
      return mergeYouTubeLocal(yt, local);
    },
    initialData: [],
    enabled: !!videoId,
  });

  const submit = async () => {
    if (!text.trim() || !user) return;
    await base44.entities.Comment.create({
      video_id: videoId,
      author_email: user.email,
      author_name: user.full_name,
      author_avatar: user.avatar_url,
      content: text.trim(),
      is_premium: !!user.is_premium,
    });
    setText("");
    qc.invalidateQueries({ queryKey: ["comments", videoId] });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">{comments.length} commentaires</h2>

      {user && (
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 shrink-0 flex items-center justify-center text-sm font-bold text-primary-foreground">
            {user.full_name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 space-y-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ajoute un commentaire..."
              className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 resize-none"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setText("")}>Annuler</Button>
              <Button size="sm" onClick={submit} disabled={!text.trim()} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                Commenter
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary shrink-0 overflow-hidden">
              {c.author_avatar ? (
                <img src={c.author_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                  {c.author_name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{c.author_name || "Utilisateur"}</span>
                {c.is_premium && <Crown className="w-3.5 h-3.5 text-premium" />}
                <span className="text-xs text-muted-foreground">{formatTimeAgo(c.created_date)}</span>
              </div>
              <p className="text-sm mt-0.5 whitespace-pre-wrap">{c.content}</p>
              <button className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{c.likes || 0}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}