const MAP_CODE_RE = /^\d{4}-\d{4}-\d{4}$/;

export function normalizeFortniteMapCode(value) {
  const code = typeof value === "string" ? value.trim().toUpperCase() : "";
  return MAP_CODE_RE.test(code) ? code : "";
}

export function fortniteMapPath(map) {
  const code = normalizeFortniteMapCode(map?.map_code);
  return code ? `/fortnite-maps/${encodeURIComponent(code)}` : "/fortnite-maps";
}

export function fortniteCosmeticPath(item) {
  const id = typeof item?.id === "string" ? item.id.trim() : "";
  return id ? `/fortnite-cosmetics/${encodeURIComponent(id)}` : "/fortnite-cosmetics";
}
