import React from "react";
import { Shield, Zap, Headphones, Lock } from "lucide-react";

const ITEMS = [
  { icon: Shield, label: "Paiements sécurisés" },
  { icon: Zap, label: "Retraits rapides" },
  { icon: Headphones, label: "Support 24h/24" },
  { icon: Lock, label: "Connexion chiffrée" },
];

export default function CasinoSecurityBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 px-4 rounded-2xl"
      style={{ background: "rgba(12,12,16,0.5)", border: "1px solid rgba(255,255,255,0.04)" }}>
      {ITEMS.map((item, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-1.5">
            <item.icon className="w-3.5 h-3.5" style={{ color: "rgba(139,92,246,0.6)" }} />
            <span className="text-[10px] font-medium text-white/40">{item.label}</span>
          </div>
          {i < ITEMS.length - 1 && <span className="text-white/10 hidden sm:inline">·</span>}
        </React.Fragment>
      ))}
    </div>
  );
}