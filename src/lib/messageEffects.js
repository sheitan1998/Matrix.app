// Visual effects applied to server messages (Boost Level 2+). Classes live in index.css.
export const MESSAGE_EFFECTS = [
  { key: "glow", label: "Néon", icon: "💡", className: "msg-fx-glow" },
  { key: "rainbow", label: "Arc-en-ciel", icon: "🌈", className: "msg-fx-rainbow" },
  { key: "fire", label: "Feu", icon: "🔥", className: "msg-fx-fire" },
  { key: "sparkle", label: "Étincelles", icon: "✨", className: "msg-fx-sparkle" },
  { key: "pulse", label: "Pulsation", icon: "💓", className: "msg-fx-pulse" },
  { key: "shake", label: "Secousse", icon: "📳", className: "msg-fx-shake" },
];

export function getEffectClass(key) {
  return MESSAGE_EFFECTS.find((e) => e.key === key)?.className || "";
}