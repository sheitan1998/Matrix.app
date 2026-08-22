import React from "react";
import { cn } from "@/lib/utils";

const COIN_URL = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/e7a29db49_ChatGPT_Image_3_aot_2026__16_22_42-removebg-preview.png";

export default function TrixIcon({ className = "", size = 50 }) {
  return (
    <img
      src={COIN_URL}
      alt="Trix"
      className={cn("inline-block shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}