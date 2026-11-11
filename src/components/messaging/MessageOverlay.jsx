import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Send, Search, X, Mail, User, Smile, Trash2, Lock, Phone, UserCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { playMessageSound } from "@/lib/messageSound";
import { messageAlertsEnabled } from '@/lib/notificationPreferences';
import { isUserOnline } from "@/hooks/usePresence";
import { stripPseudoTag } from "@/lib/format";
import UserProfilePopup from "@/components/profile/UserProfilePopup";
import VoiceRecorder from "@/components/chat/VoiceRecorder";
import VoiceMessagePlayer from "@/components/chat/VoiceMessagePlayer";
import { useCall } from "@/context/CallContext";
import ContactSkeletonRow from "@/components/messaging/ContactSkeletonRow";
import { isEmojiOnly } from "@/lib/emojiUtils";
import UnifiedPicker from "@/components/chat/UnifiedPicker";

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
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profileFetchDone, setProfileFetchDone] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [friendships, setFriendships] = useState([]);
  const [tab, setTab] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [addPseudo, setAddPseudo] = useState("");
  const [adding, setAdding] = useState(false);
  const messagesEndRef = useRef(null);
  const { startCall } = useCall();

  // Fetch contacts (accepted friends + DM contacts from DirectMessage records)
  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.Friend.filter({ user_email: user.email }, "-created_date", 200).catch(() => []),
      base44.entities.DirectMessage.filter({ recipient_email: user.email }, "-created_date", 100).catch(() => []),
      base44.entities.DirectMessage.filter({ sender_email: user.email }, "-created_date", 100).catch(() => []),
    ]).then(([allFriendships, receivedDms, sentDms]) => {
      const friends = (allFriendships || []).filter(f => f.status === "accepted");
      setFriendships(allFriendships || []);
      const friendContacts = (friends || []).map(f => ({
        id: "friend_" + f.id,
        friend_user_id: f.friend_user_id,
        friend_email: f.friend_email,
        friend_name: f.friend_name || f.friend_email?.split("@")[0] || "",
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
            friend_name: official ? official.name : (otherName || otherEmail?.split("@")[0] || ""),
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
  }, [user, refreshKey]);

  // Fetch fresh profile data for all friends by user_id
  useEffect(() => {
    if (!contacts || contacts.length === 0) {
      setProfileFetchDone(true);
      return;
    }

    const userIds = [...new Set([
      ...contacts.map(f => f.friend_user_id),
      ...friendships.map(f => f.friend_user_id),
    ].filter(Boolean))];
    if (userIds.length === 0) {
      setProfileFetchDone(true);
      return;
    }

    setProfilesLoading(true);
    base44.functions.invoke("serverSearch", { action: "getUsersByIds", ids: userIds })
      .then(res => {
        const map = {};
        (res?.data?.users || []).forEach(u => { map[u.id] = u; });
        setFreshUsers(map);
        if (preselectedEmail) {
          const target = preselectedEmail.toLowerCase();
          const found = contacts.find(c =>
            (c.friend_email || "").toLowerCase() === target ||
            (map[c.friend_user_id]?.email || "").toLowerCase() === target
          );
          if (found) setSelectedContact(found);
        }
      })
      .catch(() => {})
      .finally(() => {
        setProfilesLoading(false);
        setProfileFetchDone(true);
      });
  }, [contacts, friendships, preselectedEmail]);

  // Resolve contact info from fresh user data or DM contact fallback
  const resolveContact = (contact) => {
    const fresh = contact?.friend_user_id ? freshUsers[contact.friend_user_id] : null;
    const official = resolveOfficialIdentity(contact?.friend_email);
    const isOfficial = !!official;

    // Official contacts (Support / Team Matrix) are always resolved
    if (isOfficial) {
      return {
        email: contact?.friend_email || "",
        name: official.name,
        pseudo: official.name,
        rawUserId: contact?.friend_user_id || "",
        avatar: official.avatar,
        online: true,
        isOfficial: true,
        resolved: true,
      };
    }

    // Friend contacts with a user_id — wait for fresh profile data
    if (contact?.friend_user_id) {
      const resolvedName = stripPseudoTag(fresh?.pseudo) || "";
      // Profile found with a valid pseudo → fully resolved
      if (resolvedName) {
        return {
          email: contact?.friend_email || fresh?.email || "",
          name: resolvedName,
          pseudo: resolvedName,
          rawUserId: contact?.friend_user_id || fresh?.id || "",
          avatar: fresh?.avatar_url || "",
          online: isUserOnline(fresh?.last_seen),
          isOfficial: false,
          resolved: true,
        };
      }
      // Fetch still in progress → skeleton, no name displayed
      if (!profileFetchDone) {
        return {
          email: contact?.friend_email || fresh?.email || "",
          name: "",
          pseudo: "",
          rawUserId: contact?.friend_user_id || "",
          avatar: "",
          online: false,
          isOfficial: false,
          resolved: false,
        };
      }
      // Fetch done but no pseudo available → truncated email fallback (request completed)
      const fallbackName = contact?.friend_email?.split("@")[0] || "Membre";
      return {
        email: contact?.friend_email || fresh?.email || "",
        name: fallbackName,
        pseudo: fallbackName,
        rawUserId: contact?.friend_user_id || "",
        avatar: "",
        online: false,
        isOfficial: false,
        resolved: true,
      };
    }

    // DM contacts — name comes from the message record itself (no fetch needed)
    const dmName = stripPseudoTag(contact?.friend_name) || contact?.friend_email?.split("@")[0] || "Membre";
    return {
      email: contact?.friend_email || "",
      name: dmName,
      pseudo: dmName,
      rawUserId: "",
      avatar: contact?.sender_avatar || "",
      online: false,
      isOfficial: false,
      resolved: true,
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
          if (messageAlertsEnabled(user)) playMessageSound();
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
    setShowPicker(false);
    const tempId = Date.now().toString();
    const senderPseudo = user.pseudo || user.full_name || user.email?.split("@")[0] || "Membre";
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

  const handleSendMedia = async (url) => {
    if (!url || !selectedContact) return;
    const info = resolveContact(selectedContact);
    const contactEmail = info.email;
    if (!contactEmail) { toast.error("Contact en cours de chargement..."); return; }
    if (isBlocked) { toast.error("Vous ne pouvez pas envoyer de message à cet utilisateur."); return; }
    setShowPicker(false);
    const tempId = Date.now().toString();
    const senderPseudo = user.pseudo || user.full_name || user.email?.split("@")[0] || "Membre";
    const msgData = {
      sender_email: user.email,
      sender_name: senderPseudo,
      sender_avatar: user.avatar_url || "",
      recipient_email: contactEmail,
      recipient_name: info.pseudo || info.name,
      recipient_avatar: info.avatar,
      content: url,
      type: "text",
      is_read: false,
    };
    setMessages(prev => [...prev, { ...msgData, id: tempId, created_date: new Date().toISOString() }]);
    try {
      await base44.entities.DirectMessage.create(msgData);
    } catch {
      toast.error("Erreur d'envoi du média");
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

  const pendingReceived = friendships.filter(f => f.status === "pending_received");
  const pendingSent = friendships.filter(f => f.status === "pending_sent");

  const parsePseudoTag = (value) => {
    const trimmed = value.trim();
    const hashIdx = trimmed.indexOf("#");
    if (hashIdx === -1) return { pseudo: trimmed, tag: null };
    return { pseudo: trimmed.slice(0, hashIdx).trim(), tag: trimmed.slice(hashIdx + 1).trim() };
  };

  const sendFriendRequest = async () => {
    if (!addPseudo?.trim() || !user?.email) return;
    const input = addPseudo.trim();
    const isEmail = input.includes("@");
    const { pseudo, tag } = parsePseudoTag(input);
    if (!pseudo && !isEmail) { toast.error("Pseudo invalide"); return; }
    setAdding(true);
    try {
      const res = await base44.functions.invoke("serverSearch", isEmail
        ? { action: "addFriend", email: input }
        : { action: "addFriend", pseudo, tag });
      if (!res?.data?.success) {
        toast.error(res?.data?.error || "Erreur lors de l'envoi");
        return;
      }
      setAddPseudo("");
      setRefreshKey(k => k + 1);
      toast.success(`Demande envoyée à ${res.data.target_name || ""} !`);
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Erreur lors de l'envoi");
    }
    setAdding(false);
  };

  const acceptRequest = async (friend) => {
    if (!friend?.friend_user_id) return;
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "acceptFriendRequest",
        friend_user_id: friend.friend_user_id,
      });
      if (!res?.data?.success) {
        toast.error(res?.data?.error || "Erreur lors de l'acceptation");
        return;
      }
      setRefreshKey(k => k + 1);
      toast.success("Ami accepté !");
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Erreur");
    }
  };

  const declineRequest = async (friend) => {
    if (!friend?.friend_user_id) return;
    try {
      const res = await base44.functions.invoke("serverSearch", {
        action: "removeFriend",
        friend_user_id: friend.friend_user_id,
      });
      if (!res?.data?.success) {
        toast.error(res?.data?.error || "Erreur lors du refus");
        return;
      }
      setRefreshKey(k => k + 1);
      toast.success("Demande refusée");
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Erreur");
    }
  };

  const pendingName = (friend) => {
    const fresh = friend?.friend_user_id ? freshUsers[friend.friend_user_id] : null;
    return stripPseudoTag(fresh?.pseudo || fresh?.full_name || friend?.friend_name)
      || friend?.friend_email?.split("@")[0]
      || "Utilisateur";
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

  const selectedInfo = selectedContact ? resolveContact(selectedContact) : null;

  const visibleContacts = (tab === "online"
    ? dedupedContacts.filter(c => resolveContact(c).online)
    : dedupedContacts
  ).sort((a, b) => Number(resolveContact(b).isOfficial) - Number(resolveContact(a).isOfficial)
    || Number(resolveContact(b).online) - Number(resolveContact(a).online));

  const officialRows = visibleContacts.filter(c => resolveContact(c).isOfficial);
  const friendRows = visibleContacts.filter(c => !resolveContact(c).isOfficial);

  const renderContact = (contact) => {
    const info = resolveContact(contact);
    if (!info.resolved) return <ContactSkeletonRow key={contact.id} />;
    return (
      <div
        key={contact.id}
        role="button"
        tabIndex={0}
        onClick={() => setSelectedContact(contact)}
        onKeyDown={(e) => { if (e.key === "Enter") setSelectedContact(contact); }}
        className={`group w-full flex items-center gap-3 px-3 py-2.5 transition text-left cursor-pointer ${selectedContact?.id === contact.id ? "bg-purple-500/10" : "hover:bg-white/5"}`}
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
        {info.resolved && info.email && !info.isOfficial && (
          <button
            onClick={(e) => { e.stopPropagation(); startCall(info); }}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition hover:bg-green-500/20"
            style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}
            title={`Appeler ${info.pseudo || info.name}`}
          >
            <Phone className="w-3.5 h-3.5 text-green-400" />
          </button>
        )}
        {info.rawUserId && (
          <button onClick={(e) => { e.stopPropagation(); setProfileUserId(info.rawUserId); }} className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-white shrink-0" title="Voir le profil">
            <User className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

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
          {/* Onglets : En ligne / Tous / En attente */}
          <div className="p-3 pb-0 shrink-0">
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.15)" }}>
              {[
                { key: "online", label: "En ligne" },
                { key: "all", label: "Tous" },
                { key: "pending", label: "En attente" },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="flex-1 h-8 px-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition tap-sm"
                  style={tab === t.key
                    ? { background: "linear-gradient(135deg, #a855f7, #6d28d9)", color: "#fff" }
                    : { color: "rgba(255,255,255,0.5)" }}
                >
                  {t.label}
                </button>
              ))}
              <button
                onClick={() => setTab("pending")}
                className="h-8 px-2 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 tap-sm"
                style={{ background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.35)", color: "#d8b4fe" }}
                title="Ajouter un ami"
              >
                <Send className="w-3 h-3" /> Ajouter
              </button>
            </div>
          </div>

          {/* Recherche (onglets En ligne et Tous) */}
          {tab !== "pending" && (
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
          )}

          {/* Contacts */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {tab === "pending" ? (
              <div className="p-3 space-y-3">
                {/* Ajout d'ami — identique à la page Mon profil */}
                <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.15)" }}>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                    <Search className="w-4 h-4" style={{ color: "#a855f7" }} /> Rechercher un utilisateur
                  </h3>
                  <div className="flex gap-2">
                    <input
                      value={addPseudo}
                      onChange={e => setAddPseudo(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendFriendRequest()}
                      placeholder="Pseudo#1234 ou email"
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                    <button
                      onClick={sendFriendRequest}
                      disabled={adding}
                      className="px-4 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                      style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}
                    >
                      <Send className="w-3.5 h-3.5" /> Ajouter
                    </button>
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">Format : Pseudo#1234 (le tag identifie l'utilisateur) ou son email</p>
                </div>

                {pendingReceived.length > 0 && (
                  <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(234,179,8,0.2)" }}>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-yellow-500" /> Demandes reçues ({pendingReceived.length})
                    </h3>
                    <div className="space-y-2">
                      {pendingReceived.map(f => {
                        const fresh = f.friend_user_id ? freshUsers[f.friend_user_id] : null;
                        const name = pendingName(f);
                        return (
                          <div key={f.id} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "rgba(168,85,247,0.2)" }}>
                              {fresh?.avatar_url ? <img src={fresh.avatar_url} alt="" className="w-full h-full object-cover" /> : name[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{name}</p>
                              <p className="text-[9px] text-white/40 truncate">{f.friend_email}</p>
                            </div>
                            <button onClick={() => acceptRequest(f)} title="Accepter" className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 tap-sm" style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}>
                              <UserCheck className="w-3.5 h-3.5 text-green-400" />
                            </button>
                            <button onClick={() => declineRequest(f)} title="Refuser" className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 tap-sm" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
                              <X className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {pendingSent.length > 0 && (
                  <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h3 className="text-sm font-bold text-white/60 flex items-center gap-2 mb-3">
                      <Send className="w-4 h-4" /> Demandes envoyées ({pendingSent.length})
                    </h3>
                    <div className="space-y-2">
                      {pendingSent.map(f => {
                        const fresh = f.friend_user_id ? freshUsers[f.friend_user_id] : null;
                        const name = pendingName(f);
                        return (
                          <div key={f.id} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "rgba(168,85,247,0.2)" }}>
                              {fresh?.avatar_url ? <img src={fresh.avatar_url} alt="" className="w-full h-full object-cover" /> : name[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white/70 truncate">{name}</p>
                              <p className="text-[9px] text-white/30 truncate">{f.friend_email}</p>
                            </div>
                            <span className="text-[9px] text-white/40 px-2 py-1 rounded shrink-0" style={{ background: "rgba(255,255,255,0.05)" }}>En attente</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {pendingReceived.length + pendingSent.length === 0 && (
                  <p className="text-sm text-white/40 text-center py-4">Aucune demande en attente.</p>
                )}
              </div>
            ) : loading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <ContactSkeletonRow key={`skeleton-loading-${i}`} />
                ))}
              </>
            ) : visibleContacts.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Mail className="w-8 h-8 text-purple-400/30 mx-auto mb-2" />
                <p className="text-sm text-white/40">
                  {searchQuery ? "Aucun contact trouvé" : tab === "online" ? "Aucun ami en ligne" : "Ajoute des amis pour commencer à discuter"}
                </p>
              </div>
            ) : (
              <>
                {officialRows.length > 0 && (
                  <>
                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#a855f7" }}>Équipe Matrix & Support</p>
                    {officialRows.map(renderContact)}
                  </>
                )}
                {friendRows.length > 0 && (
                  <>
                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">Amis</p>
                    {friendRows.map(renderContact)}
                  </>
                )}
              </>
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
                  {selectedInfo.avatar ? (
                    <img src={selectedInfo.avatar} className="w-full h-full object-cover" alt="" />
                  ) : selectedInfo.resolved ? (
                    <span className="text-sm font-bold text-purple-300">
                      {selectedInfo.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  ) : (
                    <div className="w-full h-full animate-pulse" style={{ background: "rgba(168,85,247,0.08)" }} />
                  )}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{
                    background: selectedInfo.online ? "#22C55E" : "#6b7280",
                    borderColor: "#0a050f",
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                {selectedInfo.resolved ? (
                  <button
                    onClick={() => selectedInfo.rawUserId && setProfileUserId(selectedInfo.rawUserId)}
                    className="text-sm font-bold text-white truncate hover:underline text-left block">
                    {selectedInfo.name}
                  </button>
                ) : (
                  <div className="h-4 w-32 rounded animate-pulse" style={{ background: "rgba(168,85,247,0.1)" }} />
                )}
                <p className="text-[10px] truncate" style={{ color: selectedInfo.online ? "#22C55E" : "rgba(255,255,255,0.3)" }}>
                  {selectedInfo.online ? "En ligne" : "Hors ligne"}
                </p>
              </div>
              {!isReadOnlyConversation && selectedInfo.resolved && selectedInfo.email && !selectedInfo.isOfficial && (
                <button
                  onClick={() => startCall(selectedInfo)}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition tap-sm shrink-0"
                  style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
                  title="Appel vocal"
                >
                  <Phone className="w-4 h-4 text-green-400" />
                </button>
              )}
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
                      <div className="relative max-w-[75%]">
                        <div
                          className="px-3.5 py-2 rounded-2xl w-fit max-w-full"
                          style={
                            isSent
                              ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 2px 12px rgba(124,58,237,0.3)", borderBottomRightRadius: "4px" }
                              : { background: "rgba(30,20,45,0.8)", border: "1px solid rgba(168,85,247,0.15)", borderBottomLeftRadius: "4px" }
                          }
                        >
                          {msg.type === "voice" && msg.file_url ? (
                            <VoiceMessagePlayer src={msg.file_url} accent="#a855f7" transcript={msg.transcript} />
                          ) : /^https?:\/\/.+\.(gif|png|jpg|jpeg|webp)/i.test(msg.content) || msg.content?.includes("giphy.com/media") ? (
                            <img src={msg.content} alt="" className="max-w-[200px] max-h-[200px] rounded-lg object-contain" />
                          ) : (
                            <p className={`text-sm text-white break-words ${isEmojiOnly(msg.content) ? "text-4xl leading-none" : ""}`}>{msg.content}</p>
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
                  <UnifiedPicker
                    open={showPicker}
                    onClose={() => setShowPicker(false)}
                    accent="#a855f7"
                    onSelectEmoji={(emoji) => setInput(prev => prev + emoji)}
                    onSelectGif={(url) => handleSendMedia(url)}
                    onSelectSticker={(url) => handleSendMedia(url)}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPicker(!showPicker)}
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
          userEmail={selectedInfo?.email}
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