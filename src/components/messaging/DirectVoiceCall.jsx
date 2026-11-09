import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, PhoneOff } from "lucide-react";
import { useAudioSettings } from "@/hooks/useAudioSettings";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { DirectCallConnection, callRoomId } from "@/lib/directCall";
import {
  playMicMute, playMicUnmute, playSpeakerOff, playSpeakerOn, playCallEnded,
  startOutgoingRing, stopOutgoingRing,
} from "@/lib/voiceSounds";

/**
 * Direct 1:1 voice call using the user's audio settings.
 * Real WebRTC audio between the two participants (signaling via the voice actor).
 */
export default function DirectVoiceCall({ signal, role, userEmail, peerEmail, contactName, contactAvatar, onEnd }) {
  const { getAudioConstraints } = useAudioSettings();
  const [phase, setPhase] = useState(role === "caller" ? "ringing" : "connecting");
  const [error, setError] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [level, setLevel] = useState(0);
  const [remoteStream, setRemoteStream] = useState(null);
  const streamRef = useRef(null);
  const connRef = useRef(null);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  const endedRef = useRef(false);
  const startedRef = useRef(false);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const cleanup = useCallback((notifySignal = true) => {
    if (endedRef.current) return;
    endedRef.current = true;
    stopOutgoingRing();
    if (notifySignal && signal?.id) {
      base44.entities.VoiceCallSignal.update(signal.id, { status: "ended" }).catch(() => {});
    }
    connRef.current?.disconnect();
    connRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stopTimer();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    playCallEnded();
    onEndRef.current?.();
  }, [signal?.id]);

  const hangUp = () => cleanup(true);

  const startConnection = useCallback(() => {
    if (startedRef.current || endedRef.current || !streamRef.current) return;
    startedRef.current = true;
    stopOutgoingRing();
    setPhase("connecting");
    const conn = new DirectCallConnection({
      roomId: callRoomId(userEmail, peerEmail),
      peerEmail,
      localStream: streamRef.current,
      isCaller: role === "caller",
      onRemoteStream: (stream) => {
        setRemoteStream(stream);
        setPhase("connected");
      },
      onStateChange: (state) => {
        if (state === "connected") setPhase("connected");
        if (state === "failed") setError("Connexion impossible. Vérifie ton réseau.");
        if (state === "disconnected" && !endedRef.current) {
          setError("L'appel a été interrompu");
          cleanup(true);
        }
      },
    });
    connRef.current = conn;
    conn.connect();
  }, [userEmail, peerEmail, role, cleanup]);

  // Microphone + audio meter
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(getAudioConstraints());
        if (!alive) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          audioCtxRef.current = new AudioCtx();
          const source = audioCtxRef.current.createMediaStreamSource(stream);
          const analyser = audioCtxRef.current.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.6;
          source.connect(analyser);
          const data = new Uint8Array(analyser.frequencyBinCount);
          const tick = () => {
            analyser.getByteFrequencyData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i];
            setLevel(Math.min(100, Math.round((sum / data.length / 128) * 100)));
            rafRef.current = requestAnimationFrame(tick);
          };
          tick();
        } catch {
          /* level meter unavailable */
        }
        if (role === "caller") startOutgoingRing();
        else startConnection();
      } catch {
        if (alive) setError("Micro indisponible. Vérifie les permissions de ton navigateur.");
      }
    })();
    return () => {
      alive = false;
      cleanup(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch the call signal: caller waits for acceptance, both react to a hang-up
  useEffect(() => {
    if (!signal?.id) return;
    let stopped = false;
    const tick = async () => {
      if (stopped || endedRef.current) return;
      try {
        const fresh = await base44.entities.VoiceCallSignal.get(signal.id);
        if (!fresh || stopped) return;
        if (fresh.status === "accepted" && role === "caller" && !startedRef.current) {
          startConnection();
        }
        if (["declined", "ended", "missed"].includes(fresh.status)) {
          if (!endedRef.current && fresh.status === "declined" && role === "caller") {
            toast.error("Appel refusé");
          }
          cleanup(false);
        }
      } catch {
        /* keep polling */
      }
    };
    tick();
    const interval = setInterval(tick, 1500);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [signal?.id, role, startConnection, cleanup]);

  // Caller gives up after 45s without an answer
  useEffect(() => {
    if (role !== "caller") return;
    const timeout = setTimeout(() => {
      if (!endedRef.current && !startedRef.current) {
        toast.error("Pas de réponse");
        cleanup(true);
      }
    }, 45000);
    return () => clearTimeout(timeout);
  }, [role, cleanup]);

  // Start the duration counter once the call is connected
  useEffect(() => {
    if (phase !== "connected") return;
    if (!timerRef.current) timerRef.current = setInterval(() => setDuration((s) => s + 1), 1000);
    return () => stopTimer();
  }, [phase]);

  // Attach the remote audio stream
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.muted = !speakerOn;
      audioRef.current.play?.().catch(() => {});
    }
  }, [remoteStream, speakerOn]);

  const toggleMic = () => {
    const next = !micOn;
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = next; });
    setMicOn(next);
    if (next) playMicUnmute(); else playMicMute();
  };

  const toggleSpeaker = () => {
    const next = !speakerOn;
    setSpeakerOn(next);
    if (audioRef.current) audioRef.current.muted = !next;
    if (next) playSpeakerOn(); else playSpeakerOff();
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const statusLabel = phase === "ringing"
    ? "Appel en cours..."
    : phase === "connected"
      ? `En appel • ${formatTime(duration)}`
      : "Connexion...";

  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] p-6 gap-4">
      <audio ref={audioRef} autoPlay playsInline className="hidden" />

      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {phase === "connected" && level > 10 && (
            <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(34,197,94,0.3)", transform: "scale(1.2)" }} />
          )}
          <div
            className="w-20 h-20 rounded-full overflow-hidden border-2"
            style={{ borderColor: phase === "connected" ? "#22c55e" : "rgba(255,255,255,0.1)" }}
          >
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
          <p className="text-xs text-white/40 mt-0.5">{error || statusLabel}</p>
        </div>
      </div>

      {phase === "connected" && (
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

      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition border ${
            micOn ? "border-white/20 bg-white/10 hover:bg-white/15" : "border-red-500/40 bg-red-500/20"
          }`}
          title={micOn ? "Couper le micro" : "Activer le micro"}
        >
          {micOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-red-400" />}
        </button>
        <button
          onClick={hangUp}
          className="w-14 h-14 rounded-2xl flex items-center justify-center border border-red-500/40 bg-red-500/30 hover:bg-red-500/40 transition"
          title="Raccrocher"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={toggleSpeaker}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition border ${
            speakerOn ? "border-white/20 bg-white/10 hover:bg-white/15" : "border-red-500/40 bg-red-500/20"
          }`}
          title={speakerOn ? "Couper le son" : "Activer le son"}
        >
          {speakerOn ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-red-400" />}
        </button>
      </div>
    </div>
  );
}