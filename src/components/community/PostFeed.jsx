import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, ImagePlus, X, Trash2 } from "lucide-react";
import { formatTimeAgo } from "@/lib/format";
import PostComments from "./PostComments";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const REACTIONS = ["❤️", "😂", "🔥", "👏", "😮", "😢"];

export default function PostFeed() {
  const [user, setUser] = useState(null);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [reactions, setReactions] = useState({}); // { postId: { emoji: count } }
  const [myReactions, setMyReactions] = useState({}); // { postId: emoji }
  const [openComments, setOpenComments] = useState(null);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 40),
  });

  const createPost = useMutation({
    mutationFn: () =>
      base44.entities.Post.create({
        author_email: user.email,
        author_name: user.full_name,
        author_avatar: user.avatar_url,
        content: text.trim(),
        image_url: imageUrl.trim() || undefined,
        likes: 0,
        comments_count: 0,
      }),
    onSuccess: () => {
      setText("");
      setImageUrl("");
      setShowImageInput(false);
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const deletePost = async (postId) => {
    await base44.entities.Post.delete(postId);
    qc.invalidateQueries({ queryKey: ["posts"] });
    toast.success("Post supprimé");
  };

  const toggleReaction = (postId, emoji) => {
    const current = myReactions[postId];
    const postReactions = reactions[postId] || {};

    if (current === emoji) {
      // remove
      const updated = { ...postReactions, [emoji]: Math.max(0, (postReactions[emoji] || 0) - 1) };
      setReactions((r) => ({ ...r, [postId]: updated }));
      setMyReactions((m) => { const n = { ...m }; delete n[postId]; return n; });
    } else {
      const updated = { ...postReactions };
      if (current) updated[current] = Math.max(0, (updated[current] || 0) - 1);
      updated[emoji] = (updated[emoji] || 0) + 1;
      setReactions((r) => ({ ...r, [postId]: updated }));
      setMyReactions((m) => ({ ...m, [postId]: emoji }));
    }
  };

  const getReactionCount = (postId, emoji) => reactions[postId]?.[emoji] || 0;

  return (
    <div className="space-y-6">
      {/* Create post */}
      {user && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0">
              {user.full_name?.[0] || "U"}
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Quoi de neuf ?"
              rows={3}
              className="resize-none bg-secondary/60 border-border flex-1"
            />
          </div>
          {showImageInput && (
            <div className="flex gap-2">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL de l'image..."
                className="flex-1 h-9 rounded-md border border-input bg-secondary/60 px-3 text-sm"
              />
              <button onClick={() => { setShowImageInput(false); setImageUrl(""); }}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
          )}
          {imageUrl && (
            <img src={imageUrl} alt="" className="rounded-xl max-h-64 object-cover w-full" onError={(e) => e.target.style.display = "none"} />
          )}
          <div className="flex items-center justify-between">
            <button onClick={() => setShowImageInput((s) => !s)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
              <ImagePlus className="w-4 h-4" /> Image
            </button>
            <Button
              onClick={() => createPost.mutate()}
              disabled={!text.trim() || createPost.isPending}
              className="rounded-full h-9 px-5 bg-foreground text-background hover:bg-foreground/90 font-semibold"
            >
              Publier
            </Button>
          </div>
        </div>
      )}

      {/* Posts */}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-8">Chargement...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Aucune publication. Sois le premier !</p>
      ) : (
        posts.map((post) => {
          const isOwn = user?.email === post.author_email;
          return (
            <div key={post.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                    {post.author_avatar ? <img src={post.author_avatar} alt="" className="w-full h-full object-cover" /> : (post.author_name?.[0] || "?")}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{post.author_name || "Anonyme"}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(post.created_date)}</p>
                  </div>
                  {isOwn && (
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                {post.image_url && (
                  <img src={post.image_url} alt="" className="mt-3 rounded-xl w-full max-h-96 object-cover" onError={(e) => e.target.style.display = "none"} />
                )}
              </div>

              {/* Reactions */}
              <div className="px-4 pb-2 flex gap-1 flex-wrap">
                {REACTIONS.map((emoji) => {
                  const count = getReactionCount(post.id, emoji);
                  const active = myReactions[post.id] === emoji;
                  return (
                    <button
                      key={emoji}
                      onClick={() => user && toggleReaction(post.id, emoji)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-sm transition hover:scale-110",
                        active
                          ? "bg-premium/20 border border-premium/40"
                          : "hover:bg-secondary/60 border border-transparent"
                      )}
                    >
                      <span>{emoji}</span>
                      {count > 0 && <span className="text-xs text-muted-foreground font-mono">{count}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex items-center gap-3">
                <button
                  onClick={() => setOpenComments(openComments === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  {post.comments_count || 0} commentaires
                </button>
              </div>

              {openComments === post.id && <PostComments postId={post.id} user={user} />}
            </div>
          );
        })
      )}
    </div>
  );
}