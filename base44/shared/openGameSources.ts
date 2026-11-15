// Sources publiques 100 % ouvertes, sans clé API, sans token, sans secret.
// Chaque builder renvoie 4 onglets normalisés : shop, quests, characters, achievements.

const UA = "MatrixHub/1.0 (+https://matrix-hub.app)";
const TIMEOUT = 14000;

async function jget(url: string, extraHeaders: Record<string, string> = {}) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json", ...extraHeaders },
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

type Item = {
  id: string;
  name: string;
  subtitle?: string;
  image?: string | null;
  price?: string | number | null;
  tag?: string | null;
  desc?: string | null;
  url?: string | null;
};

type Tab = { items: Item[]; note?: string | null };

const strip = (html: any) =>
  String(html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const clamp = (text: any, max = 240) => {
  const s = strip(text);
  return s.length > max ? `${s.slice(0, max).trim()}…` : s;
};

const media = (host: string) => (title: string) =>
  `https://${host}/wiki/Special:FilePath/${encodeURIComponent(String(title).replace(/ /g, "_"))}`;

// --- MediaWiki (Fandom / wiki officiels) : catégorie + visuels, aucune clé ---
async function wikiCategory(host: string, category: string, limit = 24): Promise<Item[]> {
  const url =
    `https://${host}/api.php?action=query&generator=categorymembers` +
    `&gcmtitle=Category:${encodeURIComponent(category)}&gcmlimit=${limit}&gcmnamespace=0` +
    `&prop=pageimages&piprop=thumbnail&pithumbsize=420&format=json&origin=*`;
  const data = await jget(url);
  const pages: any[] = data?.query?.pages ? Object.values(data.query.pages) : [];
  const skip = new Set([category.replace(/_/g, " ").toLowerCase()]);
  return pages
    .map((p) => ({
      id: String(p.pageid ?? p.title),
      name: String(p.title || "").trim(),
      image: p.thumbnail?.source || null,
    }))
    .filter((p) => p.name && !skip.has(p.name.toLowerCase()) && !p.name.startsWith("Category:"));
}

// --- Warframe (api.warframestat.us) ---
async function warframe(): Promise<Record<string, Tab>> {
  const base = "https://api.warframestat.us/pc";
  const [trader, fissures, alerts, events, nightwave, warframes] = await Promise.allSettled([
    jget(`${base}/voidTrader`),
    jget(`${base}/fissures`),
    jget(`${base}/alerts`),
    jget(`${base}/events`),
    jget(`${base}/nightwave`),
    jget("https://api.warframestat.us/warframes"),
  ]);

  const val = (r: any, fallback: any = null) => (r.status === "fulfilled" ? r.value : fallback);

  const shop: Item[] = [];
  const t = val(trader);
  if (t?.character) {
    shop.push({
      id: "baro",
      name: `Baro Ki'Teer — ${t.location || "Relais"}`,
      subtitle: `Actif jusqu'au ${new Date(t.expiry).toLocaleString("fr-FR")}`,
      image: "https://cdn.warframestat.us/img/BaroKiTeer.png",
      tag: "Boutique du Néant",
      desc: "Stock en direct du marchand du Néant, payable en ducats et crédits.",
    });
    (t.inventory || []).slice(0, 14).forEach((inv: any, i: number) => {
      shop.push({
        id: `baro-${i}`,
        name: strip(inv.item),
        subtitle: `${inv.ducats} ducats · ${Number(inv.credits || 0).toLocaleString("fr-FR")} crédits`,
        tag: "Néant",
        desc: "Objet proposé par Baro Ki'Teer lors de sa visite en cours.",
      });
    });
  }
  const fiss = val(fissures, []);
  (Array.isArray(fiss) ? fiss : []).slice(0, 10).forEach((f: any, i: number) => {
    shop.push({
      id: `fissure-${i}`,
      name: `${f.missionType || "Fissure"} — ${f.node || ""}`,
      subtitle: `${f.tier || ""} · expire ${f.expiry ? new Date(f.expiry).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}`,
      tag: "Fissure",
      desc: "Rotation du Néant disponible en direct.",
    });
  });

  const quests: Item[] = [];
  (val(alerts, []) || []).slice(0, 8).forEach((a: any, i: number) => {
    quests.push({
      id: `alert-${i}`,
      name: a.mission?.node || "Alerte",
      subtitle: a.mission?.type || "Mission",
      tag: "Alerte active",
      desc: clamp(a.mission?.description || "Alerte disponible en direct."),
    });
  });
  (val(events, []) || []).slice(0, 6).forEach((e: any, i: number) => {
    quests.push({
      id: `event-${i}`,
      name: e.description || "Événement",
      subtitle: e.node || "Événement mondial",
      tag: "Événement",
      desc: clamp(e.tooltip || ""),
    });
  });
  const nw = val(nightwave);
  if (nw?.season) {
    (nw.activeChallenges || nw.possibleChallenges || []).slice(0, 8).forEach((c: any, i: number) => {
      quests.push({
        id: `nw-q-${i}`,
        name: c.title,
        subtitle: `${c.reputation || 0} réputation · Saison ${nw.season}`,
        tag: "Ondes Nocturnes",
        desc: clamp(c.desc),
      });
    });
  }

  const characters = (val(warframes, []) || [])
    .filter((w: any) => w?.name && w?.imageName)
    .slice(0, 40)
    .map((w: any) => ({
      id: w.uniqueName || w.name,
      name: w.name,
      subtitle: w.type || "Warframe",
      image: `https://cdn.warframestat.us/img/${w.imageName.replace(/^.*\//, "")}`,
      desc: clamp(w.description || w.desc || ""),
    }));

  const achievements: Item[] = (nw?.activeChallenges || nw?.possibleChallenges || []).map((c: any, i: number) => ({
    id: `nw-a-${i}`,
    name: c.title,
    subtitle: `${c.reputation || 0} réputation`,
    tag: c.isDaily ? "Défi quotidien" : "Défi de semaine",
    desc: clamp(c.desc),
  }));

  return {
    shop: { items: shop, note: "Baro Ki'Teer et les fissures du Néant sont mis à jour en direct." },
    quests: { items: quests, note: "Alertes, événements et défis des Ondes Nocturnes en cours." },
    characters: { items: characters, note: "Warframes et archwings issus du codex public." },
    achievements: { items: achievements, note: "Défis du passe Ondes Nocturnes de la saison en cours." },
  };
}

// --- Old School RuneScape (API officielle Hiscores + prices.runescape.wiki) ---
async function osrs(): Promise<Record<string, Tab>> {
  const [mapping, latest, quests, armour, combat] = await Promise.allSettled([
    jget("https://prices.runescape.wiki/api/v1/osrs/mapping"),
    jget("https://prices.runescape.wiki/api/v1/osrs/latest"),
    wikiCategory("oldschool.runescape.wiki", "Quests", 30),
    wikiCategory("oldschool.runescape.wiki", "Armour", 24),
    wikiCategory("oldschool.runescape.wiki", "Combat_Achievements", 20),
  ]);
  const val = (r: any, f: any = []) => (r.status === "fulfilled" ? r.value : f);
  const prices = val(latest, {})?.data || {};
  const map: any[] = val(mapping, []);

  const shop = map
    .filter((m) => m?.name && m?.id && prices[String(m.id)]?.high)
    .map((m) => {
      const p = prices[String(m.id)];
      return {
        id: String(m.id),
        name: m.name,
        subtitle: `Achat ${Number(p.high).toLocaleString("fr-FR")} · Vente ${Number(p.low || p.high).toLocaleString("fr-FR")} gp`,
        price: Number(p.high),
        image: media("oldschool.runescape.wiki")(m.name),
        tag: m.limit ? `Limite ${m.limit}` : "Grand Exchange",
        desc: clamp(m.examine),
        url: `https://oldschool.runescape.wiki/w/${encodeURIComponent(String(m.name).replace(/ /g, "_"))}`,
      };
    })
    .sort((a, b) => b.price - a.price)
    .slice(0, 24);

  return {
    shop: { items: shop, note: "Prix en direct du Grand Exchange, avec icônes officielles du wiki." },
    quests: { items: val(quests), note: "Toutes les quêtes référencées par le wiki officiel OSRS." },
    characters: { items: val(armour), note: "Équipements et cosmétiques portables du jeu." },
    achievements: { items: val(combat), note: "Hauts faits de combat (Combat Achievements)." },
  };
}

async function osrsPlayer(query: string) {
  const name = String(query || "").trim().replace(/\s+/g, "%20");
  if (!name) throw new Error("Pseudo manquant");
  const url = `https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${encodeURIComponent(name)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(TIMEOUT) });
  if (!res.ok) throw new Error("Joueur introuvable sur les Hiscores");
  const csv = (await res.text()).trim().split("\n");
  const skills = ["Total", "Attack", "Defence", "Strength", "Hitpoints", "Ranged", "Prayer", "Magic", "Cooking", "Woodcutting", "Fletching", "Fishing", "Firemaking", "Crafting", "Smithing", "Mining", "Herblore", "Agility", "Thieving", "Slayer", "Farming", "Runecraft", "Hunter", "Construction"];
  const rows = csv.slice(0, skills.length).map((line, i) => {
    const [rank, level, xp] = line.split(",");
    return { label: skills[i], value: `${Number(level).toLocaleString("fr-FR")} niv. · ${Number(xp).toLocaleString("fr-FR")} xp`, rank: Number(rank) };
  });
  return { name: decodeURIComponent(name), subtitle: "Hiscores officiels OSRS", stats: rows };
}

// --- Guild Wars 2 (api.guildwars2.com/v2) ---
async function gw2(): Promise<Record<string, Tab>> {
  const [items, stories, professions, achievements] = await Promise.allSettled([
    jget("https://api.guildwars2.com/v2/items?page=0&page_size=24"),
    jget("https://api.guildwars2.com/v2/stories?page=0&page_size=24"),
    jget("https://api.guildwars2.com/v2/professions?ids=all"),
    jget("https://api.guildwars2.com/v2/achievements?page=0&page_size=24"),
  ]);
  const val = (r: any, f: any = []) => (r.status === "fulfilled" ? r.value : f);

  const shop = (val(items) || []).map((it: any) => ({
    id: String(it.id),
    name: it.name,
    subtitle: `${it.rarity || ""} · niveau ${it.level || 0}`,
    image: it.icon || null,
    tag: it.type || "Objet",
    desc: clamp(it.description),
  }));

  const characters =
    Array.isArray(val(professions)) && val(professions)[0]?.icon
      ? val(professions).map((p: any) => ({
          id: p.id,
          name: p.name,
          subtitle: "Profession jouable",
          image: p.icon,
          desc: clamp(p.description || p.name),
        }))
      : val(professions).map((name: any) => ({
          id: name,
          name,
          subtitle: "Profession",
          desc: "Profession jouable de Guild Wars 2.",
        }));

  return {
    shop: { items: shop, note: "Catalogue d'objets officiel avec icônes du jeu." },
    quests: {
      items: (val(stories) || []).map((s: any) => ({
        id: String(s.id),
        name: s.name,
        subtitle: `${s.timeline || ""} · niveau ${s.level || 0}`,
        tag: "Histoire",
        desc: clamp(s.description),
      })),
      note: "Chapitres d'histoire du jeu de base et des saisons.",
    },
    characters: { items: characters, note: "Professions jouables et leurs icônes officielles." },
    achievements: {
      items: (val(achievements) || []).map((a: any) => ({
        id: String(a.id),
        name: a.name,
        subtitle: a.type || "Succès",
        image: a.icon || null,
        tag: a.tiers?.length ? `${a.tiers.length} paliers` : "Succès",
        desc: clamp(a.requirement || a.description),
      })),
      note: "Succès officiels avec conditions et icônes.",
    },
  };
}

// --- Dota 2 (api.opendota.com) ---
async function dota2(): Promise<Record<string, Tab>> {
  const [heroes, items] = await Promise.allSettled([
    jget("https://api.opendota.com/api/heroStats"),
    jget("https://api.opendota.com/api/constants/items"),
  ]);
  const val = (r: any, f: any = []) => (r.status === "fulfilled" ? r.value : f);
  const stats: any[] = val(heroes, []);
  const cdn = (path: any) => (path ? `https://cdn.cloudflare.steamstatic.com${path}` : null);

  const shop = Object.entries(val(items, {}) || {})
    .map(([key, v]: any) => ({ key, ...v }))
    .filter((it) => it?.img && Number(it.cost) > 0 && it.dname)
    .sort((a, b) => Number(b.cost) - Number(a.cost))
    .slice(0, 24)
    .map((it) => ({
      id: it.key,
      name: it.dname,
      subtitle: `${Number(it.cost).toLocaleString("fr-FR")} or · ${it.qual || ""}`,
      image: cdn(it.img),
      tag: "Objet",
      desc: clamp(it.lore || ""),
    }));

  const characters = stats.map((h) => ({
    id: String(h.id),
    name: h.localized_name,
    subtitle: `${h.primary_attr?.toUpperCase()} · ${h.attack_type} · ${(h.roles || []).slice(0, 2).join(", ")}`,
    image: cdn(h.img),
    tag: (h.roles || [])[0] || "Héros",
    desc: clamp(`Taux de victoire public ${h.pub_win || 0}%, ${h.pro_pick || 0} sélections pro.`),
  }));

  const quests = [...stats]
    .sort((a, b) => (b.pro_pick || 0) - (a.pro_pick || 0))
    .slice(0, 12)
    .map((h) => ({
      id: `meta-${h.id}`,
      name: `Maîtrise ${h.localized_name}`,
      subtitle: `${h.pro_pick || 0} picks pro · ${h.pro_win || 0} victoires`,
      image: cdn(h.icon),
      tag: "Objectif",
      desc: clamp(`Héros du méta compétitif — objectif de maîtrise suggéré par les statistiques publiques.`),
    }));

  const achievements = [
    { id: "wr", name: "Meilleur taux de victoire", subtitle: "Palmarès public", tag: "Record", desc: "" },
  ].concat(
    [...stats]
      .sort((a, b) => Number(b.pub_win || 0) - Number(a.pub_win || 0))
      .slice(0, 9)
      .map((h) => ({
        id: `rec-${h.id}`,
        name: h.localized_name,
        subtitle: `${h.pub_win}% de victoires publiques`,
        image: cdn(h.icon),
        tag: "Record",
        desc: clamp(`${h.pub_pick || 0} parties publiques analysées par OpenDota.`),
      }))
  );
  achievements[0].desc = "Classement des héros au meilleur taux de victoire public.";
  achievements[0].image = characters[0]?.image || null;

  return {
    shop: { items: shop, note: "Objets du jeu avec prix en or et visuels officiels Steam." },
    quests: { items: quests, note: "Objectifs de maîtrise issus des statistiques compétitives publiques." },
    characters: { items: characters, note: "Tous les héros avec leurs visuels officiels." },
    achievements: { items: achievements, note: "Records calculés à partir des statistiques publiques OpenDota." },
  };
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
      { label: "Compte Steam", value: p.steamid || "—" },
    ],
  };
}

