import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Server, Users, Search } from "lucide-react";
import CheckoutModal from "@/components/CheckoutModal";

const VIP_IMAGE = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/ca0329832_ChatGPTImage6oct202621_00_29.png";

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

      {/* VIP encart avec image fournie */}
      <button
        onClick={() => setShowVipCheckout(true)}
        className="relative rounded-xl overflow-hidden transition hover:opacity-90 mt-1 group"
        title="VIP - 2,99€/mois - Cooldown 1h au lieu de 2h"
      >
        <img
          src={VIP_IMAGE}
          alt="VIP - 2,99€/mois"
          className="w-full h-auto block"
          style={{ minHeight: "80px" }}
        />
        <div className="absolute inset-0 bg-transparent group-hover:bg-white/5 transition" />
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