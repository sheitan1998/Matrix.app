// Accès aux API MediaWiki ouvertes (wiki.gg / Fandom / wikis officiels) : aucune clé, aucun token.
// Les visuels proviennent des vignettes officielles des wikis.

const UA = "MatrixHub/1.0 (+https://matrix-hub.app)";
const TIMEOUT = 12000;

export type WikiPage = {
  pageid?: number;
  title: string;
  extract?: string;
  image?: string | null;
  url?: string | null;
};

export async function jget(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json", ...headers },
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Nettoie le wikitexte résiduel, les balises techniques et les modèles de jeu.
export function cleanWiki(input: unknown, max = 600): string {
  let s = String(input ?? "");
  s = s.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, " ");
  s = s.replace(/<[^>]*>/g, " ");
  for (let i = 0; i < 3; i += 1) s = s.replace(/\{\{[^{}]*\}\}/g, " ");
  s = s.replace(/\{\|[\s\S]*?\|\}/g, " ");
  s = s.replace(/\{Tunable[^}]*\}/gi, " ");
  s = s.replace(/\{Keyword[^}]*\}/gi, " ");
  s = s.replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, "$2");
  s = s.replace(/\[\[([^\]]*)\]\]/g, "$1");
  s = s.replace(/\[https?:\/\/\S+\s+([^\]]*)\]/g, "$1");
  s = s.replace(/'{2,}/g, "");
  s = s.replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max).trim()}…` : s;
}

function imageOf(host: string, page: any): string | null {
  if (page?.thumbnail?.source) return String(page.thumbnail.source);
  if (page?.pageimage) {
    return `https://${host}/wiki/Special:FilePath/${encodeURIComponent(String(page.pageimage))}`;
  }
  return null;
}

export async function wikiQuery(host: string, generator: Record<string, string>, limit = 24): Promise<WikiPage[]> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    origin: "*",
    redirects: "1",
    prop: "pageimages|extracts|info",
    inprop: "url",
    exintro: "1",
    explaintext: "1",
    exlimit: "max",
    piprop: "thumbnail|name",
    pithumbsize: "520",
    ...generator,
    ...(generator.generator === "categorymembers" ? { gcmlimit: String(limit) } : { gsrlimit: String(limit) }),
  });

  const data = await jget(`https://${host}/api.php?${params.toString()}`);
  const raw = data?.query?.pages;
  const pages: any[] = Array.isArray(raw) ? raw : raw ? Object.values(raw) : [];

  return pages
    .map((p) => ({
      pageid: p?.pageid,
      title: cleanWiki(p?.title, 120),
      extract: cleanWiki(p?.extract, 900),
      image: imageOf(host, p),
      url: p?.fullurl || null,
    }))
    .filter((p) => p.title && !p.title.startsWith("Category:") && !p.title.startsWith("File:"))
    .sort((a, b) => Number(!!b.image) - Number(!!a.image));
}

export function wikiPageUrl(host: string, title: string) {
  return `https://${host}/wiki/${encodeURIComponent(String(title).replace(/ /g, "_"))}`;
}