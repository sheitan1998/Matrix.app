import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Server, Users, Search, Crown } from "lucide-react";
import CheckoutModal from "@/components/CheckoutModal";

export default function ProspecteursSidebar({ active = "servers" }) {
  const [showVipCheckout, setShowVipCheckout] = useState(false);

  return (
    <div className="w-16 sm:w-20 shrink-0 sticky top-16 self-start flex flex-col gap-1 p-2">
      <Link
        to="/prospecteurs"
        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition ${active === "servers" ? "text-white" : "text-white/40 hover:text-white"}`}
        style={active === "servers" ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" } : { background: "rgba(255,255,255,0.02)" }}
      >
        <Server className="w-5 h-5" />
        <span className="text-[9px] font-bold text-center">Serveurs</span>
      </Link>
      <Link
        to="/recherche-joueur"
        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition ${active === "players" ? "text-white" : "text-white/40 hover:text-white"}`}
        style={active === "players" ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" } : { background: "rgba(255,255,255,0.02)" }}
      >
        <Users className="w-5 h-5" />
        <span className="text-[9px] font-bold text-center">Joueurs</span>
      </Link>
      <Link
        to="/recherche-createur"
        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition ${active === "creators" ? "text-white" : "text-white/40 hover:text-white"}`}
        style={active === "creators" ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" } : { background: "rgba(255,255,255,0.02)" }}
      >
        <Search className="w-5 h-5" />
        <span className="text-[9px] font-bold text-center">Créateurs</span>
      </Link>

      {/* VIP encart */}
      <button
        onClick={() => setShowVipCheckout(true)}
        className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition hover:opacity-90 mt-1"
        style={{
          background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(109,40,217,0.08))",
          border: "1px solid rgba(168,85,247,0.25)",
        }}
        title="VIP - 2,99€/mois - Cooldown 1h au lieu de 2h"
      >
        <Crown className="w-5 h-5" style={{ color: "#a855f7" }} />
        <span className="text-[8px] font-black text-center text-purple-300 leading-tight">
          VIP
        </span>
        <span className="text-[7px] text-white/40 leading-tight text-center">
          2,99€/mois
        </span>
      </button>

      {showVipCheckout && (
        <CheckoutModal
          functionName="stripePayment"
          params={{ action: "createVIPSubscription", plan: "vip_vote" }}
          onClose={() => setShowVipCheckout(false)}
          onSuccess={() => {
            setShowVipCheckout(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}