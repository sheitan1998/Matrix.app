import React from "react";
import { motion } from "framer-motion";
import { Bell, Mail, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ICONS = [
  { icon: Mail, path: "/nexus", label: "Messages", color: "#a855f7" },
  { icon: Bell, path: "/notifications", label: "Notifications", color: "#ff00ff" },
  { icon: Settings, path: "/mon-profil", label: "Paramètres", color: "#8a2be2" },
];

export default function TopRightIcons() {
  const nav = useNavigate();
  return (
    <div className="flex items-center gap-2 shrink-0">
      {ICONS.map((item, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
          onClick={() => nav(item.path)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all tap-sm hover:scale-110"
          style={{
            border: `1.5px solid ${item.color}40`,
            background: `${item.color}0a`,
          }}
          title={item.label}
        >
          <item.icon className="w-4 h-4" style={{ color: item.color }} />
        </motion.button>
      ))}
    </div>
  );
}