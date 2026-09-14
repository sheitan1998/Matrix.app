import React from "react";
import { cn } from "@/lib/utils";

const TOKEN_URL = "/media/tuto-gaming/1063cf1e5_Gemini_Generated_Image_fjbtg9fjbtg9fjbt-removebg-preview.png";

export default function CasinoToken({ className = "", size = 50 }) {
  return (
    <img
      src={TOKEN_URL}
      alt="Matrix Token"
      className={cn("inline-block shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}