import React from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight, Search } from "lucide-react";

const PARTNERS = [
  {
    name: "Amazon",
    title: "Nos offres chez Amazon",
    btn: "Voir sur Amazon",
    href: "https://amzn.to/3SslkT2",
    image: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/3ea092b99_Gemini_Generated_Image_dwz0m2dwz0m2dwz0.png",
  },
  {
    name: "Instant Gaming",
    title: "Nos offres chez Instant Gaming",
    btn: "Découvrir Instant Gaming",
    href: "https://www.instant-gaming.com/?igr=gamer-45b9bd",
    image: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/fc73e390a_generated_image.png",
  },
  {
    name: "Intersport",
    title: "Nos offres chez Intersport",
    btn: "Acheter Intersport",
    href: null,
    image: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/9ff3a90f6_Gemini_Generated_Image_axli8xaxli8xaxli.png",
  },
  {
    name: "LDLC",
    title: "Nos offres chez LDLC",
    btn: "Explorer LDLC",
    href: null,
    image: "https://media.base44.com/images/public/69e14a987a927963a9924d5a/38538f9f2_Gemini_Generated_Image_luwqztluwqztluwq.png",
    extraSearch: true,
  },
];

function PartnerCard({ p, index }) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.08, duration: 0.5 }}
      className="rounded-2xl overflow-hidden flex items-center gap-4 p-4"
      style={{
        background: "#101015",
        border: "1px solid rgba(168,85,247,0.15)",
      }}
    >
      {/* Image */}
      <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: "#0a050f" }}>
        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-black text-white leading-tight">{p.title}</h3>
        <div className="flex items-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="w-3.5 h-3.5" style={{ color: "#ffd700", fill: "#ffd700" }} />
          ))}
          <span className="text-xs text-white/60 ml-1">4.5</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90 tap-sm"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}
          >
            {p.btn}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          {p.extraSearch && (
            <Search className="w-4 h-4 text-white/40" />
          )}
        </div>
      </div>
    </motion.div>
  );

  if (p.href) {
    return (
      <a href={p.href} target="_blank" rel="noopener noreferrer" className="block hover:scale-[1.02] transition-transform">
        {inner}
      </a>
    );
  }
  return inner;
}

export default function AffiliatePartners() {
  return (
    <div className="mt-6 lg:mt-8">
      <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-5">
        Nos offres chez nos partenaires affiliés
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        {PARTNERS.map((p, i) => (
          <PartnerCard key={p.name} p={p} index={i} />
        ))}
      </div>
    </div>
  );
}