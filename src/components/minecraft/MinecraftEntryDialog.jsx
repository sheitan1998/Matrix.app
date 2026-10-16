import React, { useEffect, useState } from "react";
import { Box, ChevronLeft, ChevronRight, Database, Hammer, Layers3, Map, PawPrint } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MinecraftVisual from "./MinecraftVisual";
import CraftRecipe from "./CraftRecipe";

function Value({ children = null }) {
  return children === null || children === undefined || children === ""
    ? <span className="text-white/35">Non disponible dans la source</span>
    : <span className="text-white/80">{children}</span>;
}

export default function MinecraftEntryDialog({ entry, onOpenChange, onSelectEntry }) {
  const [recipeIndex, setRecipeIndex] = useState(0);

  useEffect(() => setRecipeIndex(0), [entry?.id]);

  if (!entry) return null;
  const recipes = entry.kind === "item" ? entry.recipes : [];
  const recipe = recipes[recipeIndex];

  return (
    <Dialog open={Boolean(entry)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-emerald-300/20 bg-[#07100c]/95 p-0 text-white shadow-2xl shadow-emerald-950/50 backdrop-blur-2xl">
        <DialogHeader className="border-b border-white/10 p-5 pr-14">
          <div className="flex items-center gap-4 text-left">
            <MinecraftVisual entry={entry} />
            <div className="min-w-0">
              <DialogTitle className="truncate text-xl font-black">{entry.displayName}</DialogTitle>
              <DialogDescription className="mt-1 font-mono text-xs text-emerald-200/70">
                {entry.technicalId}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 p-5">
          {entry.kind === "item" && (
            <>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <Info icon={Layers3} label="Stack maximum"><Value>{entry.stackSize}</Value></Info>
                <Info icon={Hammer} label="Durabilité"><Value>{entry.maxDurability}</Value></Info>
                <Info icon={Box} label="Dureté du bloc"><Value>{entry.hardness}</Value></Info>
                <Info icon={Database} label="ID numérique"><Value>{entry.numericId}</Value></Info>
                <Info icon={Map} label="Biomes d’apparition"><Value /></Info>
                <Info icon={PawPrint} label="Drops de mobs"><Value /></Info>
              </dl>

              <section>
                <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-white">Recettes</h3>
                {recipe ? (
                  <>
                    {recipes.length > 1 && (
                      <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-2">
                        <button
                          type="button"
                          onClick={() => setRecipeIndex((index) => Math.max(0, index - 1))}
                          disabled={recipeIndex === 0}
                          className="rounded-lg p-2 text-white/60 hover:bg-white/10 disabled:opacity-25"
                          aria-label="Recette précédente"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-xs font-bold text-white/60">
                          Variante {recipeIndex + 1} sur {recipes.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRecipeIndex((index) => Math.min(recipes.length - 1, index + 1))}
                          disabled={recipeIndex === recipes.length - 1}
                          className="rounded-lg p-2 text-white/60 hover:bg-white/10 disabled:opacity-25"
                          aria-label="Recette suivante"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <CraftRecipe recipe={recipe} result={entry} onSelect={onSelectEntry} />
                  </>
                ) : (
                  <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/40">
                    Recette non disponible dans la source.
                  </p>
                )}
              </section>
            </>
          )}

          {entry.kind === "biome" && (
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Info icon={Map} label="Dimension"><Value>{entry.dimension}</Value></Info>
              <Info icon={Database} label="Température"><Value>{entry.temperature}</Value></Info>
              <Info icon={Layers3} label="Précipitations">
                <Value>{entry.precipitation === null ? null : entry.precipitation ? "Oui" : "Non"}</Value>
              </Info>
              <Info icon={PawPrint} label="Mobs présents"><Value /></Info>
            </dl>
          )}

          {entry.kind === "mob" && (
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Info icon={PawPrint} label="Catégorie"><Value>{entry.mobCategory}</Value></Info>
              <Info icon={Layers3} label="Dimensions">
                <Value>{entry.width && entry.height ? `${entry.width} × ${entry.height} blocs` : null}</Value>
              </Info>
              <Info icon={Map} label="Biomes d’apparition"><Value /></Info>
              <Info icon={Box} label="Drops"><Value /></Info>
            </dl>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ icon: Icon, label, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <dt className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-200/70">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
