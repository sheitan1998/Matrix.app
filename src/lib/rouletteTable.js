export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// European single-zero wheel, clockwise pocket order.
export const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

export const isRedNumber = (number) => RED_NUMBERS.includes(number);

export const rouletteColor = (number) =>
  number === 0 ? 'green' : isRedNumber(number) ? 'red' : 'black';

// 12 columns of 3 numbers: top row = multiples of 3 (2:1), bottom row = 3n+1.
export const NUMBER_COLUMNS = Array.from({ length: 12 }, (_, column) => [
  3 + column * 3,
  2 + column * 3,
  1 + column * 3,
]);

export const FORMAT_LOCALES = {
  fr: 'fr-FR', en: 'en-US', es: 'es-ES', de: 'de-DE', it: 'it-IT',
  pt: 'pt-PT', nl: 'nl-NL', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN', ar: 'ar-SA',
};

export function formatCoins(value, language = 'fr') {
  return new Intl.NumberFormat(FORMAT_LOCALES[language] || 'fr-FR').format(Math.round(value || 0));
}

export function cellTone(number) {
  const color = rouletteColor(number);
  if (color === 'red') return { background: 'linear-gradient(160deg, #c53030, #7f1d1d)', borderColor: '#ef4444' };
  if (color === 'black') return { background: 'linear-gradient(160deg, #26262b, #0b0b0e)', borderColor: '#3f3f46' };
  return { background: 'linear-gradient(160deg, #1b8a36, #0d5c23)', borderColor: '#22c55e' };
}