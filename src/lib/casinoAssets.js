import { SLOT_THEMES } from "@/components/casino/slotThemes";

/**
 * Liste des assets casino clés à précharger dès l'arrivée sur l'app.
 * Inclut: arrière-plans des slots, cartes du lobby, symboles communs, tokens.
 */
const CASINO_ASSETS = [
  // Cartes du lobby casino
  "/media/tuto-gaming/62275f2a2_generated_image.png",
  "https://media.base44.com/images/public/69e14a987a927963a9924d5a/f1890072f_ChatGPTImage28sept202617_21_27.png",
  "https://media.base44.com/images/public/69e14a987a927963a9924d5a/f4b6e77c6_ChatGPTImage28sept202617_28_25.png",

  // Token casino
  "/media/tuto-gaming/1063cf1e5_Gemini_Generated_Image_fjbtg9fjbtg9fjbt-removebg-preview.png",

  // Curseur pièce (scratch card)
  "https://media.base44.com/images/public/69e14a987a927963a9924d5a/aca8e7da3_ChatGPT_Image_3_aot_2026__16_22_42-removebg-preview.png",

  // Arrière-plans des 6 thèmes de slots
  ...Object.values(SLOT_THEMES).map((t) => t.bgImage),
];

/**
 * Retourne la liste des URLs d'images à précharger pour le casino.
 * @returns {string[]}
 */
export function getCasinoAssets() {
  return CASINO_ASSETS.filter(Boolean);
}