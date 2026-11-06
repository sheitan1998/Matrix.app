import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Wallet, Gift } from "lucide-react";
import HeaderActions from "@/components/layout/HeaderActions";

export default function ShopHeader() {
  return (
    <header className="mb-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: "radial-gradient(circle at 30% 20%, #7c3aed, #180a26 72%)",
              border: "1px solid rgba(168,85,247,0.55)",
              boxShadow: "0 0 30px rgba(139,92,246,0.45)",
            }}
          >
            <ShoppingBag className="h-6 w-6 text-white/90" />
            <span
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-black"
              style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)" }}
            >
              M
            </span>
          </div>
          <div>
            <h1
              className="text-2xl font-black tracking-tight sm:text-3xl"
              style={{
                background: "linear-gradient(92deg,#f5f3ff,#c4b5fd 55%,#fbbf24)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Boutique Matrix
            </h1>
            <p className="text-xs text-white/45 sm:text-sm">
              Découvrez tous nos produits et profitez d'avantages exclusifs !
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/wallet"
            className="flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-bold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", boxShadow: "0 0 18px rgba(139,92,246,0.35)" }}
          >
            <Wallet className="h-4 w-4" /> Mon Portefeuille
          </Link>
          <HeaderActions />
        </div>
      </div>

      <div
        className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{
          background: "linear-gradient(100deg, rgba(88,28,135,0.55), rgba(24,10,38,0.72))",
          border: "1px solid rgba(168,85,247,0.3)",
        }}
      >
        <Gift className="h-5 w-5 shrink-0 text-amber-300" />
        <p className="text-xs font-semibold text-white/80 sm:text-sm">
          Faites vos achats, boostez votre expérience et devenez encore plus puissant !
        </p>
      </div>
    </header>
  );
}