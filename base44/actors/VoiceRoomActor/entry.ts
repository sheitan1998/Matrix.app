import { Actor } from 'base44:runtime/actors';

const MAX_PARTICIPANTS = 32;

/**
 * Voice room signaling actor. Relays WebRTC offers / answers / ICE candidates
 * between participants and broadcasts presence + screen-share state changes.
 * One instance per VoiceRoom entity id — every client connected to that id shares it.
 */
export default class VoiceRoomActor extends Actor {
  // conn.id -> { email, name, avatar, sharing }
  participants = new Map();

  async handleConnect(conn) {
    if (this.participants.size >= MAX_PARTICIPANTS) {
      conn.reject(4001, 'room full');
      return;
    }
    conn.send({ type: 'connected' });
    this.broadcastPresence();
  }

  async handleMessage(conn, msg) {
    if (typeof msg !== 'object' || msg === null) return;
    const sender = this.participants.get(conn.id);

    // Register a participant (sent right after connect)
    if (msg.type === 'join') {
      this.participants.set(conn.id, {
        email: String(msg.email || ''),
        name: String(msg.name || 'Utilisateur'),
        avatar: String(msg.avatar || ''),
        sharing: false,
      });
      this.broadcastPresence();
      return;
    }

    if (!sender) return;

    // Screen-share state changes (broadcast to everyone)
    if (msg.type === 'screen-start') {
      sender.sharing = true;
      this.broadcast({ type: 'screen-start', email: sender.email });
      return;
    }
    if (msg.type === 'screen-stop') {
      sender.sharing = false;
      this.broadcast({ type: 'screen-stop', email: sender.email });
      return;
    }

    // Relay WebRTC signaling to a specific recipient (by email)
    if (msg.type === 'offer' || msg.type === 'answer' || msg.type === 'ice-candidate') {
      const targetConn = this.getConnections().find((c) => {
        const p = this.participants.get(c.id);
        return p && p.email === msg.to;
      });
      if (targetConn) {
        targetConn.send({ ...msg, from: sender.email });
      }
      return;
    }
  }

  async handleClose(conn) {
    const participant = this.participants.get(conn.id);
    this.participants.delete(conn.id);
    if (participant) {
      this.broadcast({ type: 'participant-left', email: participant.email });
    }
    this.broadcastPresence();
  }

  broadcastPresence() {
    this.broadcast({
      type: 'presence',
      participants: [...this.participants.values()].map((p) => ({
        email: p.email,
        name: p.name,
        avatar: p.avatar,
        sharing: p.sharing,
      })),
    });
  }
}