import React from "react";
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, ScreenShare, ScreenShareOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVoice } from "@/context/VoiceContext";
import ScreenShareView from "@/components/community/ScreenShareView";
import ScreenShareModal from "@/components/community/ScreenShareModal";
import VoiceParticipants from "@/components/community/VoiceParticipants";

export default function VoiceChannel({ channel, server, theme, user }) {
  const {
    connected, channel: activeChannel,
    micOn, speakerOn, sharing, screenStream, participants,
    showShareModal, closeShareModal,
    connect, disconnect, toggleMic, toggleSpeaker,
    startScreenShare, stopScreenShare,
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

  const isSharing = sharing && !!screenStream;

  // Connected state — big shared screen (when sharing), participants and controls
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

      <div className={cn("flex-1 min-h-0 flex flex-col", isSharing ? "p-3 gap-3" : "overflow-y-auto p-6")}>
        {isSharing && (
          <div className="relative flex-1 min-h-[200px]">
            <ScreenShareView stream={screenStream} accent={accent} onStop={stopScreenShare} large />
          </div>
        )}

        <VoiceParticipants participants={participants} accent={accent} compact={isSharing} />

        {/* Controls */}
        <div className="shrink-0 flex justify-center gap-3 flex-wrap">
          <button onClick={toggleMic}
            title={micOn ? "Couper le micro" : "Activer le micro"}
            className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition border",
              micOn ? "border-white/20 bg-white/10 hover:bg-white/15" : "border-red-500/40 bg-red-500/20")}>
            {micOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-red-400" />}
          </button>
          <button onClick={toggleSpeaker}
            title={speakerOn ? "Couper le son" : "Activer le son"}
            className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition border",
              speakerOn ? "border-white/20 bg-white/10 hover:bg-white/15" : "border-red-500/40 bg-red-500/20")}>
            {speakerOn ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-red-400" />}
          </button>
          {isSharing ? (
            <>
              <button onClick={startScreenShare}
                title="Changer de source de partage"
                className="h-12 px-4 rounded-2xl flex items-center gap-2 text-xs font-bold text-green-400 transition border border-green-500/40 bg-green-500/20 hover:bg-green-500/30">
                <RefreshCw className="w-4 h-4" /> Changer de source
              </button>
              <button onClick={stopScreenShare}
                title="Arrêter le partage"
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition border border-red-500/40 bg-red-500/20 hover:bg-red-500/30">
                <ScreenShareOff className="w-5 h-5 text-red-400" />
              </button>
            </>
          ) : (
            <button onClick={startScreenShare}
              title="Partager l'écran"
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition border border-white/20 bg-white/10 hover:bg-white/15">
              <ScreenShare className="w-5 h-5 text-white" />
            </button>
          )}
          <button onClick={disconnect}
            title="Quitter le vocal"
            className="w-12 h-12 rounded-2xl flex items-center justify-center border border-red-500/40 bg-red-500/20 hover:bg-red-500/30 transition">
            <PhoneOff className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>

      <ScreenShareModal
        open={showShareModal}
        stream={screenStream}
        onClose={closeShareModal}
        onStop={stopScreenShare}
        accent={accent}
      />
    </div>
  );
}