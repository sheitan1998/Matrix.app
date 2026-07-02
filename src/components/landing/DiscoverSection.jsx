import React from "react";
import { motion } from "framer-motion";
import { Users, Star, BarChart3, Calendar } from "lucide-react";

const ITEMS = [
  { icon: Users, title: "Salons personnalisés", desc: "Crée ton espace, invite tes amis, parle en vocal ou texte." },
  { icon: Star, title: "Créateurs mis en avant", desc: "Découvre les talents de la communauté Matrix." },
  { icon: BarChart3, title: "Système de niveaux", desc: "Monte en niveau, débloque des badges et des avantages." },
  { icon: Calendar, title: "Événements & tournois", desc: "Participe à des événements exclusifs et gagne des récompenses." },
];

export default function DiscoverSection() {
  return (
    <div className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
      }}>
      <p className="text-xs font-black tracking-widest text-white/40 mb-4">À DÉCOUVRIR</p>
      <div className="space-y-4">
        {ITEMS.map((item, i) => (
          <motion.div key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}>
              <item.icon className="w-4 h-4" style={{ color: "#a855f7" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{item.title}</p>
              <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}