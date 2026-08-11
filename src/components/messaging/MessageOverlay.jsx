import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Send, Search, X, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { playMessageSound } from "@/lib/messageSound";
import { isUserOnline } from "@/hooks/usePresence";
import { stripPseudoTag } from "@/lib/format";
import UserProfilePopup from "@/components/profile/UserProfilePopup";

export default function MessageOverlay({ user, preselectedEmail, onClose, onMessagesRead }) {
  const [contacts, setContacts] = useState([]);
  const [freshUsers, setFreshUsers] = useState({});
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileUserId, setProfileUserId] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch contacts (accepted friends)
  useEffect(() => {
    base44.entities.Friend.filter({ user_email: user.email, status: "accepted" })
      .then(data => {
        setContacts(data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  // Fetch fresh profile data for all friends by user_id
  useEffect(() => {
    if (!contacts || contacts.length === 0) return;
    const userIds = [...new Set(contacts.map(f => f.friend_user_id).filter(Boolean))];
    if (userIds.length === 0) return;
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

  // Resolve contact info from fresh user data
  const resolveContact = (contact) => {
    const fresh = contact?.friend_user_id ? freshUsers[contact.friend_user_id] : null;
    return {
      email: fresh?.email || "",
      name: stripPseudoTag(fresh?.full_name) || "Utilisateur",
      pseudo: stripPseudoTag(fresh?.pseudo) || "",
      rawUserId: contact?.friend_user_id || fresh?.id || "",
      avatar: fresh?.avatar_url || "",
      online: isUserOnline(fresh?.last_seen),
    };
  };

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
      const all = [...(sent || []), ...(received || [])].sort(
        (a, b) => new Date(a.created_date) - new Date(b.created_date)
      );
      setMessages(all);
      // Mark received unread messages as read
      const unread = (received || []).filter(m => !m.is_read);
      if (unread.length > 0) {
        unread.forEach(m => base44.entities.DirectMessage.update(m.id, { is_read: true }));
        if (onMessagesRead) onMessagesRead(unread.length);
      }
    }).catch(() => {});
  }, [selectedContact, user, freshUsers]);

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
          setMessages(prev => [...prev, msg]);
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

  const sendMessage = async () => {
    if (!input.trim() || !selectedContact) return;
    const info = resolveContact(selectedContact);
    const contactEmail = info.email;
    if (!contactEmail) {
      toast.error("Impossible de résoudre le destinataire");
      return;
    }
    const content = input.trim();
    setInput("");
    const tempId = Date.now().toString();
    const msgData = {
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      sender_avatar: user.avatar_url || "",
      recipient_email: contactEmail,
      recipient_name: info.name,
      recipient_avatar: info.avatar,
      content,
      is_read: false,
    };
    setMessages(prev => [...prev, { ...msgData, id: tempId, created_date: new Date().toISOString() }]);
    try {
      await base44.entities.DirectMessage.create(msgData);
    } catch (e) {
      toast.error("Erreur d'envoi du message");
    }
  };

  const filteredContacts = contacts.filter(c => {
    const info = resolveContact(c);
    return !searchQuery ||
      (info.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (info.pseudo?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (info.email?.toLowerCase().includes(searchQuery.toLowerCase()));
  });

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
              filteredContacts.map(contact => {
                const info = resolveContact(contact);
                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 transition text-left ${selectedContact?.id === contact.id ? "bg-purple-500/10" : "hover:bg-white/5"}`}
                  >
                    <div className="relative shrink-0">
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                        style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}
                      >
                        {info.avatar ? (
                          <img src={info.avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-sm font-bold text-purple-300">
                            {info.name?.[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <span
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                        style={{
                          background: info.online ? "#22C55E" : "#6b7280",
                          borderColor: "#0a050f",
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{info.name}</p>
                      <p className="text-[10px] text-white/40 truncate">{info.pseudo || info.email}</p>
                    </div>
                    {info.rawUserId && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setProfileUserId(info.rawUserId); }}
                        className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-white shrink-0"
                        title="Voir le profil">
                        <User className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </button>
                );
              })
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
                    <div key={msg.id} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                      <div
                        className="max-w-[70%] px-3.5 py-2 rounded-2xl"
                        style={
                          isSent
                            ? {
                                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                                boxShadow: "0 2px 12px rgba(124,58,237,0.3)",
                                borderBottomRightRadius: "4px",
                              }
                            : {
                                background: "rgba(30,20,45,0.8)",
                                border: "1px solid rgba(168,85,247,0.15)",
                                borderBottomLeftRadius: "4px",
                              }
                        }
                      >
                        <p className="text-sm text-white break-words">{msg.content}</p>
                        <p className={`text-[9px] mt-1 ${isSent ? "text-white/50" : "text-white/30"}`}>
                          {new Date(msg.created_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 shrink-0" style={{ borderTop: "1px solid rgba(168,85,247,0.1)" }}>
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Écris un message..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/5 text-white placeholder:text-white/30 outline-none text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition disabled:opacity-40 shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    boxShadow: "0 2px 12px rgba(124,58,237,0.3)",
                  }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
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