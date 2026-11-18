import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const SITE_URL = "https://matrix-hub.app";
const MIN_SERVER_DESCRIPTION = 120;
const MIN_CREATOR_DESCRIPTION = 80;
const MAX_URLS = 2000;

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

    const [serversPage, creatorsPage] = await Promise.allSettled([
      base44.asServiceRole.entities.ServerAd.filter({ type: "server" }, { sort: "-updated_date", limit: MAX_URLS }),
      base44.asServiceRole.entities.CreatorChannel.filter({ is_active: true }, { sort: "-updated_date", limit: MAX_URLS }),
    ]);

    const urls = [];

    const servers = serversPage.status === "fulfilled" ? serversPage.value.items || [] : [];
    for (const server of servers) {
      const slug = server.slug || server.id;
      const description = (server.description || "").replace(/\s+/g, " ").trim();
      if (!slug || description.length < MIN_SERVER_DESCRIPTION) continue;
      urls.push(toEntry(`${SITE_URL}/servers/${slug}`, server.updated_date));
    }

    const creators = creatorsPage.status === "fulfilled" ? creatorsPage.value.items || [] : [];
    for (const creator of creators) {
      const slug = creator.slug || creator.id;
      const description = (creator.description || "").replace(/\s+/g, " ").trim();
      if (!slug || description.length < MIN_CREATOR_DESCRIPTION) continue;
      urls.push(toEntry(`${SITE_URL}/createur/${slug}`, creator.updated_date));
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