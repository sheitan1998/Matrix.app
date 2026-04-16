import React from "react";
import { cn } from "@/lib/utils";

export default function TrixIcon({ className = "", size = 16 }) {
  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-full bg-premium/20 shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <span
        className="font-black text-premium leading-none"
        style={{ fontSize: size * 0.55 }}
      >
        T
      </span>
    </span>
  );
}