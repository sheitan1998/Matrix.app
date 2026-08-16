import { base44 } from "@/api/base44Client";

export const FARMING_SIM_POSTER = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/018b8e463_Gemini_Generated_Image_fjt2ptfjt2ptfjt2.png";

export const FARMING_SIM_CATEGORIES = [
  {
    id: "vehicules",
    title: "Véhicule",
    cards: [
      { id: "petits-tracteurs", title: "Petits tracteurs", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/65065ff53_Capturedcran2026-08-16044202.png" },
      { id: "tracteurs-moyens", title: "Tracteurs moyens", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/85f20b4d8_Capturedcran2026-08-16044220.png" },
      { id: "grands-tracteurs", title: "Grands tracteurs", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/c244ffc6b_Capturedcran2026-08-16044236.png" },
      { id: "camions", title: "Camions", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/0a8ca0cb8_Capturedcran2026-08-16044257.png" },
      { id: "voitures-motos", title: "Voitures et motos", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/c524798e8_Capturedcran2026-08-16044313.png" },
      { id: "divers-vehicules", title: "Divers", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/dd7a5e76a_Capturedcran2026-08-16044325.png" },
    ],
  },
  {
    id: "chargeuses",
    title: "Chargeuse",
    cards: [
      { id: "chargeuses-avant", title: "Chargeuses avant", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/f4b4d3bfe_Capturedcran2026-08-16050326.png" },
      { id: "outils-pour-chargeuses", title: "Outils pour chargeuses", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/0b7fdbe87_Capturedcran2026-08-16050345.png" },
      { id: "chariots-telescopiques", title: "Chariots télescopiques", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/b6eeb8704_Capturedcran2026-08-16050355.png" },
      { id: "equipement-pour-chargeuses", title: "Équipement pour chargeuses", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/6b1703ce2_Capturedcran2026-08-16050405.png" },
      { id: "chargeuses-sur-pneus", title: "Chargeuses sur pneus", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/eeb114e3c_Capturedcran2026-08-16050418.png" },
      { id: "chargeuses-compactes", title: "Chargeuses compactes", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/44ded42be_Capturedcran2026-08-16050438.png" },
      { id: "chariots-elevateurs", title: "Chariots élévateurs", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/ea5a63cce_Capturedcran2026-08-16050518.png" },
    ],
  },
  { id: "remorques", title: "Remorque", cards: [] },
  { id: "travail-du-sol", title: "Travail du sol", cards: [] },
  { id: "semis", title: "Semi", cards: [] },
  { id: "ameliorations-rendement", title: "Amélioration du rendement", cards: [] },
  { id: "moisson-battage", title: "Moisson et battage", cards: [] },
  { id: "recolte-fourrage", title: "Récolte de fourrage", cards: [] },
  { id: "prairie", title: "Prairie", cards: [] },
  { id: "mise-en-balles", title: "Mise en balle", cards: [] },
  { id: "tubercules", title: "Tubercule", cards: [] },
  { id: "legumes", title: "Légumes", cards: [] },
  { id: "cultures-speciales", title: "Culture spéciale", cards: [] },
  { id: "raisins-olives", title: "Raisins et olives", cards: [] },
  { id: "animaux", title: "Animaux", cards: [] },
  { id: "sylviculture", title: "Sylviculture", cards: [] },
  { id: "divers", title: "Divers", cards: [] },
  { id: "objets", title: "Objets", cards: [] },
  { id: "outils-manuels", title: "Outils manuels", cards: [] },
];

export async function fetchFarmingSimCategories() {
  try {
    const items = await base44.entities.FarmingSimCategory.list('sort_order', 200);
    if (!items || items.length === 0) return FARMING_SIM_CATEGORIES;
    const cats = items.filter(i => !i.parent_slug).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return cats.map(cat => ({
      id: cat.slug,
      title: cat.title,
      cards: items
        .filter(i => i.parent_slug === cat.slug)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(sub => ({ id: sub.slug, title: sub.title, img: sub.img })),
    }));
  } catch {
    return FARMING_SIM_CATEGORIES;
  }
}