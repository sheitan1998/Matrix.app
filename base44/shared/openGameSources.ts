// Sources 100 % ouvertes, aucune clé API, aucun secret.
// 6 onglets stricts : boutique, rotations, quêtes, passe, personnages/skins, succès.
// Le contenu vient des API publiques de jeux et des wikis officiels ouverts (MediaWiki).

import { cleanWiki, jget, wikiPageUrl, wikiQuery, type WikiPage } from "./openGameWiki.ts";

export type TabKey = "shop" | "rotations" | "quests" | "battlepass" | "characters" | "achievements";

export type OpenGameItem = {
  id: string;
  name: string;
  image: string | null;
  tag: string;
  desc: string;
  subtitle?: string | null;
  rarity?: string | null;
  price?: string | null;
  stats?: { label: string; value: string }[];
  url?: string | null;
};

type Tab = { items: OpenGameItem[]; note?: string | null };

type TabCfg = { categories?: string[]; query?: string; tag: string };
type GameCfg = { hosts: string[]; tabs: Record<TabKey, TabCfg> };

const TAB_KEYS: TabKey[] = ["shop", "rotations", "quests", "battlepass", "characters", "achievements"];
const LIMIT = 24;

function toItem(page: WikiPage, tag: string, host: string): OpenGameItem {
  const desc = page.extract || "";
  return {
    id: String(page.pageid ?? page.title),
    name: page.title,
    image: page.image || null,
    tag,
    desc,
    subtitle: null,
    rarity: null,
    price: null,
    url: page.url || wikiPageUrl(host, page.title),
  };
}

async function collect(host: string, cfg: TabCfg): Promise<WikiPage[]> {
  const found = new Map<string, WikiPage>();
  const add = (pages: WikiPage[]) =>
    pages.forEach((p) => {
      if (p?.title && !found.has(p.title)) found.set(p.title, p);
    });

  if (cfg.categories?.length) {
    const lists = await Promise.all(
      cfg.categories.map((c) =>
        wikiQuery(host, {
          generator: "categorymembers",
          gcmtitle: `Category:${c}`,
          gcmnamespace: "0",
        }, LIMIT).catch(() => [])
      )
    );
    lists.forEach(add);
  }

  const withImages = () => [...found.values()].filter((p) => p.image).length;
  if ((found.size < 6 || withImages() < 8) && cfg.query) {
    const pages = await wikiQuery(host, {
      generator: "search",
      gsrsearch: cfg.query,
      gsrnamespace: "0",
    }, LIMIT).catch(() => []);
    add(pages);
  }

  return [...found.values()]
    .sort((a, b) => Number(!!b.image) - Number(!!a.image))
    .slice(0, LIMIT);
}

async function wikiTab(cfg: TabCfg, hosts: string[], label: string): Promise<Tab> {
  let best: { host: string; pages: WikiPage[]; images: number } | null = null;

  for (const host of hosts) {
    const pages = await collect(host, cfg);
    const images = pages.filter((p) => p.image).length;
    if (!best || images > best.images) best = { host, pages, images };
    // On garde l'hôte qui fournit réellement des visuels officiels.
    if (images >= 3 && pages.length >= 3) break;
  }

  if (!best?.pages.length) {
    return { items: [], note: `${label} — source ouverte momentanément indisponible.` };
  }

  return {
    items: best.pages.map((p) => toItem(p, cfg.tag, best!.host)),
    note: `${label} — données et visuels du wiki officiel public (${best.host}), sans clé API.`,
  };
}

