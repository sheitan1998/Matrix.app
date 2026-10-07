import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Server, Users, Search, Zap } from "lucide-react";
import CheckoutModal from "@/components/CheckoutModal";
import VoteAutoSetupModal from "./VoteAutoSetupModal";

const VIP_IMAGE = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/ca0329832_ChatGPTImage6oct202621_00_29.png";
const VOTE_AUTO_IMAGE = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/1448fd9e6_ChatGPTImage6oct202623_19_53.png";

export default function ProspecteursSidebar({ active = "servers", user }) {
  const [showVipCheckout, setShowVipCheckout] = useState(false);
  const [showVoteAutoCheckout, setShowVoteAutoCheckout] = useState(false);
  const [showVoteAutoSetup, setShowVoteAutoSetup] = useState(false);

  const hasVoteAuto = !!user?.has_vote_auto &&
  (!user?.vote_auto_until || new Date(user.vote_auto_until).getTime() > Date.now());

  const hasVip = !!user?.is_vip &&
  (!user?.vip_until || new Date(user.vip_until).getTime() > Date.now());

  return (
    <div className="w-24 sm:w-32 shrink-0 sticky top-16 self-start flex flex-col gap-1 p-2">
      <Link
        to="/prospecteurs"
        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition ${active === "servers" ? "text-white" : "text-white/40 hover:text-white"}`}
        style={active === "servers" ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" } : { background: "rgba(255,255,255,0.02)" }}>
        
        <Server className="w-5 h-5" />
        <span className="text-[9px] font-bold text-center">Serveurs</span>
      </Link>
      <Link
        to="/recherche-joueur"
        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition ${active === "players" ? "text-white" : "text-white/40 hover:text-white"}`}
        style={active === "players" ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" } : { background: "rgba(255,255,255,0.02)" }}>
        
        <Users className="w-5 h-5" />
        <span className="text-[9px] font-bold text-center">Joueurs</span>
      </Link>
      <Link
        to="/recherche-createur"
        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition ${active === "creators" ? "text-white" : "text-white/40 hover:text-white"}`}
        style={active === "creators" ? { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" } : { background: "rgba(255,255,255,0.02)" }}>
        
        <Search className="w-5 h-5" />
        <span className="text-[9px] font-bold text-center">Créateurs</span>
      </Link>

      {/* VIP encart (2,99€/mois) — masqué si VIP actif */}
      {!hasVip && (
        <button
          onClick={() => setShowVipCheckout(true)}
          className="relative rounded-xl overflow-hidden transition hover:scale-[1.03] mt-2 group block w-full"
          title="VIP - 2,99€/mois - Cooldown 1h au lieu de 2h"
          style={{ boxShadow: "0 0 20px rgba(255,215,0,0.15)" }}>
          
          <img
            src={VIP_IMAGE}
            alt="VIP - 2,99€/mois"
            className="w-full h-auto block"
            style={{ minHeight: "140px" }} />
          
          <div className="absolute inset-0 ring-2 ring-yellow-500/30 rounded-xl pointer-events-none" />
          <div className="absolute inset-0 bg-transparent group-hover:bg-yellow-500/5 transition rounded-[10px]" />
        </button>
      )}

      {/* Vote Auto encart (4,99€/mois) — masqué si Vote Auto actif */}
      {!hasVoteAuto && (
        <button
          onClick={() => setShowVoteAutoCheckout(true)}
          className="relative rounded-xl overflow-hidden transition hover:scale-[1.03] group block w-full"
          title="Vote Auto - 4,99€/mois - Vote automatisé pour ton serveur"
          style={{ boxShadow: "0 0 20px rgba(191,0,255,0.15)" }}>
          
          <img
            src={VOTE_AUTO_IMAGE}
            alt="Vote Auto - 4,99€/mois"
            className="w-full h-auto block"
            style={{ minHeight: "140px" }} />
          
          <div className="absolute inset-0 ring-2 ring-fuchsia-500/30 rounded-xl pointer-events-none" />
          <div className="absolute inset-0 bg-transparent group-hover:bg-fuchsia-500/5 transition rounded-[10px]" />
        </button>
      )}

      {/* Bouton de configuration Vote Auto — visible si Vote Auto actif */}
      {hasVoteAuto && (
        <button
          onClick={() => setShowVoteAutoSetup(true)}
          className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition text-white hover:opacity-90 tap-sm"
          style={{ background: "rgba(191,0,255,0.15)", border: "1px solid rgba(191,0,255,0.3)" }}
          title="Configurer tes serveurs en Vote Auto"
        >
          <Zap className="w-5 h-5" style={{ color: "#d946ef" }} />
          <span className="text-[9px] font-bold text-center">Configurer Vote Auto</span>
        </button>
      )}

      {showVipCheckout &&
      <CheckoutModal
        functionName="stripePayment"
        params={{ action: "createVIPSubscription", plan: "vip_vote" }}
        onClose={() => setShowVipCheckout(false)}
        onSuccess={() => {
          setShowVipCheckout(false);
          window.location.reload();
        }} />

      }

      {showVoteAutoCheckout &&
      <CheckoutModal
        functionName="stripePayment"
        params={{ action: "createVoteAutoSubscription", plan: "vote_auto" }}
        onClose={() => setShowVoteAutoCheckout(false)}
        onSuccess={() => {
          setShowVoteAutoCheckout(false);
          window.location.reload();
        }} />

      }

      {showVoteAutoSetup && user &&
      <VoteAutoSetupModal user={user} onClose={() => setShowVoteAutoSetup(false)} />
      }
    </div>);

}