import React from "react";
import { ArrowRight, Shuffle } from "lucide-react";
import MinecraftVisual from "./MinecraftVisual";
import { getItemById } from "@/lib/minecraftData";

function IngredientButton({ itemId, onSelect }) {
  const item = getItemById(itemId);
  if (!item) {
    return (
      <div className="grid aspect-square place-items-center rounded-lg border border-dashed border-white/10 bg-black/20 text-[10px] text-white/35">
        Indisponible
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group relative flex aspect-square min-h-0 min-w-0 items-center justify-center rounded-lg border border-white/10 bg-black/25 p-1 transition hover:border-emerald-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
      aria-label={`Ouvrir la fiche de ${item.displayName}`}
      title={item.displayName}
    >
      <MinecraftVisual entry={item} compact className="h-full w-full border-0 bg-transparent" />
      <span className="sr-only">{item.displayName}</span>
    </button>
  );
}

export default function CraftRecipe({ recipe, result, onSelect }) {
  if (recipe.type === "shapeless") {
    const counts = recipe.ingredients.reduce((accumulator, id) => {
      accumulator.set(id, (accumulator.get(id) || 0) + 1);
      return accumulator;
    }, new Map());

    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-200">
          <Shuffle className="h-4 w-4" />
          Recette sans forme
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[...counts].map(([id, count]) => {
            const item = getItemById(id);
            return (
              <div key={id} className="relative">
                <IngredientButton itemId={id} onSelect={onSelect} />
                {count > 1 && (
                  <span className="absolute -bottom-1 -right-1 rounded-full bg-emerald-400 px-1.5 text-[10px] font-black text-black">
                    ×{count}
                  </span>
                )}
                <span className="mt-1 block max-w-16 truncate text-center text-[9px] text-white/45">
                  {item?.displayName || "Inconnu"}
                </span>
              </div>
            );
          })}
          <ArrowRight className="mx-1 h-5 w-5 text-white/30" />
          <Result entry={result} count={recipe.resultCount} />
        </div>
      </div>
    );
  }

  const rows = recipe.shape || [];
  const grid = Array.from({ length: 9 }, () => null);
  rows.forEach((row, rowIndex) => {
    row.forEach((itemId, columnIndex) => {
      grid[rowIndex * 3 + columnIndex] = itemId;
    });
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-emerald-200">Grille de craft 3 × 3</p>
      <div className="flex items-center gap-4">
        <div className="grid w-44 grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/30 p-2">
          {grid.map((itemId, index) => (
            itemId === null || itemId === undefined || itemId < 0
              ? <div key={index} className="aspect-square rounded-lg border border-dashed border-white/10 bg-white/[0.02]" />
              : <IngredientButton key={index} itemId={itemId} onSelect={onSelect} />
          ))}
        </div>
        <ArrowRight className="h-6 w-6 shrink-0 text-white/30" />
        <Result entry={result} count={recipe.resultCount} />
      </div>
    </div>
  );
}

function Result({ entry, count }) {
  return (
    <div className="relative text-center">
      <MinecraftVisual entry={entry} />
      {count > 1 && (
        <span className="absolute right-0 top-10 rounded-full bg-emerald-400 px-1.5 text-[10px] font-black text-black">
          ×{count}
        </span>
      )}
      <span className="mt-1 block max-w-20 truncate text-[9px] text-white/45">{entry.displayName}</span>
    </div>
  );
}
