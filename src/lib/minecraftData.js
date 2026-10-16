import biomes from "minecraft-data/minecraft-data/data/pc/1.21.9/biomes.json" with { type: "json" };
import blocks from "minecraft-data/minecraft-data/data/pc/1.21.9/blocks.json" with { type: "json" };
import entities from "minecraft-data/minecraft-data/data/pc/1.21.9/entities.json" with { type: "json" };
import items from "minecraft-data/minecraft-data/data/pc/1.21.9/items.json" with { type: "json" };
import recipes from "minecraft-data/minecraft-data/data/pc/1.21.9/recipes.json" with { type: "json" };

export const MINECRAFT_DATA_VERSION = "1.21.9";
const itemsById = new Map(items.map((item) => [item.id, item]));
const blocksByName = new Map(blocks.map((block) => [block.name, block]));

const ARMOR_WORDS = ["helmet", "chestplate", "leggings", "boots", "elytra", "shield"];
const TOOL_WORDS = ["sword", "pickaxe", "axe", "shovel", "hoe", "bow", "crossbow", "trident", "mace", "fishing_rod"];
const REDSTONE_WORDS = ["redstone", "repeater", "comparator", "piston", "observer", "hopper", "dispenser", "dropper", "lever", "button", "pressure_plate", "rail", "target"];
const FOOD_WORDS = ["apple", "bread", "beef", "pork", "chicken", "mutton", "rabbit", "fish", "salmon", "cod", "potato", "carrot", "beetroot", "melon", "cookie", "cake", "stew", "soup", "honey", "berries"];

export const ENCYCLOPEDIA_CATEGORIES = [
  { id: "all", label: "Tout" },
  { id: "tools", label: "Armes / Outils" },
  { id: "armor", label: "Armures" },
  { id: "building", label: "Construction" },
  { id: "redstone", label: "Redstone" },
  { id: "economy", label: "Économie / Nourriture" },
  { id: "world", label: "Mobs & Biomes" },
];

function includesAny(name, words) {
  return words.some((word) => name.includes(word));
}

function categoryFor(item, block) {
  if (includesAny(item.name, ARMOR_WORDS)) return "armor";
  if (includesAny(item.name, TOOL_WORDS) || item.enchantCategories?.includes("weapon")) return "tools";
  if (includesAny(item.name, REDSTONE_WORDS)) return "redstone";
  if (includesAny(item.name, FOOD_WORDS) || item.name.includes("emerald") || item.name.includes("villager")) return "economy";
  if (block) return "building";
  return "all";
}

function recipeIngredientIds(recipe) {
  if (Array.isArray(recipe.ingredients)) return recipe.ingredients.flat().filter(Number.isInteger);
  if (Array.isArray(recipe.inShape)) return recipe.inShape.flat().filter(Number.isInteger);
  return [];
}

export function getItemById(id) {
  const item = itemsById.get(id);
  if (!item) return null;
  return normalizeItem(item);
}

function normalizeItem(item) {
  const block = blocksByName.get(item.name) || null;
  const recipeVariants = (recipes[item.id] || [])
    .filter((recipe) => recipe?.result?.id === item.id && recipe.result.count > 0)
    .map((recipe, index) => ({
      id: `${item.id}-${index}`,
      type: recipe.inShape ? "shaped" : "shapeless",
      shape: recipe.inShape || null,
      ingredients: recipeIngredientIds(recipe),
      resultCount: recipe.result.count,
    }));

  return {
    kind: "item",
    id: `item-${item.id}`,
    numericId: item.id,
    name: item.name,
    displayName: item.displayName,
    technicalId: `minecraft:${item.name}`,
    stackSize: item.stackSize ?? null,
    maxDurability: item.maxDurability ?? null,
    hardness: block?.hardness ?? null,
    blockDropIds: block?.drops || [],
    category: categoryFor(item, block),
    recipes: recipeVariants,
    searchable: `${item.displayName} ${item.name}`.toLowerCase(),
  };
}

const itemEntries = items.map(normalizeItem);
const biomeEntries = biomes.map((biome) => ({
  kind: "biome",
  id: `biome-${biome.id}`,
  numericId: biome.id,
  name: biome.name,
  displayName: biome.displayName,
  technicalId: `minecraft:${biome.name}`,
  category: "world",
  dimension: biome.dimension ?? null,
  temperature: biome.temperature ?? null,
  precipitation: typeof biome.has_precipitation === "boolean" ? biome.has_precipitation : null,
  searchable: `${biome.displayName} ${biome.name} biome`.toLowerCase(),
}));
const mobEntries = entities
  .filter((entity) => entity.type === "mob")
  .map((entity) => ({
    kind: "mob",
    id: `mob-${entity.id}`,
    numericId: entity.id,
    name: entity.name,
    displayName: entity.displayName,
    technicalId: `minecraft:${entity.name}`,
    category: "world",
    mobCategory: entity.category ?? null,
    width: entity.width ?? null,
    height: entity.height ?? null,
    searchable: `${entity.displayName} ${entity.name} mob`.toLowerCase(),
  }));

export const MINECRAFT_ENTRIES = [...itemEntries, ...biomeEntries, ...mobEntries];

export function filterMinecraftEntries(entries, query, category) {
  const normalizedQuery = query.trim().toLowerCase();
  return entries.filter((entry) => {
    const categoryMatches = category === "all"
      || entry.category === category
      || (category === "building" && entry.kind === "item" && entry.category === "all");
    return categoryMatches && (!normalizedQuery || entry.searchable.includes(normalizedQuery));
  });
}
