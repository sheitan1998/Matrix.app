import React, { useEffect, useRef } from "react";

/**
 * Menu contextuel flottant pour les éléments de la timeline.
 * items: [{ label, icon, onClick, danger, disabled }]
 */
export default function TimelineContextMenu({ x, y, title, items, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const close = () => onClose();
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
      window.removeEventListener("resize", close);
    };
  }, [onClose]);

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 8;
    const maxY = window.innerHeight - rect.height - 8;
    el.style.left = `${Math.max(8, Math.min(x, maxX))}px`;
    el.style.top = `${Math.max(8, Math.min(y, maxY))}px`;
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed z-[80] w-48 rounded-xl overflow-hidden py-1 shadow-2xl"
      style={{ left: x, top: y, background: "#1a1a1e", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {title && (
        <p className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/35 truncate">{title}</p>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            type="button"
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return;
              item.onClick?.();
              onClose();
            }}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold transition disabled:opacity-30 ${
              item.danger ? "text-red-400 hover:bg-red-500/10" : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}