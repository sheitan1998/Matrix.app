import React, { useState, useEffect } from "react";
import { Users, Clock, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import AdMessages from "./AdMessages";

export default function PlayerAdCard({ player, currentUser, onDelete }) {
  const [remainingMin, setRemainingMin] = useState(60);

  useEffect(() => {
    if (!player.expires_at) return;
    const update = () => {
      const remaining = Math.max(0, Math.floor((new Date(player.expires_at).getTime() - Date.now()) / 60000));
      setRemainingMin(remaining);
    };
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, [player.expires_at]);

  const handleDelete = async () => {
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "deleteAd",
        serverAdId: player.id,
      });
      if (res.data?.success) {
        onDelete(player.id);
        toast.success("Annonce supprimée");
      } else {
        toast.error(res.data?.error || "Erreur");
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const hasProfile = !!player.profile_image;
  const isOwner = currentUser?.email === player.author_email;
  const displayName = player.player_pseudo || player.author_name || "Joueur";

  return (
    <div
      className="rounded-lg p-3 transition"
      style={{
        background: "rgba(138, 79, 255, 0.05)",
        border: "1px solid rgba(138, 79, 255, 0.1)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-black text-white"
          style={{ background: "linear-gradient(135deg, #8a4fff, #5b21b6)" }}
        >
          {hasProfile ? (
            <img src={player.profile_image} alt="" className="w-full h-full object-cover" />
          ) : (
            displayName[0]?.toUpperCase() || "J"
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="text-xs font-bold text-white truncate">{displayName}</p>
            {player.expires_at && (
              <span
                className="text-[8px] flex items-center gap-0.5 ml-auto shrink-0"
                style={{ color: remainingMin < 10 ? "#ef4444" : "rgba(255,255,255,0.3)" }}
              >
                <Clock className="w-2 h-2" />
                {remainingMin}min
              </span>
            )}
          </div>
          {player.game && <p className="text-[9px] text-white/40">{player.game}</p>}
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            className="w-6 h-6 rounded flex items-center justify-center transition tap-sm shrink-0"
            style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      <p className="text-[10px] text-white/50 leading-relaxed line-clamp-2 mb-2">
        {player.description}
      </p>

      <div className="flex items-center gap-3 text-[9px] text-white/40 mb-2">
        {player.player_count_needed > 0 && (
          <span className="flex items-center gap-0.5">
            <Users className="w-2.5 h-2.5" />
            {player.player_count_needed} joueur{player.player_count_needed > 1 ? "s" : ""}
          </span>
        )}
        {player.availability_hours && (
          <span className="flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {player.availability_hours}
          </span>
        )}
      </div>

      <AdMessages adId={player.id} currentUser={currentUser} />
    </div>
  );
}