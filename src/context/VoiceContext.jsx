import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAudioSettings } from "@/hooks/useAudioSettings";
import { useSpeakingDetection } from "@/hooks/useSpeakingDetection";
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
  const [screenStream, setScreenStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [voiceRoomId, setVoiceRoomId] = useState(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const lastSpeakingSynced = useRef(false);

  // Speaking detection on local mic stream
  const { speaking: localSpeaking } = useSpeakingDetection(
    micOn ? localStreamRef.current : null,
    { threshold: 0.06, interval: 80 }
  );

  // Sync participant state to DB
  const updateParticipantInDB = useCallback(async (roomId, email, patch) => {
    try {
      const room = await base44.entities.VoiceRoom.get(roomId);
      if (!room) return;
      const updated = (room.participants || []).map((p) =>
        p.email === email ? { ...p, ...patch } : p
      );
      await base44.entities.VoiceRoom.update(roomId, {
        participants: updated,
        participants_count: updated.length,
      });
    } catch { /* silent */ }
  }, []);

  // Subscribe to VoiceRoom changes for real-time participant updates
  useEffect(() => {
    if (!voiceRoomId) return;
    const unsubscribe = base44.entities.VoiceRoom.subscribe((event) => {
      const room = event.data;
      if (!room || room.id !== voiceRoomId) return;
      setParticipants(room.participants || []);
    });
    return unsubscribe;
  }, [voiceRoomId]);

  // Sync speaking state to participants list (local) and to DB
  useEffect(() => {
    setParticipants((prev) =>
      prev.map((p) => (p.isSelf ? { ...p, speaking: localSpeaking } : p))
    );
    if (voiceRoomId && user?.email && localSpeaking !== lastSpeakingSynced.current) {
      lastSpeakingSynced.current = localSpeaking;
      updateParticipantInDB(voiceRoomId, user.email, { speaking: localSpeaking });
    }
  }, [localSpeaking, voiceRoomId, user, updateParticipantInDB]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const connect = useCallback(async (channelData, serverData, themeData, userData) => {
    try {
      // Clean up existing streams
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setScreenStream(null);

      const stream = await navigator.mediaDevices.getUserMedia(getAudioConstraints());
      localStreamRef.current = stream;

      const myName = userData?.pseudo?.split("#")[0] || userData?.full_name?.split(" ")[0] || "Utilisateur";
      const myParticipant = {
        email: userData?.email || "",
        name: myName,
        avatar: userData?.avatar_url || "",
        micOn: true,
      };

      // Find or create VoiceRoom for this server+channel
      let room = null;
      try {
        const existing = await base44.entities.VoiceRoom.filter({
          server_id: serverData?.id || "",
          channel_id: channelData?.id || "",
        });
        if (existing.items && existing.items.length > 0) {
          room = existing.items[0];
          const current = room.participants || [];
          const filtered = current.filter((p) => p.email !== myParticipant.email);
          const updatedParticipants = [...filtered, myParticipant];
          room = await base44.entities.VoiceRoom.update(room.id, {
            participants: updatedParticipants,
            participants_count: updatedParticipants.length,
          });
        }
      } catch { /* fall through to create */ }

      if (!room) {
        room = await base44.entities.VoiceRoom.create({
          name: channelData?.name || "Salon vocal",
          server_id: serverData?.id || "",
          channel_id: channelData?.id || "",
          owner_email: userData?.email || "",
          owner_name: myName,
          is_public: true,
          participants: [myParticipant],
          participants_count: 1,
        });
      }

      setVoiceRoomId(room.id);
      setChannel(channelData);
      setServer(serverData);
      setTheme(themeData);
      setUser(userData);
      setConnected(true);
      setMicOn(true);
      setSpeakerOn(true);
      setSharing(false);
      setParticipants(room.participants || [myParticipant]);
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
    setScreenStream(null);

    // Remove user from DB
    const roomId = voiceRoomId;
    const email = user?.email;
    if (roomId && email) {
      base44.entities.VoiceRoom.get(roomId).then(async (room) => {
        if (!room) return;
        const updated = (room.participants || []).filter((p) => p.email !== email);
        if (updated.length === 0) {
          await base44.entities.VoiceRoom.delete(roomId);
        } else {
          await base44.entities.VoiceRoom.update(roomId, {
            participants: updated,
            participants_count: updated.length,
          });
        }
      }).catch(() => {});
    }

    setConnected(false);
    setSharing(false);
    setScreenStream(null);
    setParticipants([]);
    setChannel(null);
    setServer(null);
    setTheme(null);
    setUser(null);
    setVoiceRoomId(null);
    toast.info("Déconnecté du vocal");
  }, [voiceRoomId, user]);

  const toggleMic = useCallback(() => {
    setMicOn((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => { t.enabled = next; });
      }
      setParticipants((p) => p.map((m) => m.isSelf ? { ...m, micOn: next } : m));
      if (voiceRoomId && user?.email) {
        updateParticipantInDB(voiceRoomId, user.email, { micOn: next });
      }
      if (next) playMicUnmute(); else playMicMute();
      return next;
    });
  }, [voiceRoomId, user, updateParticipantInDB]);

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
    setScreenStream(null);
    setSharing(false);
  }, []);

  // Replace the current screen stream with a new one (source switching)
  const replaceScreenShare = useCallback((newStream) => {
    // Stop old tracks
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    screenStreamRef.current = newStream;
    setScreenStream(newStream);
    setSharing(true);
    // Listen for the browser's native "stop sharing" button
    const videoTrack = newStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.onended = () => stopScreenShare();
    }
    toast.success("Source de partage mise à jour !");
  }, [stopScreenShare]);

  // Open the custom share picker modal
  const openShareModal = useCallback(() => {
    setShowShareModal(true);
  }, []);

  // Close the share picker modal
  const closeShareModal = useCallback(() => {
    setShowShareModal(false);
  }, []);

  // Called when the user picks a source in the modal
  const handleShareStart = useCallback((stream) => {
    replaceScreenShare(stream);
    setShowShareModal(false);
  }, [replaceScreenShare]);

  // Legacy direct call (kept for compatibility) — now opens the modal
  const startScreenShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const value = {
    connected, channel, server, theme, user,
    micOn, speakerOn, sharing, screenStream, participants,
    localStreamRef, localSpeaking,
    showShareModal, openShareModal, closeShareModal, handleShareStart,
    connect, disconnect, toggleMic, toggleSpeaker,
    startScreenShare, stopScreenShare, replaceScreenShare,
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