import { base44 } from "@/api/base44Client";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

/**
 * Manages WebRTC peer connections for screen-share transmission within a voice room.
 * Uses the VoiceRoomActor as a signaling relay: offers / answers / ICE candidates
 * are sent through the actor, which relays them to the intended recipient by email.
 *
 * Topology: when the local user starts sharing, they create one RTCPeerConnection
 * per other participant and send an offer to each. Late joiners are handled in
 * handlePresence — the sharer creates an offer for any new participant.
 */
export class VoiceWebrtcManager {
  constructor(roomId, userInfo) {
    this.roomId = roomId;
    this.userInfo = userInfo;
    this.conn = null;
    this.peerConnections = new Map(); // email -> RTCPeerConnection
    this.remoteStreams = new Map(); // email -> MediaStream
    this.localScreenStream = null;
    this.participants = [];
    this.onRemoteStream = null; // (email, name, stream) => void
    this.onRemoteStreamRemoved = null; // (email) => void
  }

  async connect() {
    try {
      let connId = sessionStorage.getItem("voiceConnId");
      if (!connId) {
        connId = crypto.randomUUID();
        sessionStorage.setItem("voiceConnId", connId);
      }
      this.conn = base44.actors.VoiceRoomActor(this.roomId).connect({ id: connId });
      this.conn.subscribe((msg) => this.handleMessage(msg));
      this.conn.send({
        type: "join",
        email: this.userInfo.email,
        name: this.userInfo.name,
        avatar: this.userInfo.avatar,
      });
    } catch (e) {
      console.warn("WebRTC signaling unavailable:", e);
    }
  }

  handleMessage(msg) {
    if (!msg || typeof msg !== "object") return;
    switch (msg.type) {
      case "presence":
        this.handlePresence(msg.participants || []);
        break;
      case "screen-stop":
        this.removeRemoteStream(msg.email);
        break;
      case "offer":
        this.handleOffer(msg.from, msg.sdp);
        break;
      case "answer":
        this.handleAnswer(msg.from, msg.sdp);
        break;
      case "ice-candidate":
        this.handleIceCandidate(msg.from, msg.candidate);
        break;
      case "participant-left":
        this.removeRemoteStream(msg.email);
        break;
    }
  }

  handlePresence(participants) {
    this.participants = participants;
    // If I'm sharing, create offers for new participants (late joiners)
    if (this.localScreenStream) {
      for (const p of participants) {
        if (p.email === this.userInfo.email) continue;
        if (!this.peerConnections.has(p.email)) {
          this.createOffer(p.email).catch(() => {});
        }
      }
    }
  }

  async startScreenShare(stream) {
    this.localScreenStream = stream;
    this.conn?.send({ type: "screen-start" });
    for (const p of this.participants) {
      if (p.email === this.userInfo.email) continue;
      await this.createOffer(p.email);
    }
  }

  async createOffer(remoteEmail) {
    const pc = this.getOrCreatePeerConnection(remoteEmail);
    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach((track) => {
        if (!pc.getSenders().some((s) => s.track === track)) {
          pc.addTrack(track, this.localScreenStream);
        }
      });
    }
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.conn?.send({ type: "offer", to: remoteEmail, sdp: offer });
  }

  async handleOffer(from, sdp) {
    const pc = this.getOrCreatePeerConnection(from);
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.conn?.send({ type: "answer", to: from, sdp: answer });
    } catch {
      /* glare or state mismatch — ignore */
    }
  }

  async handleAnswer(from, sdp) {
    const pc = this.peerConnections.get(from);
    if (pc && pc.signalingState === "have-local-offer") {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch { /* ignore */ }
    }
  }

  async handleIceCandidate(from, candidate) {
    const pc = this.peerConnections.get(from);
    if (pc && candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch { /* ignore */ }
    }
  }

  getOrCreatePeerConnection(email) {
    if (!this.peerConnections.has(email)) {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.conn?.send({ type: "ice-candidate", to: email, candidate: event.candidate });
        }
      };
      pc.ontrack = (event) => {
        const stream = event.streams[0];
        if (stream) {
          this.remoteStreams.set(email, stream);
          const name = this.getParticipantName(email);
          this.onRemoteStream?.(email, name, stream);
        }
      };
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "closed") {
          this.removeRemoteStream(email);
        }
      };
      this.peerConnections.set(email, pc);
    }
    return this.peerConnections.get(email);
  }

  getParticipantName(email) {
    const p = this.participants.find((p) => p.email === email);
    return p?.name || email;
  }

  removeRemoteStream(email) {
    const pc = this.peerConnections.get(email);
    if (pc) {
      pc.close();
      this.peerConnections.delete(email);
    }
    if (this.remoteStreams.has(email)) {
      this.remoteStreams.delete(email);
      this.onRemoteStreamRemoved?.(email);
    }
  }

  stopScreenShare() {
    for (const pc of this.peerConnections.values()) {
      pc.close();
    }
    this.peerConnections.clear();
    this.localScreenStream = null;
    this.conn?.send({ type: "screen-stop" });
  }

  disconnect() {
    this.stopScreenShare();
    this.conn?.close();
    this.conn = null;
    this.remoteStreams.clear();
    this.participants = [];
  }
}