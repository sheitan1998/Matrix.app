import React, { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useIncomingCall } from "@/hooks/useIncomingCall";
import DirectVoiceCall from "@/components/messaging/DirectVoiceCall";
import IncomingCallNotification from "@/components/messaging/IncomingCallNotification";

const CallContext = createContext(null);

/**
 * Global 1:1 voice call handling: ring anywhere in the app, accept from the
 * notification, and run the call in a full-screen panel.
 */
export function CallProvider({ children }) {
  const { user } = useAuth();
  const [activeCall, setActiveCall] = useState(null);

  const { incomingCall, acceptCall, declineCall } = useIncomingCall(user, (callData) => {
    setActiveCall({
      role: "callee",
      signal: callData,
      peerEmail: callData.caller_email,
      name: callData.caller_name || callData.caller_email?.split("@")[0] || "Contact",
      avatar: callData.caller_avatar || "",
    });
  });

  const startCall = useCallback(
    async (peer) => {
      if (!user?.email) return null;
      if (!peer?.email) {
        toast.error("Contact indisponible");
        return null;
      }
      if (activeCall) {
        toast.error("Un appel est déjà en cours");
        return null;
      }
      try {
        const signal = await base44.entities.VoiceCallSignal.create({
          caller_email: user.email,
          caller_name: user.pseudo || user.full_name || user.email.split("@")[0],
          caller_avatar: user.avatar_url || "",
          recipient_email: peer.email,
          recipient_name: peer.name || peer.pseudo || peer.email.split("@")[0],
          status: "ringing",
        });
        setActiveCall({
          role: "caller",
          signal,
          peerEmail: peer.email,
          name: peer.name || peer.pseudo || peer.email.split("@")[0],
          avatar: peer.avatar || "",
        });
        return signal;
      } catch {
        toast.error("Impossible de lancer l'appel");
        return null;
      }
    },
    [user, activeCall]
  );

  const endCall = useCallback(() => setActiveCall(null), []);

  const handleAccept = useCallback(() => {
    if (activeCall) {
      declineCall();
      return;
    }
    acceptCall();
  }, [activeCall, acceptCall, declineCall]);

  return (
    <CallContext.Provider value={{ startCall, activeCall, endCall }}>
      {children}

      {activeCall &&
        createPortal(
          <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
            style={{ background: "rgba(5,3,10,0.92)", backdropFilter: "blur(8px)" }}
          >
            <div
              className="w-full max-w-sm rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(20,10,35,0.98), rgba(35,15,55,0.98))",
                border: "1px solid rgba(34,197,94,0.3)",
                boxShadow: "0 0 60px rgba(34,197,94,0.15)",
              }}
            >
              <DirectVoiceCall
                signal={activeCall.signal}
                role={activeCall.role}
                userEmail={user?.email}
                peerEmail={activeCall.peerEmail}
                contactName={activeCall.name}
                contactAvatar={activeCall.avatar}
                onEnd={endCall}
              />
            </div>
          </div>,
          document.body
        )}

      <IncomingCallNotification
        call={incomingCall}
        onAccept={handleAccept}
        onDecline={declineCall}
      />
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) return { startCall: async () => null, activeCall: null, endCall: () => {} };
  return ctx;
}