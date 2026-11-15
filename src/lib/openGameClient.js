// Deux sources (Guild Wars 2 et OpenDota) limitent fortement les IP de datacenter (HTTP 429).
// Ces endpoints sont CORS-ouverts : on les interroge directement depuis le navigateur du joueur,
// toujours sans clé, token ni secret. Le serveur complète les onglets que l'API ne couvre pas.

const clamp = (text, max = 320) => {
  const s = String(text ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max)}…` : s;
};

async function jget(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const CLIENT_GAMES = new Set(["guild-wars-2", "dota-2"]);

// --- Guild Wars 2 : API officielle, aucune clé ---
async function gw2() {
  const [items, stories, professions, daily, achievements, seasons] = await Promise.allSettled([
    jget("https://api.guildwars2.com/v2/items?page=0&page_size=24"),
    jget("https://api.guildwars2.com/v2/stories?page=0&page_size=24"),
    jget("https://api.guildwars2.com/v2/professions?ids=all"),
    jget("https://api.guildwars2.com/v2/achievements/daily"),
    jget("https://api.guildwars2.com/v2/achievements?page=0&page_size=24"),
    jget("https://api.guildwars2.com/v2/stories/seasons?ids=all"),
  ]);
  const val = (r, f = []) => (r.status === "fulfilled" ? r.value : f);

  const shop = (val(items) || []).map((it) => ({
    id: String(it.id),
    name: it.name,
    image: it.icon || null,
    tag: it.type || "Objet",
    subtitle: `${it.rarity || ""}${it.level ? ` · niveau ${it.level}` : ""}`,
    rarity: it.rarity || null,
    price: it.vendor_value ? `${Number(it.vendor_value).toLocaleString("fr-FR")} cuivre` : null,
    desc: clamp(it.description),
    stats: [
      { label: "Type", value: it.type || "—" },
      { label: "Rareté", value: it.rarity || "—" },
    ],
  }));

  const characters = (val(professions) || []).map((p) => ({
    id: String(p.id || p),
    name: p.name || String(p),
    image: p.icon || null,
    tag: "Profession",
    subtitle: p.name ? "Profession jouable" : null,
    desc: clamp(p.description || "Profession jouable de Guild Wars 2."),
  }));

  const quests = (val(stories) || []).map((s) => ({
    id: String(s.id),
    name: s.name,
    image: null,
    tag: "Histoire",
    subtitle: `${s.timeline || ""}${s.level ? ` · niveau ${s.level}` : ""}`,
    desc: clamp(s.description),
  }));

  // Rotation quotidienne réelle : les succès du jour, avec leurs icônes officielles.
  const dailyIds = [
    ...((val(daily) || {}).pve || []),
    ...((val(daily) || {}).pvp || []),
    ...((val(daily) || {}).wvw || []),
  ]
    .flatMap((entry) => entry?.ids || [])
    .filter((id, i, arr) => arr.indexOf(id) === i)
    .slice(0, 16);

  let rotations = [];
  if (dailyIds.length) {
    const detail = await jget(`https://api.guildwars2.com/v2/achievements?ids=${dailyIds.join(",")}`).catch(() => []);
    rotations = (Array.isArray(detail) ? detail : []).map((a) => ({
      id: String(a.id),
      name: a.name,
      image: a.icon || null,
      tag: "Quotidien",
      subtitle: "Rotation quotidienne",
      desc: clamp(a.requirement),
    }));
  }

  const battlepass = (val(seasons) || []).map((s) => ({
    id: String(s.id),
    name: s.name,
    image: s.icon || null,
    tag: "Saison",
    subtitle: "Progression saisonnière",
    desc: clamp(s.description || "Saison de l'histoire vivante de Guild Wars 2."),
  }));

  return {
    tabs: {
      shop: { items: shop, note: "Catalogue officiel GW2 (api.guildwars2.com), sans clé." },
      rotations: { items: rotations, note: "Succès quotidiens en cours (rotation officielle)." },
      quests: { items: quests, note: "Chapitres d'histoire officiels." },
      battlepass: { items: battlepass, note: "Saisons de l'histoire vivante." },
      characters: { items: characters, note: "Professions jouables et icônes officielles." },
      achievements: {
        items: (val(achievements) || []).map((a) => ({
          id: String(a.id),
          name: a.name,
          image: a.icon || null,
          tag: a.type || "Succès",
          subtitle: a.tiers?.length ? `${a.tiers.length} paliers` : "Succès",
          desc: clamp(a.requirement || a.description),
        })),
        note: "Succès officiels avec conditions et icônes.",
      },
    },
  };
}

