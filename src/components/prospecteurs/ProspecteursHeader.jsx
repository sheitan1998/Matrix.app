import React from "react";
import { Link } from "react-router-dom";
import { Gem } from "lucide-react";
import HeaderActions from "@/components/layout/HeaderActions";

export default function ProspecteursHeader({ user, trixBalance }) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3"
      style={{
        background: "rgba(18, 9, 28, 0.95)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(138, 79, 255, 0.2)"
      }}>
      
      {/* Left: MATRIX logo */}
      <Link to="/" className="flex items-center gap-2 tap-sm">
        <span className="text-xl font-black text-white tracking-tight">
          MATRI<span style={{ color: "#8a4fff" }}>X</span>
        </span>
      </Link>

      {/* Center: RECHERCHE PROSPECTEURS pill */}
      









      

      {/* Right: Trix Wallet + Messaging + Profile */}
      <HeaderActions />
    </header>);

}