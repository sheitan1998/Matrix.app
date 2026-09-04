import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, ImagePlus, X, Trash2, Pencil, Check, Video as VideoIcon } from "lucide-react";
import { formatTimeAgo } from "@/lib/format";
import PostComments from "./PostComments";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useProgression } from "@/context/ProgressionContext";

const REACTIONS = ["❤️", "😂", "🔥", "👏", "😮", "😢"];

export default function PostFeed() {
  const [user, setUser] = useState(null);
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null); // base64
  const [videoPreview, setVideoPreview] = useState(null);
  const [reactions, setReactions] = useState({});
  const [myReactions, setMyReactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("matrix_my_reactions") || "{}"); } catch { return {}; }
  });
  const [openComments, setOpenComments] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // { postId, x, y }
  const [editingPost, setEditingPost] = useState(null);
  const [emojiPickerPost, setEmojiPickerPost] = useState(null);
  const [lastPostTime, setLastPostTime] = useState(0);
  const [postCooldown, setPostCooldown] = useState(30); // seconds, admin can change
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const fileRef = useRef(null);
  const videoFileRef = useRef(null);
  const qc = useQueryClient();
  const cooldownRef = useRef(null);
  const { trackActivity } = useProgression();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const close = () => { setContextMenu(null); setEmojiPickerPost(null); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 40),
  });

  // Sync reactions from server data
  useEffect(() => {
    if (posts.length > 0) {
      const serverReactions = {};
      posts.forEach(p => { if (p.reactions) serverReactions[p.id] = p.reactions; });
      setReactions(prev => ({ ...serverReactions, ...prev }));
    }
  }, [posts]);

  const createPost = useMutation({
    mutationFn: () =>
      base44.entities.Post.create({
        author_email: user.email,
        author_name: user.full_name,
        author_avatar: user.avatar_url,
        author_role: user.role === "admin" ? "admin" : "user",
        content: text.trim(),
        image_url: imagePreview || undefined,
        video_url: videoPreview || undefined,
        likes: 0,
        comments_count: 0,
      }),
    onSuccess: () => {
      setText("");
      setImagePreview(null);
      setVideoPreview(null);
      setLastPostTime(Date.now());
      qc.invalidateQueries({ queryKey: ["posts"] });
      trackActivity("posts_created");
    },
  });

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    const objUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      const MAX = 1200;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      setImagePreview(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.src = objUrl;
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleVideoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error("Vidéo trop lourde (max 50MB)"); return; }
    toast.info("Import vidéo...");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setVideoPreview(file_url);
      toast.success("Vidéo importée !");
    } catch (err) { toast.error("Erreur d'import vidéo"); }
    if (fileRef.current) fileRef.current.value = "";
  };

  const deletePost = async (postId) => {
    await base44.entities.Post.delete(postId);
    qc.invalidateQueries({ queryKey: ["posts"] });
    toast.success("Post supprimé");
    setContextMenu(null);
  };

  const saveEdit = async () => {
    if (!editingPost) return;
    await base44.entities.Post.update(editingPost.id, { content: editingPost.content });
    qc.invalidateQueries({ queryKey: ["posts"] });
    setEditingPost(null);
    toast.success("Post modifié");
  };

  const toggleReaction = (postId, emoji) => {
    const currentReactions = myReactions[postId] || [];
    const postReactions = reactions[postId] || {};
    const hasEmoji = currentReactions.includes(emoji);

    let newMyReactions;
    let updatedReactions;
    if (hasEmoji) {
      newMyReactions = currentReactions.filter(e => e !== emoji);
      updatedReactions = { ...postReactions, [emoji]: Math.max(0, (postReactions[emoji] || 0) - 1) };
    } else {
      newMyReactions = [...currentReactions, emoji];
      updatedReactions = { ...postReactions, [emoji]: (postReactions[emoji] || 0) + 1 };
    }

    setReactions((r) => ({ ...r, [postId]: updatedReactions }));
    const newMyAll = { ...myReactions, [postId]: newMyReactions };
    setMyReactions(newMyAll);
    localStorage.setItem("matrix_my_reactions", JSON.stringify(newMyAll));

    // Persist to entity
    base44.entities.Post.update(postId, { reactions: updatedReactions }).catch(() => {});
    if (!hasEmoji) trackActivity("like");
    setEmojiPickerPost(null);
    setContextMenu(null);
  };

  const isAdmin = user?.role === "admin";

  // Cooldown timer
  useEffect(() => {
    if (lastPostTime > 0) {
      cooldownRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lastPostTime) / 1000);
        const left = Math.max(0, postCooldown - elapsed);
        setCooldownLeft(left);
        if (left <= 0) { clearInterval(cooldownRef.current); setLastPostTime(0); }
      }, 100);
      return () => clearInterval(cooldownRef.current);
    }
  }, [lastPostTime, postCooldown]);

  const canPost = lastPostTime === 0 || cooldownLeft <= 0;

  const getReactionCount = (postId, emoji) => reactions[postId]?.[emoji] || 0;

  const handleContextMenu = (e, post) => {
    e.preventDefault();
    e.stopPropagation();
    if (post.author_email !== user?.email && !isAdmin) return;
    setContextMenu({ postId: post.id, post, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="space-y-6">
      {/* Create post */}
      {user && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0 relative">
              {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" alt="" /> : (user.full_name?.[0] || "U")}
              {isAdmin && (
                <span className="absolute -top-1 -right-1 text-[9px] font-black px-1 rounded-full" style={{ background: "#ffd700", color: "#000" }}>A</span>
              )}
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Quoi de neuf ?"
              rows={3}
              className="resize-none bg-secondary/60 border-border flex-1"
            />
          </div>
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="" className="rounded-xl max-h-64 object-cover w-full" />
              <button onClick={() => setImagePreview(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
          {videoPreview && (
            <div className="relative">
              <video src={videoPreview} controls className="rounded-xl max-h-64 w-full" />
              <button onClick={() => setVideoPreview(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
                <ImagePlus className="w-4 h-4" /> Photo
              </button>
              <button onClick={() => videoFileRef.current?.click()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
                <VideoIcon className="w-4 h-4" /> Vidéo
              </button>
              <input ref={videoFileRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
            </div>
            {isAdmin && (
              <select value={postCooldown} onChange={(e) => setPostCooldown(parseInt(e.target.value))}
                className="text-xs rounded-lg bg-secondary/60 border-border px-2 py-1 outline-none text-muted-foreground">
                <option value="0">0s</option>
                <option value="10">10s</option>
                <option value="30">30s</option>
                <option value="60">60s</option>
                <option value="120">120s</option>
              </select>
            )}
            <Button
              onClick={() => createPost.mutate()}
              disabled={!text.trim() || createPost.isPending || (!canPost && !isAdmin)}
              className="rounded-full h-9 px-5 bg-foreground text-background hover:bg-foreground/90 font-semibold"
            >
              {!canPost && !isAdmin ? `⏳ ${cooldownLeft}s` : "Publier"}
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
          const canManage = isOwn || isAdmin;
          const postAuthorIsAdmin = post.author_email && (
            // We mark admin posts with a flag stored in image_url starting with __admin
            post.is_admin === true
          );
          return (
            <div key={post.id} className="rounded-2xl border border-border bg-card overflow-hidden"
              onContextMenu={(e) => canManage && handleContextMenu(e, post)}>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                    {post.author_avatar ? <img src={post.author_avatar} alt="" className="w-full h-full object-cover" /> : (post.author_name?.[0] || "?")}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm" style={post.author_role === "admin" ? { color: "#ffd700" } : {}}>
                        {post.author_name || "Anonyme"}
                      </p>
                      {post.author_role === "admin" && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "#ffd700", color: "#000" }}>
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(post.created_date)}</p>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      {isOwn && (
                        <button onClick={() => setEditingPost({ id: post.id, content: post.content })}
                          className="p-1.5 rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-white">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => deletePost(post.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {editingPost?.id === post.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingPost.content}
                      onChange={(e) => setEditingPost(prev => ({ ...prev, content: e.target.value }))}
                      rows={3}
                      className="resize-none bg-secondary/60 border-border w-full"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}><Check className="w-3.5 h-3.5 mr-1" /> Sauvegarder</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingPost(null)}>Annuler</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                )}

                {post.image_url && !post.image_url.startsWith("__") && (
                  <img src={post.image_url} alt="" className="mt-3 rounded-xl w-full max-h-[500px] object-contain bg-black/20" onError={(e) => e.target.style.display = "none"} />
                )}
                {post.video_url && (
                  <video src={post.video_url} controls className="mt-3 rounded-xl w-full max-h-[500px] bg-black/40" />
                )}
              </div>

              {/* Reactions */}
              <div className="px-4 pb-2 flex gap-1 flex-wrap">
                {REACTIONS.map((emoji) => {
                  const count = getReactionCount(post.id, emoji);
                  const active = (myReactions[post.id] || []).includes(emoji);
                  return (
                    <button key={emoji}
                      onClick={() => user && toggleReaction(post.id, emoji)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-sm transition hover:scale-110",
                        active ? "bg-premium/20 border border-premium/40" : "hover:bg-secondary/60 border border-transparent"
                      )}>
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
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
                  <MessageCircle className="w-4 h-4" />
                  {post.comments_count || 0} commentaires
                </button>
              </div>

              {openComments === post.id && <PostComments postId={post.id} user={user} />}
            </div>
          );
        })
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[999] rounded-2xl overflow-hidden shadow-2xl border border-border"
          style={{ top: contextMenu.y, left: contextMenu.x, background: "hsl(var(--card))", minWidth: "180px" }}
          onClick={(e) => e.stopPropagation()}>
          {/* Emoji reactions */}
          <div className="p-2 flex gap-1 border-b border-border">
            {REACTIONS.map(emoji => (
              <button key={emoji} onClick={() => toggleReaction(contextMenu.postId, emoji)}
                className="text-xl hover:scale-125 transition p-1">{emoji}</button>
            ))}
          </div>
          {contextMenu.post.author_email === user?.email && (
            <button
              onClick={() => { setEditingPost({ id: contextMenu.postId, content: contextMenu.post.content }); setContextMenu(null); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-secondary transition">
              <Pencil className="w-4 h-4" /> Modifier
            </button>
          )}
          <button
            onClick={() => deletePost(contextMenu.postId)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition">
            <Trash2 className="w-4 h-4" /> Supprimer
          </button>
        </div>
      )}
    </div>
  );
}