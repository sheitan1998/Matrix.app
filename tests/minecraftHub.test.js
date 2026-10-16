import assert from "node:assert/strict";
import test from "node:test";
import { buildModrinthFacets } from "../src/lib/modrinthApi.js";
import {
  filterMinecraftEntries,
  getItemById,
  MINECRAFT_DATA_VERSION,
  MINECRAFT_ENTRIES,
} from "../src/lib/minecraftData.js";

test("construit des groupes de facettes Modrinth avec OR intra-groupe", () => {
  const facets = buildModrinthFacets({
    projectType: "mod",
    loader: "NeoForge",
    versionFamily: "1.21.x",
  });

  assert.deepEqual(facets[0], ["project_type:mod"]);
  assert.deepEqual(facets[1], ["categories:neoforge"]);
  assert.ok(facets[2].includes("versions:1.21"));
  assert.ok(facets[2].includes("versions:1.21.9"));
});

test("normalise les métadonnées Minecraft réellement disponibles", () => {
  assert.equal(MINECRAFT_DATA_VERSION, "1.21.9");
  const sword = MINECRAFT_ENTRIES.find((entry) => entry.name === "diamond_sword");
  const stone = MINECRAFT_ENTRIES.find((entry) => entry.name === "stone");

  assert.equal(sword.technicalId, "minecraft:diamond_sword");
  assert.equal(sword.stackSize, 1);
  assert.equal(sword.maxDurability, 1561);
  assert.equal(stone.hardness, 1.5);
});

test("expose des recettes shaped 3x3 et shapeless sans inventer d’ingrédients", () => {
  const entriesWithRecipes = MINECRAFT_ENTRIES.filter(
    (entry) => entry.kind === "item" && entry.recipes.length > 0,
  );
  const shaped = entriesWithRecipes.flatMap((entry) => entry.recipes).find((recipe) => recipe.type === "shaped");
  const shapeless = entriesWithRecipes.flatMap((entry) => entry.recipes).find((recipe) => recipe.type === "shapeless");

  assert.ok(shaped);
  assert.ok(shaped.shape.length <= 3);
  assert.ok(shaped.shape.every((row) => row.length <= 3));
  assert.ok(shapeless);
  assert.ok(shapeless.ingredients.every(Number.isInteger));
  assert.ok(getItemById(shapeless.ingredients.find((id) => id >= 0)));
});

test("filtre par recherche et catégorie", () => {
  const tools = filterMinecraftEntries(MINECRAFT_ENTRIES, "diamond_sword", "tools");
  const biomes = filterMinecraftEntries(MINECRAFT_ENTRIES, "badlands", "world");

  assert.ok(tools.some((entry) => entry.name === "diamond_sword"));
  assert.ok(biomes.some((entry) => entry.kind === "biome" && entry.name === "badlands"));
  assert.equal(filterMinecraftEntries(MINECRAFT_ENTRIES, "badlands", "armor").length, 0);
});

