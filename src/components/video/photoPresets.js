export const PHOTO_PRESETS = [
  { key: "original", label: "Original", adj: {} },
  { key: "vivid", label: "Éclatant", adj: { saturation: 145, contrast: 112, brightness: 104 } },
  { key: "noir", label: "Noir & Blanc", adj: { grayscale: 100, contrast: 115 } },
  { key: "sepia", label: "Sépia", adj: { sepia: 75, brightness: 104 } },
  { key: "cold", label: "Froid", adj: { hue: 200, saturation: 115, brightness: 102 } },
  { key: "warm", label: "Chaud", adj: { hue: 340, saturation: 118, brightness: 105 } },
  { key: "vintage", label: "Vintage", adj: { sepia: 35, contrast: 92, saturation: 85, brightness: 106 } },
  { key: "punch", label: "Contraste", adj: { contrast: 145, brightness: 96 } },
];

export const PHOTO_ASPECTS = [
  { value: "original", label: "Libre", ratio: null },
  { value: "1:1", label: "1:1", ratio: 1 },
  { value: "4:5", label: "4:5", ratio: 4 / 5 },
  { value: "16:9", label: "16:9", ratio: 16 / 9 },
  { value: "9:16", label: "9:16", ratio: 9 / 16 },
];

export const DEFAULT_ADJUSTMENTS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hue: 0,
};

export function cssFilter(adj) {
  return `brightness(${adj.brightness}%) contrast(${adj.contrast}%) saturate(${adj.saturation}%) blur(${adj.blur}px) grayscale(${adj.grayscale}%) sepia(${adj.sepia}%) hue-rotate(${adj.hue}deg)`;
}