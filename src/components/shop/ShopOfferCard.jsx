import React from "react";
import { CreditCard, Check } from "lucide-react";
import TrixIcon from "@/components/TrixIcon";
import { formatTrix } from "@/lib/format";

export default function ShopOfferCard({ offer, onBuy, buying }) {
  const accent = offer.accent || "#a855f7";

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl p-4"
      style={{
        background: "linear-gradient(160deg, rgba(28,14,44,0.95), rgba(9,5,14,0.96))",
        border: `1px solid ${accent}55`,
        boxShadow: "0 12px 30px rgba(0,0,0,0.42)",
      }}
    >
      {offer.badge && (
        <span
          className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[9px] font-black text-black"
          style={{ background: accent }}
        >
          {offer.badge}
        </span>
      )}

      <div className="mb-2 flex items-center gap-2 pr-16">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}
          aria-hidden="true"
        >
          {offer.icon || "✨"}
        </span>
        <h3 className="truncate text-sm font-black text-white">{offer.name}</h3>
      </div>

      <p className="text-xl font-black text-white">
        {offer.price}
        {offer.period && <span className="text-[11px] font-bold text-white/40"> {offer.period}</span>}
      </p>

      {offer.perks?.length > 0 && (
        <ul className="mt-2 flex-1 space-y-1">
          {offer.perks.map((perk) => (
            <li key={perk} className="flex items-start gap-1.5 text-[11px] leading-snug text-white/60">
              <Check className="mt-0.5 h-3 w-3 shrink-0" style={{ color: accent }} />
              {perk}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 space-y-1.5">
        <button
          onClick={() => onBuy(offer, "euro")}
          disabled={!!buying}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black text-white transition hover:brightness-110 disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
        >
          <CreditCard className="h-3.5 w-3.5" />
          {buying === `${offer.id}:euro` ? "Chargement..." : "Payer par carte"}
        </button>

        {offer.trixPrice > 0 && (
          <button
            onClick={() => onBuy(offer, "trix")}
            disabled={!!buying}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white/85 transition hover:text-white disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <TrixIcon size={14} />
            {buying === `${offer.id}:trix` ? "..." : `${formatTrix(offer.trixPrice)} Trix`}
          </button>
        )}
      </div>
    </div>
  );
}