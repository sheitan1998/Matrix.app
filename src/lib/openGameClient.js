// Deux sources (Guild Wars 2 et OpenDota) limitent fortement les IP de datacenter (HTTP 429).
// Ces endpoints sont CORS-ouverts : on les interroge directement depuis le navigateur du joueur,
// toujours sans clé, token ni secret.

const clamp = (text, max = 240) => {
  const s = String(text ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max)}…` : s;
};

async function jget(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const CLIENT_GAMES = new Set(["guild-wars-2", "dota-2"]);

async function gw2() {
  const [items, stories, professions, achievements] = await Promise.allSettled([
    jget("https://api.guildwars2.com/v2/items?page=0&page_size=24"),
    jget("https://api.guildwars2.com/v2/stories?page=0&page_size=24"),
    jget("https://api.guildwars2.com/v2/professions?ids=all"),
    jget("https://api.guildwars2.com/v2/achievements?page=0&page_size=24"),
  ]);
  const val = (r, f = []) => (r.status === "fulfilled" ? r.value : f);

  return {
    shop: {
      items: (val(items) || []).map((it) => ({
        id: String(it.id),
        name: it.name,
        subtitle: `${it.rarity || ""} · niveau ${it.level || 0}`,
        image: it.icon || null,
        tag: it.type || "Objet",
        desc: clamp(it.description),
      })),
      note: "Catalogue d'objets officiel avec icônes du jeu.",
    },
    quests: {
      items: (val(stories) || []).map((s) => ({
        id: String(s.id),
        name: s.name,
        subtitle: `${s.timeline || ""} · niveau ${s.level || 0}`,
        tag: "Histoire",
        desc: clamp(s.description),
      })),
      note: "Chapitres d'histoire du jeu de base et des saisons.",
    },
    characters: {
      items: (val(professions) || []).map((p) => ({
        id: p.id || p,
        name: p.name || p,
        subtitle: "Profession jouable",
        image: p.icon || null,
        desc: clamp(p.description || "Profession jouable de Guild Wars 2."),
      })),
      note: "Professions jouables et leurs icônes officielles.",
    },
    achievements: {
      items: (val(achievements) || []).map((a) => ({
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
      subtitle: `${Number(it.cost).toLocaleString("fr-FR")} or · ${it.qual || ""}`,
      image: cdn(it.img),
      tag: "Objet",
      desc: clamp(it.lore || ""),
    }));

  const characters = stats.map((h) => ({
    id: String(h.id),
    name: h.localized_name,
    subtitle: `${h.primary_attr?.toUpperCase()} · ${h.attack_type}`,
    image: cdn(h.img),
    tag: (h.roles || [])[0] || "Héros",
    desc: clamp(`${(h.roles || []).join(", ")} — ${h.pub_win || 0}% de victoires publiques.`),
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
      desc: "Héros du méta compétitif issu des statistiques publiques.",
    }));

  const achievements = [...stats]
    .sort((a, b) => Number(b.pub_win || 0) - Number(a.pub_win || 0))
    .slice(0, 10)
    .map((h, i) => ({
      id: `rec-${h.id}`,
      name: h.localized_name,
      subtitle: `${h.pub_win}% de victoires publiques`,
      image: cdn(h.icon),
      tag: i === 0 ? "Meilleur taux" : "Record",
      desc: clamp(`${(h.pub_pick || 0).toLocaleString("fr-FR")} parties publiques analysées par OpenDota.`),
    }));

  return {
    shop: { items: shop, note: "Objets du jeu avec prix en or et visuels officiels Steam." },
    quests: { items: quests, note: "Objectifs de maîtrise issus des statistiques compétitives publiques." },
    characters: { items: characters, note: "Tous les héros avec leurs visuels officiels." },
    achievements: { items: achievements, note: "Records calculés à partir des statistiques publiques OpenDota." },
  };
}

export async function buildOpenGameClient(slug) {
  if (slug === "guild-wars-2") return { slug, tabs: await gw2() };
  if (slug === "dota-2") return { slug, tabs: await dota2() };
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