const GAMES: Record<string, GameCfg> = {
  warframe: {
    hosts: ["warframe.fandom.com", "wiki.warframe.com"],
    tabs: {
      shop: { query: "Market", tag: "Boutique" },
      rotations: { query: "Void Fissure", tag: "Rotation" },
      quests: { categories: ["Quests"], query: "Quest", tag: "Quête" },
      battlepass: { query: "Nightwave", tag: "Ondes Nocturnes" },
      characters: { categories: ["Warframes"], query: "Warframe", tag: "Warframe" },
      achievements: { categories: ["Achievements"], query: "Achievement", tag: "Succès" },
    },
  },
  osrs: {
    hosts: ["oldschool.runescape.wiki"],
    tabs: {
      shop: { query: "Grand Exchange", tag: "Grand Exchange" },
      rotations: { categories: ["Minigames"], query: "Minigame", tag: "Rotation" },
      quests: { categories: ["Quests"], query: "Quest", tag: "Quête" },
      battlepass: { query: "Leagues", tag: "Ligue saisonnière" },
      characters: { categories: ["Bosses"], query: "Boss", tag: "Boss" },
      achievements: { categories: ["Combat Achievements", "Combat_Achievements"], query: "Combat Achievement", tag: "Haut fait" },
    },
  },
  "guild-wars-2": {
    // Le wiki officiel refuse les appels serveur (403 WAF) : on s'appuie sur le miroir Fandom
    // ici, et le navigateur complète avec l'API officielle GW2.
    hosts: ["guildwars2.fandom.com"],
    tabs: {
      shop: { query: "Black Lion", tag: "Boutique" },
      rotations: { query: "World boss", tag: "Événement" },
      quests: { query: "Story", tag: "Histoire" },
      battlepass: { query: "Living World", tag: "Saison" },
      characters: { query: "Profession", tag: "Profession" },
      achievements: { query: "Achievement", tag: "Succès" },
    },
  },
  "dota-2": {
    hosts: ["dota2.fandom.com"],
    tabs: {
      shop: { query: "Cosmetic item", tag: "Cosmétique" },
      rotations: { query: "Ranked season", tag: "Saison" },
      quests: { query: "Quest", tag: "Quête" },
      battlepass: { query: "Battle Pass", tag: "Passe de combat" },
      characters: { categories: ["Heroes"], query: "Hero", tag: "Héros" },
      achievements: { categories: ["Achievements"], query: "Achievement", tag: "Succès" },
    },
  },
  "overwatch-2": {
    hosts: ["overwatch.fandom.com", "overwatch.wiki.gg"],
    tabs: {
      shop: { categories: ["Skins"], query: "Skin", tag: "Cosmétique" },
      rotations: { categories: ["Maps"], query: "Map", tag: "Carte" },
      quests: { query: "Challenge", tag: "Défi" },
      battlepass: { query: "Battle Pass", tag: "Passe de combat" },
      characters: { categories: ["Heroes"], query: "Hero", tag: "Héros" },
      achievements: { categories: ["Achievements"], query: "Achievement", tag: "Succès" },
    },
  },
  "helldivers-2": {
    hosts: ["helldivers.wiki.gg", "helldivers.fandom.com"],
    tabs: {
      shop: { query: "Superstore", tag: "Superstore" },
      rotations: { query: "Major Order", tag: "Ordre majeur" },
      quests: { query: "Mission", tag: "Mission" },
      battlepass: { query: "Warbond", tag: "Warbond" },
      characters: { categories: ["Stratagems"], query: "Stratagem", tag: "Stratagème" },
      achievements: { categories: ["Achievements"], query: "Achievement", tag: "Succès" },
    },
  },
  "dead-by-daylight": {
    hosts: ["deadbydaylight.wiki.gg", "deadbydaylight.fandom.com"],
    tabs: {
      shop: { categories: ["Outfits", "Cosmetics"], query: "Outfit", tag: "Cosmétique" },
      rotations: { query: "Shrine of Secrets", tag: "Sanctuaire" },
      quests: { categories: ["Tomes"], query: "Tome", tag: "Tome" },
      battlepass: { query: "Rift", tag: "Ondes Nocturnes" },
      characters: { categories: ["Survivors", "Killers"], query: "Survivor", tag: "Personnage" },
      achievements: { categories: ["Achievements"], query: "Achievement", tag: "Succès" },
    },
  },
  palworld: {
    hosts: ["palworld.wiki.gg", "palworld.fandom.com"],
    tabs: {
      shop: { categories: ["Items"], query: "Item", tag: "Objet" },
      rotations: { query: "Raid Boss", tag: "Raid" },
      quests: { query: "Quest", tag: "Quête" },
      battlepass: { query: "Sakurajima", tag: "Mise à jour" },
      characters: { categories: ["Pals"], query: "Pal", tag: "Pal" },
      achievements: { categories: ["Achievements"], query: "Achievement", tag: "Succès" },
    },
  },
  "sea-of-thieves": {
    hosts: ["seaofthieves.wiki.gg", "seaofthieves.fandom.com"],
    tabs: {
      shop: { categories: ["Cosmetics"], query: "Cosmetic", tag: "Cosmétique" },
      rotations: { query: "World Event", tag: "Événement" },
      quests: { categories: ["Tall Tales"], query: "Tall Tale", tag: "Conte" },
      battlepass: { query: "Season", tag: "Saison" },
      characters: { categories: ["Outfits"], query: "Outfit", tag: "Tenue" },
      achievements: { categories: ["Commendations"], query: "Commendation", tag: "Haut fait" },
    },
  },
  "apex-legends": {
    hosts: ["apexlegends.wiki.gg", "apexlegends.fandom.com"],
    tabs: {
      shop: { categories: ["Cosmetics"], query: "Skin", tag: "Cosmétique" },
      rotations: { categories: ["Maps"], query: "Map", tag: "Carte" },
      quests: { query: "Quest", tag: "Quête" },
      battlepass: { query: "Battle Pass", tag: "Passe de combat" },
      characters: { categories: ["Legends"], query: "Legend", tag: "Légende" },
      achievements: { categories: ["Achievements"], query: "Achievement", tag: "Succès" },
    },
  },
};

