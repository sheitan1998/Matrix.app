import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Home, Check, ShoppingBag, Sparkles, Coins, X, AlertCircle, CreditCard, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatTrix } from "@/lib/format";
import HeaderActions from "@/components/layout/HeaderActions";
import TrixIcon from "@/components/TrixIcon";
import CosmeticPreview from "@/components/cosmetics/CosmeticPreview";
import CosmeticProfilePreview from "@/components/cosmetics/CosmeticProfilePreview";

const CATEGORIES = [
  { key: "all", label: "Tout" },
  { key: "badge", label: "Badges" },
  { key: "avatar_animation", label: "Animations" },
  { key: "profile_cover", label: "Couvertures de profil" },
];

const RARITY_COLORS = {
  common: "#9ca3af", rare: "#3b82f6", epic: "#a855f7", legendary: "#f59e0b",
};

// Conversion fixe: 1€ = 100 Trix (1 Trix = 0,01€)
const trixToEuro = (trix) => (trix / 100).toFixed(2).replace(".", ",") + "€";

// Affiche le prix en € — utilise price_euros si défini, sinon conversion depuis Trix
const displayEuro = (item) => {
  if (item.price_euros && item.price_euros > 0) {
    return item.price_euros.toFixed(2).replace(".", ",") + "€";
  }
  return trixToEuro(item.price_trix);
};

