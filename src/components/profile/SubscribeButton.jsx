import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SubscribeButton({ targetEmail, targetName, size = "sm" }) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!targetEmail) return;
    base44.functions.invoke("serverSearch", { action: "getSubscriptionStatus", target_email: targetEmail })
      .then((res) => setSubscribed(res?.data?.subscribed || false))
      .catch(() => {});
  }, [targetEmail]);

  const toggle = async () => {
    setLoading(true);
    try {
      if (subscribed) {
        await base44.functions.invoke("serverSearch", { action: "unsubscribe", target_email: targetEmail });
        setSubscribed(false);
        toast.success(`Désabonné de ${targetName || "l'utilisateur"}`);
      } else {
        await base44.functions.invoke("serverSearch", { action: "subscribe", target_email: targetEmail });
        setSubscribed(true);
        toast.success(`Abonné à ${targetName || "l'utilisateur"} 🔔`);
      }
    } catch { toast.error("Erreur lors de l'abonnement"); }
    setLoading(false);
  };

  const isSm = size === "sm";
  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn("font-bold flex items-center justify-center gap-1.5 transition hover:opacity-90 disabled:opacity-50", isSm ? "h-8 px-3 rounded-lg text-xs" : "h-10 px-4 rounded-xl text-sm")}
      style={subscribed
        ? { background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }
        : { background: "linear-gradient(135deg, #a855f7, #6d28d9)", color: "#fff" }
      }
    >
      {loading ? <Loader2 className={cn("animate-spin", isSm ? "w-3 h-3" : "w-4 h-4")} /> : subscribed ? <BellOff className={isSm ? "w-3 h-3" : "w-4 h-4"} /> : <Bell className={isSm ? "w-3 h-3" : "w-4 h-4"} />}
      {subscribed ? "Abonné" : "S'abonner"}
    </button>
  );
}