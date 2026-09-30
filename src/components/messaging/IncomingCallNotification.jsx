import React, { useEffect } from "react";
import { Phone, PhoneOff, X } from "lucide-react";

/**
 * Floating incoming-call notification with Accept / Decline buttons.
 * Shown when another user initiates a direct voice call.
 */
export default function IncomingCallNotification({ call, onAccept, onDecline }) {
  useEffect(() => {
    if (!call) return;
    const timeout = setTimeout(() => {
      // Auto-decline after 40s of no answer
      onDecline();
    }, 40000);
    return () => clearTimeout(timeout);
  }, [call, onDecline]);

  if (!call) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onDecline} />

      {/* Call card */}
      <div
        className="relative pointer-events-auto w-full max-w-sm mx-4 rounded-3xl p-6 flex flex-col items-center gap-4"
        style={{
          background: "linear-gradient(135deg, rgba(15,10,25,0.98), rgba(30,15,50,0.98))",
          border: "1px solid rgba(34,197,94,0.3)",
          boxShadow: "0 0 60px rgba(34,197,94,0.15), 0 20px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Close (dismiss) */}
        <button
          onClick={onDecline}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 transition tap-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ringing indicator */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: "#22c55e" }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Appel entrant
        </div>

        {/* Avatar with pulse ring */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(34,197,94,0.2)", transform: "scale(1.4)" }} />
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-green-400/50 relative">
            {call.caller_avatar ? (
              <img src={call.caller_avatar} alt={call.caller_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white" style={{ background: "#22c55e" }}>
                {call.caller_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
        </div>

        {/* Caller info */}
        <div className="text-center">
          <p className="text-lg font-black text-white">{call.caller_name || "Utilisateur"}</p>
          <p className="text-xs text-white/40 mt-0.5">Appel vocal entrant…</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-6 mt-2">
          <button
            onClick={onDecline}
            className="flex flex-col items-center gap-1.5 tap-sm group"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center transition transform group-hover:scale-110"
              style={{ background: "rgba(239,68,68,0.9)", boxShadow: "0 0 20px rgba(239,68,68,0.4)" }}>
              <PhoneOff className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-white/50">Refuser</span>
          </button>
          <button
            onClick={onAccept}
            className="flex flex-col items-center gap-1.5 tap-sm group"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center transition transform group-hover:scale-110 animate-bounce"
              style={{ background: "rgba(34,197,94,0.9)", boxShadow: "0 0 20px rgba(34,197,94,0.4)" }}>
              <Phone className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-green-400">Accepter</span>
          </button>
        </div>
      </div>
    </div>
  );
}