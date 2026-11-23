import React from "react";
import { History, Zap, Crown, Infinity as InfinityIcon } from "lucide-react";
import { formatCountdown } from "@/hooks/useAiQuota";

const TIER_LABEL = { starter: "Starter", plus: "Matrix Plus", ultra: "Matrix Ultra" };

export default function AiQuotaBar({ quota, remainingMs, onUpgrade, onOpenHistory, guest = false }) {
  const weekly = quota?.window === "week";
  const limit = quota?.limit ?? 10;
  const remaining = quota?.remaining ?? limit;
  const used = quota?.used ?? 0;
  const percent = Math.max(0, Math.min(100, (remaining / Math.max(1, limit)) * 100));
  const countdown = formatCountdown(remainingMs);
  const low = remaining <= Math.max(2, Math.floor(limit * 0.05));
  const windowStarted = Boolean(quota?.next_reset_at);
  const isUltra = quota?.plan_tier === "ultra";
  const windowLabel = weekly ? "cette semaine" : "sur 24 h";

  return (
    <div
      className="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-3"
      style={{
        background: "rgba(15,8,26,0.85)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(138,79,255,0.16)",
      }}
    >
      <button
        onClick={onOpenHistory}
        className="md:hidden h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold text-white/60 tap-sm"
        style={{ background: "rgba(138,79,255,0.12)", border: "1px solid rgba(138,79,255,0.25)" }}
      >
        <History className="w-3.5 h-3.5" /> Historique
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <span
          className="text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"
          style={
            quota?.plan_tier === "ultra"
              ? { background: "rgba(251,191,36,0.16)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.35)" }
              : quota?.plan_tier === "plus"
                ? { background: "rgba(168,85,247,0.16)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,0.35)" }
                : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)" }
          }
        >
          {quota?.plan_tier === "ultra" ? <InfinityIcon className="w-3 h-3" /> : quota?.plan_tier === "plus" ? <Zap className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
          {TIER_LABEL[quota?.plan_tier] || "Starter"}
        </span>

        <div className="min-w-0">
          <p className="text-[11px] font-bold text-white leading-tight">
            {guest
              ? "Connecte-toi pour discuter avec Matrix AI"
              : `${remaining} / ${limit} messages restants ${windowLabel}`}
          </p>
          {!guest && (
            <p className="text-[9px] text-white/35 leading-tight">
              {windowStarted
                ? `Renouvellement dans ${countdown.label}`
                : weekly
                  ? "Ta semaine démarre à ton prochain message"
                  : "Ta fenêtre de 24 h démarre à ton prochain message"}
            </p>
          )}
        </div>
      </div>

      {!guest && (
        <div className="hidden sm:block w-32 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              background: low
                ? "linear-gradient(90deg, #f97316, #ef4444)"
                : "linear-gradient(90deg, #8a4fff, #22d3ee)",
            }}
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {!guest && (
          <span className="hidden md:block text-[9px] text-white/30">
            {used} message{used !== 1 ? "s" : ""} utilisé{used !== 1 ? "s" : ""}
          </span>
        )}
        <button
          onClick={onUpgrade}
          className="h-8 px-3 rounded-lg text-[10px] font-black transition hover:brightness-110 tap-sm"
          style={{
            background: "linear-gradient(135deg, rgba(138,79,255,0.9), rgba(109,40,217,0.9))",
            color: "#fff",
            boxShadow: "0 0 16px rgba(138,79,255,0.28)",
          }}
        >
          {guest ? "Voir les offres" : isUltra ? "Mon abonnement" : quota?.plan_tier === "plus" ? "Passer à Matrix Ultra" : "Passer à Matrix Plus"}
        </button>
      </div>
    </div>
  );
}