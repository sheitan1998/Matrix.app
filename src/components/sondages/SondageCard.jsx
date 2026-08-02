import React, { useState } from "react";
import { Edit3, Lock, Unlock, Trash2, MessageCircle, Send } from "lucide-react";

const REACTION_EMOJIS = ["👍", "❤️", "🔥", "😮", "🎉"];

export default function SondageCard({ sondage, user, votes, reactions, comments, isAdmin, onVote, onReaction, onComment, onDeleteComment, onEdit, onClose, onReopen, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const myVote = votes.find(v => v.sondage_id === sondage.id && v.user_email === user?.email);
  const hasVoted = !!myVote;
  const isActive = sondage.status !== "closed";
  const showResults = hasVoted || !isActive;

  const totalVotes = votes.filter(v => v.sondage_id === sondage.id).length;

  const getVoteCount = (choiceId) => votes.filter(v => v.sondage_id === sondage.id && v.choice_id === choiceId).length;
  const getVotePercent = (choiceId) => totalVotes > 0 ? Math.round((getVoteCount(choiceId) / totalVotes) * 100) : 0;

  const cardReactions = REACTION_EMOJIS.map(emoji => ({
    emoji,
    count: reactions.filter(r => r.sondage_id === sondage.id && r.emoji === emoji).length,
    mine: reactions.some(r => r.sondage_id === sondage.id && r.emoji === emoji && r.user_email === user?.email),
  }));

  const cardComments = comments
    .filter(c => c.sondage_id === sondage.id)
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  const submitComment = () => {
    if (!commentText.trim()) return;
    onComment(sondage.id, commentText.trim());
    setCommentText("");
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,10,25,0.8)", border: "1px solid rgba(168,85,247,0.15)", backdropFilter: "blur(8px)" }}>
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black px-2 py-1 rounded-full" style={{
              background: isActive ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
              color: isActive ? "#22C55E" : "rgba(255,255,255,0.5)",
              border: `1px solid ${isActive ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
            }}>
              {isActive ? "● ACTIF" : "FERMÉ"}
            </span>
            <span className="text-[10px] text-white/40">{totalVotes} vote{totalVotes > 1 ? "s" : ""}</span>
          </div>
          {isAdmin && (
            <div className="flex gap-1">
              <button onClick={() => onEdit(sondage)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(168,85,247,0.1)" }} title="Modifier">
                <Edit3 className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
              </button>
              {isActive ? (
                <button onClick={() => onClose(sondage.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(234,179,8,0.1)" }} title="Fermer">
                  <Lock className="w-3.5 h-3.5 text-yellow-500" />
                </button>
              ) : (
                <button onClick={() => onReopen(sondage.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)" }} title="Rouvrir">
                  <Unlock className="w-3.5 h-3.5 text-green-500" />
                </button>
              )}
              <button onClick={() => onDelete(sondage.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }} title="Supprimer">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          )}
        </div>
        <h3 className="text-lg font-black text-white mb-1">{sondage.title}</h3>
        {sondage.description && <p className="text-sm text-white/60 leading-relaxed">{sondage.description}</p>}
      </div>

      {/* Choices */}
      <div className="px-5 pb-3 space-y-2">
        {(sondage.choices || []).map((choice) => {
          const percent = getVotePercent(choice.id);
          const isMyChoice = myVote?.choice_id === choice.id;
          const count = getVoteCount(choice.id);
          return (
            <div
              key={choice.id}
              onClick={() => !showResults && onVote(sondage.id, choice.id)}
              className="relative w-full rounded-xl overflow-hidden transition group"
              style={{
                background: showResults ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${isMyChoice ? "#a855f7" : "rgba(255,255,255,0.08)"}`,
                cursor: showResults ? "default" : "pointer",
              }}
            >
              {showResults && (
                <div className="absolute inset-y-0 left-0 transition-all" style={{ width: `${percent}%`, background: isMyChoice ? "linear-gradient(90deg, rgba(168,85,247,0.35), rgba(168,85,247,0.1))" : "rgba(168,85,247,0.1)" }} />
              )}
              <div className="relative flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  {isMyChoice && <span style={{ color: "#a855f7" }}>✓</span>}
                  {choice.text}
                </span>
                {showResults && (
                  <span className="text-xs font-bold text-white/70">{percent}% · {count}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!hasVoted && isActive && (
        <div className="px-5 pb-3">
          <p className="text-[11px] text-white/40 text-center">Cliquez sur un choix pour voter</p>
        </div>
      )}

      {/* Reactions */}
      <div className="px-5 pb-3 flex items-center gap-2 flex-wrap">
        {cardReactions.map(({ emoji, count, mine }) => (
          <button
            key={emoji}
            onClick={() => onReaction(sondage.id, emoji)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition tap-sm"
            style={{
              background: mine ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${mine ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            <span className="text-sm">{emoji}</span>
            {count > 0 && <span className="text-white/60 font-semibold">{count}</span>}
          </button>
        ))}
      </div>

      {/* Comments toggle */}
      <div className="px-5 pb-2">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition tap-sm"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {cardComments.length} commentaire{cardComments.length > 1 ? "s" : ""}
          <span className="text-white/30 text-[10px]">{showComments ? "▲ masquer" : "▼ voir"}</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-5 pb-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="pt-3 space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin">
            {cardComments.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-2">Aucun commentaire pour le moment</p>
            ) : cardComments.map(c => (
              <div key={c.id} className="flex gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white overflow-hidden" style={{ background: "rgba(168,85,247,0.2)" }}>
                  {c.author_avatar ? <img src={c.author_avatar} className="w-full h-full object-cover" alt="" /> : c.author_name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-xs font-bold text-white">{c.author_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white/40">{new Date(c.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        {(c.author_email === user?.email || isAdmin) && (
                          <button onClick={() => onDeleteComment(c.id)} className="text-white/30 hover:text-red-400 transition">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Add comment */}
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitComment()}
              placeholder="Ajouter un commentaire..."
              className="flex-1 px-3 py-2 rounded-xl text-xs text-white placeholder-white/30 outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <button onClick={submitComment} className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.2)" }}>
              <Send className="w-4 h-4" style={{ color: "#a855f7" }} />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-2.5 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-[10px] text-white/40">Par {sondage.created_by_name || "Admin"}</span>
        <span className="text-[10px] text-white/30">{new Date(sondage.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
      </div>
    </div>
  );
}