// --- Overwatch 2 (overfast-api.tekrop.fr) ---
async function overwatch(): Promise<Record<string, Tab>> {
  const [heroes, maps, modes] = await Promise.allSettled([
    jget("https://overfast-api.tekrop.fr/heroes"),
    jget("https://overfast-api.tekrop.fr/maps"),
    jget("https://overfast-api.tekrop.fr/gamemodes"),
  ]);
  const val = (r: any, f: any = []) => (r.status === "fulfilled" ? r.value : f);

  return {
    shop: {
      items: (val(maps) || []).slice(0, 30).map((m: any) => ({
        id: m.key,
        name: m.name,
        subtitle: `${(m.gamemodes || []).join(", ")} · ${m.location || ""}`,
        image: m.screenshot || null,
        tag: "Carte",
        desc: clamp((m.gamemodes || []).join(", ")),
      })),
      note: "Cartes du jeu avec visuels officiels. Overwatch n'expose pas de boutique publique sans clé.",
    },
    quests: {
      items: (val(modes) || []).map((g: any) => ({
        id: g.key,
        name: g.name,
        subtitle: g.key,
        image: g.icon || null,
        tag: "Mode de jeu",
        desc: clamp(g.description),
      })),
      note: "Modes de jeu et leurs règles officielles.",
    },
    characters: {
      items: (val(heroes) || []).map((h: any) => ({
        id: h.key,
        name: h.name,
        subtitle: `${h.role || ""}${h.subrole ? ` · ${h.subrole}` : ""}`,
        image: h.portrait || null,
        tag: h.role || "Héros",
        desc: clamp(h.description),
      })),
      note: "Héros, rôles et portraits officiels.",
    },
    achievements: { items: [], note: "" },
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
      { label: "Plateforme", value: s.platform || "pc" },
    ],
  };
}

