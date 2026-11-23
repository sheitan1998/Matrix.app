// Détection d'intention Matrix AI : demande d'image en langage naturel et liens présents dans un message.
// Module pur, partagé entre le serveur (matrixAi) et l'interface.

export const MAX_URLS_PER_MESSAGE = 3;

const IMAGE_NOUNS =
  'image|images|illustration|illustrations|logo|logos|banni[èe]re|banner|affiche|poster|avatar|wallpaper|fond d.[ée]cran|dessin|picture|photo|portrait|visuel|miniature|thumbnail|ic[ôo]ne|icon|artwork|peinture|painting|croquis|sketch|mascotte|mascot|sticker|meme|m[èe]me|paysage|landscape';

const GENERATION_VERBS =
  'g[ée]n[èe]re|g[ée]n[ée]rer|cr[ée]e|cr[ée]er|dessine|dessiner|fais|faire|fabrique|r[ée]alise|produis|imagine|montre|donne|generate|create|draw|make|design|render|produce|paint|show';

const QUESTION_START = /^(comment|pourquoi|quel(le)?s?|qu'est|c'est quoi|how|why|what|which|where|explique|explain)\b/i;

export function normalizeText(text: unknown): string {
  return String(text || '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isImageRequest(text: unknown): boolean {
  const t = normalizeText(text);
  if (!t) return false;
  if (/^\/(image|imagine|img)\b/i.test(t)) return true;
  if (QUESTION_START.test(t)) return false;

  const head = t.slice(0, 120);
  const politeLead = '(?:(?:s\'il (?:te|vous) pla[iî]t|stp|please)[ ,]*)?(?:(?:peux|pourrais|pouvez|pourriez)[- ]?(?:tu|vous)|can you|could you|je (?:veux|voudrais|souhaite|aimerais)|j\'aimerais|i (?:want|would like)|i\'d like)?';

  // « génère-moi une image de ... », « peux-tu créer un logo ... », « je voudrais une illustration ... »
  const direct = new RegExp(
    `^${politeLead}[ ,]*(?:${GENERATION_VERBS})(?:[- ]?(?:moi|me|nous))?\\b[^.?!]{0,50}?\\b(?:${IMAGE_NOUNS})\\b`,
    'i',
  );
  if (direct.test(head)) return true;

  // « je veux/voudrais une image ... », « un logo pour mon serveur » introduit par un souhait.
  const wish = new RegExp(
    `^(?:je (?:veux|voudrais|souhaite|aimerais)|j'aimerais|i (?:want|would like)|i'd like|il me faut|besoin d)[^.?!]{0,30}?\\b(?:${IMAGE_NOUNS})\\b`,
    'i',
  );
  if (wish.test(head)) return true;

  // « dessine-moi un dragon » : verbe de dessin sans nom explicite.
  return /^(?:dessine|draw|illustre|peins|paint)(?:[- ]moi)?\b\s+\S/i.test(head);
}

export function stripImageCommand(text: unknown): string {
  return String(text || '').replace(/^\/(image|imagine|img)\b\s*/i, '').trim();
}

const URL_PATTERN = /\bhttps?:\/\/[^\s<>"'`)\]}]+/gi;

export function extractUrls(text: unknown, max = MAX_URLS_PER_MESSAGE): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const match of String(text || '').matchAll(URL_PATTERN)) {
    const candidate = match[0].replace(/[.,;:!?]+$/, '');
    try {
      const parsed = new URL(candidate);
      parsed.hash = '';
      const normalized = parsed.toString();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        urls.push(normalized);
      }
    } catch {
      // URL invalide : ignorée.
    }
    if (urls.length >= max) break;
  }
  return urls;
}
