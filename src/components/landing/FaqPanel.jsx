import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "C'est quoi Matrix ?",
    a: "Matrix est une plateforme tout-en-un conçue pour se divertir, discuter, accéder à des outils pratiques et explorer différents univers communautaires.",
  },
  {
    q: "Comment fonctionnent les mises à jour ?",
    a: "Les mises à jour de l'application (disponible sur Windows, Mac et Linux) se font de manière entièrement automatique en arrière-plan pour que tu aies toujours la dernière version sans effort.",
  },
  {
    q: "Comment personnaliser mon profil ?",
    a: "Tu peux modifier ton avatar, tes informations et accéder à des cosmétiques exclusifs directement via la section Boutique Matrix de l'application.",
  },
  {
    q: "Où puis-je retrouver la communauté ?",
    a: "Tu as deux espaces pour cela : le serveur Nexus intégré directement au sein de l'application, et le serveur Discord officiel de Matrix pour suivre toutes les actualités et échanger en dehors.",
  },
  {
    q: "Comment contacter le support ou signaler un bug ?",
    a: "Tu peux te rendre directement dans ta page de profil au sein de l'application pour accéder à l'outil de contact du support et signaler un bug ou poser une question.",
  },
];

function AccordionItem({ item, isOpen, onToggle, index }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${isOpen ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition"
        style={{ background: isOpen ? "rgba(168,85,247,0.06)" : "transparent" }}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
            style={{
              background: "rgba(168,85,247,0.15)",
              color: "#c4b5fd",
            }}
          >
            {index + 1}
          </span>
          <span className="text-sm font-bold text-white">{item.q}</span>
        </span>
        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform duration-300"
          style={{
            color: "#a855f7",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 pl-[3.25rem] text-xs leading-relaxed text-white/60">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPanel({ open, onClose }) {
  const [openIndex, setOpenIndex] = useState(0);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[91] flex flex-col"
            style={{
              background: "#0a050f",
              borderLeft: "1px solid rgba(168,85,247,0.2)",
              boxShadow: "-10px 0 40px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{
                background: "rgba(15,10,25,0.8)",
                borderBottom: "1px solid rgba(168,85,247,0.15)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "rgba(168,85,247,0.15)",
                  }}
                >
                  <HelpCircle className="w-4 h-4" style={{ color: "#a855f7" }} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">FAQ</h3>
                  <p className="text-[10px] text-white/40">
                    Questions fréquentes
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition tap-sm"
                style={{ color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* FAQ items */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-2.5">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem
                  key={i}
                  index={i}
                  item={item}
                  isOpen={openIndex === i}
                  onToggle={() =>
                    setOpenIndex(openIndex === i ? -1 : i)
                  }
                />
              ))}
            </div>

            {/* Footer */}
            <div
              className="px-5 py-3 shrink-0"
              style={{
                background: "rgba(15,10,25,0.6)",
                borderTop: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <p className="text-[10px] text-white/30 text-center">
                © 2026 MATRIX — Besoin d'aide supplémentaire ? Contacte le
                support depuis ton profil.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}