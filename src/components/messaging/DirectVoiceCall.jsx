import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, Phone } from "lucide-react";
import { useAudioSettings } from "@/hooks/useAudioSettings";
import { toast } from "sonner";

/**
 * Direct voice call component for DM conversations.
 * Uses the user's audio settings (device selection, noise suppression, etc.)
 */
export default function DirectVoiceCall({ contactName, contactAvatar, onEnd }) {
  const { settings, getAudioConstraints, attachOutputDevice } = useAudioSettings();
  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [level, setLevel] = useState(0);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const connect = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(getAudioConstraints());
      streamRef.current = stream;
      setConnected(true);

      // Setup analyser for local level meter
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
        const source = audioCtxRef.current.createMediaStreamSource(stream);
        const analyser = audioCtxRef.current.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.6;
        source.connect(analyser);
        analyserRef.current = analyser;

        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          setLevel(Math.min(100, Math.round((sum / data.length / 128) * 100)));
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {}

      setCallDuration(0);
      timerRef.current = setInterval(() => setCallDuration((s) => s + 1), 1000);
      toast.success(`Appel vocal démarré avec ${contactName}`);
    } catch (e) {
      toast.error("Impossible d'accéder au microphone. Vérifiez les permissions.");
    }
  }, [getAudioConstraints, contactName]);

  const disconnect = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    setConnected(false);
    setLevel(0);
    setCallDuration(0);
    if (onEnd) onEnd();
  }, [onEnd]);

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => { t.enabled = !micOn; });
    }
    setMicOn((v) => !v);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 gap-4">
      {/* Contact avatar + name */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {connected && level > 10 && (
            <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(34,197,94,0.3)", scale: 1.2 }} />
          )}
          <div className="w-20 h-20 rounded-full overflow-hidden border-2" style={{ borderColor: connected ? "#22c55e" : "rgba(255,255,255,0.1)" }}>
            {contactAvatar ? (
              <img src={contactAvatar} alt={contactName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white" style={{ background: "#a855f7" }}>
                {contactName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-black text-white">{contactName}</p>
          <p className="text-xs text-white/40 mt-0.5">
            {connected ? `En appel • ${formatTime(callDuration)}` : "Connexion..."}
          </p>
        </div>
      </div>

      {/* Level meter */}
      {connected && (
        <div className="w-full max-w-[200px] h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${level}%`,
              background: level > 70 ? "#ef4444" : level > 40 ? "#fbbf24" : "#22c55e",
            }}
          />
        </div>
      )}

      {/* Controls */}
      {connected && (
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition border ${
              micOn ? "border-white/20 bg-white/10 hover:bg-white/15" : "border-red-500/40 bg-red-500/20"
            }`}
          >
            {micOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-red-400" />}
          </button>
          <button
            onClick={() => setSpeakerOn((v) => !v)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition border ${
              speakerOn ? "border-white/20 bg-white/10 hover:bg-white/15" : "border-red-500/40 bg-red-500/20"
            }`}
          >
            {speakerOn ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-red-400" />}
          </button>
          <button
            onClick={disconnect}
            className="w-14 h-14 rounded-2xl flex items-center justify-center border border-red-500/40 bg-red-500/30 hover:bg-red-500/40 transition"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {/* Audio info */}
      {connected && (
        <p className="text-[9px] text-white/30 text-center max-w-[250px] leading-relaxed">
          {settings.noiseSuppression && "🔇 Suppression du bruit activée"}
          {settings.echoCancellation && " • 🔊 Écho annulé"}
          {!settings.noiseSuppression && !settings.echoCancellation && "Audio brut (sans traitement)"}
        </p>
      )}
    </div>
  );
}