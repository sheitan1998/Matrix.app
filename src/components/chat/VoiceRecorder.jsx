import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function VoiceRecorder({ onSend, disabled, accent = "hsl(135 100% 50%)" }) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = async () => {
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      // Pick the best supported mime type
      const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg", "audio/mp4"];
      const mimeType = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = handleStop;
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        toast.error("Accès au microphone refusé. Autorisez le microphone dans les paramètres de votre navigateur/app.");
      } else if (err.name === "NotFoundError") {
        toast.error("Aucun microphone détecté sur cet appareil.");
      } else {
        toast.error("Impossible d'accéder au microphone: " + (err.message || "erreur inconnue"));
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.ignoreStop = true;
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setRecording(false);
    setSeconds(0);
    chunksRef.current = [];
  };

  const handleStop = async () => {
    if (mediaRecorderRef.current?.ignoreStop) {
      mediaRecorderRef.current.ignoreStop = false;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      return;
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());

    const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current.mimeType || "audio/webm" });
    if (blob.size < 500) {
      toast.error("Enregistrement trop court");
      setSeconds(0);
      return;
    }

    setUploading(true);
    try {
      const ext = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "m4a" : "webm";
      const fileName = `voice_${Date.now()}.${ext}`;
      const file = new File([blob], fileName, { type: blob.type });
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      const duration = seconds;
      onSend({ url: file_url, name: fileName, duration });
      setSeconds(0);
    } catch {
      toast.error("Erreur lors de l'envoi du message vocal");
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (recording) {
    return (
      <div className="flex items-center gap-2 flex-1">
        <button
          onClick={cancelRecording}
          disabled={uploading}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-red-400 hover:text-red-300 transition disabled:opacity-30 shrink-0"
          title="Annuler"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="text-xs font-mono text-white/80">{formatTime(seconds)}</span>
          <span className="text-xs text-white/40">Enregistrement…</span>
        </div>
        <button
          onClick={stopRecording}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition shrink-0"
          style={{ background: accent + "30", color: accent }}
          title="Arrêter et envoyer"
        >
          {uploading ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : <Send className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startRecording}
      disabled={disabled || uploading}
      className="w-8 h-8 rounded-xl flex items-center justify-center transition text-white/40 hover:text-white disabled:opacity-30 shrink-0"
      title="Message vocal"
    >
      {uploading ? (
        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : <Mic className="w-4 h-4" />}
    </button>
  );
}