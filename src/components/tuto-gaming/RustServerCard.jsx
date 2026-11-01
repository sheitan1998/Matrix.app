import React from "react";
import GameImageFallback from "@/components/tuto-gaming/GameImageFallback";

const RUST_LOGO = "data:image/svg+xml;base64," + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#0a050f"/><text x="60" y="75" font-size="48" font-weight="900" fill="#CE422B" text-anchor="middle" font-family="sans-serif" style="filter:drop-shadow(0 0 8px #CE422B88)">RUST</text></svg>`);

export default function RustServerCard({ server }) {
  const playerPct = server.maxPlayers > 0 ? (server.players / server.maxPlayers) * 100 : 0;
  const isFull = playerPct >= 95;

  return (
    <div
      className="rounded-xl overflow-hidden p-4 transition-all"
      style={{
        background: "hsl(var(--card))",
        border: `1px solid ${isFull ? "rgba(248,113,113,0.3)" : "rgba(191,90,242,0.2)"}`,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate">{server.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            {server.isOfficial && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase" style={{ background: "rgba(74,222,128,0.15)", color: "#4ADE80" }}>
                Officiel
              </span>
            )}
            {server.country && (
              <span className="text-[10px] text-muted-foreground">{server.country}</span>
            )}
            <span className={`text-[10px] font-bold ${isFull ? "text-red-400" : "text-green-400"}`}>
              {server.status === "online" ? "● En ligne" : "● Hors ligne"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>{server.players} / {server.maxPlayers} joueurs</span>
            <span>{Math.round(playerPct)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(playerPct, 100)}%`,
                background: isFull ? "#F87171" : "linear-gradient(90deg, #4ADE80, #BF5AF2)",
              }}
            />
          </div>
        </div>
      </div>

      {server.ip && server.port > 0 && (
        <div className="mt-3 flex items-center justify-between">
          <code className="text-[10px] text-muted-foreground font-mono">{server.ip}:{server.port}</code>
          <button
            onClick={() => navigator.clipboard?.writeText(`connect ${server.ip}:${server.port}`)}
            className="text-[10px] font-bold px-2 py-1 rounded tap-sm transition"
            style={{ background: "rgba(191,90,242,0.1)", color: "#BF5AF2", border: "1px solid rgba(191,90,242,0.3)" }}
          >
            Copier
          </button>
        </div>
      )}
    </div>
  );
}