const TAB_LABELS: Record<TabKey, string> = {
  shop: "Boutique",
  rotations: "Rotations & événements",
  quests: "Quêtes & missions",
  battlepass: "Passe de combat",
  characters: "Personnages & skins",
  achievements: "Succès",
};

// --- Boutique Old School RuneScape : prix réels du Grand Exchange (API officielle ouverte) ---
async function osrsShop(): Promise<Tab | null> {
  try {
    const [mapping, latest] = await Promise.all([
      jget("https://prices.runescape.wiki/api/v1/osrs/mapping"),
      jget("https://prices.runescape.wiki/api/v1/osrs/latest"),
    ]);
    const prices = latest?.data || {};
    const items: OpenGameItem[] = (Array.isArray(mapping) ? mapping : [])
      .filter((m: any) => m?.name && m?.id && prices[String(m.id)]?.high)
      .map((m: any) => {
        const p = prices[String(m.id)];
        return {
          id: String(m.id),
          name: m.name,
          image: `https://oldschool.runescape.wiki/w/Special:FilePath/${encodeURIComponent(String(m.name).replace(/ /g, "_"))}.png`,
          tag: "Grand Exchange",
          price: `${Number(p.high).toLocaleString("fr-FR")} gp`,
          subtitle: `Achat ${Number(p.high).toLocaleString("fr-FR")} · vente ${Number(p.low || p.high).toLocaleString("fr-FR")} gp`,
          desc: cleanWiki(m.examine, 320) || "Objet échangeable au Grand Exchange.",
          stats: [
            { label: "Limite d'achat", value: String(m.limit ?? "—") },
            { label: "Membres", value: m.members ? "Oui" : "Non" },
          ],
          url: `https://oldschool.runescape.wiki/w/${encodeURIComponent(String(m.name).replace(/ /g, "_"))}`,
        };
      })
      .sort((a, b) => Number(String(b.price).replace(/\D/g, "")) - Number(String(a.price).replace(/\D/g, "")))
      .slice(0, LIMIT);
    if (!items.length) return null;
    return { items, note: "Prix réels du Grand Exchange (API officielle publique), sans clé." };
  } catch {
    return null;
  }
}

export function isOpenGame(slug: string) {
  return !!GAMES[slug];
}

