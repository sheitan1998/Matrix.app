import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const SITE_URL = "https://matrix-hub.app";
const MIN_SERVER_DESCRIPTION = 30;
const MIN_CREATOR_DESCRIPTION = 80;
const MAX_URLS = 2000;

/**
 * Une fiche serveur est indexable dès qu'elle porte un contenu propre :
 * description suffisante, jeux, catégories ou étiquettes.
 * Règle identique à isServerIndexable() côté front (src/lib/serverSeo.js).
 */
function hasServerContent(server: any): boolean {
  const description = String(server?.description || "").replace(/\s+/g, " ").trim();
  const games = [...(server?.games || []), server?.game].filter(Boolean);
  const categories = [...(server?.categories || []), server?.category].filter(
    (name: any) => name && !["discord", "nexus"].includes(String(name).trim().toLowerCase())
  );
  const tags = server?.tags || [];
  return (
    description.length >= MIN_SERVER_DESCRIPTION ||
    games.length > 0 ||
    categories.length > 0 ||
    tags.length > 0
  );
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toEntry(loc, lastmod) {
  const date = lastmod ? String(lastmod).slice(0, 10) : "";
  return `  <url><loc>${escapeXml(loc)}</loc>${date ? `<lastmod>${date}</lastmod>` : ""}</url>`;
}

/**
 * Sitemap dynamique des annonces publiques éligibles.
 * Seuls les contenus suffisamment complets sont inclus : pas d'annonce vide,
 * pas de contenu de faible qualité, aucune page privée.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    const [serversPage, creatorsPage, categoriesPage, gamesPage, questsPage, wikiPage] = await Promise.allSettled([
      base44.asServiceRole.entities.ServerAd.filter({ type: "server" }, { sort: "-updated_date", limit: MAX_URLS }),
      base44.asServiceRole.entities.CreatorChannel.filter({ is_active: true }, { sort: "-updated_date", limit: MAX_URLS }),
      base44.asServiceRole.entities.ServerCategory.filter({ is_active: true }, { sort: "sort_order", limit: 500 }),
      base44.asServiceRole.entities.Game.filter({ is_active: true }, { sort: "sort_order", limit: 500 }),
      base44.asServiceRole.entities.Quest.filter({}, { sort: "-updated_date", limit: MAX_URLS }),
      base44.asServiceRole.entities.WikiEntry.filter({}, { sort: "-updated_date", limit: MAX_URLS }),
    ]);

    const urls = [];

    const servers = serversPage.status === "fulfilled" ? serversPage.value.items || [] : [];
    const eligibleServers = servers.filter(hasServerContent);

    // Pages de catégories de l'annuaire Best Serveur (/best-serveurs/category/:slug).
    // Une catégorie n'est listée que si au moins une fiche indexable l'utilise.
    const usedSlugs = new Set<string>();
    const usedNames = new Set<string>();
    for (const server of eligibleServers) {
      for (const slug of [...(server.category_slugs || []), server.category_slug]) {
        if (slug) usedSlugs.add(String(slug));
      }
      for (const name of [...(server.categories || []), server.category]) {
        if (name) usedNames.add(String(name));
      }
    }

    const categories = categoriesPage.status === "fulfilled" ? categoriesPage.value.items || [] : [];
    for (const category of categories) {
      if (!category.slug) continue;
      if (!usedSlugs.has(String(category.slug)) && !usedNames.has(String(category.name))) continue;
      urls.push(toEntry(`${SITE_URL}/best-serveurs/category/${category.slug}`, category.updated_date));
    }

    for (const server of eligibleServers) {
      const slug = server.slug || server.id;
      if (!slug) continue;
      urls.push(toEntry(`${SITE_URL}/servers/${slug}`, server.updated_date));
    }

    const creators = creatorsPage.status === "fulfilled" ? creatorsPage.value.items || [] : [];
    for (const creator of creators) {
      const slug = creator.slug || creator.id;
      const description = (creator.description || "").replace(/\s+/g, " ").trim();
      if (!slug || description.length < MIN_CREATOR_DESCRIPTION) continue;
      urls.push(toEntry(`${SITE_URL}/createur/${slug}`, creator.updated_date));
    }

    // Guides gaming : memes regles d'eligibilite que les pages (contenu reel, pas de fiche vide).
    const rowsOf = (result) => {
      if (result.status !== "fulfilled") return [];
      const value = result.value;
      return Array.isArray(value) ? value : value?.items || [];
    };
    const clean = (text) => String(text || "").replace(/\s+/g, " ").trim();
    const quests = rowsOf(questsPage).filter(
      (quest) =>
        quest.id &&
        quest.game_slug &&
        (clean(quest.description).length >= 40 ||
          quest.objectives ||
          quest.rewards ||
          quest.tips ||
          (quest.steps || []).some((step) => clean(step?.title)))
    );
    const wikiEntries = rowsOf(wikiPage).filter(
      (entry) =>
        entry.id &&
        entry.game_slug &&
        (clean(entry.description).length >= 40 || clean(entry.content).length >= 40)
    );
    const gamesWithContent = new Set([...quests, ...wikiEntries].map((item) => item.game_slug));
    for (const game of rowsOf(gamesPage)) {
      if (!game.slug) continue;
      if (!gamesWithContent.has(game.slug) && clean(game.description).length < 40) continue;
      urls.push(toEntry(`${SITE_URL}/tuto-gaming/${game.slug}`, game.updated_date));
    }
    for (const quest of quests) {
      urls.push(toEntry(`${SITE_URL}/tuto-gaming/${quest.game_slug}/quest/${quest.id}`, quest.updated_date));
    }
    for (const entry of wikiEntries) {
      urls.push(toEntry(`${SITE_URL}/tuto-gaming/${entry.game_slug}/wiki/${entry.id}`, entry.updated_date));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}