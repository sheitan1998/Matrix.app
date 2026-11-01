import React from "react";
import { motion } from "framer-motion";
import { Crown, Users, Sparkles, Heart, Gift } from "lucide-react";
import ProjectSupportBlock from "@/components/progression/ProjectSupportBlock";

const FOOTER_POINTS = [
  { icon: Users, text: "Rejoins une communauté active" },
  { icon: Sparkles, text: "Découvre de nouveaux contenus" },
  { icon: Heart, text: "Partage ta passion" },
  { icon: Gift, text: "Profite d'avantages exclusifs" },
];

export default function LandingFooter() {
  return (
    <div id="landing-footer" className="mt-8 lg:mt-10">
      {/* Main horizontal container */}
      <div
        className="rounded-3xl p-6 lg:p-8"
        style={{
          background: "linear-gradient(135deg, rgba(15,10,25,0.8) 0%, rgba(20,12,35,0.6) 100%)",
          border: "1px solid rgba(168,85,247,0.2)",
          boxShadow: "0 0 40px rgba(168,85,247,0.08)",
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-6 lg:gap-8 items-center">
          {/* Top 3 Donors (left) — embedded in ProjectSupportBlock */}
          <div>
            <ProjectSupportBlock />
          </div>

          {/* Support module (center) */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl lg:text-2xl font-black text-white mb-2">
                Soutenir la communauté, c'est faire vivre MATRIX !
              </h3>
              <p className="text-sm text-white/50 mb-4 max-w-md">
                Ton soutien nous permet de maintenir les serveurs, développer de nouvelles fonctionnalités
                et offrir une expérience unique à toute la communauté.
              </p>
              <a
                href="#landing-footer"
                onClick={(e) => {
                  e.preventDefault();
                  const btn = document.querySelector("#landing-footer button");
                  if (btn) btn.click();
                }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-black text-white transition hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #6200ea 0%, #aa00ff 100%)",
                  boxShadow: "0 0 30px rgba(138,43,226,0.5), 0 0 15px rgba(170,0,255,0.3)",
                }}
              >
                <Heart className="w-5 h-5" fill="white" />
                Soutenir
              </a>
            </motion.div>
          </div>

          {/* Crown M badge (right) */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative w-28 h-28 lg:w-32 lg:h-32 flex items-center justify-center"
            >
              {/* Orbital ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: "2px solid rgba(168,85,247,0.3)",
                  boxShadow: "0 0 30px rgba(168,85,247,0.3), inset 0 0 20px rgba(168,85,247,0.1)",
                  animation: "spin 8s linear infinite",
                }}
              />
              <div
                className="absolute inset-2 rounded-full"
                style={{
                  border: "1px solid rgba(255,0,255,0.2)",
                  animation: "spin 12s linear infinite reverse",
                }}
              />
              {/* M badge */}
              <div
                className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle, rgba(74,20,140,0.6) 0%, rgba(156,39,176,0.3) 100%)",
                  border: "2px solid rgba(168,85,247,0.5)",
                  boxShadow: "0 0 25px rgba(168,85,247,0.4)",
                }}
              >
                <span className="text-4xl lg:text-5xl font-black text-white" style={{ textShadow: "0 0 15px rgba(168,85,247,0.8)" }}>
                  M
                </span>
                <Crown
                  className="absolute -top-3 w-6 h-6"
                  style={{ color: "#ffd700", filter: "drop-shadow(0 0 8px rgba(255,215,0,0.6))" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom footer line */}
      <div className="mt-4 lg:mt-6">
        <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8 mb-4">
          {FOOTER_POINTS.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
              className="flex items-center gap-2"
            >
              <point.icon className="w-4 h-4" style={{ color: "#a855f7" }} />
              <span className="text-xs lg:text-sm text-foreground/60 font-medium">{point.text}</span>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-lg lg:text-xl text-foreground/80" style={{ fontFamily: "cursive, 'Brush Script MT', sans-serif" }}>
            Ensemble, on est plus forts !
          </p>
        </div>
      </div>
    </div>
  );
}