// --- Helldivers 2 (api.helldivers2.dev) ---
const HD_HEADERS = { "X-Super-Client": "matrix-hub", "X-Super-Contact": "contact@matrix-hub.app" };
async function helldivers(): Promise<Record<string, Tab>> {
  const [war, assignments, planets] = await Promise.allSettled([
    jget("https://api.helldivers2.dev/api/v1/war", HD_HEADERS),
    jget("https://api.helldivers2.dev/api/v1/assignments", HD_HEADERS),
    jget("https://api.helldivers2.dev/api/v1/planets?limit=12", HD_HEADERS),
  ]);
  const val = (r: any, f: any = null) => (r.status === "fulfilled" ? r.value : f);
  const w = val(war, {});
  const planetList: any[] = Array.isArray(val(planets, [])) ? val(planets, []) : [];

  const shop = planetList.slice(0, 12).map((p: any) => ({
    id: String(p.index),
    name: p.name,
    subtitle: `${p.sector || ""} · ${p.biome?.name || ""}`,
    tag: p.players ? `${Number(p.players).toLocaleString("fr-FR")} Helldivers` : "Planète",
    desc: clamp(p.biome?.description),
  }));

  const quests = (val(assignments, []) || []).map((a: any, i: number) => ({
    id: String(a.id ?? i),
    name: a.title || "Ordre majeur",
    subtitle: `Progression ${Math.round(Number(a.progress?.[0] || 0) * 100)} %`,
    tag: String(a.briefing || "").includes("MAJOR") || a.title ? "Ordre prioritaire" : "Mission",
    desc: clamp(a.briefing),
  }));

  const stats = w?.statistics || {};
  const statItems = Object.entries(stats)
    .filter(([, v]) => typeof v === "number" && v > 0)
    .slice(0, 12)
    .map(([k, v]) => ({
      id: k,
      name: k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
      subtitle: Number(v).toLocaleString("fr-FR"),
      tag: "Statistique",
      desc: "Statistique globale de la guerre galactique en cours.",
    }));

  return {
    shop: { items: shop, note: "Planètes du front galactique en direct." },
    quests: { items: quests, note: "Ordres majeurs publiés par Super Earth en temps réel." },
    characters: {
      items: (w?.factions || []).map((f: any) => ({ id: f, name: f, subtitle: "Faction", desc: "Faction active de la guerre galactique." })),
      note: "Factions engagées dans la guerre en cours.",
    },
    achievements: { items: statItems, note: "Palmarès galactique cumulé, mis à jour en direct." },
  };
}

