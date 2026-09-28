import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Send, Search, X, Mail, User, Smile, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import { playMessageSound } from "@/lib/messageSound";
import { isUserOnline } from "@/hooks/usePresence";
import { stripPseudoTag } from "@/lib/format";
import UserProfilePopup from "@/components/profile/UserProfilePopup";
import VoiceRecorder from "@/components/chat/VoiceRecorder";
import VoiceMessagePlayer from "@/components/chat/VoiceMessagePlayer";

const EMOJI_LIST = ["😀", "😂", "🥰", "😍", "😎", "🤔", "😅", "😭", "😡", "👍", "👎", "❤️", "🔥", "✨", "🎉", "💯", "🤝", "👋", "🙏", "💀", "🤡", "👀", "💪", "🫶", "😴", "🥳", "😇", "🤗", "😌", "🙃"];

const SUPPORT_EMAIL = "support@matrix-hub.app";
const SUPPORT_NAME = "Équipe Matrix";
const SUPPORT_AVATAR = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/7f40ce19c_ChatGPT_Image_23_sept_2026_20260923195119.jpeg";

const TICKET_SUPPORT_EMAIL = "support-tickets@matrix-hub.app";
const TICKET_SUPPORT_NAME = "Support";
const TICKET_SUPPORT_AVATAR = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/7f40ce19c_ChatGPT_Image_23_sept_2026_20260923195119.jpeg";

function resolveOfficialIdentity(emailKey) {
  const key = (emailKey || "").toLowerCase();
  if (key === TICKET_SUPPORT_EMAIL) return { name: TICKET_SUPPORT_NAME, avatar: TICKET_SUPPORT_AVATAR, isTicket: true };
  if (key === SUPPORT_EMAIL) return { name: SUPPORT_NAME, avatar: SUPPORT_AVATAR, isTicket: false };
  return null;
}

