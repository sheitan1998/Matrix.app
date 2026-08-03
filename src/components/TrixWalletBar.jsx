import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { formatTrix } from "@/lib/format";
import { ShoppingBag, RefreshCw } from "lucide-react";
import TrixIcon from "@/components/TrixIcon";
import ShopSelectionModal from "@/components/ShopSelectionModal";

export default function TrixWalletBar() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [showShopModal, setShowShopModal] = useState(false);
  const balance = user?.trix_balance ?? 0;

  return (
    <>
      <div className="flex items-center gap-2 shrink-0">
        {/* Trix balance */}
        <div
          className="flex items-center gap-1.5 h-9 px-3 rounded-full"
          style={{
            background: "rgba(255,215,0,0.06)",
            border: "1px solid rgba(255,215,0,0.2)",
          }}
          title="Votre solde de Trix"
        >
          <TrixIcon size={18} />
          <span className="font-mono text-sm font-bold text-white">
            {formatTrix(balance)}
          </span>
        </div>

        {/* Boutique Cosmétiques */}
        <button
          onClick={() => setShowShopModal(true)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-bold text-white transition hover:opacity-90 tap-sm"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
            boxShadow: "0 0 15px rgba(139,92,246,0.3)",
          }}
          title="Boutique Cosmétiques"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">Cosmétiques</span>
        </button>

        {/* Boutique Trix */}
        <button
          onClick={() => setShowShopModal(true)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-bold text-white transition hover:opacity-90 tap-sm"
          style={{
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            boxShadow: "0 0 15px rgba(251,191,36,0.3)",
          }}
          title="Boutique Trix"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Trix</span>
        </button>
      </div>

      <ShopSelectionModal
        open={showShopModal}
        onClose={() => setShowShopModal(false)}
        onSelectTrix={() => nav("/trix-store")}
        onSelectCosmetics={() => nav("/boutique-matrix")}
      />
    </>
  );
}