export default function BoutiqueMatrix() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { user, checkUserAuth } = useAuth();
  const [cat, setCat] = useState("all");
  const [buyingTrix, setBuyingTrix] = useState(null);
  const [buyingEuro, setBuyingEuro] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const { data: items = [] } = useQuery({
    queryKey: ["matrix-shop-items"],
    queryFn: () => base44.entities.MatrixShopItem.filter({ is_active: true }, "sort_order", 100),
  });

  const { data: owned = [] } = useQuery({
    queryKey: ["user-cosmetics", user?.email],
    queryFn: () => base44.entities.UserCosmetic.filter({ user_email: user.email }, "-created_date", 200),
    enabled: !!user?.email,
  });

  const filtered = cat === "all" ? items : items.filter(i => i.category === cat);
  const isOwned = (itemId) => owned.some(o => o.item_id === itemId);

  // Reset to page 1 when category changes
  useEffect(() => { setPage(1); }, [cat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // Handle Stripe redirect with URL cleanup
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment === "cancelled") {
      toast.error("Paiement annulé");
      window.history.replaceState({}, "", "/boutique-matrix");
    }
    if (payment === "success" && sessionId) {
      base44.functions.invoke("stripePayment", { action: "verifySession", sessionId })
        .then(res => {
          if (res?.data?.success) {
            toast.success("Cosmétique débloqué ! 🎉", { description: "Équipez-le depuis votre profil" });
            qc.invalidateQueries({ queryKey: ["user-cosmetics"] });
            checkUserAuth();
          }
          window.history.replaceState({}, "", "/boutique-matrix");
        })
        .catch(() => {
          window.history.replaceState({}, "", "/boutique-matrix");
        });
    }
  }, [searchParams]);

  const buyWithTrix = async (item) => {
    const balance = user?.trix_balance || 0;
    if (balance < item.price_trix) { toast.error("Solde TRIX insuffisant"); return; }
    if (isOwned(item.id)) { toast.info("Vous possédez déjà cet objet"); return; }
    setBuyingTrix(item.id);
    try {
      await base44.auth.updateMe({ trix_balance: balance - item.price_trix });
      await base44.entities.UserCosmetic.create({
        user_email: user.email, item_id: item.id, item_name: item.name,
        category: item.category, icon: item.icon, rarity: item.rarity, is_equipped: false,
        video_url: item.video_url || "",
        preview_image: item.preview_image || "",
      });
      await base44.entities.TrixTransaction.create({
        user_email: user.email, type: "purchase", amount: -item.price_trix,
        description: `Achat cosmétique: ${item.name} (-${item.price_trix} Trix)`,
      });
      qc.invalidateQueries({ queryKey: ["user-cosmetics"] });
      checkUserAuth();
      toast.success(`${item.name} acheté ! Équipez-le depuis votre profil.`);
      setDetailItem(null);
    } catch { toast.error("Erreur lors de l'achat"); }
    setBuyingTrix(null);
  };

  const buyWithEuro = async (item) => {
    if (!user) return;
    if (isOwned(item.id)) { toast.info("Vous possédez déjà cet objet"); return; }
    setBuyingEuro(item.id);
    try {
      const res = await base44.functions.invoke("cosmeticShop", {
        action: "createCheckout",
        itemId: item.id,
      });
      const url = res?.data?.url;
      if (!url) {
        toast.error(res?.data?.error || "Erreur lors de la création du paiement");
        return;
      }
      window.location.href = url;
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Erreur");
    }
    setBuyingEuro(null);
  };

  return (
    <div className="min-h-screen relative overflow-y-auto overflow-x-hidden" style={{ backgroundColor: "#0a050f" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(168,85,247,0.08), transparent 60%)" }} />

      <div className="relative z-10 min-h-screen flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6 py-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1 text-white/50 hover:text-white transition">
              <Home className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-black text-white">Boutique Matrix</h1>
          </div>
          <HeaderActions />
        </header>

        <p className="text-sm text-white/50 mb-4">Personnalisez votre profil avec des cosmétiques exclusifs. Achetez avec vos Trix ou en €.</p>

        {/* Category filter */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCat(c.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition"
              style={cat === c.key
                ? { background: "rgba(168,85,247,0.2)", color: "#fff", border: "1px solid rgba(168,85,247,0.4)" }
                : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Items grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
            <p className="text-white/40 text-sm">Aucun produit dans cette catégorie pour le moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
              {paginated.map(item => {
                const ownedItem = isOwned(item.id);
                const rarityColor = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
                return (
                  <div key={item.id} onClick={() => setDetailItem(item)} className="rounded-2xl p-4 flex flex-col cursor-pointer transition hover:scale-[1.02]" style={{
                    background: "rgba(15,10,25,0.7)",
                    border: `1.5px solid ${rarityColor}30`,
                    backdropFilter: "blur(8px)",
                  }}>
                    {/* Preview */}
                    <div className="w-full mb-3">
                      <CosmeticPreview item={item} />
                    </div>

                    {/* Rarity */}
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded self-start mb-1" style={{ background: `${rarityColor}20`, color: rarityColor }}>
                      {item.rarity}
                    </span>

                    <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
                    <p className="text-[10px] text-white/40 mb-3 line-clamp-2">{item.description || item.category}</p>

                    {/* Dual price */}
                    <div className="mt-auto space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-xs font-bold" style={{ color: "#fbbf24" }}>
                          <TrixIcon size={14} />
                          {formatTrix(item.price_trix)}
                        </div>
                        <span className="text-[10px] text-white/30">ou</span>
                        <span className="text-xs font-bold text-white/70">{displayEuro(item)}</span>
                      </div>
                      {ownedItem ? (
                        <span className="w-full text-center text-[10px] font-bold text-green-400 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                          <Check className="w-3 h-3" /> Possédé
                        </span>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setDetailItem(item); }}
                          className="w-full px-3 py-1.5 rounded-lg text-xs font-bold text-white transition"
                          style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
                          Acheter
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pb-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white/70 disabled:opacity-30 transition hover:bg-white/5"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition"
                    style={p === safePage
                      ? { background: "linear-gradient(135deg, #a855f7, #6d28d9)", color: "#fff" }
                      : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white/70 disabled:opacity-30 transition hover:bg-white/5"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  ›
                </button>
              </div>
            )}
          </>
        )}

        {/* Link to profile */}
        <div className="pb-8 text-center">
          <Link to="/mon-profil" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
            <Sparkles className="w-4 h-4" /> Gérer mes cosmétiques
          </Link>
        </div>
      </div>

      {/* Detail modal with dual payment */}
      {detailItem && (() => {
        const rarityColor = RARITY_COLORS[detailItem.rarity] || RARITY_COLORS.common;
        const ownedItem = isOwned(detailItem.id);
        return (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={() => setDetailItem(null)}>
            <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ background: "#120a1f", border: `1.5px solid ${rarityColor}40` }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h2 className="text-sm font-black text-white">{detailItem.name}</h2>
                <button onClick={() => setDetailItem(null)} className="w-8 h-8 rounded-lg flex items-center justify-center tap-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>
              <div className="p-5">
                <div className="w-full mb-4">
                  <CosmeticPreview item={detailItem} size="text-5xl" forcePlay />
                </div>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mb-2 inline-block" style={{ background: `${rarityColor}20`, color: rarityColor }}>
                  {detailItem.rarity}
                </span>
                {detailItem.description && <p className="text-xs text-white/60 leading-relaxed mb-4">{detailItem.description}</p>}

                {/* Dual price display */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-base font-bold" style={{ color: "#fbbf24" }}>
                    <TrixIcon size={18} />
                    {formatTrix(detailItem.price_trix)}
                  </div>
                  <span className="text-xs text-white/30">ou</span>
                  <span className="text-base font-bold text-white">{displayEuro(detailItem)}</span>
                </div>

                {ownedItem ? (
                  <div className="py-2.5 rounded-xl text-sm font-bold text-green-400 flex items-center justify-center gap-1.5" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <Check className="w-4 h-4" /> Possédé
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Profile preview toggle */}
                    <button
                      onClick={() => setShowProfilePreview(!showProfilePreview)}
                      className="w-full py-2 rounded-xl text-xs font-bold text-white/70 flex items-center justify-center gap-1.5 transition hover:text-white"
                      style={{ background: showProfilePreview ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)", border: showProfilePreview ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(255,255,255,0.06)" }}>
                      <Eye className="w-3.5 h-3.5" /> {showProfilePreview ? "Masquer l'aperçu profil" : "Aperçu sur mon profil"}
                    </button>
                    {showProfilePreview && (
                      <div className="pb-1">
                        <CosmeticProfilePreview item={detailItem} user={user} />
                      </div>
                    )}
                    {/* Pay with Trix */}
                    <button onClick={() => buyWithTrix(detailItem)} disabled={buyingTrix === detailItem.id}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                      style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
                      {buyingTrix === detailItem.id ? "Traitement..." : (
                        <>
                          <TrixIcon size={16} />
                          Payer {formatTrix(detailItem.price_trix)} Trix
                        </>
                      )}
                    </button>
                    {/* Pay with Euro */}
                    <button onClick={() => buyWithEuro(detailItem)} disabled={buyingEuro === detailItem.id}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                      {buyingEuro === detailItem.id ? "Redirection..." : (
                        <>
                          <CreditCard className="w-4 h-4 text-white/60" />
                          Payer {displayEuro(detailItem)}
                        </>
                      )}
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-white/30 text-center mt-3 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Non remboursable après achat
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}