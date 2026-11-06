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
    base44.entities.DirectMessage.filter({ recipient_email: user.email }).
    then((msgs) => {
      const unread = (msgs || []).filter((m) => !m.is_read);
      setUnreadCount(unread.length);
    }).
    catch(() => {});
  }, [user?.email]);

  // Real-time subscription for new DMs
  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = base44.entities.DirectMessage.subscribe((event) => {
      if (event.type === "create") {
        const msg = event.data;
        if (msg.recipient_email === user.email) {
          if (messageAlertsEnabled(user)) playMessageSound();
          if (!msg.is_read) setUnreadCount((prev) => prev + 1);
        }
      }
    });
    return unsubscribe;
  }, [user?.email]);

  // Fetch pending friend requests
  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Friend.filter({ user_email: user.email, status: "pending_received" }).
    then((friends) => setPendingCount((friends || []).length)).
    catch(() => {});
  }, [user?.email]);

  // Real-time subscription for friend requests
  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = base44.entities.Friend.subscribe((event) => {
      if (event.type === "create" && event.data?.user_email === user.email && event.data?.status === "pending_received") {
        setPendingCount((prev) => prev + 1);
      } else if (event.type === "update" || event.type === "delete") {
        base44.entities.Friend.filter({ user_email: user.email, status: "pending_received" }).
        then((friends) => setPendingCount((friends || []).length)).
        catch(() => {});
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
          title="Votre solde de Trix">
          
          <TrixIcon size={18} />
          <span className="font-mono text-[11px] sm:text-sm font-bold text-white whitespace-nowrap">
            {formatTrix(balance)} <span className="text-trix/70 text-[9px] sm:text-[10px]">TRIX</span>
          </span>
        </div>

        {/* Boutique button — hidden on mobile */}
        







        

        {/* Translation button — hidden on mobile */}
        <div className="hidden sm:flex">
          <TranslationButton />
        </div>

        {/* Messaging button — hidden on mobile */}
        














        

        {/* Admin button — visible only for admins */}
        








        

        {/* Profile button */}
        




















        
      </div>

      {/* Overlays — rendered via portal to avoid backdrop-filter containing block */}
      {createPortal(
        <ShopSelectionModal
          open={showShopModal}
          onClose={() => setShowShopModal(false)}
          onSelectTrix={() => nav("/trix-store")}
          onSelectCosmetics={() => nav("/boutique-matrix")} />,

        document.body
      )}

      {showMessages && createPortal(
        <div className="fixed inset-0 z-[80]" style={{ background: "#0a050f" }}>
          <MessageOverlay
            user={user}
            preselectedEmail={preselectedEmail}
            onClose={() => {setShowMessages(false);setPreselectedEmail(null);}}
            onMessagesRead={(count) => setUnreadCount((prev) => Math.max(0, prev - count))} />
          
        </div>,
        document.body
      )}

      {showProfile && createPortal(
        <div className="fixed inset-0 z-[80] overflow-y-auto" style={{ background: "#0a050f" }}>
          <ProfileContent onClose={() => setShowProfile(false)} />
        </div>,
        document.body
      )}
    </>);

}