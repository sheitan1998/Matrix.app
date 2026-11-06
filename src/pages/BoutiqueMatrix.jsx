import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useProgression } from "@/context/ProgressionContext";
import { DEFAULT_CATEGORIES, buildSpecialOffer, effectivePrices, sectionOf } from "@/lib/shopPricing";
import ShopHeader from "@/components/shop/ShopHeader";
import ShopTabs from "@/components/shop/ShopTabs";
import ShopOverview from "@/components/shop/ShopOverview";
import ShopProductsSection from "@/components/shop/ShopProductsSection";
import ShopItemModal from "@/components/shop/ShopItemModal";
import ShopFooter from "@/components/shop/ShopFooter";
import CheckoutModal from "@/components/CheckoutModal";

const SHOP_BACKGROUND =
  "https://base44.app/api/apps/69e14a987a927963a9924d5a/files/mp/public/69e14a987a927963a9924d5a/ee04ab000_boutique-matrix-bg.png";

export default function BoutiqueMatrix() {
  const qc = useQueryClient();
  const { user, checkUserAuth } = useAuth();
  const { trackActivity } = useProgression();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedItem, setSelectedItem] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [buying, setBuying] = useState(null);

  const { data: items = [] } = useQuery({
    queryKey: ["matrix-shop-items"],
    queryFn: () => base44.entities.MatrixShopItem.filter({ is_active: true }, "sort_order", 200),
  });

  const { data: config = {} } = useQuery({
    queryKey: ["matrix-shop-config"],
    queryFn: async () => {
      const rows = await base44.entities.MatrixShopConfig.list("-created_date", 1);
      return rows[0] || {};
    },
  });

  const { data: dbCategories = [] } = useQuery({
    queryKey: ["matrix-shop-categories"],
    queryFn: () => base44.entities.MatrixShopCategory.filter({ is_active: true }, "sort_order", 50),
  });

  const { data: owned = [] } = useQuery({
    queryKey: ["user-cosmetics", user?.email],
    queryFn: () => base44.entities.UserCosmetic.filter({ user_email: user.email }, "-created_date", 200),
    enabled: !!user?.email,
  });

  const categories = dbCategories.length > 0 ? dbCategories : DEFAULT_CATEGORIES;
  const offer = useMemo(() => buildSpecialOffer(config, items), [config, items]);

  const activeCategory = categories.find((c) => c.key === activeTab) || categories[0];
  const sectionItems = useMemo(
    () => items.filter((item) => sectionOf(item) === activeCategory?.key),
    [items, activeCategory?.key]
  );

  useEffect(() => {
    const unsubscribe = base44.entities.MatrixShopConfig.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["matrix-shop-config"] });
    });
    return unsubscribe;
  }, [qc]);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment === "cancelled") {
      toast.error("Paiement annulé");
      window.history.replaceState({}, "", "/boutique-matrix");
    }
    if (payment === "success" && sessionId) {
      base44.functions
        .invoke("stripePayment", { action: "verifySession", sessionId })
        .then((res) => {
          if (res?.data?.success) {
            toast.success("Achat confirmé ! 🎉");
            qc.invalidateQueries({ queryKey: ["user-cosmetics"] });
            checkUserAuth();
          }
          window.history.replaceState({}, "", "/boutique-matrix");
        })
        .catch(() => window.history.replaceState({}, "", "/boutique-matrix"));
    }
  }, [searchParams]);

  const ownedEntry = (itemId) => owned.find((o) => o.item_id === itemId);

  const buyWithTrix = async (item) => {
    const price = effectivePrices(item, config).priceTrix;
    if ((user?.trix_balance || 0) < price) {
      toast.error("Solde TRIX insuffisant");
      return;
    }
    setBuying("trix");
    try {
      const res = await base44.functions.invoke("cosmeticShop", { action: "buyWithTrix", itemId: item.id });
      if (res?.data?.success) {
        qc.invalidateQueries({ queryKey: ["user-cosmetics"] });
        checkUserAuth();
        trackActivity("cosmetics_owned");
        toast.success(`${item.name} acheté !`);
        setSelectedItem(null);
      } else {
        toast.error(res?.data?.error || "Erreur lors de l'achat");
      }
    } catch (e) {
      toast.error(e?.message || "Erreur lors de l'achat");
    }
    setBuying(null);
  };

  const buyWithEuro = (item) => {
    if (!user) return;
    setCheckout({ functionName: "cosmeticShop", params: { action: "createCheckout", itemId: item.id } });
  };

  const handleOfferClick = () => {
    if (offer?.product) setSelectedItem(offer.product);
    else setActiveTab("tickets");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden select-none" style={{ backgroundColor: "#05030a" }}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[100svh] overflow-hidden"
        aria-hidden="true"
        style={{ paddingLeft: "clamp(0px, 3vw, 64px)" }}
      >
        <img
          src={SHOP_BACKGROUND}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: "left top" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,3,10,0.12) 0%, rgba(5,3,10,0.30) 42%, rgba(5,3,10,0.68) 74%, #05030a 100%)",
          }}
        />
      </div>

      <h1 className="sr-only">Boutique Matrix</h1>

      <div
        className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-6 sm:px-6"
        style={{ paddingTop: "clamp(130px, 23vh, 250px)" }}
      >
        <ShopHeader />
        <ShopTabs categories={categories} active={activeTab} onChange={setActiveTab} />

        {activeTab === "overview" ? (
          <ShopOverview
            categories={categories}
            offer={offer}
            onOpenCategory={setActiveTab}
            onOpenOffer={handleOfferClick}
          />
        ) : (
          <ShopProductsSection
            category={activeCategory}
            items={sectionItems}
            config={config}
            onOpen={setSelectedItem}
          />
        )}

        <ShopFooter />
      </div>

      {selectedItem && (
        <ShopItemModal
          item={selectedItem}
          prices={effectivePrices(selectedItem, config)}
          user={user}
          owned={!!ownedEntry(selectedItem.id)}
          quantity={ownedEntry(selectedItem.id)?.quantity || 1}
          buying={buying}
          onClose={() => setSelectedItem(null)}
          onBuyTrix={buyWithTrix}
          onBuyEuro={buyWithEuro}
        />
      )}

      {checkout && (
        <CheckoutModal
          functionName={checkout.functionName}
          params={checkout.params}
          onClose={() => setCheckout(null)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ["user-cosmetics"] });
            checkUserAuth();
            setSelectedItem(null);
            toast.success("Achat confirmé ! 🎉");
          }}
        />
      )}
    </div>
  );
}