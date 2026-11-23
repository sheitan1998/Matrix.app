import React, { useCallback, useEffect, useState } from "react";
import { Star, MessageSquare, Trash2, Loader2, CornerDownRight, LogIn } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const CARD = { background: "rgba(18,9,28,0.6)", border: "1px solid rgba(138,79,255,0.15)" };
const FIELD = { background: "#0d0814", border: "1px solid rgba(138,79,255,0.18)" };

function Stars({ value, onChange, size = "w-4 h-4" }) {
  return (
    <span className="inline-flex items-center gap-0.5" role={onChange ? "radiogroup" : undefined} aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const star = (
          <Star
            className={size}
            style={{
              color: filled ? "#fbbf24" : "rgba(255,255,255,0.2)",
              fill: filled ? "#fbbf24" : "transparent",
              filter: filled ? "drop-shadow(0 0 4px rgba(251,191,36,0.6))" : "none",
            }}
          />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="tap-sm"
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </span>
  );
}

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
};

const errorMessage = (err) => {
  const code = err?.response?.data?.error;
  if (code === "already_reviewed") return "Tu as déjà publié un avis sur cette fiche.";
  if (code === "own_listing") return "Tu ne peux pas noter ta propre fiche.";
  if (code === "content_too_short") return "Ton avis est trop court (3 caractères minimum).";
  return "Une erreur est survenue. Réessaie dans un instant.";
};

/**
 * Avis sur une fiche (serveur ou créateur) : lecture publique, publication réservée
 * aux utilisateurs connectés, suppression et réponse pour le propriétaire / les admins.
 */
export default function ReviewsSection({ targetType, targetId, isOwner = false, user = null }) {
  const { navigateToLogin } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [busyId, setBusyId] = useState(null);

  const canModerate = isOwner || user?.role === "admin";
  const hasReviewed = reviews.some((r) => r.is_mine);

  const load = useCallback(async () => {
    if (!targetId) return;
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "getReviews", targetType, targetId });
      setReviews(res.data?.reviews || []);
      setAverage(res.data?.average || 0);
    } catch {
      /* silent : la section reste vide */
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => { load(); }, [load, user?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Choisis une note de 1 à 5 étoiles.");
      return;
    }
    if (content.trim().length < 3) {
      toast.error("Ton avis est trop court (3 caractères minimum).");
      return;
    }
    setSubmitting(true);
    try {
      await base44.functions.invoke("serverSearch", { action: "addReview", targetType, targetId, rating, content: content.trim() });
      toast.success("Avis publié !");
      setRating(0);
      setContent("");
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet avis ?")) return;
    setBusyId(id);
    try {
      await base44.functions.invoke("serverSearch", { action: "deleteReview", reviewId: id });
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Avis supprimé");
      load();
    } catch {
      toast.error("Suppression impossible");
    } finally {
      setBusyId(null);
    }
  };

  const handleReply = async (id, reply) => {
    setBusyId(id);
    try {
      await base44.functions.invoke("serverSearch", { action: "replyReview", reviewId: id, reply });
      setReplyFor(null);
      setReplyText("");
      await load();
    } catch {
      toast.error("Réponse impossible");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="rounded-xl p-4 mb-4" style={CARD} aria-labelledby={`reviews-${targetType}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 id={`reviews-${targetType}`} className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" style={{ color: "#a855f7" }} /> Avis ({reviews.length})
        </h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-white">
            <Stars value={average} size="w-3.5 h-3.5" /> {average.toFixed(1)}/5
          </span>
        )}
      </div>

      {user ? (
        isOwner ? (
          <p className="text-[11px] text-white/40 mb-3">Tu es le gérant de cette fiche : tu peux répondre aux avis ou supprimer ceux qui sont indésirables.</p>
        ) : hasReviewed ? (
          <p className="text-[11px] text-white/40 mb-3">Merci ! Tu as déjà publié un avis sur cette fiche.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mb-4 space-y-2">
            <Stars value={rating} onChange={setRating} size="w-6 h-6" />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Partage ton expérience…"
              className="w-full px-3 py-2 rounded-lg text-xs text-white placeholder:text-white/25 outline-none resize-none"
              style={FIELD}
            />
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-white/25">{content.length}/1000</span>
              <button
                type="submit"
                disabled={submitting}
                className="h-9 px-4 rounded-lg text-xs font-black text-white tap-sm disabled:opacity-50 flex items-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)", boxShadow: "0 0 12px rgba(138,79,255,0.25)" }}
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Publier mon avis
              </button>
            </div>
          </form>
        )
      ) : (
        <button
          type="button"
          onClick={() => navigateToLogin?.()}
          className="mb-4 w-full h-10 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 tap-sm"
          style={{ background: "rgba(138,79,255,0.1)", color: "#c084fc", border: "1px dashed rgba(138,79,255,0.35)" }}
        >
          <LogIn className="w-3.5 h-3.5" /> Connecte-toi pour publier un avis
        </button>
      )}

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-purple-500" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-[11px] text-white/30 text-center py-2">Aucun avis pour le moment.</p>
      ) : (
        <ul className="space-y-2.5">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(138,79,255,0.12)" }}>
              <div className="flex items-start gap-2.5">
                <div
                  className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-xs font-black text-white"
                  style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
                >
                  {r.author_avatar ? <img src={r.author_avatar} alt="" className="w-full h-full object-cover" loading="lazy" /> : (r.author_name?.[0]?.toUpperCase() || "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white truncate">{r.author_name || "Utilisateur"}</span>
                    <Stars value={r.rating} size="w-3 h-3" />
                    <span className="text-[9px] text-white/30">{formatDate(r.created_date)}</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap break-words mt-1">{r.content}</p>
                </div>
                {(canModerate || r.is_mine) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    disabled={busyId === r.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 tap-sm disabled:opacity-50"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
                    aria-label="Supprimer l'avis"
                    title="Supprimer l'avis"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {r.owner_reply && replyFor !== r.id && (
                <div className="mt-2 ml-10 rounded-lg p-2.5 flex gap-1.5" style={{ background: "rgba(138,79,255,0.08)", border: "1px solid rgba(138,79,255,0.2)" }}>
                  <CornerDownRight className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#a855f7" }} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#c084fc" }}>Réponse du gérant</p>
                    <p className="text-xs text-white/70 whitespace-pre-wrap break-words">{r.owner_reply}</p>
                  </div>
                </div>
              )}

              {canModerate && replyFor !== r.id && (
                <button
                  type="button"
                  onClick={() => { setReplyFor(r.id); setReplyText(r.owner_reply || ""); }}
                  className="mt-2 ml-10 text-[10px] font-bold tap-sm"
                  style={{ color: "#c084fc" }}
                >
                  {r.owner_reply ? "Modifier ma réponse" : "Répondre"}
                </button>
              )}

              {canModerate && replyFor === r.id && (
                <div className="mt-2 ml-10 space-y-1.5">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    maxLength={1000}
                    rows={2}
                    placeholder="Ta réponse…"
                    className="w-full px-3 py-2 rounded-lg text-xs text-white placeholder:text-white/25 outline-none resize-none"
                    style={FIELD}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReply(r.id, replyText)}
                      disabled={busyId === r.id}
                      className="h-8 px-3 rounded-lg text-[10px] font-black text-white tap-sm disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
                    >
                      {replyText.trim() ? "Envoyer" : "Retirer la réponse"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setReplyFor(null); setReplyText(""); }}
                      className="h-8 px-3 rounded-lg text-[10px] font-bold text-white/50 tap-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
