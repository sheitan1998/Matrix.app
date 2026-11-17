import { slugify } from "@/lib/serverDirectory";

/**
 * Catégories d'un serveur.
 * Les annonces récentes stockent un tableau (categories / category_slugs),
 * les plus anciennes une seule valeur (category / category_slug).
 * Retourne toujours [{ name, slug }].
 */
export function serverCategoryList(server) {
  const names = Array.isArray(server?.categories) && server.categories.length
    ? server.categories
    : server?.category ? [server.category] : [];
  const slugs = Array.isArray(server?.category_slugs) && server.category_slugs.length
    ? server.category_slugs
    : server?.category_slug ? [server.category_slug] : [];

  return names
    .filter(Boolean)
    .map((name, index) => ({ name, slug: slugs[index] || slugify(name) }));
}

/** true si le serveur possède la catégorie demandée ({ slug, name }). */
export function serverMatchesCategory(server, category) {
  if (!category?.slug) return true;
  return serverCategoryList(server).some(
    (item) => item.slug === category.slug || (category.name && item.name === category.name)
  );
}