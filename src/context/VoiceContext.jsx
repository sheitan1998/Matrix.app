import React, { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAudioSettings } from "@/hooks/useAudioSettings";
import { useSpeakingDetection } from "@/hooks/useSpeakingDetection";
import { playMicMute, playMicUnmute, playSpeakerOff, playSpeakerOn, playCallEnded } from "@/lib/voiceSounds";
import { toast } from "sonner";
import ScreenSourcePicker from "@/components/community/ScreenSourcePicker";
import { isTauriApp } from "@/lib/nativeScreenCapture";
import { VoiceWebrtcManager } from "@/lib/voiceWebrtc";

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
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [voiceRoomId, setVoiceRoomId] = useState(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const lastSpeakingSynced = useRef(false);
  const speakingWrite = useRef({ timer: null, lastWrite: 0 });
  const webrtcManagerRef = useRef(null);
  const [remoteScreenStreams, setRemoteScreenStreams] = useState([]);

  // Live voice-activity detection on the mic stream (a muted track is silent -> "not speaking")
  const { speaking: localSpeaking } = useSpeakingDetection(localStream);
  const localSpeakingRef = useRef(false);
  localSpeakingRef.current = localSpeaking;

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

  // Share the local speaking state with the room (throttled) so other members see the ring
  useEffect(() => {
    if (!voiceRoomId || !user?.email) return;
    const state = speakingWrite.current;
    if (state.timer || localSpeaking === lastSpeakingSynced.current) return;
    const wait = Math.max(0, 300 - (Date.now() - state.lastWrite));
    state.timer = setTimeout(() => {
      state.timer = null;
      const value = localSpeakingRef.current;
      if (value === lastSpeakingSynced.current) return;
      lastSpeakingSynced.current = value;
      state.lastWrite = Date.now();
      updateParticipantInDB(voiceRoomId, user.email, { speaking: value });
    }, wait);
  }, [localSpeaking, voiceRoomId, user, updateParticipantInDB]);

  // Drop any pending speaking write when leaving a room
  useEffect(() => () => {
    clearTimeout(speakingWrite.current.timer);
    speakingWrite.current.timer = null;
  }, [voiceRoomId]);

  // Participants shown in the UI: the local user's own mic/speaking state comes straight from the
  // live audio analysis (no database round trip), so the ring reacts instantly.
  const displayParticipants = useMemo(() => {
    const me = user?.email?.toLowerCase();
    return participants.map((p) =>
      me && (p.email || "").toLowerCase() === me
        ? { ...p, isSelf: true, micOn, speaking: micOn && localSpeaking }
        : p
    );
  }, [participants, user, micOn, localSpeaking]);

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

  // Disconnect from the WebRTC actor when the page is closing (tab close, navigation)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.disconnect();
        webrtcManagerRef.current = null;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
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

      // Clean up any existing WebRTC session before reconnecting
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.disconnect();
        webrtcManagerRef.current = null;
      }
      setRemoteScreenStreams([]);

      const stream = await navigator.mediaDevices.getUserMedia(getAudioConstraints());
      localStreamRef.current = stream;
      setLocalStream(stream);
      lastSpeakingSynced.current = false;

      const myName = userData?.pseudo?.split("#")[0] || userData?.full_name?.split(" ")[0] || "Utilisateur";
      const myParticipant = {
        email: userData?.email || "",
        name: myName,
        avatar: userData?.avatar_url || "",
        micOn: true,
        speaking: false,
      };

      // Find or create VoiceRoom for this server+channel
      let room = null;
      try {
        const existing = await base44.entities.VoiceRoom.filter({
          server_id: serverData?.id || "",
          channel_id: channelData?.id || "",
        });
        const existingRooms = Array.isArray(existing) ? existing : existing?.items || [];
        if (existingRooms.length > 0) {
          room = existingRooms[0];
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

      // Connect to the WebRTC signaling actor for screen-share transmission
      try {
        const manager = new VoiceWebrtcManager(room.id, {
          email: userData?.email || "",
          name: myName,
          avatar: userData?.avatar_url || "",
        });
        manager.onRemoteStream = (email, name, stream) => {
          setRemoteScreenStreams((prev) => {
            const filtered = prev.filter((s) => s.email !== email);
            return [...filtered, { email, name, stream }];
          });
        };
        manager.onRemoteStreamRemoved = (email) => {
          setRemoteScreenStreams((prev) => prev.filter((s) => s.email !== email));
        };
        await manager.connect();
        webrtcManagerRef.current = manager;
      } catch (e) {
        console.warn("WebRTC signaling unavailable:", e);
      }

      toast.success(`Connecté à #${channelData.name} 🎙️`);
    } catch (e) {
      toast.error("Impossible d'accéder au micro. Vérifiez les permissions.");
    }
  }, [getAudioConstraints]);

  const disconnect = useCallback(() => {
    playCallEnded();

    // 1. Close all WebRTC peer connections and disconnect from the signaling actor
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.disconnect();
      webrtcManagerRef.current = null;
    }

    // 2. Stop all media tracks (mic + screen share)
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    // 3. Clear the speaking-state debounce timer
    clearTimeout(speakingWrite.current.timer);
    speakingWrite.current.timer = null;

    // 4. Reset local state immediately (optimistic UI)
    setScreenStream(null);
    setLocalStream(null);
    setRemoteScreenStreams([]);
    lastSpeakingSynced.current = false;
    setConnected(false);
    setSharing(false);
    setParticipants([]);
    setChannel(null);
    setServer(null);
    setTheme(null);
    setUser(null);
    setVoiceRoomId(null);

    // 5. Remove the user from the VoiceRoom entity — the actor already broadcast
    //    "participant-left" to everyone, so real-time presence is instant.
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

    toast.info("Déconnecté du vocal");
  }, [voiceRoomId, user]);

  const toggleMic = useCallback(() => {
    const next = !micOn;
    setMicOn(next);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => { t.enabled = next; });
    }
    if (voiceRoomId && user?.email) {
      updateParticipantInDB(voiceRoomId, user.email, { micOn: next });
    }
    if (next) playMicUnmute(); else playMicMute();
  }, [micOn, voiceRoomId, user, updateParticipantInDB]);

  const toggleSpeaker = useCallback(() => {
    setSpeakerOn((prev) => {
      const next = !prev;
      if (next) playSpeakerOn(); else playSpeakerOff();
      return next;
    });
  }, []);

  const stopScreenShare = useCallback(() => {
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.stopScreenShare();
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setScreenStream(null);
    setSharing(false);
  }, []);

  // Show a freshly captured stream (first share, or a source switch replacing the old one)
  const applyScreenStream = useCallback((newStream) => {
    const switching = !!screenStreamRef.current;
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    screenStreamRef.current = newStream;
    setScreenStream(newStream);
    setSharing(true);
    // The browser's native "stop sharing" button ends the track
    const videoTrack = newStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.onended = () => {
        if (screenStreamRef.current === newStream) stopScreenShare();
      };
    }
    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.startScreenShare(newStream).catch(() => {});
    }
    toast.success(switching ? "Source de partage mise à jour" : "Partage d'écran démarré");
  }, [stopScreenShare]);

  // Browser fallback (web app, or a desktop build without native capture): the browser's own
  // picker is the only source chooser available there, so it opens directly — nothing in front.
  const browserScreenShare = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error("Le partage d'écran n'est pas supporté par ce navigateur.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true });
      applyScreenStream(stream);
    } catch (e) {
      if (e?.name !== "NotAllowedError" && e?.name !== "AbortError") {
        toast.error("Erreur lors du partage d'écran.");
      }
    }
  }, [applyScreenStream]);

  // Desktop client: the in-app picker (with thumbnails) is the only chooser, no browser dialog.
  const startScreenShare = useCallback(() => {
    if (isTauriApp()) setShowSourcePicker(true);
    else browserScreenShare();
  }, [browserScreenShare]);

  const handleSourcePicked = useCallback((stream) => {
    setShowSourcePicker(false);
    applyScreenStream(stream);
  }, [applyScreenStream]);

  const closeSourcePicker = useCallback(() => setShowSourcePicker(false), []);

  const fallbackToBrowserShare = useCallback(() => {
    setShowSourcePicker(false);
    browserScreenShare();
  }, [browserScreenShare]);

  const value = {
    connected, channel, server, theme, user,
    micOn, speakerOn, sharing, screenStream, remoteScreenStreams, participants: displayParticipants,
    localStreamRef, localSpeaking: micOn && localSpeaking,
    connect, disconnect, toggleMic, toggleSpeaker,
    startScreenShare, stopScreenShare,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
      <ScreenSourcePicker
        open={showSourcePicker}
        accent={theme?.accent}
        onSelect={handleSourcePicked}
        onClose={closeSourcePicker}
        onFallback={fallbackToBrowserShare}
      />
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used within VoiceProvider");
  return ctx;
}