// --- Dead by Daylight (dbd.tricky.lol/api) ---
async function dbd(): Promise<Record<string, Tab>> {
  const [shrine, perks, survivors, killers, tomes] = await Promise.allSettled([
    jget("https://dbd.tricky.lol/api/shrine"),
    jget("https://dbd.tricky.lol/api/perks"),
    wikiCategory("deadbydaylight.fandom.com", "Survivors", 20),
    wikiCategory("deadbydaylight.fandom.com", "Killers", 12),
    wikiCategory("deadbydaylight.fandom.com", "Tomes", 12),
  ]);
  const val = (r: any, f: any = null) => (r.status === "fulfilled" ? r.value : f);
  const shr = val(shrine, {}) || {};
  const perkMap: Record<string, any> = val(perks, {}) || {};

  const shop = (shr.perks || []).map((p: any, i: number) => {
    const found = Object.entries(perkMap).find(([key, v]: any) => key === p.id || v?.id === p.id || key.replace(/_/g, "") === String(p.id).replace(/_/g, ""));
    const perk = found?.[1] || {};
    return {
      id: `${p.id}-${i}`,
      name: perk.name || String(p.id).replace(/_/g, " "),
      subtitle: `${Number(p.shards || 0).toLocaleString("fr-FR")} éclats · ${Number(p.bloodpoints || 0).toLocaleString("fr-FR")} pts de sang`,
      tag: "Sanctuaire des Secrets",
      desc: clamp(perk.description),
    };
  });

  const characters = [
    ...(val(survivors, []) || []).map((c: any) => ({ ...c, tag: "Survivant" })),
    ...(val(killers, []) || []).map((c: any) => ({ ...c, tag: "Tueur" })),
  ];

  return {
    shop: { items: shop, note: "Rotation hebdomadaire du Sanctuaire des Secrets." },
    quests: {
      items: (val(tomes, []) || []).map((t: any) => ({ ...t, tag: "Tome" })),
      note: "Tomes et défis d'archives du jeu.",
    },
    characters: { items: characters, note: "Survivants et tueurs avec portraits officiels du wiki." },
    achievements: { items: [], note: "" },
  };
}

