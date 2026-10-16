const MODRINTH_API = "https://api.modrinth.com/v2";

/**
 * @typedef {{
 *   project_id: string;
 *   slug: string;
 *   author: string;
 *   title: string;
 *   description: string;
 *   project_type: "mod" | "modpack" | "shader" | "resourcepack";
 *   categories: string[];
 *   versions: string[];
 *   downloads: number;
 *   follows: number;
 *   icon_url: string | null;
 * }} ModrinthSearchHit
 */

/**
 * @typedef {{
 *   id: string;
 *   slug: string;
 *   title: string;
 *   description: string;
 *   body: string;
 *   project_type: string;
 *   downloads: number;
 *   followers: number;
 *   icon_url: string | null;
 *   loaders: string[];
 *   game_versions: string[];
 *   gallery: Array<{ url: string; title?: string; description?: string; featured?: boolean }>;
 * }} ModrinthProject
 */

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   version_number: string;
 *   date_published: string;
 *   game_versions: string[];
 *   loaders: string[];
 *   files: Array<{ url: string; filename: string; primary: boolean; size: number }>;
 * }} ModrinthVersion
 */

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isSearchHit(value) {
  return isObject(value)
    && typeof value.project_id === "string"
    && typeof value.slug === "string"
    && typeof value.title === "string"
    && typeof value.author === "string"
    && typeof value.description === "string"
    && typeof value.project_type === "string"
    && isStringArray(value.categories)
    && isStringArray(value.versions);
}

function isProject(value) {
  return isObject(value)
    && typeof value.id === "string"
    && typeof value.title === "string"
    && typeof value.body === "string"
    && isStringArray(value.loaders)
    && isStringArray(value.game_versions)
    && Array.isArray(value.gallery);
}

function isVersion(value) {
  return isObject(value)
    && typeof value.id === "string"
    && typeof value.version_number === "string"
    && isStringArray(value.game_versions)
    && isStringArray(value.loaders)
    && Array.isArray(value.files)
    && value.files.every((file) => isObject(file)
      && typeof file.url === "string"
      && typeof file.filename === "string");
}

async function fetchJson(path, signal) {
  const response = await fetch(`${MODRINTH_API}${path}`, {
    signal,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Modrinth a répondu avec le statut ${response.status}.`);
  }

  return response.json();
}

export function buildModrinthFacets({ projectType, loader, versionFamily }) {
  const facets = [];
  if (projectType) facets.push([`project_type:${projectType}`]);
  if (loader) facets.push([`categories:${loader.toLowerCase()}`]);
  if (versionFamily) {
    const versions = versionFamily === "1.21.x"
      ? ["1.21", "1.21.1", "1.21.2", "1.21.3", "1.21.4", "1.21.5", "1.21.6", "1.21.7", "1.21.8", "1.21.9", "1.21.10"]
      : versionFamily === "1.20.x"
        ? ["1.20", "1.20.1", "1.20.2", "1.20.3", "1.20.4", "1.20.5", "1.20.6"]
        : versionFamily === "1.19.x"
          ? ["1.19", "1.19.1", "1.19.2", "1.19.3", "1.19.4"]
          : ["1.18", "1.18.1", "1.18.2"];
    facets.push(versions.map((version) => `versions:${version}`));
  }
  return facets;
}

export async function searchModrinth({
  query,
  projectType,
  loader,
  versionFamily,
  offset = 0,
  limit = 12,
  signal = undefined,
}) {
  const params = new URLSearchParams({
    query,
    limit: String(limit),
    offset: String(offset),
    index: query ? "relevance" : "downloads",
    facets: JSON.stringify(buildModrinthFacets({ projectType, loader, versionFamily })),
  });
  const data = await fetchJson(`/search?${params}`, signal);

  if (!isObject(data) || !Array.isArray(data.hits) || !data.hits.every(isSearchHit)) {
    throw new Error("La réponse de recherche Modrinth est invalide.");
  }

  return {
    hits: data.hits,
    totalHits: typeof data.total_hits === "number" ? data.total_hits : data.hits.length,
  };
}

export async function getModrinthProject(projectId, signal) {
  const data = await fetchJson(`/project/${encodeURIComponent(projectId)}`, signal);
  if (!isProject(data)) throw new Error("La fiche Modrinth reçue est invalide.");
  return data;
}

export async function getModrinthVersions(projectId, signal) {
  const data = await fetchJson(`/project/${encodeURIComponent(projectId)}/version`, signal);
  if (!Array.isArray(data) || !data.every(isVersion)) {
    throw new Error("Les versions Modrinth reçues sont invalides.");
  }
  return data;
}
