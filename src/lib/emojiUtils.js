// Shared emoji utilities for chat and messaging components

// Expanded emoji list — organized by category for easy browsing
export const EMOJI_LIST = [
  // Faces
  "😀","😂","🥰","😍","😎","🤔","😅","😭","😡","👍","👎","❤️","🔥","✨","🎉","💯",
  "🤝","👋","🙏","💀","🤡","👀","💪","🫶","😴","🥳","😇","🤗","😌","🙃","😏","😑",
  "😬","🙄","😤","😠","🥺","😢","😱","🤯","🤩","🫠","🫡","🫰","🥹","🤣","😎","🥵",
  "🥶","😈","👿","🤠","🥸","🤓","🧐","🤫","🤥","😶‍🌫️","😵","🤒","🤕","🤢","🤮","🤧",
  // Hands
  "👏","🙌","👐","🤲","🤞","✌️","🤟","🤘","👌","🤌","🤏","👈","👉","👆","👇","☝️",
  // Animals
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔",
  "🐧","🦅","🦉","🐺","🐴","🦄","🐝","🦋","🐢","🐙","🦖","🐬","🐳","🐋","🦈","🐊",
  // Food
  "🍎","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆",
  "🥑","🍔","🍟","🍕","🌭","🥪","🌮","🌯","🥗","🍝","🍜","🍣","🍱","🍙","🍚","🍦",
  "🍰","🎂","🍮","🍭","🍫","🍿","🍩","🍪","☕","🍵","🧋","🍺","🍷","🍸","🍹","🍾",
  // Activities
  "⚽","🏀","🏈","⚾","🎾","🏐","🎱","🏓","🏸","🏒","🎯","🎮","🎰","🎲","🧩","🎸",
  "🎹","🥁","🎺","🎻","🎤","🎧","🎨","🎭","🏆","🥇","🥈","🥉","🏅","🎖️","🛹","🎿",
  // Travel
  "🚗","🚕","🚙","🚌","🏎️","🚓","🚑","🚒","🚲","🛵","🏍️","✈️","🚀","🛸","🚁","🚢",
  "⛵","🚤","🏝️","🏖️","🏔️","🌋","🏕️","⛺","🏠","🏡","🏰","🗼","🗽","🎡","🎢","🎠",
  // Objects & Symbols
  "💎","💰","💳","🔔","🎁","🎈","🎀","🪄","🎊","🎉","🏮","📮","📦","🏷️","🔑",
  "🔒","🔓","📖","📚","✏️","📝","💡","🔦","🔋","⌛","⏳","📡","🛰️","🌍","🌎","🌏",
  "⭐","🌟","💫","⚡","🌈","☀️","🌙","☁️","❄️","🔥","💧","🌊","🌱","🌿","🌸","🌹",
];

// Regex to detect if a string is composed entirely of emojis (with optional whitespace)
// Uses Unicode property escapes for Extended_Pictographic
const EMOJI_PATTERN = /\p{Extended_Pictographic}/u;
const NON_EMOJI_PATTERN = /[\p{L}\p{N}\p{P}]/u;

/**
 * Checks if a message is composed ONLY of emojis (no text, numbers, or punctuation)
 * @param {string} text - The message content
 * @returns {boolean} - true if the message is emoji-only
 */
export function isEmojiOnly(text) {
  if (!text || !text.trim()) return false;
  const trimmed = text.trim();
  // If there are letters, numbers, or punctuation, it's not emoji-only
  if (NON_EMOJI_PATTERN.test(trimmed)) return false;
  // Must contain at least one emoji
  return EMOJI_PATTERN.test(trimmed);
}

/**
 * Returns the appropriate CSS class for message text based on emoji-only content
 * @param {string} text - The message content
 * @returns {string} - CSS class for jumbo rendering if emoji-only, empty string otherwise
 */
export function getEmojiTextClass(text) {
  return isEmojiOnly(text) ? "text-4xl leading-none" : "";
}