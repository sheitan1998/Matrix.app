import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const POSTER_IMAGE = "https://media.base44.com/images/public/69e14a987a927963a9924d5a/5a7d6231a_Farming-Simulator-25.jpg";

const CATALOG_SECTIONS = [
  { id: "objets_outils", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/7cefd3e31_Capturedcran2026-08-15115323.png", title: "Objets & Outils Manuels" },
  { id: "vehicules", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/5a30ff2e9_Capturedcran2026-08-15114555.png", title: "Véhicules" },
  { id: "chargeuses", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/3f4ddd394_Capturedcran2026-08-15114617.png", title: "Chargeuses" },
  { id: "remorques", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/c02303482_Capturedcran2026-08-15114730.png", title: "Remorques" },
  { id: "travail_sol", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/02e1a37b7_Capturedcran2026-08-15114742.png", title: "Travail du Sol" },
  { id: "semis", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/2674749ee_Capturedcran2026-08-15114752.png", title: "Semis" },
  { id: "ameliorations", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/517671bd2_Capturedcran2026-08-15114811.png", title: "Améliorations du Rendement" },
  { id: "moisson", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/311267874_Capturedcran2026-08-15114827.png", title: "Moisson et Battage" },
  { id: "fourrage", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/758a8a024_Capturedcran2026-08-15114839.png", title: "Récolte de Fourrage" },
  { id: "prairie", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/2f811d1c1_Capturedcran2026-08-15114852.png", title: "Prairie" },
  { id: "balles", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/df0948be7_Capturedcran2026-08-15114903.png", title: "Mise en Balles" },
  { id: "tubercules_1", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/ead086645_Capturedcran2026-08-15114915.png", title: "Tubercules" },
  { id: "tubercules_2", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/602599805_Capturedcran2026-08-15115001.png", title: "Tubercules" },
  { id: "legumes", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/5d628ad8b_Capturedcran2026-08-15115011.png", title: "Légumes" },
  { id: "cultures_speciales", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/62e022c96_Capturedcran2026-08-15115142.png", title: "Cultures Spéciales" },
  { id: "raisin_olives", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/da94cf8f9_Capturedcran2026-08-15115205.png", title: "Raisin et Olives" },
  { id: "animaux", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/580b988e6_Capturedcran2026-08-15115220.png", title: "Animaux" },
  { id: "sylviculture", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/019b51715_Capturedcran2026-08-15115259.png", title: "Sylviculture" },
  { id: "divers", img: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/2bd48366b_Capturedcran2026-08-15115309.png", title: "Divers" },
];

export default function FarmingSimulator25() {
  return (
    <div className="min-h-screen" style={{ background: "#0d0518" }}>
      {/* Back link */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-4">
        <Link
          to="/tuto-gaming"
          className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition tap-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold">Retour au Hub</span>
        </Link>
      </div>

      {/* Poster / Hero */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-4">
        <div
          className="relative overflow-hidden rounded-2xl border border-white/10"
          style={{ boxShadow: "0 0 40px rgba(191,90,242,0.15)" }}
        >
          <img
            src={POSTER_IMAGE}
            alt="Farming Simulator 25"
            className="w-full h-auto object-cover"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, transparent 60%, rgba(13,5,24,0.6) 100%)",
            }}
          />
        </div>
      </div>

      {/* Catalog sections stacked vertically */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-12 space-y-3">
        {CATALOG_SECTIONS.map((section) => (
          <div
            key={section.id}
            className="overflow-hidden rounded-xl border border-white/5"
            style={{ background: "#1a1a1a" }}
          >
            <img
              src={section.img}
              alt={section.title}
              className="w-full h-auto object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}