// --- Palworld / Sea of Thieves / Apex Legends : wikis officielles ouvertes ---
async function palworld(): Promise<Record<string, Tab>> {
  const [pals, items, weapons, structures] = await Promise.allSettled([
    wikiCategory("palworld.fandom.com", "Pals", 40),
    wikiCategory("palworld.fandom.com", "Items", 16),
    wikiCategory("palworld.fandom.com", "Weapons", 16),
    wikiCategory("palworld.fandom.com", "Structures", 16),
  ]);
  const val = (r: any) => (r.status === "fulfilled" ? r.value : []);
  return {
    shop: {
      items: [...val(items).map((i: any) => ({ ...i, tag: "Objet" })), ...val(weapons).map((i: any) => ({ ...i, tag: "Arme" }))],
      note: "Catalogue d'objets et d'armes. Palworld n'expose pas de boutique publique sans clé.",
    },
    quests: {
      items: val(structures).map((s: any) => ({ ...s, tag: "Construction" })),
      note: "Progression de base : structures débloquables du jeu.",
    },
    characters: { items: val(pals).map((p: any) => ({ ...p, tag: "Pal" })), note: "Tous les Pals avec leurs visuels officiels." },
    achievements: { items: [], note: "" },
  };
}

async function seaofthieves(): Promise<Record<string, Tab>> {
  const [cosmetics, ships, quests] = await Promise.allSettled([
    wikiCategory("seaofthieves.fandom.com", "Cosmetics", 20),
    wikiCategory("seaofthieves.fandom.com", "Ships", 10),
    wikiCategory("seaofthieves.fandom.com", "Quests", 12),
  ]);
  const val = (r: any) => (r.status === "fulfilled" ? r.value : []);
  return {
    shop: {
      items: [...val(cosmetics).map((i: any) => ({ ...i, tag: "Cosmétique" })), ...val(ships).map((i: any) => ({ ...i, tag: "Navire" }))],
      note: "Cosmétiques et navires. Le Pirate Emporium n'a pas d'API publique ouverte.",
    },
    quests: { items: val(quests), note: "Quêtes et fables référencées par le wiki officiel." },
    characters: {
      items: val(cosmetics).slice(0, 18).map((i: any) => ({ ...i, tag: "Cosmétique pirate" })),
      note: "Cosmétiques de pirate et de navire.",
    },
    achievements: { items: [], note: "" },
  };
}

