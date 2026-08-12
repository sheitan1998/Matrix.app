import React from "react";
import ServerCard from "./ServerCard";
import { Server } from "lucide-react";

export default function ServerCardGrid({ servers, loading, onVote, onDelete, onEdit, currentUser, type = "all" }) {
  const title = type === "discord" ? "Tous les serveurs Discord" : type === "nexus" ? "Tous les serveurs Nexus" : "Serveurs récents";
  const accentColor = type === "discord" ? "#5865F2" : "#22c55e";
  const Icon = type === "discord" ? Server : Server;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col"
      style={{
        background: "rgba(18, 9, 28, 0.6)",
        border: `1px solid ${accentColor}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <Icon className="w-4 h-4" style={{ color: accentColor }} />
        <h2 className="text-xs font-black tracking-wider uppercase text-white">
          {title}
        </h2>
        <span className="text-[9px] text-white/40 ml-auto">
          {servers.length} serveur{servers.length > 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl animate-pulse"
              style={{ background: "rgba(138, 79, 255, 0.05)" }}
            />
          ))}
        </div>
      ) : servers.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: "rgba(18, 9, 28, 0.4)", border: "1px dashed rgba(138, 79, 255, 0.15)" }}
        >
          <Server className="w-8 h-8 mx-auto mb-2 text-white/20" />
          <p className="text-xs text-white/40">Aucun serveur pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto scrollbar-thin pr-1">
          {servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onVote={onVote}
              onDelete={onDelete}
              onEdit={onEdit}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}

    </div>
  );
}