import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Zap, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useProgression } from "@/context/ProgressionContext";
import ServerBoostLevels from "@/components/prospecteurs/ServerBoostLevels";
import { useServerBoosts, useBoostCountSync } from "@/hooks/useServerBoosts";
import { getBoostLevelInfo, MAX_BOOSTS } from "@/lib/boostPerks";

export default function ServerBoostButton({ server, user, flashBoosts, onBoosted }) {
  const { trackActivity } = useProgression();
  const [loading, setLoading] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  const { activeCount, invalidate, isFetching } = useServerBoosts(server?.id, server?.boosts);
  useBoostCountSync(server?.boosts || 0, activeCount, flashBoosts, onBoosted, isFetching);

  const currentBoosts = activeCount;
  const boostLevel = getBoostLevelInfo(currentBoosts);
  const isMaxed = currentBoosts >= MAX_BOOSTS;

  const handleBoost = async () => {
    if (!user) {
      toast.error("Connecte-toi pour booster");
      return;
    }
    if ((user.flash_boosts || 0) < 1) {
      toast.error("Tu n'as pas de boost Flash ! Va à la Boutique Nexus pour en acheter.");
      return;
    }
    if (isMaxed) {
      toast.error("Ce serveur a atteint le niveau maximum de boosts (30) !");
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "boostServer",
        serverId: server.id,
      });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Serveur boosté ! (${res.boosts}/${MAX_BOOSTS})`);
      trackActivity("server_boosts");
      // Invalidate and wait for fresh data before syncing the parent,
      // so the stale cached count doesn't overwrite the new value.
      await invalidate();
      if (onBoosted) onBoosted(res.boosts, res.newFlashBoosts);
    } catch (err) {
      toast.error(err?.message || "Erreur lors du boost");
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setShowLevels(true)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition hover:opacity-90 tap-sm"
        style={{
          background: boostLevel.color + "20",
          border: `1px solid ${boostLevel.color}50`,
          color: boostLevel.color,
        }}
        title={`Niveau ${boostLevel.level} — ${currentBoosts}/${MAX_BOOSTS} boosts`}
      >
        <Zap className="w-3.5 h-3.5" fill={boostLevel.color} />
        <span>{currentBoosts}/{MAX_BOOSTS}</span>
        {boostLevel.level > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-black" style={{ background: boostLevel.color, color: "#000" }}>
            N{boostLevel.level}
          </span>
        )}
      </button>

      {/* Boost levels modal — rendered via portal for proper centering */}
      {showLevels && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
          onClick={() => setShowLevels(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl p-5 max-h-[85vh] overflow-y-auto scrollbar-thin"
            style={{ background: "#0d0d12", border: "1px solid rgba(168,85,247,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLevels(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition tap-sm"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-2"
                style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
                <Zap className="w-6 h-6 text-white" fill="white" />
              </div>
              <h2 className="text-lg font-black text-white">Booster le serveur</h2>
              <p className="text-xs text-white/50 mt-1">{server?.name}</p>
            </div>

            {/* Current boost status */}
            <div className="rounded-2xl p-3 mb-4 flex items-center justify-between" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
              <div>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Boosts actuels</p>
                <p className="text-2xl font-black" style={{ color: boostLevel.color }}>
                  {currentBoosts}<span className="text-sm text-white/30">/{MAX_BOOSTS}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Tes boosts Flash</p>
                <p className="text-2xl font-black text-white flex items-center gap-1">
                  <Zap className="w-4 h-4 text-white/60" fill="white" />
                  {flashBoosts || 0}
                </p>
              </div>
            </div>

            {/* Boost button */}
            <button
              onClick={handleBoost}
              disabled={loading || isMaxed || (flashBoosts || 0) < 1}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white transition hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2 mb-4"
              style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" fill="currentColor" />
                  {isMaxed ? "Niveau maximum atteint" : (flashBoosts || 0) < 1 ? "Pas de boost Flash" : "Booster (1 Flash Boost)"}
                </>
              )}
            </button>

            {/* Levels */}
            <ServerBoostLevels currentBoosts={currentBoosts} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}