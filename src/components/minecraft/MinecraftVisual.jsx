import React, { useState } from "react";
import { Box, Map, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

const ASSET_BASE = "https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.5";

export default function MinecraftVisual({ entry, className = "", compact = false }) {
  const [failed, setFailed] = useState(false);
  const sizeClass = compact ? "h-10 w-10" : "h-14 w-14";
  const imageUrl = entry.kind === "item"
    ? `${ASSET_BASE}/items/${entry.name}.png`
    : entry.kind === "mob"
      ? `${ASSET_BASE}/entity/${entry.name}.png`
      : null;
  const Icon = entry.kind === "biome" ? Map : entry.kind === "mob" ? PawPrint : Box;

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-xl border border-emerald-300/15 bg-black/35",
        sizeClass,
        className,
      )}
      aria-hidden="true"
    >
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain p-1.5 [image-rendering:pixelated]"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon className={compact ? "h-4 w-4 text-emerald-300/70" : "h-6 w-6 text-emerald-300/70"} />
      )}
    </div>
  );
}

