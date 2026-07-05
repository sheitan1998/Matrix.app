import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, ThumbsUp, Laugh, Flame as Fire, Star, PartyPopper } from "lucide-react";

const REACTIONS = [
  { key: "heart", emoji: "❤️", icon: Heart, color: "#ef4444" },
  { key: "like", emoji: "👍", icon: ThumbsUp, color: "#3b82f6" },
  { key: "laugh", emoji: "😂", icon: Laugh, color: "#eab308" },
  { key: "fire", emoji: "🔥", icon: Fire, color: "#f97316" },
  { key: "star", emoji: "⭐", icon: Star, color: "#a855f7" },
  { key: "party", emoji: "🎉", icon: PartyPopper, color: "#22c55e" },
];

export default function FloatingReactions({ videoId }) {
  const [floaters, setFloaters] = useState([]);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (!videoId) return;
    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event.type === "create" && event.data?.type === "reaction" && event.data?.video_id === videoId) {
        spawnFloater(event.data.content);
      }
    });
    return unsubscribe;
  }, [videoId]);

  const spawnFloater = useCallback((emoji) => {
    const id = Date.now() + Math.random();
    const x = 10 + Math.random() * 80;
    setFloaters((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id));
    }, 3000);
  }, []);

  const sendReaction = async (reaction) => {
    spawnFloater(reaction.emoji);
    setBurst((b) => b + 1);
    try {
      await base44.entities.ChatMessage.create({
        video_id: videoId,
        author_email: "system",
        author_name: "reaction",
        content: reaction.emoji,
        type: "reaction",
      });
    } catch (e) { /* ignore */ }
  };

  return (
    <>
      {/* Floating reactions overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floaters.map((f) => (
          <div
            key={f.id}
            className="absolute text-3xl"
            style={{
              left: `${f.x}%`,
              bottom: 0,
              animation: "floatUp 3s ease-out forwards",
            }}
          >
            {f.emoji}
          </div>
        ))}
      </div>

      {/* Reaction bar */}
      <div className="flex gap-1.5 justify-center">
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            onClick={() => sendReaction(r)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg hover:scale-125 transition active:scale-95"
            style={{ background: `${r.color}20`, border: `1px solid ${r.color}40` }}
            title={r.key}
          >
            {r.emoji}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          10% { opacity: 1; transform: translateY(-20px) scale(1.2); }
          100% { transform: translateY(-300px) scale(1) rotate(15deg); opacity: 0; }
        }
      `}</style>
    </>
  );
}