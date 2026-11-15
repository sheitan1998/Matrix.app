import React from "react";

export default function OpenGameItemCard({ item, accent }) {
  const image = item.image;
  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col group transition-transform hover:-translate-y-0.5"
      style={{ background: "rgba(13,5,24,0.85)", border: `1px solid ${accent}33` }}
    >
      <div
        className="relative h-32 flex items-center justify-center overflow-hidden"
        style={{ background: `radial-gradient(circle at 50% 30%, ${accent}18, #0a0512 70%)` }}
      >
        {image ? (
          <img
            src={image}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-contain p-2"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <span className="text-2xl font-black" style={{ color: `${accent}66` }}>
            {(item.name || "?").slice(0, 2).toUpperCase()}
          </span>
        )}
        {item.tag && (
          <span
            className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
            style={{ background: "rgba(10,5,18,0.85)", color: accent, border: `1px solid ${accent}55` }}
          >
            {item.tag}
          </span>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col gap-1">
        <h4 className="text-xs font-black text-white leading-tight" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.name}
        </h4>
        {item.subtitle && (
          <p className="text-[10px] font-bold" style={{ color: accent }}>{item.subtitle}</p>
        )}
        {item.desc && (
          <p className="text-[10px] text-white/40 leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.desc}
          </p>
        )}
      </div>
    </div>
  );
}