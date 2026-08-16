import React from "react";

export default function WikiItemCard({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group block overflow-hidden rounded-lg border border-[#3a3a3a] hover:border-[#7DA627] transition-all duration-200 text-left"
      style={{ background: "#262626" }}
    >
      <div className="relative h-40 sm:h-44 overflow-hidden">
        <img
          src={item.thumbnail_url || item.image_url}
          alt={item.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "#7DA627" }}
        />
      </div>
      <div className="px-3 py-2">
        <span
          className="block text-[10px] font-bold uppercase tracking-wider mb-0.5"
          style={{ color: "#7DA627" }}
        >
          Élément
        </span>
        <span className="block text-xs font-bold text-white uppercase tracking-tight line-clamp-2">
          {item.title}
        </span>
      </div>
    </button>
  );
}