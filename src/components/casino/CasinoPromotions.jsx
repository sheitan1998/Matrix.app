import React from "react";
import { motion } from "framer-motion";
import { PROMOTIONS } from "./casinoData";

export default function CasinoPromotions() {
  return (
    <section>
      <h3 className="text-lg font-black text-white mb-4">Promotions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PROMOTIONS.map((promo, i) => (
          <motion.div key={promo.title}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-4 transition group cursor-pointer"
            style={{ background: "rgba(12,12,16,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${promo.color}30`; e.currentTarget.style.boxShadow = `0 0 20px ${promo.color}10`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}>

            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{promo.icon}</span>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: `${promo.color}15`, color: promo.color }}>{promo.badge}</span>
            </div>
            <p className="text-sm font-bold text-white mb-1">{promo.title}</p>
            <p className="text-[11px] text-white/40 leading-relaxed">{promo.desc}</p>
            <button className="mt-3 w-full h-8 rounded-lg text-xs font-bold transition"
              style={{ background: `${promo.color}10`, color: promo.color, border: `1px solid ${promo.color}20` }}>
              Réclamer
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}