export default function MessageOverlay({ user, preselectedEmail, onClose, onMessagesRead }) {
  const [contacts, setContacts] = useState([]);
  const [freshUsers, setFreshUsers] = useState({});
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileUserId, setProfileUserId] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch contacts (accepted friends + DM contacts from DirectMessage records)
  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.Friend.filter({ user_email: user.email, status: "accepted" }).catch(() => []),
      base44.entities.DirectMessage.filter({ recipient_email: user.email }, "-created_date", 100).catch(() => []),
      base44.entities.DirectMessage.filter({ sender_email: user.email }, "-created_date", 100).catch(() => []),
    ]).then(([friends, receivedDms, sentDms]) => {
      const friendContacts = (friends || []).map(f => ({
        id: "friend_" + f.id,
        friend_user_id: f.friend_user_id,
        friend_email: f.friend_email,
        friend_name: f.friend_name || f.friend_email?.split("@")[0] || "Utilisateur",
        is_dm_contact: false,
      }));

      // Build DM contacts from messages where the other party is not already a friend
      const friendEmails = new Set((friends || []).map(f => f.friend_email?.toLowerCase()));
      const dmContacts = [];
      const seenEmails = new Set();
      [...(receivedDms || []), ...(sentDms || [])].forEach(dm => {
        const otherEmail = dm.sender_email === user.email ? dm.recipient_email : dm.sender_email;
        const otherName = dm.sender_email === user.email ? dm.recipient_name : dm.sender_name;
        const key = (otherEmail || "").toLowerCase();
        if (key && !friendEmails.has(key) && !seenEmails.has(key)) {
          seenEmails.add(key);
          const official = resolveOfficialIdentity(key);
          const isOfficial = !!official;
          dmContacts.push({
            id: "dm_" + key,
            friend_user_id: null,
            friend_email: otherEmail,
            friend_name: official ? official.name : (otherName || otherEmail?.split("@")[0] || "Contact"),
            is_dm_contact: false,
            is_official: isOfficial,
            last_dm_date: dm.created_date,
          });
        }
      });

      // Sort: DM contacts with recent messages first, then friends
      dmContacts.sort((a, b) => new Date(b.last_dm_date || 0) - new Date(a.last_dm_date || 0));
      setContacts([...dmContacts, ...friendContacts]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  // Fetch fresh profile data for all friends by user_id
  useEffect(() => {
    if (!contacts || contacts.length === 0) return;
    const userIds = [...new Set(contacts.map(f => f.friend_user_id).filter(Boolean))];
    if (userIds.length === 0) return;
    // Also try to auto-select a DM contact matching the preselected email
    if (preselectedEmail) {
      const dmContact = contacts.find(c => c.is_dm_contact && c.friend_email?.toLowerCase() === preselectedEmail.toLowerCase());
      if (dmContact) setSelectedContact(dmContact);
    }
    if (userIds.length === 0) {
      // Still check DM contacts for auto-select even if no friend user IDs
      if (preselectedEmail) {
        const dmContact = contacts.find(c => c.is_dm_contact && c.friend_email?.toLowerCase() === preselectedEmail.toLowerCase());
        if (dmContact) setSelectedContact(dmContact);
      }
      return;
    }
    base44.functions.invoke("serverSearch", { action: "getUsersByIds", ids: userIds })
      .then(res => {
        const map = {};
        (res?.data?.users || []).forEach(u => { map[u.id] = u; });
        setFreshUsers(map);
        // Auto-select preselected contact if provided
        if (preselectedEmail) {
          const preselected = (res?.data?.users || []).find(u => u.email === preselectedEmail);
          if (preselected) {
            const friendRec = contacts.find(f => f.friend_user_id === preselected.id);
            if (friendRec) setSelectedContact(friendRec);
          }
        }
      })
      .catch(() => {});
  }, [contacts, preselectedEmail]);

  // Resolve contact info from fresh user data or DM contact fallback
  const resolveContact = (contact) => {
    const fresh = contact?.friend_user_id ? freshUsers[contact.friend_user_id] : null;
    const official = resolveOfficialIdentity(contact?.friend_email);
    const isOfficial = !!official;
    const officialName = official?.name || SUPPORT_NAME;
    const officialAvatar = official?.avatar || SUPPORT_AVATAR;
    return {
      email: fresh?.email || contact?.friend_email || "",
      name: isOfficial ? officialName : (stripPseudoTag(fresh?.pseudo) || stripPseudoTag(fresh?.full_name) || contact?.friend_name || "Utilisateur"),
      pseudo: isOfficial ? officialName : (stripPseudoTag(fresh?.pseudo) || stripPseudoTag(fresh?.full_name) || contact?.friend_name || "Utilisateur"),
      rawUserId: contact?.friend_user_id || fresh?.id || "",
      avatar: isOfficial ? officialAvatar : (fresh?.avatar_url || contact?.sender_avatar || ""),
      online: isOfficial ? true : isUserOnline(fresh?.last_seen),
      isOfficial,
    };
  };

  // Check block status when contact is selected
  useEffect(() => {
    if (!selectedContact) { setIsBlocked(false); return; }
    const info = resolveContact(selectedContact);
    if (info.email) {
      base44.functions.invoke("serverSearch", { action: "isBlockedBy", target_email: info.email })
        .then(res => setIsBlocked(res?.data?.blocked || false))
        .catch(() => setIsBlocked(false));
    } else {
      setIsBlocked(false);
    }
  }, [selectedContact, freshUsers]);

  // Fetch messages when a contact is selected
  useEffect(() => {
    if (!selectedContact) return;
    const info = resolveContact(selectedContact);
    const contactEmail = info.email;
    if (!contactEmail) return;
    Promise.all([
      base44.entities.DirectMessage.filter({ sender_email: user.email, recipient_email: contactEmail }, "created_date", 200),
      base44.entities.DirectMessage.filter({ sender_email: contactEmail, recipient_email: user.email }, "created_date", 200),
    ]).then(([sent, received]) => {
      const merged = [...(sent || []), ...(received || [])];
      const seenIds = new Set();
      const deduped = merged.filter(m => {
        if (seenIds.has(m.id)) return false;
        seenIds.add(m.id);
        return true;
      }).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      setMessages(deduped);
      // Mark received unread messages as read
      const unread = (received || []).filter(m => !m.is_read);
      if (unread.length > 0) {
        unread.forEach(m => base44.entities.DirectMessage.update(m.id, { is_read: true }));
        if (onMessagesRead) onMessagesRead(unread.length);
      }
    }).catch(() => {});
  }, [selectedContact, user, freshUsers]);

  // Determine if the current conversation is read-only (e.g. closed ticket from Support)
  // Checks the LAST message only — a new message without read-only reopens the conversation
  const isReadOnlyConversation = messages.length > 0 && messages[messages.length - 1].is_read_only;

  // Real-time subscription for new messages in the current conversation
  useEffect(() => {
    if (!selectedContact) return;
    const info = resolveContact(selectedContact);
    const contactEmail = info.email;
    if (!contactEmail) return;
    const unsubscribe = base44.entities.DirectMessage.subscribe((event) => {
      if (event.type === "create") {
        const msg = event.data;
        if (msg.recipient_email === user.email && msg.sender_email === contactEmail) {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          if (!msg.is_read) {
            base44.entities.DirectMessage.update(msg.id, { is_read: true });
            if (onMessagesRead) onMessagesRead(1);
          }
          playMessageSound();
        }
      }
    });
    return unsubscribe;
  }, [selectedContact, user, freshUsers]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (attachment = null, messageType = null) => {
    if ((!input.trim() && !attachment) || !selectedContact) return;
    const info = resolveContact(selectedContact);
    const contactEmail = info.email;
    if (!contactEmail) {
      toast.error("Contact en cours de chargement...");
      return;
    }
    if (isBlocked) {
      toast.error("Vous ne pouvez pas envoyer de message à cet utilisateur.");
      return;
    }
    // Check DM privacy — does the recipient allow messages from non-friends?
    if (!info.isOfficial) {
      try {
        const privacyRes = await base44.functions.invoke("serverSearch", { action: "checkDmPrivacy", target_email: contactEmail });
        if (privacyRes?.data?.can_dm === false) {
          toast.error("Cet utilisateur n'accepte les messages que de ses amis.");
          return;
        }
      } catch { /* fail open — allow if service unreachable */ }
    }
    const content = input.trim();
    setInput("");
    setShowEmojis(false);
    const tempId = Date.now().toString();
    const senderPseudo = user.pseudo || user.full_name || "Utilisateur";
    const type = messageType || (attachment ? "voice" : "text");
    const msgData = {
      sender_email: user.email,
      sender_name: senderPseudo,
      sender_avatar: user.avatar_url || "",
      recipient_email: contactEmail,
      recipient_name: info.pseudo || info.name,
      recipient_avatar: info.avatar,
      content: content || (attachment ? "Message vocal" : ""),
      type,
      file_url: attachment?.url || "",
      transcript: type === "voice" ? (attachment?.transcript || "") : "",
      is_read: false,
    };

    // If messaging Support (tickets), route through the ticket system
    if (contactEmail.toLowerCase() === TICKET_SUPPORT_EMAIL) {
      const ticketMsg = [...messages].reverse().find(m => m.ticket_id);
      if (ticketMsg) {
        setMessages(prev => [...prev, { ...msgData, id: tempId, created_date: new Date().toISOString(), ticket_id: ticketMsg.ticket_id }]);
        try {
          await base44.functions.invoke("ticketSystem", {
            action: "sendMessage",
            ticket_id: ticketMsg.ticket_id,
            content,
          });
        } catch (e) {
          toast.error("Erreur d'envoi du message");
          setMessages(prev => prev.filter(m => m.id !== tempId));
        }
        return;
      }
    }

    setMessages(prev => [...prev, { ...msgData, id: tempId, created_date: new Date().toISOString() }]);
    try {
      await base44.entities.DirectMessage.create(msgData);
    } catch (e) {
      toast.error("Erreur d'envoi du message");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const deleteMessage = async (msgId) => {
    try {
      await base44.entities.DirectMessage.delete(msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
      toast.success("Message supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const filteredContacts = contacts.filter(c => {
    const info = resolveContact(c);
    return !searchQuery ||
      (info.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (info.pseudo?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (info.email?.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Deduplicate by email — keep the friend entry (has friend_user_id) over the DM contact
  const dedupedContacts = (() => {
    const map = new Map();
    filteredContacts.forEach(c => {
      const info = resolveContact(c);
      const key = (info.email || c.id).toLowerCase();
      const existing = map.get(key);
      if (!existing || (!existing.friend_user_id && c.friend_user_id)) {
        map.set(key, c);
      }
    });
    return Array.from(map.values());
  })();

  return (
    <div className="h-screen flex flex-col" style={{ background: "#0a050f" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: "1px solid rgba(168,85,247,0.15)" }}>
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition tap-sm">
          <X className="w-5 h-5 text-white/70" />
        </button>
        <Mail className="w-5 h-5 text-purple-400" />
        <h1 className="text-lg font-black text-white">Messagerie</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Contact list */}
        <div
          className={`${selectedContact ? "hidden md:flex" : "flex"} w-full md:w-80 flex-col shrink-0`}
          style={{ borderRight: "1px solid rgba(168,85,247,0.1)" }}
        >
          {/* Search */}
          <div className="p-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un contact..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/5 text-white placeholder:text-white/30 outline-none text-sm"
              />
            </div>
          </div>
          {/* Contacts */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {loading ? (
              <p className="text-sm text-white/30 text-center py-8">Chargement...</p>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Mail className="w-8 h-8 text-purple-400/30 mx-auto mb-2" />
                <p className="text-sm text-white/40">
                  {searchQuery ? "Aucun contact trouvé" : "Ajoute des amis pour commencer à discuter"}
                </p>
              </div>
            ) : (
              (() => {
                const officialContacts = dedupedContacts.filter(c => c.is_official);
                const teamContacts = officialContacts.filter(c => c.friend_email?.toLowerCase() === SUPPORT_EMAIL);
                const ticketContacts = officialContacts.filter(c => c.friend_email?.toLowerCase() === TICKET_SUPPORT_EMAIL);
                const friendContacts = dedupedContacts.filter(c => !c.is_dm_contact && !c.is_official);
                const requestContacts = dedupedContacts.filter(c => c.is_dm_contact);
                const renderContact = (contact) => {
                  const info = resolveContact(contact);
                  return (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 transition text-left ${selectedContact?.id === contact.id ? "bg-purple-500/10" : "hover:bg-white/5"}`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}>
                          {info.avatar ? <img src={info.avatar} className="w-full h-full object-cover" alt="" /> : <span className="text-sm font-bold text-purple-300">{info.name?.[0]?.toUpperCase() || "?"}</span>}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{ background: info.online ? "#22C55E" : "#6b7280", borderColor: "#0a050f" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{info.pseudo || info.name}</p>
                        <p className="text-[10px] text-white/40 truncate">{info.online ? "En ligne" : "Hors ligne"}</p>
                      </div>
                      {info.rawUserId && (
                        <button onClick={(e) => { e.stopPropagation(); setProfileUserId(info.rawUserId); }} className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-white shrink-0" title="Voir le profil">
                          <User className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </button>
                  );
                };
                return (
                  <>
                    {teamContacts.length > 0 && (
                      <>
                        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#a855f7" }}>Équipe Matrix</p>
                        {teamContacts.map(renderContact)}
                      </>
                    )}
                    {ticketContacts.length > 0 && (
                      <>
                        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#a855f7" }}>Support</p>
                        {ticketContacts.map(renderContact)}
                      </>
                    )}
                    {friendContacts.length > 0 && (
                      <>
                        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">Amis</p>
                        {friendContacts.map(renderContact)}
                      </>
                    )}
                    {requestContacts.length > 0 && (
                      <>
                        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#fbbf24" }}>Demandes de message</p>
                        {requestContacts.map(renderContact)}
                      </>
                    )}
                  </>
                );
              })()
            )}
          </div>
        </div>

        {/* Chat window */}
        {selectedContact ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: "1px solid rgba(168,85,247,0.1)" }}>
              <button
                onClick={() => setSelectedContact(null)}
                className="md:hidden w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition tap-sm"
              >
                <ArrowLeft className="w-4 h-4 text-white/70" />
              </button>
              <div className="relative shrink-0">
                <div
                  className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                  style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}
                >
                  {(() => { const info = resolveContact(selectedContact); return info.avatar ? (
                    <img src={info.avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="text-sm font-bold text-purple-300">
                      {info.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  ); })()}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{
                    background: resolveContact(selectedContact).online ? "#22C55E" : "#6b7280",
                    borderColor: "#0a050f",
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <button
                  onClick={() => resolveContact(selectedContact).rawUserId && setProfileUserId(resolveContact(selectedContact).rawUserId)}
                  className="text-sm font-bold text-white truncate hover:underline text-left block">
                  {resolveContact(selectedContact).name}
                </button>
                <p className="text-[10px] truncate" style={{ color: resolveContact(selectedContact).online ? "#22C55E" : "rgba(255,255,255,0.3)" }}>
                  {resolveContact(selectedContact).online ? "En ligne" : "Hors ligne"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-8">Aucun message. Démarre la conversation !</p>
              ) : (
                messages.map(msg => {
                  const isSent = msg.sender_email === user.email;
                  return (
                    <div key={msg.id} className={`flex group ${isSent ? "justify-end" : "justify-start"}`}>
                      <div className="relative">
                        <div
                          className="max-w-[70%] px-3.5 py-2 rounded-2xl"
                          style={
                            isSent
                              ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 2px 12px rgba(124,58,237,0.3)", borderBottomRightRadius: "4px" }
                              : { background: "rgba(30,20,45,0.8)", border: "1px solid rgba(168,85,247,0.15)", borderBottomLeftRadius: "4px" }
                          }
                        >
                          {msg.type === "voice" && msg.file_url ? (
                            <VoiceMessagePlayer src={msg.file_url} accent="#a855f7" transcript={msg.transcript} />
                          ) : (
                            <p className="text-sm text-white break-words">{msg.content}</p>
                          )}
                          <p className={`text-[9px] mt-1 ${isSent ? "text-white/50" : "text-white/30"}`}>
                            {new Date(msg.created_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {isSent && (
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            style={{ background: "rgba(239,68,68,0.9)" }}
                            title="Supprimer">
                            <Trash2 className="w-2.5 h-2.5 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 shrink-0 relative" style={{ borderTop: "1px solid rgba(168,85,247,0.1)" }}>
              {isReadOnlyConversation ? (
                <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
                  <Lock className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
                  <p className="text-xs font-medium text-white/50">Ce fil de discussion est en lecture seule</p>
                </div>
              ) : (
                <>
                  {isBlocked && (
                    <p className="text-xs text-red-400 mb-2 text-center">⛔ Vous ne pouvez pas envoyer de message à cet utilisateur (bloqué).</p>
                  )}
                  {showEmojis && (
                    <div className="absolute bottom-full left-4 mb-2 p-2 rounded-xl flex flex-wrap gap-1 max-w-[280px]" style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.2)" }}>
                      {EMOJI_LIST.map(emoji => (
                        <button key={emoji} onClick={() => setInput(prev => prev + emoji)} className="w-7 h-7 text-lg hover:bg-white/10 rounded transition tap-sm">{emoji}</button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEmojis(!showEmojis)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition shrink-0 tap-sm"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder={isBlocked ? "Messages bloqués" : "Écris un message..."}
                      disabled={isBlocked}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder:text-white/30 outline-none text-sm disabled:opacity-50"
                    />
                    <VoiceRecorder
                      disabled={isBlocked}
                      accent="#a855f7"
                      onSend={(voice) => sendMessage({ url: voice.url, name: voice.name }, "voice")}
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={(!input.trim() || isBlocked)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition disabled:opacity-40 shrink-0"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 2px 12px rgba(124,58,237,0.3)" }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center">
            <Mail className="w-12 h-12 text-purple-400/30 mb-3" />
            <p className="text-sm text-white/40">Sélectionne un contact pour commencer à discuter</p>
          </div>
        )}
      </div>

      {profileUserId && (
        <UserProfilePopup
          userId={profileUserId}
          open={!!profileUserId}
          onClose={() => setProfileUserId(null)}
          onOpenDm={(contact) => {
            const friend = contacts.find(c => c.friend_user_id === profileUserId);
            if (friend) setSelectedContact(friend);
            setProfileUserId(null);
          }}
        />
      )}
    </div>
  );
}