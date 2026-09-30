import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, ScreenShare, ScreenShareOff, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoice } from "@/context/VoiceContext";
import ScreenShareView from "@/components/community/ScreenShareView";
import SpeakingRing from "@/components/community/SpeakingRing";

export default function PersistentVoicePanel() {
  const {
    connected, channel, server, theme,
    micOn, speakerOn, sharing, screenStream, participants,
    toggleMic, toggleSpeaker,
    stopScreenShare, startScreenShare,
    disconnect,
  } = useVoice();
  const [expanded, setExpanded] = useState(true);

  if (!connected) return null;

  const accent = theme?.accent || "#00ff41";

  const panel = createPortal(
    <div className="fixed bottom-20 right-4 z-[80] w-72 max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-2xl"
      style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.2)" }}>
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-2 px-3 py-2.5 transition hover:bg-white/5"
        style={{ borderBottom: expanded ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-bold text-white truncate">
            {server?.icon_emoji || "🏠"} {server?.name || "Serveur"}
          </p>
          <p className="text-[10px] text-white/40 truncate">🔊 #{channel?.name || "vocal"}</p>
        </div>
        <span className="text-[10px] text-white/40 font-bold">{participants.length}</span>
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-white/40" /> : <ChevronUp className="w-3.5 h-3.5 text-white/40" />}
      </button>

      {expanded && (
        <>
          {/* Screen share preview */}
          {sharing && screenStream && (
            <div className="px-2 pt-2">
              <ScreenShareView stream={screenStream} accent={accent} onStop={stopScreenShare} compact />
            </div>
          )}

          {/* Participants */}
          <div className="p-2 space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
            {participants.map((p, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                style={{ background: p.isSelf ? accent + "10" : "rgba(255,255,255,0.03)" }}>
                <div className="relative shrink-0 w-7 h-7 rounded-full">
                  <SpeakingRing speaking={!!p.speaking && p.micOn !== false} />
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white overflow-hidden"
                    style={{ background: accent + "30" }}>
                    {p.avatar ? (
                      <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (p.name || "?")[0].toUpperCase()
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-white/80 flex-1 truncate">
                  {p.name || "—"}{p.isSelf && " (toi)"}
                </span>
                {p.micOn ? <Mic className="w-3 h-3" style={{ color: accent }} /> : <MicOff className="w-3 h-3 text-red-400" />}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 p-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={toggleMic}
              className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition border",
                micOn ? "border-white/20 bg-white/10" : "border-red-500/40 bg-red-500/20")}
              title={micOn ? "Couper le micro" : "Activer le micro"}>
              {micOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-red-400" />}
            </button>
            <button onClick={toggleSpeaker}
              className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition border",
                speakerOn ? "border-white/20 bg-white/10" : "border-red-500/40 bg-red-500/20")}
              title={speakerOn ? "Couper le son" : "Activer le son"}>
              {speakerOn ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
            {sharing && (
              <button onClick={startScreenShare}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition border border-green-500/40 bg-green-500/20"
                title="Changer de source de partage">
                <RefreshCw className="w-4 h-4 text-green-400" />
              </button>
            )}
            <button onClick={sharing ? stopScreenShare : startScreenShare}
              className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition border",
                sharing ? "border-red-500/40 bg-red-500/20" : "border-white/20 bg-white/10")}
              title={sharing ? "Arrêter le partage" : "Partager l'écran"}>
              {sharing ? <ScreenShareOff className="w-4 h-4 text-red-400" /> : <ScreenShare className="w-4 h-4 text-white" />}
            </button>
            <div className="flex-1" />
            <button onClick={disconnect}
              className="px-3 h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-white transition hover:opacity-90 shrink-0"
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
              title="Quitter le vocal">
              <PhoneOff className="w-3.5 h-3.5" /> Quitter
            </button>
          </div>
        </>
      )}
    </div>,
    document.body
  );

  return panel;
}