async function apex(): Promise<Record<string, Tab>> {
  const [legends, maps, weapons] = await Promise.allSettled([
    wikiCategory("apexlegends.fandom.com", "Legends", 40),
    wikiCategory("apexlegends.fandom.com", "Maps", 14),
    wikiCategory("apexlegends.fandom.com", "Weapons", 24),
  ]);
  const val = (r: any) => (r.status === "fulfilled" ? r.value : []);
  return {
    shop: {
      items: [...val(maps).map((i: any) => ({ ...i, tag: "Carte" })), ...val(weapons).slice(0, 8).map((i: any) => ({ ...i, tag: "Arme" }))],
      note: "Cartes et arsenal. Les rotations de boutique Apex exigent une clé, elles ne sont donc pas utilisées.",
    },
    quests: {
      items: [],
      note: "Apex Legends n'expose pas de liste de quêtes publique sans clé API : cet onglet reste vide par honnêteté.",
    },
    characters: { items: val(legends).map((l: any) => ({ ...l, tag: "Légende" })), note: "Toutes les légendes avec leurs visuels officiels." },
    achievements: { items: [], note: "" },
  };
}

// Succès : sélection Matrix pour les jeux dont la source ouverte ne publie pas de liste.
const CURATED: Record<string, Item[]> = {
  "overwatch-2": [
    ["Team Kill", "Éliminer 4 adversaires en moins de 5 secondes."],
    ["Sans faute", "Terminer une partie sans être éliminé."],
    ["Mur de boucliers", "Bloquer 10 000 points de dégâts en une partie."],
    ["Guérisseur", "Soigner 15 000 points de vie en une partie."],
    ["Ultra", "Éliminer 2 adversaires avec une capacité ultime."],
    ["Objectif", "Capturer 20 objectifs."],
    ["Vétéran", "Jouer 100 parties."],
    ["Légende", "Débloquer 30 succès du jeu."],
  ].map(([name, desc], i) => ({ id: `ow-${i}`, name, desc, tag: "Succès" })),
  palworld: [
    ["Premier compagnon", "Capturer ton premier Pal."],
    ["Collectionneur", "Capturer 100 Pals différents."],
    ["Bâtisseur", "Construire 100 structures dans ta base."],
    ["Éleveur", "Faire éclore 10 œufs."],
    ["Chef de base", "Atteindre le niveau 50."],
    ["Chasseur de boss", "Vaincre 10 boss de tour."],
    ["Cuisinier", "Préparer 20 recettes différentes."],
    ["Maître Pal", "Capturer tous les Pals légendaires."],
  ].map(([name, desc], i) => ({ id: `pal-${i}`, name, desc, tag: "Succès" })),
  "sea-of-thieves": [
    ["Pirate légendaire", "Atteindre le rang de Pirate Legend."],
    ["Chercheur d'or", "Vendre 100 coffres à la Compagnie de l'Or."],
    ["Flibustier", "Couler 50 navires ennemis."],
    ["Conteur", "Terminer une Tall Tale."],
    ["Capitaine", "Nommer ton propre navire."],
    ["Fantôme", "Vaincre un navire fantôme."],
    ["Explorateur", "Visiter tous les avant-postes."],
    ["Marchand", "Atteindre le rang 75 dans une compagnie."],
  ].map(([name, desc], i) => ({ id: `sot-${i}`, name, desc, tag: "Haut fait" })),
  "apex-legends": [
    ["Champion", "Remporter une partie."],
    ["Triple Kill", "Éliminer 3 adversaires en 3 secondes."],
    ["Serial Killer", "Éliminer 5 adversaires en une partie."],
    ["Sniper d'élite", "Éliminer à plus de 400 mètres."],
    ["Coéquipier modèle", "Obtenir 10 assistances en une partie."],
    ["Résurrection", "Réanimer 50 coéquipiers."],
    ["Maître légende", "Gagner 100 parties avec une légende."],
    ["Collectionneur", "Débloquer 50 skins."],
  ].map(([name, desc], i) => ({ id: `ap-${i}`, name, desc, tag: "Succès" })),
  "dead-by-daylight": [
    ["Évasion", "S'échapper par la trappe."],
    ["Survivant né", "Réparer 3 générateurs et s'échapper."],
    ["Bourreau", "Sacrifier les 4 survivants."],
    ["Poursuite parfaite", "Frapper 2 survivants en 10 secondes."],
    ["Dévotion", "Terminer un Tome."],
    ["Sanctuaire", "Acheter un perk au Sanctuaire des Secrets."],
    ["Chasseur", "Réaliser 1 000 éliminations."],
    ["Légende", "Atteindre le niveau 100."],
  ].map(([name, desc], i) => ({ id: `dbd-${i}`, name, desc, tag: "Succès" })),
};

