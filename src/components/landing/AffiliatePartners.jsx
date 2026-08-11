import React from "react";
import { motion } from "framer-motion";
import { Star, ArrowUpRight } from "lucide-react";

const PARTNERS = [
  {
    name: "Amazon",
    title: "Nos offres chez Amazon",
    button: "Voir sur Amazon",
    url: "https://www.amazon.fr",
    image: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/3ea092b99_Gemini_Generated_Image_dwz0m2dwz0m2dwz0.png",
  },
  {
    name: "Decathlon",
    title: "Nos offres chez Decathlon",
    button: "Découvrir Decathlon",
    url: "https://www.decathlon.fr",
    image: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/86c0fef7e_Gemini_Generated_Image_4x2tdt4x2tdt4x2t.png",
  },
  {
    name: "Intersport",
    title: "Nos offres chez Intersport",
    button: "Acheter Intersport",
    url: "https://www.intersport.fr",
    image: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/8490b6202_generated_image.png",
  },
  {
    name: "LDLC",
    title: "Nos offres chez LDLC",
    button: "Explorer LDLC",
    url: "https://www.ldlc.com",
    image: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/38538f9f2_Gemini_Generated_Image_luwqztluwqztluwq.png",
  },
];

function PartnerCard({ partner, index }) {
  return (
    <motion.a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-xl overflow-hidden flex items-stretch"
      style={{ background: "#121016", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Image */}
      <div className="w-24 sm:w-28 shrink-0 flex items-center justify-center" style={{ background: "#0a050f" }}>
        <img src={partner.image} alt={partner.name} className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between gap-2 min-w-0">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white leading-tight">{partner.title}</h3>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3 h-3 fill-current" style={{ color: "#ffb800" }} />
            ))}
            <span className="text-xs text-white ml-1">4,5</span>
          </div>
        </div>
        <button
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white self-start transition hover:opacity-90"
          style={{ background: "#2a2630" }}
        >
          {partner.button}
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </motion.a>
  );
}

export default function AffiliatePartners() {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5"
      style={{
        background: "rgba(22,19,28,0.8)",
        border: "1px solid rgba(90,69,128,0.4)",
        boxShadow: "0 0 20px rgba(90,69,128,0.15)",
      }}
    >
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
        Nos offres chez nos partenaires affiliés
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PARTNERS.map((p, i) => (
          <PartnerCard key={p.name} partner={p} index={i} />
        ))}
      </div>
    </div>
  );
}