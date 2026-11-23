// Détection d'intention Matrix AI : demande d'image en langage naturel et liens présents dans un message.
// Module pur, partagé entre le serveur (matrixAi) et l'interface.

export const MAX_URLS_PER_MESSAGE = 3;

const IMAGE_NOUNS =
  'image|images|illustration|illustrations|logo|logos|banni[èe]re|banner|affiche|poster|avatar|wallpaper|fond d.[ée]cran|dessin|picture|photo|portrait|visuel|miniature|thumbnail|ic[ôo]ne|icon|artwork|peinture|painting|croquis|sketch|mascotte|mascot|sticker|meme|m[èe]me|paysage|landscape|photographie|fan ?art|concept ?art|pixel ?art|imagen|im[áa]genes|fotograf[íi]a|ilustraci[óo]n|dibujo|cartel|retrato|paisaje|bild|bilder|foto|zeichnung|hintergrundbild|porträt|immagine|immagini|illustrazione|disegno|ritratto|paesaggio|imagem|imagens|ilustra[çc][ãa]o|desenho|paisagem';

const GENERATION_VERBS =
  'g[ée]n[èe]re|g[ée]n[ée]rer|cr[ée]e|cr[ée]er|dessine|dessiner|fais|faire|fabrique|r[ée]alise|produis|imagine|montre|donne|generate|create|draw|make|design|render|produce|paint|show|peins|illustre|con[çc]ois|invente|propose|genera|generar|crea|crear|dibuja|dibujar|haz|hazme|hacer|dise[ñn]a|mu[ée]strame|erstelle|erstellen|generiere|generieren|mach|mache|zeichne|zeichnen|male|gestalte|creare|disegna|fai|fammi|realizza|mostrami|gera|gerar|cria|criar|desenha|faz|fazer|mostra';

const BLANK_CARD =
  'carte blanche|libre cours|free hand|free rein|surprends[- ]moi|surprise me|carta blanca|sorpr[ée]ndeme|freie hand|[üu]berrasch(?:e)? mich|sorprendimi|surpreende[- ]me';

const QUESTION_START =
  /^(comment|pourquoi|quel(le)?s?|qu'est|c'est quoi|how|why|what|which|where|explique|explain|c[óo]mo|por qu[ée]|wie|warum|perch[ée]|come|porque)(?![\p{L}\p{N}])/iu;

const END = '(?![\\p{L}\\p{N}])';
const NOUN_START = '(?:^|[^\\p{L}\\p{N}])';

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
  const politeLead = '(?:(?:s\'il (?:te|vous) pla[iî]t|stp|please)[ ,]*)?(?:(?:peux|pourrais|pouvez|pourriez)[- ]?(?:tu|vous)|can you|could you|je (?:veux|voudrais|souhaite|aimerais)|j\'aimerais|i (?:want|would like)|i\'d like|puedes|podr[ií]as|kannst du|k[öo]nntest du|puoi|potresti|podes)?';

  // « génère-moi une image de ... », « peux-tu créer un logo ... », « je voudrais une illustration ... »
  const direct = new RegExp(
    `^${politeLead}[ ,]*(?:${GENERATION_VERBS})(?:[- ]?(?:moi|me|nous|mir|mi|ti))?${END}[^.?!]{0,60}?${NOUN_START}(?:${IMAGE_NOUNS})${END}`,
    'iu',
  );
  if (direct.test(head)) return true;

  // « je veux/voudrais une image ... », « un logo pour mon serveur » introduit par un souhait.
  const wish = new RegExp(
    `^(?:je (?:veux|voudrais|souhaite|aimerais)|j'aimerais|i (?:want|would like)|i'd like|il me faut|besoin d|quiero|quisiera|me gustar[ií]a|ich (?:m[öo]chte|will|brauche)|vorrei|voglio|quero|queria)[^.?!]{0,30}?${NOUN_START}(?:${IMAGE_NOUNS})${END}`,
    'iu',
  );
  if (wish.test(head)) return true;

  // Demande commençant par le sujet visuel : « image de ... », « un logo pour mon serveur », « photo : ... ».
  const nounLed = new RegExp(
    `^(?:(?:une?|des|an?|the|un[ao]?|ein[e]?|il|la|el|o)\\s+)?(?:${IMAGE_NOUNS})\\s*(?::|-|–|—|(?:de la|de|du|des|d'|of|for|pour|del|para|von|für|di|per)(?![\\p{L}\\p{N}]|'))\\s*\\S`,
    'iu',
  );
  if (nounLed.test(head) && !t.endsWith('?')) return true;

  // « carte blanche » seul, ou associé à un nom d'image.
  const blank = new RegExp(`^(?:${BLANK_CARD})[ .!]*$`, 'iu');
  if (blank.test(t)) return true;
  if (new RegExp(`${NOUN_START}(?:${BLANK_CARD})${END}`, 'iu').test(head)
    && new RegExp(`${NOUN_START}(?:${IMAGE_NOUNS})${END}`, 'iu').test(head)) {
    return true;
  }

  // « dessine-moi un dragon » : verbe de dessin sans nom explicite.
  return /^(?:dessine|draw|illustre|peins|paint|dibuja|zeichne|disegna|desenha)(?:[- ]moi)?(?![\p{L}\p{N}])\s+\S/iu.test(head);
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
