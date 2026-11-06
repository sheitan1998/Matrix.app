import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import CheckoutModal from "@/components/CheckoutModal";
import ShopOfferCard from "@/components/shop/ShopOfferCard";
import { OFFERS_BY_CATEGORY, OFFER_NOTES } from "@/lib/shopOffers";
import { formatEuro } from "@/lib/shopPricing";

export default function ShopOfferCategory({ category }) {
  const { user, checkUserAuth } = useAuth();
  const [checkout, setCheckout] = useState(null);
  const [buying, setBuying] = useState(null);

  // Abonnements pilotés depuis le panneau admin (prix, durée, activation)
  const { data: dbPlans = [] } = useQuery({
    queryKey: ["shop-subscription-plans"],
    queryFn: () => base44.entities.ShopSubscriptionPlan.list("sort_order", 50),
    enabled: category?.key === "subscriptions",
  });

  const offers = (OFFERS_BY_CATEGORY[category?.key] || [])
    .map((offer) => {
      if (!offer.planKey) return offer;
      const plan = dbPlans.find((p) => p.key === offer.planKey);
      if (!plan) return offer;
      return {
        ...offer,
        name: plan.label || offer.name,
        price: plan.price_cents > 0 ? formatEuro(plan.price_cents / 100) : offer.price,
        badge: plan.badge || offer.badge,
        perks: plan.perks?.length ? plan.perks : offer.perks,
        is_active: plan.is_active !== false,
      };
    })
    .filter((offer) => offer.is_active !== false);

  const buy = async (offer, method) => {
    if (!user) {
      toast.error("Connecte-toi pour effectuer un achat.");
      return;
    }

    if (method === "trix") {
      if (!offer.trixCheckout) return;
      setBuying(`${offer.id}:trix`);
      try {
        const res = await base44.functions.invoke(offer.trixCheckout.functionName, offer.trixCheckout.params);
        if (res?.data?.success) {
          checkUserAuth();
          toast.success(`${offer.name} acheté !`);
        } else {
          toast.error(res?.data?.error || "Solde Trix insuffisant");
        }
      } catch (e) {
        toast.error(e?.message || "Erreur lors de l'achat");
      }
      setBuying(null);
      return;
    }

    setCheckout(offer.checkout);
  };

  if (!category || offers.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
          style={{
            background: `${category.accent_color || "#a855f7"}18`,
            border: `1px solid ${category.accent_color || "#a855f7"}35`,
          }}
        >
          {category.icon || "✨"}
        </span>
        <div>
          <h2 className="text-base font-black text-white">{category.label}</h2>
          <p className="text-[11px] text-white/45">{category.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {offers.map((offer) => (
          <ShopOfferCard key={offer.id} offer={offer} onBuy={buy} buying={buying} />
        ))}
      </div>

      {OFFER_NOTES[category.key] && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] text-white/30">
          <CreditCard className="h-3 w-3" />
          Paiement sécurisé via Stripe — {OFFER_NOTES[category.key]}
        </p>
      )}

      {checkout && (
        <CheckoutModal
          functionName={checkout.functionName}
          params={checkout.params}
          onClose={() => setCheckout(null)}
          onSuccess={() => {
            checkUserAuth();
            setCheckout(null);
            toast.success("Paiement confirmé !");
          }}
        />
      )}
    </section>
  );
}