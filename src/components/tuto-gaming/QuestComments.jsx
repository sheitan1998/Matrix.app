import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { MessageSquare, Send, Trash2, Reply, Loader2 } from "lucide-react";

export default function QuestComments({ questId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchComments = async () => {
    try {
      const all = await base44.entities.GameComment.filter({ quest_id: questId });
      setComments(all);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [questId]);

  const topLevel = comments
    .filter((c) => !c.parent_id)
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const getReplies = (parentId) =>
    comments
      .filter((c) => c.parent_id === parentId)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  const handlePost = async () => {
    if (!content.trim() || !currentUser) return;
    setPosting(true);
    try {
      await base44.entities.GameComment.create({
        quest_id: questId,
        author_email: currentUser.email,
        author_name: currentUser.full_name || currentUser.email.split("@")[0],
        author_avatar: currentUser.avatar_url || "",
        content: content.trim(),
      });
      setContent("");
      fetchComments();
    } catch {
      toast.error("Erreur lors de la publication");
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (parentId) => {
    if (!replyContent.trim() || !currentUser) return;
    setPosting(true);
    try {
      await base44.entities.GameComment.create({
        quest_id: questId,
        parent_id: parentId,
        author_email: currentUser.email,
        author_name: currentUser.full_name || currentUser.email.split("@")[0],
        author_avatar: currentUser.avatar_url || "",
        content: replyContent.trim(),
      });
      setReplyContent("");
      setReplyingTo(null);
      fetchComments();
    } catch {
      toast.error("Erreur lors de la publication");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await base44.entities.GameComment.delete(commentId);
      fetchComments();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const renderAvatar = (comment) => (
    <div
      className="w-7 h-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-black text-white"
      style={{ background: "linear-gradient(135deg, #BF5AF2, #7c3aed)" }}
    >
      {comment.author_avatar ? (
        <img src={comment.author_avatar} alt="" className="w-full h-full object-cover" />
      ) : (
        (comment.author_name?.[0]?.toUpperCase() || "J")
      )}
    </div>
  );

  const renderComment = (comment, isReply = false) => (
    <div
      key={comment.id}
      className={`flex items-start gap-2.5 p-3 rounded-lg ${
        isReply ? "ml-9" : ""
      }`}
      style={{
        background: "rgba(191,90,242,0.04)",
        border: isReply
          ? "1px solid rgba(191,90,242,0.08)"
          : "1px solid rgba(191,90,242,0.12)",
      }}
    >
      {renderAvatar(comment)}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold text-white truncate">
            {comment.author_name || "Joueur"}
          </span>
          {currentUser?.email === comment.author_email && (
            <button
              onClick={() => handleDelete(comment.id)}
              className="text-white/20 hover:text-red-400 transition tap-sm"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        <p className="text-xs text-white/60 leading-relaxed">{comment.content}</p>

        {/* Reply button */}
        {currentUser && !isReply && (
          <button
            onClick={() => {
              setReplyingTo(replyingTo === comment.id ? null : comment.id);
              setReplyContent("");
            }}
            className="flex items-center gap-1 mt-1.5 text-[10px] text-white/30 hover:text-[#BF5AF2] transition tap-sm"
          >
            <Reply className="w-2.5 h-2.5" />
            Répondre
          </button>
        )}

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="flex gap-1.5 mt-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReply(comment.id)}
              placeholder="Votre réponse..."
              maxLength={300}
              autoFocus
              className="flex-1 h-8 px-2.5 rounded-lg text-xs text-white placeholder:text-white/30 outline-none"
              style={{
                background: "rgba(191,90,242,0.05)",
                border: "1px solid rgba(191,90,242,0.15)",
              }}
            />
            <button
              onClick={() => handleReply(comment.id)}
              disabled={posting || !replyContent.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition tap-sm disabled:opacity-30"
              style={{ background: "rgba(191,90,242,0.15)", color: "#BF5AF2" }}
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Comment count */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4" style={{ color: "#BF5AF2" }} />
        <h3 className="text-sm font-black tracking-wider uppercase text-white">
          Commentaires ({comments.length})
        </h3>
      </div>

      {/* New comment input */}
      {currentUser ? (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePost()}
            placeholder="Partagez votre astuce, votre expérience..."
            maxLength={500}
            className="flex-1 h-10 px-3 rounded-lg text-sm text-white placeholder:text-white/30 outline-none"
            style={{
              background: "rgba(191,90,242,0.05)",
              border: "1px solid rgba(191,90,242,0.2)",
            }}
          />
          <button
            onClick={handlePost}
            disabled={posting || !content.trim()}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition tap-sm disabled:opacity-30"
            style={{
              background: "linear-gradient(135deg, #BF5AF2, #7c3aed)",
              color: "#fff",
            }}
          >
            {posting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      ) : (
        <div
          className="p-3 rounded-lg mb-4 text-center"
          style={{
            background: "rgba(191,90,242,0.05)",
            border: "1px solid rgba(191,90,242,0.12)",
          }}
        >
          <p className="text-xs text-white/40">
            Connectez-vous pour publier un commentaire et participer à l'entraide
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-white/30" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-white/30">
            Aucun commentaire pour le moment. Soyez le premier à partager !
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topLevel.map((comment) => (
            <div key={comment.id}>
              {renderComment(comment)}
              <div className="space-y-2 mt-2">
                {getReplies(comment.id).map((reply) => renderComment(reply, true))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}