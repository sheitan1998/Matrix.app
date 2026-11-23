// Détection d'intention Matrix AI côté interface (demande d'image en langage naturel).

export const MAX_URLS_PER_MESSAGE = 3;

const IMAGE_NOUNS =
  'image|images|illustration|illustrations|logo|logos|banni[èe]re|banner|affiche|poster|avatar|wallpaper|fond d.[ée]cran|dessin|picture|photo|portrait|visuel|miniature|thumbnail|ic[ôo]ne|icon|artwork|peinture|painting|croquis|sketch|mascotte|mascot|sticker|meme|m[èe]me|paysage|landscape';

const GENERATION_VERBS =
  'g[ée]n[èe]re|g[ée]n[ée]rer|cr[ée]e|cr[ée]er|dessine|dessiner|fais|faire|fabrique|r[ée]alise|produis|imagine|montre|donne|generate|create|draw|make|design|render|produce|paint|show';

const QUESTION_START = /^(comment|pourquoi|quel(le)?s?|qu'est|c'est quoi|how|why|what|which|where|explique|explain)\b/i;

export function normalizeText(text) {
  return String(text || '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isImageRequest(text) {
  const t = normalizeText(text);
  if (!t) return false;
  if (/^\/(image|imagine|img)\b/i.test(t)) return true;
  if (QUESTION_START.test(t)) return false;

  const head = t.slice(0, 120);
  const politeLead = "(?:(?:s'il (?:te|vous) pla[iî]t|stp|please)[ ,]*)?(?:(?:peux|pourrais|pouvez|pourriez)[- ]?(?:tu|vous)|can you|could you|je (?:veux|voudrais|souhaite|aimerais)|j'aimerais|i (?:want|would like)|i'd like)?";

  const direct = new RegExp(
    `^${politeLead}[ ,]*(?:${GENERATION_VERBS})(?:[- ]?(?:moi|me|nous))?\\b[^.?!]{0,50}?\\b(?:${IMAGE_NOUNS})\\b`,
    'i',
  );
  if (direct.test(head)) return true;

  const wish = new RegExp(
    `^(?:je (?:veux|voudrais|souhaite|aimerais)|j'aimerais|i (?:want|would like)|i'd like|il me faut|besoin d)[^.?!]{0,30}?\\b(?:${IMAGE_NOUNS})\\b`,
    'i',
  );
  if (wish.test(head)) return true;

  return /^(?:dessine|draw|illustre|peins|paint)(?:[- ]moi)?\b\s+\S/i.test(head);
}

export function stripImageCommand(text) {
  return String(text || '').replace(/^\/(image|imagine|img)\b\s*/i, '').trim();
}