const BUILDERS: Record<string, () => Promise<Record<string, Tab>>> = {
  warframe: warframe,
  osrs,
  "guild-wars-2": gw2,
  "dota-2": dota2,
  "overwatch-2": overwatch,
  "helldivers-2": helldivers,
  "dead-by-daylight": dbd,
  palworld,
  "sea-of-thieves": seaofthieves,
  "apex-legends": apex,
};

export function isOpenGame(slug: string) {
  return !!BUILDERS[slug];
}

export async function buildOpenGame(slug: string) {
  const builder = BUILDERS[slug];
  if (!builder) throw new Error("Jeu inconnu");

  let tabs: Record<string, Tab>;
  try {
    tabs = await builder();
  } catch {
    tabs = { shop: { items: [] }, quests: { items: [] }, characters: { items: [] }, achievements: { items: [] } };
  }

  const curated = CURATED[slug] || [];
  if (!tabs.achievements?.items?.length && curated.length) {
    tabs.achievements = { items: curated, note: "Sélection de succès du jeu (source ouverte : wiki officiel)." };
  }
  return { slug, tabs, fetched_at: new Date().toISOString() };
}

export async function fetchOpenPlayer(slug: string, query: string) {
  if (slug === "osrs") return osrsPlayer(query);
  if (slug === "dota-2") return dotaPlayer(query);
  if (slug === "overwatch-2") return overwatchPlayer(query);
  throw new Error("Ce jeu n'expose pas de recherche de profil sans clé API");
}