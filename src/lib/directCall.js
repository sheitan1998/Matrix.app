import { base44 } from "@/api/base44Client";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

/** Deterministic room id shared by the two participants of a 1:1 call. */
export function callRoomId(emailA, emailB) {
  const raw = [emailA, emailB]
    .map((e) => (e || "").toLowerCase().trim())
    .sort()
    .join("|");
  let hash = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return `dmcall_${hash.toString(36)}`;
}

/**
 * WebRTC audio connection for a 1:1 call.
 * Signaling goes through the VoiceRoomActor, which relays offers, answers and
 * ICE candidates between the two participants of the room.
 */
export class DirectCallConnection {
  constructor({ roomId, peerEmail, localStream, isCaller, onRemoteStream, onStateChange }) {
    this.roomId = roomId;
    this.peerEmail = (peerEmail || "").toLowerCase();
    this.peerAddress = peerEmail || "";
    this.localStream = localStream;
    this.isCaller = isCaller;
    this.onRemoteStream = onRemoteStream;
    this.onStateChange = onStateChange;
    this.conn = null;
    this.pc = null;
    this.offerStarted = false;
    this.pendingCandidates = [];
    this.closed = false;
  }

  connect() {
    const connId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `call_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.conn = base44.actors.VoiceRoomActor(this.roomId).connect({ id: connId });
    this.conn.subscribe((msg) => this.handleMessage(msg));
    this.conn.send({ type: "join" });
  }

  handleMessage(msg) {
    if (!msg || typeof msg !== "object" || this.closed) return;

    if (msg.type === "presence") {
      const peer = (msg.participants || []).find(
        (p) => p.email && p.email.toLowerCase() === this.peerEmail
      );
      if (peer) {
        this.peerAddress = peer.email;
        if (this.isCaller && !this.offerStarted) {
          this.offerStarted = true;
          this.createOffer().catch(() => {});
        }
      }
      return;
    }

    if (msg.type === "offer" && !this.isCaller) {
      this.handleOffer(msg.sdp).catch(() => {});
      return;
    }
    if (msg.type === "answer" && this.isCaller) {
      this.handleAnswer(msg.sdp).catch(() => {});
      return;
    }
    if (msg.type === "ice-candidate") {
      this.handleIceCandidate(msg.candidate);
      return;
    }
    if (msg.type === "participant-left" && msg.email?.toLowerCase() === this.peerEmail) {
      this.onStateChange?.("disconnected");
    }
  }

  ensurePeer() {
    if (this.pc) return this.pc;
    const pc = new RTCPeerConnection(ICE_SERVERS);
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => pc.addTrack(track, this.localStream));
    }
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.conn?.send({
          type: "ice-candidate",
          to: this.peerAddress,
          candidate: event.candidate,
        });
      }
    };
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) this.onRemoteStream?.(stream);
    };
    pc.onconnectionstatechange = () => {
      this.onStateChange?.(pc.connectionState);
    };
    this.pc = pc;
    return pc;
  }

  async createOffer() {
    const pc = this.ensurePeer();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.conn?.send({ type: "offer", to: this.peerAddress, sdp: offer });
  }

  async handleOffer(sdp) {
    const pc = this.ensurePeer();
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    await this.flushCandidates();
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.conn?.send({ type: "answer", to: this.peerAddress, sdp: answer });
  }

  async handleAnswer(sdp) {
    const pc = this.pc;
    if (!pc) return;
    if (pc.signalingState === "have-local-offer") {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await this.flushCandidates();
    }
  }

  async handleIceCandidate(candidate) {
    if (!candidate) return;
    const pc = this.pc;
    if (!pc || !pc.remoteDescription) {
      this.pendingCandidates.push(candidate);
      return;
    }
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {
      /* candidate already applied */
    }
  }

  async flushCandidates() {
    const pc = this.pc;
    if (!pc) return;
    const queued = this.pendingCandidates;
    this.pendingCandidates = [];
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        /* ignore */
      }
    }
  }

  disconnect() {
    this.closed = true;
    try {
      this.conn?.close();
    } catch {
      /* ignore */
    }
    this.conn = null;
    if (this.pc) {
      try {
        this.pc.close();
      } catch {
        /* ignore */
      }
      this.pc = null;
    }
  }
}