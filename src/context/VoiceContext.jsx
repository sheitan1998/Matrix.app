import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { useAudioSettings } from "@/hooks/useAudioSettings";
import { playMicMute, playMicUnmute, playSpeakerOff, playSpeakerOn, playCallEnded } from "@/lib/voiceSounds";
import { toast } from "sonner";

const VoiceContext = createContext(null);

export function VoiceProvider({ children }) {
  const { getAudioConstraints } = useAudioSettings();
  const [connected, setConnected] = useState(false);
  const [channel, setChannel] = useState(null);
  const [server, setServer] = useState(null);
  const [theme, setTheme] = useState(null);
  const [user, setUser] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [participants, setParticipants] = useState([]);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const videoRef = useRef(null);

  const connect = useCallback(async (channelData, serverData, themeData, userData) => {
    try {
      // If already connected to a different channel, disconnect first
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia(getAudioConstraints());
      localStreamRef.current = stream;
      setChannel(channelData);
      setServer(serverData);
      setTheme(themeData);
      setUser(userData);
      setConnected(true);
      setMicOn(true);
      setSpeakerOn(true);
      setSharing(false);
      setParticipants([{ name: userData?.pseudo?.split("#")[0] || (userData?.full_name ? userData.full_name.split(" ")[0] : "Moi"), isSelf: true, micOn: true }]);
      toast.success(`Connecté à #${channelData.name} 🎙️`);
    } catch (e) {
      toast.error("Impossible d'accéder au micro. Vérifiez les permissions.");
    }
  }, [getAudioConstraints]);

  const disconnect = useCallback(() => {
    playCallEnded();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setConnected(false);
    setSharing(false);
    setParticipants([]);
    setChannel(null);
    setServer(null);
    setTheme(null);
    setUser(null);
    toast.info("Déconnecté du vocal");
  }, []);

  const toggleMic = useCallback(() => {
    setMicOn((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => { t.enabled = next; });
      }
      setParticipants((p) => p.map((m) => m.isSelf ? { ...m, micOn: next } : m));
      if (next) playMicUnmute(); else playMicMute();
      return next;
    });
  }, []);

  const toggleSpeaker = useCallback(() => {
    setSpeakerOn((prev) => {
      const next = !prev;
      if (next) playSpeakerOn(); else playSpeakerOff();
      return next;
    });
  }, []);

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setSharing(false);
  }, []);

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenStreamRef.current = stream;
      setSharing(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
      stream.getVideoTracks()[0].onended = () => stopScreenShare();
      toast.success("Partage d'écran démarré !");
    } catch (e) {
      toast.error("Partage d'écran annulé");
    }
  }, [stopScreenShare]);

  const value = {
    connected, channel, server, theme, user,
    micOn, speakerOn, sharing, participants,
    localStreamRef, screenStreamRef, videoRef,
    connect, disconnect, toggleMic, toggleSpeaker,
    startScreenShare, stopScreenShare,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used within VoiceProvider");
  return ctx;
}