import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  MessageSquare, Send, Trash2, Reply, Loader2,
  ThumbsUp, Flag, ChevronDown,
} from "lucide-react";

export default function QuestComments({ questId, wikiEntryId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  const fetchData = useCallback(async () => {
    try {
      const commentFilter = questId ? { quest_id: questId } : { wiki_entry_id: wikiEntryId };
      const allComments = await base44.entities.GameComment.filter(commentFilter);

      const voteFilter = questId ? { quest_id: questId } : { wiki_entry_id: wikiEntryId };
      const allVotes = await base44.entities.CommentVote.filter(voteFilter);

      setComments(allComments);
      setVotes(allVotes);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [questId, wikiEntryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getUpvotes = (commentId) =>
    votes.filter((v) => v.comment_id === commentId && v.type === "upvote");
  const hasUpvoted = (commentId) =>
    currentUser
      ? votes.some(
          (v) => v.comment_id === commentId && v.user_email === currentUser.email && v.type === "upvote"
        )
      : false;
  const hasReported = (commentId) =>
    currentUser
      ? votes.some(
          (v) => v.comment_id === commentId && v.user_email === currentUser.email && v.type === "report"
        )
      : false;

  const handlePost = async () => {
    if (!content.trim() || !currentUser) return;
    setPosting(true);
    try {
      await base44.entities.GameComment.create({
        quest_id: questId || undefined,
        wiki_entry_id: wikiEntryId || undefined,
        author_email: currentUser.email,
        author_name: currentUser.full_name || currentUser.email.split("@")[0],
        author_avatar: currentUser.avatar_url || "",
        content: content.trim(),
      });
      setContent("");
      fetchData();
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
        quest_id: questId || undefined,
        wiki_entry_id: wikiEntryId || undefined,
        parent_id: parentId,
        author_email: currentUser.email,
        author_name: currentUser.full_name || currentUser.email.split("@")[0],
        author_avatar: currentUser.avatar_url || "",
        content: replyContent.trim(),
      });
      setReplyContent("");
      setReplyingTo(null);
      fetchData();
    } catch {
      toast.error("Erreur lors de la publication");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await base44.entities.GameComment.delete(commentId);
      fetchData();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleUpvote = async (commentId) => {
    if (!currentUser) return;
    if (hasUpvoted(commentId)) {
      const existing = votes.find(
        (v) => v.comment_id === commentId && v.user_email === currentUser.email && v.type === "upvote"
      );
      if (existing) {
        await base44.entities.CommentVote.delete(existing.id);
        fetchData();
      }
    } else {
      try {
        await base44.entities.CommentVote.create({
          comment_id: commentId,
          quest_id: questId || undefined,
          wiki_entry_id: wikiEntryId || undefined,
          user_email: currentUser.email,
          type: "upvote",
        });
        fetchData();
      } catch {
        toast.error("Erreur");
      }
    }
  };

  const handleReport = async (commentId) => {
    if (!currentUser || hasReported(commentId)) return;
    try {
      await base44.entities.CommentVote.create({
        comment_id: commentId,
        quest_id: questId || undefined,
        wiki_entry_id: wikiEntryId || undefined,
        user_email: currentUser.email,
        type: "report",
      });
      toast.success("Commentaire signalé. Merci pour votre contribution !");
      fetchData();
    } catch {
      toast.error("Erreur");
    }
  };

  const topLevel = comments.filter((c) => !c.parent_id);
  const sorted = [...topLevel].sort((a, b) => {
    if (sortBy === "popular") {
      return getUpvotes(b.id).length - getUpvotes(a.id).length;
    }
    return new Date(b.created_date) - new Date(a.created_date);
  });
  const getReplies = (parentId) =>
    comments
      .filter((c) => c.parent_id === parentId)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  const renderAvatar = (comment) => (
    <div
      className="w-7 h-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-black text-white"
      style={{ background: "linear-gradient(135deg, #BF5AF2, #7c3aed)" }}
    >
      {comment.author_avatar ? (
        <img src={comment.author_avatar} alt="" className="w-full h-full object-cover" />
      ) : (
        comment.author_name?.[0]?.toUpperCase() || "J"
      )}
    </div>
  );

  const renderComment = (comment, isReply = false) => {
    const upvoteCount = getUpvotes(comment.id).length;
    const userUpvoted = hasUpvoted(comment.id);
    const userReported = hasReported(comment.id);

    return (
      <div
        key={comment.id}
        className={`flex items-start gap-2.5 p-3 rounded-lg ${isReply ? "ml-9" : ""}`}
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

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1.5">
            {/* Upvote */}
            {currentUser && (
              <button
                onClick={() => handleUpvote(comment.id)}
                className="flex items-center gap-1 text-[10px] transition tap-sm"
                style={{ color: userUpvoted ? "#BF5AF2" : "rgba(255,255,255,0.3)" }}
              >
                <ThumbsUp className="w-3 h-3" fill={userUpvoted ? "#BF5AF2" : "none"} />
                {upvoteCount > 0 && upvoteCount}
              </button>
            )}

            {/* Reply */}
            {currentUser && !isReply && (
              <button
                onClick={() => {
                  setReplyingTo(replyingTo === comment.id ? null : comment.id);
                  setReplyContent("");
                }}
                className="flex items-center gap-1 text-[10px] text-white/30 hover:text-[#BF5AF2] transition tap-sm"
              >
                <Reply className="w-2.5 h-2.5" />
                Répondre
              </button>
            )}

            {/* Report */}
            {currentUser && currentUser.email !== comment.author_email && (
              <button
                onClick={() => handleReport(comment.id)}
                disabled={userReported}
                className="flex items-center gap-1 text-[10px] transition tap-sm disabled:opacity-30"
                style={{ color: userReported ? "#F87171" : "rgba(255,255,255,0.2)" }}
              >
                <Flag className="w-2.5 h-2.5" />
                {userReported ? "Signalé" : "Signaler"}
              </button>
            )}
          </div>

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
  };

  return (
    <div>
      {/* Header with count and sort */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" style={{ color: "#BF5AF2" }} />
          <h3 className="text-sm font-black tracking-wider uppercase text-white">
            Commentaires ({comments.length})
          </h3>
        </div>
        {comments.length > 1 && (
          <button
            onClick={() => setSortBy(sortBy === "recent" ? "popular" : "recent")}
            className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/60 transition tap-sm"
          >
            {sortBy === "recent" ? "Populaires" : "Récents"}
            <ChevronDown className="w-3 h-3" />
          </button>
        )}
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
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
            Connectez-vous pour publier un commentaire, voter et signaler
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
          {sorted.map((comment) => (
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