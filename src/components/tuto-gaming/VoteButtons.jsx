import React, { useState, useEffect, useCallback } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * Reusable Like/Dislike component for creator publications.
 * - Toggle behavior: clicking the same vote cancels it; clicking the opposite switches.
 * - Real-time counters from the entity record.
 *
 * Props:
 *   contentType: "farming_mod" | "fortnite_map"
 *   contentId: string
 *   likes: number
 *   dislikes: number
 *   user: object | null
 */
export default function VoteButtons({ contentType, contentId, likes = 0, dislikes = 0, user }) {
  const [myVote, setMyVote] = useState(null); // "like" | "dislike" | null
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ likes, dislikes });

  useEffect(() => {
    setCounts({ likes, dislikes });
  }, [likes, dislikes]);

  // Fetch the current user's vote
  const fetchMyVote = useCallback(async () => {
    if (!user?.email || !contentId) return;
    try {
      const res = await base44.entities.ContentVote.filter(
        { user_email: user.email, content_type: contentType, content_id: contentId },
        { limit: 1 }
      );
      const items = res?.items || res || [];
      if (items.length > 0) setMyVote(items[0].vote);
      else setMyVote(null);
    } catch {
      setMyVote(null);
    }
  }, [user?.email, contentType, contentId]);

  useEffect(() => {
    fetchMyVote();
  }, [fetchMyVote]);

  const handleVote = async (voteType) => {
    if (!user?.email) return;
    if (loading) return;

    setLoading(true);
    const prevVote = myVote;
    let newVote = null;
    let likeDelta = 0;
    let dislikeDelta = 0;

    if (prevVote === voteType) {
      // Clicking the same vote cancels it
      newVote = null;
      if (voteType === "like") likeDelta = -1;
      else dislikeDelta = -1;
    } else if (prevVote === null) {
      // No prior vote → set new vote
      newVote = voteType;
      if (voteType === "like") likeDelta = 1;
      else dislikeDelta = 1;
    } else {
      // Switching from like→dislike or dislike→like
      newVote = voteType;
      if (voteType === "like") { likeDelta = 1; dislikeDelta = -1; }
      else { likeDelta = -1; dislikeDelta = 1; }
    }

    // Optimistic UI update
    setMyVote(newVote);
    setCounts((c) => ({
      likes: Math.max(0, c.likes + likeDelta),
      dislikes: Math.max(0, c.dislikes + dislikeDelta),
    }));

    try {
      const entity = base44.entities[contentType === "farming_mod" ? "FarmingMod" : "FortniteMap"];

      if (newVote === null) {
        // Cancel vote — delete the ContentVote record
        const existing = await base44.entities.ContentVote.filter(
          { user_email: user.email, content_type: contentType, content_id: contentId },
          { limit: 1 }
        );
        const items = existing?.items || existing || [];
        if (items.length > 0) {
          await base44.entities.ContentVote.delete(items[0].id);
        }
        // Update counter on the content entity
        await entity.update(contentId, {
          likes: Math.max(0, counts.likes + likeDelta),
          dislikes: Math.max(0, counts.dislikes + dislikeDelta),
        });
      } else {
        // Upsert vote — if a record exists, update it; otherwise create
        const existing = await base44.entities.ContentVote.filter(
          { user_email: user.email, content_type: contentType, content_id: contentId },
          { limit: 1 }
        );
        const items = existing?.items || existing || [];
        if (items.length > 0) {
          await base44.entities.ContentVote.update(items[0].id, { vote: newVote });
        } else {
          await base44.entities.ContentVote.create({
            user_email: user.email,
            content_type: contentType,
            content_id: contentId,
            vote: newVote,
          });
        }
        // Update counters on the content entity
        await entity.update(contentId, {
          likes: Math.max(0, counts.likes + likeDelta),
          dislikes: Math.max(0, counts.dislikes + dislikeDelta),
        });
      }
    } catch {
      // Revert on error
      setMyVote(prevVote);
      setCounts({ likes, dislikes });
    } finally {
      setLoading(false);
    }
  };

  const likeActive = myVote === "like";
  const dislikeActive = myVote === "dislike";

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => handleVote("like")}
        disabled={loading || !user}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition tap-sm disabled:opacity-50 ${
          likeActive ? "text-green-400" : "text-white/40 hover:text-white/70"
        }`}
        style={{
          background: likeActive ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
          border: likeActive ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.06)",
        }}
        title="J'aime"
      >
        <ThumbsUp className="w-3 h-3" fill={likeActive ? "currentColor" : "none"} />
        {counts.likes}
      </button>
      <button
        onClick={() => handleVote("dislike")}
        disabled={loading || !user}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition tap-sm disabled:opacity-50 ${
          dislikeActive ? "text-red-400" : "text-white/40 hover:text-white/70"
        }`}
        style={{
          background: dislikeActive ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.04)",
          border: dislikeActive ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.06)",
        }}
        title="Je n'aime pas"
      >
        <ThumbsDown className="w-3 h-3" fill={dislikeActive ? "currentColor" : "none"} />
        {counts.dislikes}
      </button>
    </div>
  );
}