export async function buildOpenGame(slug: string) {
  const cfg = GAMES[slug];
  if (!cfg) throw new Error("Jeu inconnu");

  const tabs: Partial<Record<TabKey, Tab>> = {};
  await Promise.all(
    TAB_KEYS.map(async (key) => {
      tabs[key] = await wikiTab(cfg.tabs[key], cfg.hosts, TAB_LABELS[key]);
    })
  );

  if (slug === "osrs") {
    const live = await osrsShop();
    if (live) tabs.shop = live;
  }

  return { slug, tabs, fetched_at: new Date().toISOString() };
}

// --- Suivi joueur (aucune clé) ---
async function osrsPlayer(query: string) {
  const name = String(query || "").trim();
  if (!name) throw new Error("Pseudo manquant");
  const url = `https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "MatrixHub/1.0 (+https://matrix-hub.app)" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error("Joueur introuvable sur les Hiscores");
  const csv = (await res.text()).trim().split("\n");
  const skills = ["Total", "Attack", "Defence", "Strength", "Hitpoints", "Ranged", "Prayer", "Magic", "Cooking", "Woodcutting", "Fletching", "Fishing", "Firemaking", "Crafting", "Smithing", "Mining", "Herblore", "Agility", "Thieving", "Slayer", "Farming", "Runecraft", "Hunter", "Construction"];
  const stats = csv.slice(0, skills.length).map((line, i) => {
    const [rank, level, xp] = line.split(",");
    return { label: skills[i], value: `${Number(level).toLocaleString("fr-FR")} niv. · ${Number(xp).toLocaleString("fr-FR")} xp` };
  });
  return { name, subtitle: "Hiscores officiels OSRS", stats };
}

async function dotaPlayer(query: string) {
  const id = String(query || "").trim().match(/\d+/)?.[0];
  if (!id) throw new Error("Indique un ID de compte Steam (chiffres uniquement)");
  const [player, wl] = await Promise.all([
    jget(`https://api.opendota.com/api/players/${id}`),
    jget(`https://api.opendota.com/api/players/${id}/wl`).catch(() => null),
  ]);
  const p = player?.profile || {};
  return {
    name: p.personaname || `Joueur ${id}`,
    subtitle: `ID ${id}${player?.rank_tier ? ` · rang ${player.rank_tier}` : ""}`,
    avatar: p.avatarfull || p.avatar || null,
    stats: [
      { label: "Victoires", value: String(wl?.win ?? "—") },
      { label: "Défaites", value: String(wl?.lose ?? "—") },
      { label: "Pays", value: p.loccountrycode || "—" },
    ],
  };
}

async function overwatchPlayer(query: string) {
  const name = String(query || "").trim();
  if (!name) throw new Error("Indique un BattleTag (ex. Pseudo-1234)");
  const search = await jget(`https://overfast-api.tekrop.fr/players?name=${encodeURIComponent(name)}`);
  const hit = search?.results?.[0];
  if (!hit) throw new Error("Profil introuvable");
  const p = await jget(`https://overfast-api.tekrop.fr/players/${encodeURIComponent(hit.player_id)}`);
  const s = p?.summary || {};
  return {
    name: s.username || hit.name,
    subtitle: `BattleTag ${hit.player_id}`,
    avatar: s.avatar || hit.avatar || null,
    stats: [
      { label: "Titre", value: s.title || "—" },
      { label: "Victoires", value: String(s.competitive?.pc?.games_won ?? "—") },
      { label: "Parties jouées", value: String(s.competitive?.pc?.games_played ?? "—") },
      { label: "Endossement", value: s.endorsement ? String(s.endorsement) : "—" },
    ],
  };
}

export async function fetchOpenPlayer(slug: string, query: string) {
  if (slug === "osrs") return osrsPlayer(query);
  if (slug === "dota-2") return dotaPlayer(query);
  if (slug === "overwatch-2") return overwatchPlayer(query);
  throw new Error("Ce jeu n'expose pas de recherche de profil sans clé API");
}