// --- Dota 2 : OpenDota, aucune clé ---
async function dota2() {
  const [heroes, items] = await Promise.allSettled([
    jget("https://api.opendota.com/api/heroStats"),
    jget("https://api.opendota.com/api/constants/items"),
  ]);
  const stats = heroes.status === "fulfilled" ? heroes.value : [];
  const constants = items.status === "fulfilled" ? items.value : {};
  const cdn = (path) => (path ? `https://cdn.cloudflare.steamstatic.com${path}` : null);

  const shop = Object.entries(constants || {})
    .map(([key, v]) => ({ key, ...v }))
    .filter((it) => it?.img && Number(it.cost) > 0 && it.dname)
    .sort((a, b) => Number(b.cost) - Number(a.cost))
    .slice(0, 24)
    .map((it) => ({
      id: it.key,
      name: it.dname,
      image: cdn(it.img),
      tag: it.qual || "Objet",
      subtitle: `${Number(it.cost).toLocaleString("fr-FR")} or`,
      price: `${Number(it.cost).toLocaleString("fr-FR")} or`,
      desc: clamp(it.lore || it.notes || ""),
      stats: [{ label: "Coût", value: `${Number(it.cost).toLocaleString("fr-FR")} or` }],
    }));

  const characters = stats.map((h) => ({
    id: String(h.id),
    name: h.localized_name,
    image: cdn(h.img),
    tag: (h.roles || [])[0] || "Héros",
    subtitle: `${h.primary_attr?.toUpperCase()} · ${h.attack_type}`,
    desc: clamp(`${(h.roles || []).join(", ")} — ${h.pub_win || 0} % de victoires publiques.`),
  }));

  const rotations = [...stats]
    .sort((a, b) => (b.pro_pick || 0) - (a.pro_pick || 0))
    .slice(0, 16)
    .map((h) => ({
      id: `meta-${h.id}`,
      name: h.localized_name,
      image: cdn(h.icon),
      tag: "Méta",
      subtitle: `${h.pro_pick || 0} picks pro · ${h.pro_win || 0} victoires`,
      desc: "Héros en tête du méta compétitif selon les statistiques publiques.",
    }));

  const achievements = [...stats]
    .sort((a, b) => Number(b.pub_win || 0) - Number(a.pub_win || 0))
    .slice(0, 12)
    .map((h, i) => ({
      id: `rec-${h.id}`,
      name: h.localized_name,
      image: cdn(h.icon),
      tag: i === 0 ? "Meilleur taux" : "Record",
      subtitle: `${h.pub_win} % de victoires publiques`,
      desc: clamp(`${(h.pub_pick || 0).toLocaleString("fr-FR")} parties publiques analysées par OpenDota.`),
    }));

  return {
    tabs: {
      shop: { items: shop, note: "Objets du jeu avec visuels officiels Steam." },
      rotations: { items: rotations, note: "Méta compétitive mise à jour depuis les statistiques publiques." },
      quests: { items: [], note: "" },
      battlepass: { items: [], note: "" },
      characters: { items: characters, note: "Tous les héros avec leurs visuels officiels." },
      achievements: { items: achievements, note: "Records calculés à partir des données publiques OpenDota." },
    },
  };
}

export async function buildOpenGameClient(slug) {
  if (slug === "guild-wars-2") return { slug, ...(await gw2()) };
  if (slug === "dota-2") return { slug, ...(await dota2()) };
  throw new Error("Jeu non pris en charge côté navigateur");
}

export async function fetchOpenPlayerClient(slug, query) {
  if (slug !== "dota-2") throw new Error("Recherche indisponible");
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