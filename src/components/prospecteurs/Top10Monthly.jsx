import React, { useMemo } from "react";
import { Trophy, Crown } from "lucide-react";
import ServerRankingBlock from "@/components/prospecteurs/ServerRankingBlock";
import { sortByScore } from "@/lib/serverDirectory";

// General Top 10 of the active universe only (servers are already isolated by the parent query)
export default function Top10Monthly({ activeTab = "nexus", servers = [], loading }) {
  const top10 = useMemo(() => sortByScore(servers).slice(0, 10), [servers]);
  const isDiscord = activeTab === "discord";

  return (
    <div className="mb-5">
      <ServerRankingBlock
        title={isDiscord ? "Top 10 Serveurs Discord" : "Top 10 Serveurs Nexus"}
        icon={isDiscord ? Crown : Trophy}
        servers={top10}
        accentColor={isDiscord ? "#5865F2" : "#22c55e"}
        loading={loading}
      />
    </div>
  );
}