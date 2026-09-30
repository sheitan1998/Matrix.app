import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { startIncomingRing, stopIncomingRing } from "@/lib/voiceSounds";

/**
 * Subscribes to incoming voice call signals for the current user.
 * Returns the active incoming call (if any) and callbacks to accept/decline.
 */
export function useIncomingCall(user, onAccept) {
  const [incomingCall, setIncomingCall] = useState(null);
  const onAcceptRef = useRef(onAccept);
  onAcceptRef.current = onAccept;

  // Poll for ringing signals (realtime subscribe + initial fetch)
  const fetchRinging = useCallback(async () => {
    if (!user?.email) return;
    try {
      const page = await base44.entities.VoiceCallSignal.filter(
        { recipient_email: user.email, status: "ringing" },
        { sort: "-created_date", limit: 5 }
      );
      const items = page?.items || [];
      if (items.length > 0) {
        const signal = items[0];
        // Only show if created within the last 45 seconds
        const age = Date.now() - new Date(signal.created_date).getTime();
        if (age < 45000) {
          setIncomingCall(signal);
          startIncomingRing();
          return;
        }
      }
      setIncomingCall(null);
      stopIncomingRing();
    } catch {
      /* silent */
    }
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    fetchRinging();
    const interval = setInterval(fetchRinging, 3000);
    const unsubscribe = base44.entities.VoiceCallSignal.subscribe((event) => {
      const rec = event.data;
      if (!rec) return;
      if (event.type === "delete") {
        setIncomingCall((prev) => (prev?.id === rec.id ? null : prev));
        return;
      }
      if (rec.recipient_email === user.email && rec.status === "ringing") {
        setIncomingCall(rec);
        startIncomingRing();
      } else if (rec.recipient_email === user.email && rec.status !== "ringing") {
        setIncomingCall((prev) => (prev?.id === rec.id ? null : prev));
        stopIncomingRing();
      }
    });
    return () => {
      clearInterval(interval);
      stopIncomingRing();
      if (unsubscribe) unsubscribe();
    };
  }, [fetchRinging, user?.email]);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    stopIncomingRing();
    try {
      await base44.entities.VoiceCallSignal.update(incomingCall.id, { status: "accepted" });
    } catch {
      /* silent */
    }
    const callData = incomingCall;
    setIncomingCall(null);
    if (onAcceptRef.current) onAcceptRef.current(callData);
  }, [incomingCall]);

  const declineCall = useCallback(async () => {
    if (!incomingCall) return;
    stopIncomingRing();
    try {
      await base44.entities.VoiceCallSignal.update(incomingCall.id, { status: "declined" });
    } catch {
      /* silent */
    }
    setIncomingCall(null);
  }, [incomingCall]);

  return { incomingCall, acceptCall, declineCall };
}