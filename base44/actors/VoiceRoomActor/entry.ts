import { Actor } from 'base44:runtime/actors';

const MAX_PARTICIPANTS = 32;

/**
 * Voice room signaling actor. Relays WebRTC offers / answers / ICE candidates
 * between participants and broadcasts presence + screen-share state changes.
 * One instance per VoiceRoom entity id — every client connected to that id shares it.
 *
 * Identity is derived from the platform-verified conn.identity, never from
 * client-supplied email/name fields.
 */
export default class VoiceRoomActor extends Actor {
  // conn.id -> { email, name, avatar, sharing, userId }
  participants = new Map();

  async handleConnect(conn) {
    // Reject unauthenticated connections — prevents identity spoofing
    if (!conn.identity || conn.identity.type !== 'authenticated') {
      conn.reject(4401, 'authentication required');
      return;
    }
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

    // Register a participant — identity is server-resolved, not client-supplied
    if (msg.type === 'join') {
      // Ignore the client-supplied email/name — derive from conn.identity
      const userId = conn.identity?.userId;
      if (!userId) return;
      if (sender) return; // already registered

      try {
        const user = await this.client.asServiceRole.entities.User.get(userId);
        if (!user) return;
        this.participants.set(conn.id, {
          userId,
          email: user.email,
          name: user.full_name || user.pseudo || 'Utilisateur',
          avatar: user.avatar_url || '',
          sharing: false,
        });
      } catch (err) {
        console.error('[VoiceRoomActor] failed to resolve user', userId, err);
        return;
      }
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