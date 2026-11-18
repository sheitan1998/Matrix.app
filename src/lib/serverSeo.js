import { SITE_URL } from "@/lib/seoRoutes";
import { serverTags } from "@/lib/serverTags";

/**
 * SEO des fiches serveurs — construit des métadonnées uniques
 * à partir des données réelles de chaque annonce.
 * Aucune valeur générique partagée entre deux serveurs.
 */

const TYPE_LABELS = {
  discord: "Serveur Discord",
  nexus: "Serveur Nexus",
};

export function serverTypeLabel(server) {
  return TYPE_LABELS[server?.server_type] || "Serveur de jeu";
}

function uniqueList(raw) {
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const name = String(item || "").replace(/\s+/g, " ").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

export function serverGames(server) {
  return uniqueList([...(server?.games || []), server?.game]);
}

/** Catégories thématiques : les marqueurs de plateforme (DISCORD / NEXUS) sont exclus. */
const PLATFORM_MARKERS = new Set(["discord", "nexus"]);

export function serverCategories(server) {
  return uniqueList([...(server?.categories || []), server?.category]).filter(
    (name) => !PLATFORM_MARKERS.has(name.toLowerCase())
  );
}

export function serverPath(server) {
  return `/servers/${server?.slug || server?.id || ""}`;
}

/** Une fiche reste indexable dès qu'elle porte un contenu propre exploitable. */
export function isServerIndexable(server) {
  if (!server) return false;
  const description = (server.description || "").trim();
  return (
    description.length >= 30 ||
    serverGames(server).length > 0 ||
    serverCategories(server).length > 0 ||
    serverTags(server).length > 0
  );
}

function truncate(text, max) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function serverSeoTitle(server) {
  const theme = uniqueList([
    ...serverGames(server).slice(0, 2),
    ...serverCategories(server).slice(0, 1),
  ]).slice(0, 2).join(" et ");
  const base = `${server.title} — ${serverTypeLabel(server)}`;
  return theme ? `${base} ${theme} | Matrix Hub` : `${base} | Matrix Hub`;
}

export function serverSeoDescription(server) {
  const description = (server.description || "").replace(/\s+/g, " ").trim();
  const games = serverGames(server);
  const categories = serverCategories(server);
  const tags = serverTags(server);
  const parts = [];

  if (description) {
    parts.push(/[.!?]$/.test(description) ? description : `${description}.`);
  } else {
    parts.push(
      `${server.title} est un ${serverTypeLabel(server).toLowerCase()} référencé dans l'annuaire Best Serveur de Matrix Hub.`
    );
  }

  if (games.length) parts.push(`Jeux : ${games.slice(0, 3).join(", ")}.`);
  else if (categories.length) parts.push(`Thème : ${categories.slice(0, 2).join(", ")}.`);

  if (tags.length) parts.push(`Étiquettes : ${tags.slice(0, 3).map((tag) => `#${tag}`).join(", ")}.`);

  const votes = Number(server.votes || 0);
  const monthVotes = Number(server.votes_month || 0);
  parts.push(
    votes || monthVotes
      ? `${votes} votes au total et ${monthVotes} votes ce mois-ci.`
      : "Votez chaque jour pour le faire progresser dans le classement."
  );

  return truncate(parts.join(" "), 158);
}

export function serverSeoSchema(server) {
  const url = `${SITE_URL}${serverPath(server)}`;
  const description = truncate((server.description || "").replace(/\s+/g, " ").trim(), 300);
  const logo = server.logo_url || server.profile_image;
  const banner = server.banner_url || server.cover_image;
  const links = [server.discord_link, server.website_url].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: serverSeoTitle(server),
        description: description || undefined,
        inLanguage: "fr-FR",
        isPartOf: { "@type": "WebSite", name: "Matrix Hub", url: SITE_URL },
        dateModified: server.updated_date || server.created_date || undefined,
        primaryImageOfPage: banner
          ? { "@type": "ImageObject", url: banner, caption: `Bannière du serveur ${server.title}` }
          : undefined,
      },
      {
        "@type": "Organization",
        "@id": `${url}#organization`,
        name: server.title,
        description: description || undefined,
        url,
        logo: logo || undefined,
        image: banner || logo || undefined,
        ...(links.length ? { sameAs: links } : {}),
      },
    ],
  };
}

/** Objet complet attendu par usePageSEO. */
export function buildServerSeo(server) {
  return {
    title: serverSeoTitle(server),
    description: serverSeoDescription(server),
    path: serverPath(server),
    image: server.banner_url || server.cover_image || server.logo_url || server.profile_image,
    imageAlt: `Bannière du serveur ${server.title} sur Matrix Hub`,
    type: "profile",
    noindex: !isServerIndexable(server),
    schema: serverSeoSchema(server),
  };
}