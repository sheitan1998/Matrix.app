import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { FARMING_SIM_CATEGORIES } from "@/components/tuto-gaming/farmingSimData";
import { normalizeAppAssetUrl } from "@/lib/urlUtils";

export default function WikiItemModal({ item, onClose }) {
  if (!item) return null;

  const parentCategory = FARMING_SIM_CATEGORIES.find((c) => c.id === item.category);
  const subCategory = parentCategory?.cards.find((c) => c.id === item.sub_category);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10"
        style={{ background: "#1a1a1a" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-white/10" style={{ background: "rgba(26,26,26,0.95)", backdropFilter: "blur(12px)" }}>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: "#7DA627" }}>
              {parentCategory?.title || "Catégorie"} {subCategory ? `— ${subCategory.title}` : ""}
            </span>
            <h2 className="text-base font-black text-white uppercase tracking-tight">
              {item.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Spec sheet image */}
        {item.spec_sheet_url && (
          <div className="p-4">
            <img
              src={normalizeAppAssetUrl(item.spec_sheet_url)}
              alt={item.title}
              className="w-full h-auto rounded-lg object-contain"
              style={{ background: "#262626" }}
            />
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div className="px-5 pb-5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
              Notes / Conseils
            </span>
            <p className="text-sm text-white/70 whitespace-pre-wrap">{item.notes}</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}