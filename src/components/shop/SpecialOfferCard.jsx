import React from "react";
import { Flame, ArrowRight } from "lucide-react";
import { formatEuro } from "@/lib/shopPricing";

export default function SpecialOfferCard({ offer, onClick }) {
  if (!offer) return null;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl p-4 text-left transition hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(155deg,#fbbf24,#f59e0b 52%,#ea580c)",
        border: "1px solid rgba(255,255,255,0.35)",
        boxShadow: "0 16px 36px rgba(245,158,11,0.28)",
      }}
    >
      {offer.image && (
        <div className="relative mb-3 h-16 overflow-hidden rounded-xl" style={{ border: "1px solid rgba(0,0,0,0.15)" }}>
          <img src={offer.image} alt={offer.title} className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}

      {offer.discountPercent > 0 && (
        <span
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-xs font-black"
          style={{ background: "#fff", color: "#6d28d9", boxShadow: "0 4px 14px rgba(0,0,0,0.25)" }}
        >
          -{offer.discountPercent}%
        </span>
      )}

      <div className="flex items-center gap-1.5">
        <Flame className="h-4 w-4 text-[#7c2d12]" />
        <p className="text-[11px] font-black uppercase tracking-widest text-[#7c2d12]">Offre Spéciale !</p>
      </div>

      <h3 className="mt-1.5 pr-10 text-sm font-black leading-snug text-[#2b1206]">{offer.title}</h3>
      {offer.description && <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-relaxed text-[#4a2205]/80">{offer.description}</p>}

      <div className="mt-auto flex items-end gap-2 pt-3">
        {offer.oldPrice > offer.price && (
          <span className="text-xs font-bold text-[#4a2205]/60 line-through">{formatEuro(offer.oldPrice)}</span>
        )}
        <span className="text-2xl font-black text-[#2b1206]">{formatEuro(offer.price)}</span>
      </div>

      <button
        onClick={onClick}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-black text-[#2b1206] transition hover:brightness-105"
        style={{ background: "linear-gradient(135deg,#fde68a,#fbbf24)", border: "1px solid rgba(120,53,15,0.25)" }}
      >
        {offer.cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}