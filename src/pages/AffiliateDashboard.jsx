import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMyAffiliation, isActiveAffiliation } from "@/hooks/useMyAffiliation";
import { buildReferralCode } from "@/lib/affiliateProgram";
import ProgramSelector from "@/components/affiliate/ProgramSelector";
import MediaKit from "@/components/affiliate/MediaKit";
import AffiliateSection from "@/components/affiliate/AffiliateSection";
import PartnerSection from "@/components/affiliate/PartnerSection";

const HERO_IMAGE = "https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/3a68e170e_partenariat-affiliation-hero.png";

export default function AffiliateDashboard() {
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("affiliate");

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: affiliation } = useMyAffiliation(user?.email);
  const isAffiliate = isActiveAffiliation(affiliation);
  const referralCode = user ? (affiliation?.referral_code || buildReferralCode(user)) : "";

  const refreshAffiliation = () => qc.invalidateQueries({ queryKey: ["my-affiliation", user?.email] });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to="/mon-profil" className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-black text-base sm:text-lg">Partenariat & Affiliation</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-6">
        {/* Hero visuel principal */}
        <div className="relative rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(168,85,247,0.3)", boxShadow: "0 0 50px rgba(168,85,247,0.2)" }}>
          <img src={HERO_IMAGE} alt="Partenariat & Affiliation" className="w-full h-[260px] sm:h-[360px] object-cover object-center" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(5,2,10,0.96) 0%, rgba(5,2,10,0.5) 52%, rgba(5,2,10,0.12) 100%)" }}
          />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-9">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-purple-300">Matrix Creators</p>
            <h1 className="text-3xl sm:text-5xl font-black text-white mt-2 leading-none">Partenariat &amp; Affiliation</h1>
            <p className="text-xs sm:text-sm text-white/60 mt-2.5 max-w-lg">
              Partagez Matrix avec votre communauté, suivez vos filleuls et accédez au statut Partenaire.
            </p>
          </div>
        </div>

        {/* Deux accès principaux */}
        <ProgramSelector active={tab} onChange={setTab} locked={!isAffiliate} />

        {/* Kit média — accessible en premier */}
        <MediaKit />

        {/* Contenu du programme sélectionné */}
        {tab === "affiliate"
          ? (
            <AffiliateSection
              user={user}
              affiliation={affiliation}
              referralCode={referralCode}
              onUpdated={refreshAffiliation}
            />
          )
          : (
            <PartnerSection
              user={user}
              affiliation={affiliation}
              referralCode={referralCode}
              isAffiliate={isAffiliate}
              onGoAffiliate={() => setTab("affiliate")}
              onSubmitted={() => qc.invalidateQueries({ queryKey: ["partner-pending", user.email] })}
            />
          )}
      </div>
    </div>
  );
}