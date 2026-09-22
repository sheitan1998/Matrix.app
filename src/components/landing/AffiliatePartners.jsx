import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight, Search } from "lucide-react";
import { normalizeAppAssetUrl, normalizeExternalUrl } from "@/lib/urlUtils";

const PARTNERS = [
{
  name: "Amazon",
  title: "Nos offres chez Amazon",
  btn: "Voir sur Amazon",
  href: "https://amzn.to/3SslkT2",
  image: "/media/tuto-gaming/3ea092b99_Gemini_Generated_Image_dwz0m2dwz0m2dwz0.png"
},
{
  name: "Instant Gaming",
  title: "Nos offres chez Instant Gaming",
  btn: "Découvrir Instant Gaming",
  href: "https://www.instant-gaming.com/?igr=gamer-45b9bd",
  image: "/media/tuto-gaming/cf05661b3_Gemini_Generated_Image_38wgo938wgo938wg.png"
},
{
  name: "Intersport",
  title: "Nos offres chez Intersport",
  btn: "Acheter Intersport",
  href: "https://www.intersport.fr/",
  image: "/media/tuto-gaming/9ff3a90f6_Gemini_Generated_Image_axli8xaxli8xaxli.png"
},
{
  name: "LDLC",
  title: "Nos offres chez LDLC",
  btn: "Explorer LDLC",
  href: "https://www.ldlc.com/",
  image: "/media/tuto-gaming/38538f9f2_Gemini_Generated_Image_luwqztluwqztluwq.png",
  extraSearch: true
}];


function PartnerCard({ p, index }) {
  const href = normalizeExternalUrl(p.href);
  const imageUrl = normalizeAppAssetUrl(p.image);
  const inner =
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 + index * 0.08, duration: 0.5 }}
    className="rounded-2xl overflow-hidden flex items-center gap-4 pt-4 pr-4 pb-4 pl-4"
    style={{
      background: "#101015",
      border: "1px solid rgba(168,85,247,0.15)"
    }}>
    
      {/* Image */}
      <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: "#0a050f" }}>
        <img src={imageUrl || p.image} alt={p.name} className="w-full h-full object-cover" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-black text-white leading-tight">{p.title}</h3>
        <div className="flex items-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((s) =>
        <Star key={s} className="w-3.5 h-3.5" style={{ color: "#ffd700", fill: "#ffd700" }} />
        )}
          <span className="text-xs text-white/60 ml-1">4.5</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", opacity: href ? 1 : 0.6 }}>
            {p.btn}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
          {p.extraSearch &&
        <Search className="w-4 h-4 text-white/40" />
        }
        </div>
      </div>
    </motion.div>;


  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          // Synchronous Tauri detection — must call preventDefault before any await
          const tauriInternals = typeof window !== "undefined" && (window.__TAURI_INTERNALS__ || window.__TAURI__?.core);
          if (tauriInternals && typeof tauriInternals.invoke === "function") {
            e.preventDefault();
            tauriInternals.invoke("plugin:opener|open_url", { url: href })
              .catch(() => window.open(href, "_blank", "noopener,noreferrer"));
          }
          // On web (no Tauri runtime), let the default <a> behavior handle it
        }}
        className="block hover:scale-[1.02] transition-transform"
      >
        {inner}
      </a>);
  }
  return inner;
}

export default function AffiliatePartners() {
  return (
    <div className="mt-6 lg:mt-8">
      <h2 className="text-2xl md:text-3xl font-black text-white text-center">
        Nos offres chez nos partenaires affiliés
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        {PARTNERS.map((p, i) =>
        <PartnerCard key={p.name} p={p} index={i} />
        )}
      </div>
    </div>);

}