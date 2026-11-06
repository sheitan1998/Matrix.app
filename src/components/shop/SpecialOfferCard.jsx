import React from "react";
import { Flame } from "lucide-react";
import { formatEuro } from "@/lib/shopPricing";

// Bloc purement informatif : il présente l'offre mais n'ouvre aucun achat.
export default function SpecialOfferCard({ offer }) {
  if (!offer) return null;
  const hasImage = !!offer.image;
  const dark = hasImage;

  return (
    <div
      className="group relative flex min-h-[186px] flex-col overflow-hidden rounded-2xl p-4 text-left"
      style={{
        background: hasImage ? "#0b0616" : "linear-gradient(155deg,#fbbf24,#f59e0b 52%,#ea580c)",
        border: hasImage ? "1px solid rgba(251,191,36,0.5)" : "1px solid rgba(255,255,255,0.35)",
        boxShadow: hasImage
          ? "0 16px 36px rgba(0,0,0,0.45)"
          : "0 16px 36px rgba(245,158,11,0.28)",
      }}
    >
      {hasImage && (
        <>
          <img
            src={offer.image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(6,3,12,0.95) 0%, rgba(6,3,12,0.84) 45%, rgba(6,3,12,0.5) 100%)",
            }}
          />
          <span
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
            style={{ background: "linear-gradient(180deg, rgba(6,3,12,0), rgba(6,3,12,0.88))" }}
          />
        </>
      )}

      {offer.discountPercent > 0 && (
        <span
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full text-xs font-black"
          style={{ background: "#fff", color: "#6d28d9", boxShadow: "0 4px 14px rgba(0,0,0,0.25)" }}
        >
          -{offer.discountPercent}%
        </span>
      )}

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center gap-1.5 pr-14">
          <Flame className={`h-4 w-4 ${dark ? "text-amber-300" : "text-[#7c2d12]"}`} />
          <p className={`text-[11px] font-black uppercase tracking-widest ${dark ? "text-amber-200" : "text-[#7c2d12]"}`}>
            Offre Spéciale !
          </p>
        </div>

        <h3 className={`mt-2 text-base font-black leading-tight ${dark ? "text-white" : "text-[#3b1a05]"}`}>
          {offer.title}
        </h3>

        {offer.description && (
          <p className={`mt-1 line-clamp-2 text-[11px] leading-relaxed ${dark ? "text-white/70" : "text-[#5b2a0c]/80"}`}>
            {offer.description}
          </p>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          {offer.oldPrice > 0 && (
            <span className={`text-xs font-bold line-through ${dark ? "text-white/40" : "text-[#7c2d12]/60"}`}>
              {formatEuro(offer.oldPrice)}
            </span>
          )}
          {offer.price > 0 && (
            <span className={`text-xl font-black ${dark ? "text-amber-300" : "text-[#3b1a05]"}`}>
              {formatEuro(offer.price)}
            </span>
          )}
        </div>

        <div
          className="mt-3 flex w-full cursor-default items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-black text-[hsl(var(--background))]"
          style={{ background: "linear-gradient(135deg,#fde68a,#fbbf24)", border: "1px solid rgba(120,53,15,0.25)" }}
        >
          {offer.cta}
        </div>
      </div>
    </div>
  );
}