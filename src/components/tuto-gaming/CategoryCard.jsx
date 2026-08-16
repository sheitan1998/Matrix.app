import React from "react";
import { Link } from "react-router-dom";

export default function CategoryCard({ card, basePath = "/tuto-gaming/farming-simulator-25" }) {
  return (
    <Link
      to={`${basePath}/${card.id}`}
      className="group block overflow-hidden rounded-lg border border-[#3a3a3a] hover:border-[#7DA627] transition-all duration-200"
      style={{ background: "#262626" }}
    >
      <div className="relative h-40 sm:h-44 overflow-hidden">
        <img
          src={card.img}
          alt={card.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "#7DA627" }}
        />
      </div>
    </Link>
  );
}