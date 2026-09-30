import React from "react";
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, Monitor, MonitorOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVoice } from "@/context/VoiceContext";
import ScreenShareView from "@/components/community/ScreenShareView";
import ScreenShareModal from "@/components/community/ScreenShareModal";

export default function VoiceChannel({ channel, server, theme, user }) {
  const {
    connected, channel: activeChannel,
    micOn, speakerOn, sharing, screenStream, participants,
    connect, disconnect, toggleMic, toggleSpeaker,
    startScreenShare, stopScreenShare,
    showShareModal, closeShareModal, handleShareStart,
  } = useVoice();
  const isActive = connected && activeChannel?.id === channel.id;
  const accent = theme?.accent || "#00ff41";

  // Not connected state — show join button
  if (!isActive) {
    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-4 py-2.5 border-b flex items-center gap-2"
          style={{ borderColor: theme?.border || "hsl(var(--border))" }}>
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <span className="font-bold text-sm text-white">{channel.name}</span>
          <span className="text-xs text-muted-foreground ml-1">salon vocal</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center border-2 border-dashed"
              style={{ borderColor: accent + "40", background: accent + "10" }}>
              <Volume2 className="w-10 h-10" style={{ color: accent }} />
            </div>
            <div>
              <p className="font-black text-xl text-white">#{channel.name}</p>
              <p className="text-sm text-muted-foreground mt-1">Salon vocal — clique pour rejoindre</p>
            </div>
            <Button onClick={() => connect(channel, server, theme, user)} className="gap-2 font-bold px-8 rounded-2xl"
              style={{ background: accent, color: "#0a0a0a" }}>
              <Mic className="w-4 h-4" /> Rejoindre le vocal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Connected state — show participants + controls
  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-4 py-2.5 border-b flex items-center gap-2"
        style={{ borderColor: theme?.border || "hsl(var(--border))" }}>
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <span className="font-bold text-sm text-white">{channel.name}</span>
        <span className="text-xs text-muted-foreground ml-1">salon vocal</span>
        <span className="ml-auto flex items-center gap-1 text-xs font-bold text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          Connecté
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {sharing && screenStream && (
          <div className="mb-4">
            <ScreenShareView stream={screenStream} accent={accent} onStop={stopScreenShare} />
          </div>
        )}

        {/* Participants */}
        <div className="space-y-2 mb-6">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> Participants ({participants.length})
          </p>
          {participants.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border"
              style={{ borderColor: p.speaking && p.micOn ? accent + "60" : accent + "20", background: accent + "08" }}>
              <div className="relative shrink-0">
                {/* Speaking ring */}
                {p.speaking && p.micOn && (
                  <span
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{
                      boxShadow: `0 0 0 2px ${accent}, 0 0 12px ${accent}80`,
                      animationDuration: "1.2s",
                    }}
                  />
                )}
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white overflow-hidden"
                  style={{ background: accent + "30" }}>
                  {p.avatar ? (
                    <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (p.name || "?")[0].toUpperCase()
                  )}
                </div>
              </div>
              <span className="font-semibold text-sm text-white flex-1">{p.name || "—"}</span>
              {!p.micOn && <MicOff className="w-4 h-4 text-red-400" />}
              {p.micOn && <Mic className="w-4 h-4" style={{ color: accent }} />}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 flex-wrap">
          <button onClick={toggleMic}
            className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition border",
              micOn ? "border-white/20 bg-white/10 hover:bg-white/15" : "border-red-500/40 bg-red-500/20")}>
            {micOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-red-400" />}
          </button>
          <button onClick={toggleSpeaker}
            className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition border",
              speakerOn ? "border-white/20 bg-white/10 hover:bg-white/15" : "border-red-500/40 bg-red-500/20")}>
            {speakerOn ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-red-400" />}
          </button>
          <button onClick={sharing ? stopScreenShare : startScreenShare}
            className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition border",
              sharing ? "border-green-500/40 bg-green-500/20" : "border-white/20 bg-white/10 hover:bg-white/15")}>
            {sharing ? <Monitor className="w-5 h-5 text-green-400" /> : <MonitorOff className="w-5 h-5 text-white" />}
          </button>
          <button onClick={disconnect}
            className="w-12 h-12 rounded-2xl flex items-center justify-center border border-red-500/40 bg-red-500/20 hover:bg-red-500/30 transition">
            <PhoneOff className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>

      <ScreenShareModal
        open={showShareModal}
        onClose={closeShareModal}
        onStart={handleShareStart}
        accent={accent}
      />
    </div>
  );
}