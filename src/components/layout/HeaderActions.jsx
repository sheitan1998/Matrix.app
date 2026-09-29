import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Mail, User, Shield } from "lucide-react";
import { formatTrix } from "@/lib/format";
import { ShoppingBag } from "lucide-react";
import TrixIcon from "@/components/TrixIcon";
import ShopSelectionModal from "@/components/ShopSelectionModal";
import MessageOverlay from "@/components/messaging/MessageOverlay";
import ProfileContent from "@/components/profile/ProfileContent";
import TranslationButton from "@/components/landing/TranslationButton";
import { playMessageSound } from "@/lib/messageSound";
import { messageAlertsEnabled } from '@/lib/notificationPreferences';

export default function HeaderActions() {
  const nav = useNavigate();
  const { user, isAuthenticated, checkUserAuth } = useAuth();
  const [showShopModal, setShowShopModal] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [preselectedEmail, setPreselectedEmail] = useState(null);

  const balance = user?.trix_balance ?? 0;

  // Listen for "open chat with friend" events
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.friendEmail) {
        setPreselectedEmail(e.detail.friendEmail);
        setShowMessages(true);
      }
    };
    window.addEventListener("matrix-open-chat", handler);
    return () => window.removeEventListener("matrix-open-chat", handler);
  }, []);

  // Fetch unread DM count
  useEffect(() => {
    if (!user?.email) return;
    base44.entities.DirectMessage.filter({ recipient_email: user.email })
      .then(msgs => {
        const unread = (msgs || []).filter(m => !m.is_read);
        setUnreadCount(unread.length);
      })
      .catch(() => {});
  }, [user?.email]);

  // Real-time subscription for new DMs
  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = base44.entities.DirectMessage.subscribe((event) => {
      if (event.type === "create") {
        const msg = event.data;
        if (msg.recipient_email === user.email) {
          if (messageAlertsEnabled(user)) playMessageSound();
          if (!msg.is_read) setUnreadCount(prev => prev + 1);
        }
      }
    });
    return unsubscribe;
  }, [user?.email]);

  // Fetch pending friend requests
  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Friend.filter({ user_email: user.email, status: "pending_received" })
      .then(friends => setPendingCount((friends || []).length))
      .catch(() => {});
  }, [user?.email]);

  // Real-time subscription for friend requests
  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = base44.entities.Friend.subscribe((event) => {
      if (event.type === "create" && event.data?.user_email === user.email && event.data?.status === "pending_received") {
        setPendingCount(prev => prev + 1);
      } else if (event.type === "update" || event.type === "delete") {
        base44.entities.Friend.filter({ user_email: user.email, status: "pending_received" })
          .then(friends => setPendingCount((friends || []).length))
          .catch(() => {});
      }
    });
    return unsubscribe;
  }, [user?.email]);

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-3 overflow-hidden">
        {/* Trix balance */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 rounded-full shrink-0"
          style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)" }}
          title="Votre solde de Trix"
        >
          <TrixIcon size={18} />
          <span className="font-mono text-[11px] sm:text-sm font-bold text-white whitespace-nowrap">
            {formatTrix(balance)} <span className="text-trix/70 text-[9px] sm:text-[10px]">TRIX</span>
          </span>
        </div>

        {/* Boutique button — hidden on mobile */}
        <button
          onClick={() => setShowShopModal(true)}
          className="hidden sm:flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-bold text-white transition hover:opacity-90 tap-sm shrink-0"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 0 15px rgba(139,92,246,0.3)" }}
          title="Boutique"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">Boutique</span>
        </button>

        {/* Translation button — hidden on mobile */}
        <div className="hidden sm:flex">
          <TranslationButton />
        </div>

        {/* Messaging button — hidden on mobile */}
        <button
          onClick={() => setShowMessages(true)}
          className="hidden sm:flex relative w-9 h-9 rounded-full items-center justify-center transition hover:scale-105 tap-sm shrink-0"
          style={{ background: "rgba(18,9,28,0.85)", border: "1.5px solid rgba(168,85,247,0.4)" }}
          title="Messagerie"
        >
          <Mail className="w-4 h-4 text-white/70" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: "#ec4899" }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Admin button — visible only for admins */}
        {user?.role === 'admin' && (
          <button
            onClick={() => nav('/admin')}
            className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center transition hover:scale-105 tap-sm shrink-0"
            style={{ background: "rgba(168,85,247,0.15)", border: "1.5px solid rgba(168,85,247,0.4)" }}
            title="Administration"
          >
            <Shield className="w-4 h-4 text-white/70" />
          </button>
        )}

        {/* Profile button */}
        <button
          onClick={() => setShowProfile(true)}
          className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden flex items-center justify-center transition hover:scale-105 tap-sm shrink-0"
          style={{ background: "rgba(18,9,28,0.85)", border: "1.5px solid rgba(168,85,247,0.4)" }}
          title="Mon Profil"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : user?.full_name?.[0] ? (
            <span className="text-[11px] sm:text-xs font-bold text-white">{user.full_name[0].toUpperCase()}</span>
          ) : (
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
          )}
          {pendingCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: "#22C55E" }}
            >
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Overlays — rendered via portal to avoid backdrop-filter containing block */}
      {createPortal(
        <ShopSelectionModal
          open={showShopModal}
          onClose={() => setShowShopModal(false)}
          onSelectTrix={() => nav("/trix-store")}
          onSelectCosmetics={() => nav("/boutique-matrix")}
        />,
        document.body
      )}

      {showMessages && createPortal(
        <div className="fixed inset-0 z-[80]" style={{ background: "#0a050f" }}>
          <MessageOverlay
            user={user}
            preselectedEmail={preselectedEmail}
            onClose={() => { setShowMessages(false); setPreselectedEmail(null); }}
            onMessagesRead={(count) => setUnreadCount(prev => Math.max(0, prev - count))}
          />
        </div>,
        document.body
      )}

      {showProfile && createPortal(
        <div className="fixed inset-0 z-[80] overflow-y-auto" style={{ background: "#0a050f" }}>
          <ProfileContent onClose={() => setShowProfile(false)} />
        </div>,
        document.body
      )}
    </>
  );
}