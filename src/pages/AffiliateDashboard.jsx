import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMyAffiliation } from "@/hooks/useMyAffiliation";
import { buildReferralCode } from "@/lib/affiliateProgram";
import AffiliateProgramCard from "@/components/affiliate/AffiliateProgramCard";
import PartnerProgramCard from "@/components/affiliate/PartnerProgramCard";

const HERO_IMAGE = "https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/3a68e170e_partenariat-affiliation-hero.png";

export default function AffiliateDashboard() {
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [activating, setActivating] = useState(false);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: affiliation } = useMyAffiliation(user?.email);

  const { data: referralCount = 0 } = useQuery({
    queryKey: ["referral-count", user?.email],
    queryFn: () => base44.entities.Referral.count({ referrer_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: pendingPartner = false } = useQuery({
    queryKey: ["partner-pending", user?.email],
    queryFn: () => base44.entities.SupportTicket.filter(
      { user_email: user.email, program_type: "partner", status: { $in: ["open", "in_progress"] } },
      { limit: 1 }
    ).then((r) => !!r?.items?.[0]),
    enabled: !!user?.email,
  });

  const referralCode = affiliation?.referral_code || (user ? buildReferralCode(user) : "");

  const activateAffiliate = async () => {
    setActivating(true);
    try {
      const res = await base44.functions.invoke("affiliateProgram", { action: "activateAffiliate" });
      if (res?.data?.error) { toast.error(res.data.error); return; }
      toast.success("Statut Affilié activé !");
      qc.invalidateQueries({ queryKey: ["my-affiliation", user.email] });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur lors de l'activation");
    } finally {
      setActivating(false);
    }
  };

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
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/mon-profil" className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-black text-base sm:text-lg">Partenariat & Affiliation</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-7">
        <div className="relative rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(168,85,247,0.3)", boxShadow: "0 0 40px rgba(168,85,247,0.18)" }}>
          <img src={HERO_IMAGE} alt="Partenariat & Affiliation" className="w-full h-[220px] sm:h-[300px] object-cover object-center" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,2,10,0.94) 0%, rgba(5,2,10,0.35) 48%, transparent 78%)" }} />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300">Matrix Creator</p>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">Partenariat & Affiliation</h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1.5 max-w-lg">
              Devenez affilié en un clic ou rejoignez l'élite des partenaires Matrix.
            </p>
          </div>
        </div>

        <AffiliateProgramCard
          affiliation={affiliation}
          referralCode={referralCode}
          referralCount={referralCount}
          onActivate={activateAffiliate}
          activating={activating}
        />

        <PartnerProgramCard
          affiliation={affiliation}
          referralCode={referralCode}
          referralCount={referralCount}
          pending={pendingPartner}
          onSubmitted={() => qc.invalidateQueries({ queryKey: ["partner-pending", user.email] })}
        />
      </div>
    </div>
  );
}