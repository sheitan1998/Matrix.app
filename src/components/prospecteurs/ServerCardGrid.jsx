import React from "react";
import ServerCard from "./ServerCard";
import { Server } from "lucide-react";

export default function ServerCardGrid({ servers, loading, onVote, onBoost, onDelete, onEdit, currentUser, trixBalance }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Server className="w-4 h-4" style={{ color: "#8a4fff" }} />
        <h2 className="text-xs font-black tracking-wider uppercase text-white">
          Serveurs récents
        </h2>
        <span className="text-[9px] text-white/40 ml-auto">
          {servers.length} serveur{servers.length > 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl animate-pulse"
              style={{ background: "rgba(138, 79, 255, 0.05)" }}
            />
          ))}
        </div>
      ) : servers.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: "rgba(18, 9, 28, 0.6)", border: "1px dashed rgba(138, 79, 255, 0.2)" }}
        >
          <Server className="w-10 h-10 mx-auto mb-3 text-white/20" />
          <p className="text-sm text-white/40">Aucun serveur publié pour le moment</p>
          <p className="text-[10px] text-white/30 mt-1">Soyez le premier à publier votre serveur !</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onVote={onVote}
              onBoost={onBoost}
              onDelete={onDelete}
              onEdit={onEdit}
              currentUser={currentUser}
              trixBalance={trixBalance}
            />
          ))}
        </div>
      )}
    </div>
  );
}