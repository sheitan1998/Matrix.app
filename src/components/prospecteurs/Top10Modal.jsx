import React from "react";
import ServerRankingBlock from "@/components/prospecteurs/ServerRankingBlock";
import { sortByScore } from "@/lib/serverDirectory";
import { X, Trophy, Crown } from "lucide-react";

export default function Top10Modal({ activeTab, servers, loading, onClose }) {
  const top10 = sortByScore(servers).slice(0, 10);
  const isDiscord = activeTab === "discord";
  const accent = isDiscord ? "#5865F2" : "#22c55e";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-4"
        style={{ background: "#12091c", border: `1px solid ${accent}30` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            {isDiscord ? "Classement Discord" : "Classement Nexus"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center tap-sm"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
        <ServerRankingBlock
          title={isDiscord ? "Top 10 Serveurs Discord" : "Top 10 Serveurs Nexus"}
          icon={isDiscord ? Crown : Trophy}
          servers={top10}
          accentColor={accent}
          loading={loading}
          skeletonCount={10}
        />
      </div>
    </div>
  );
}