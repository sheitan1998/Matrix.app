import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const FEED_URL = "https://gamemonetize.com/feed.php";
const MAX_PAGES = 40;
const BATCH_SIZE = 4;
const PAGE_SIZE = 48;
const CACHE_TTL_MS = 15 * 60 * 1000;
const PAGE_TIMEOUT_MS = 8000;
const PAGE_ATTEMPTS = 2;
const RETRY_DELAY_MS = 400;
const CACHE_KEY = "nexus-game-catalog";

let cache = { at: 0, games: [], source: "public-feed" };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Une page vide ou invalide signifie la fin du flux ; une erreur réseau/HTTP est remontée après un réessai court.
async function fetchPage(page) {
  let lastError;
  for (let attempt = 1; attempt <= PAGE_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(`${FEED_URL}?format=0&num=${PAGE_SIZE}&page=${page}`, {
        signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
        headers: { "User-Agent": "MATRIX-NexusGame/1.0" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      lastError = error;
      console.warn(`[gameCatalog] page ${page} tentative ${attempt}/${PAGE_ATTEMPTS} échouée: ${error?.message || error}`);
      if (attempt < PAGE_ATTEMPTS) await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  throw lastError;
}

// Cache persistant (entité) : survit aux cold starts, utilisé si le flux live échoue.
async function loadPersistedCache(base44) {
  try {
    const rows = await base44.asServiceRole.entities.GameCatalogCache.filter({ key: CACHE_KEY }, null, 1);
    const row = Array.isArray(rows) ? rows[0] : rows?.items?.[0];
    if (!row?.games_json) return null;
    const games = JSON.parse(row.games_json);
    if (!Array.isArray(games) || !games.length) return null;
    return { id: row.id, games, at: Date.parse(row.fetched_at) || 0, source: row.source || "public-feed" };
  } catch (error) {
    console.error(`[gameCatalog] lecture du cache persistant impossible: ${error?.message || error}`);
    return null;
  }
}

async function savePersistedCache(base44, games, at) {
  try {
    const entities = base44.asServiceRole.entities.GameCatalogCache;
    const rows = await entities.filter({ key: CACHE_KEY }, null, 1);
    const existing = Array.isArray(rows) ? rows[0] : rows?.items?.[0];
    const payload = {
      key: CACHE_KEY,
      games_json: JSON.stringify(games),
      total: games.length,
      source: "public-feed",
      fetched_at: new Date(at).toISOString(),
    };
    if (existing?.id) await entities.update(existing.id, payload);
    else await entities.create(payload);
  } catch (error) {
    console.error(`[gameCatalog] écriture du cache persistant impossible: ${error?.message || error}`);
  }
}

const CATEGORY_RULES = [
  { key: "Action", words: ["action", "shoot", "shooter", "fight", "combat", "battle", "war", "zombie", "ninja", "survival"] },
  { key: "Aventure", words: ["adventure", "rpg", "quest", "explore", "platform"] },
  { key: "Course", words: ["racing", "race", "car", "driving", "driver", "moto", "bike", "truck"] },
  { key: "Sport", words: ["sport", "soccer", "football", "basket", "golf", "tennis", "pool", "boxing"] },
  { key: "Puzzle", words: ["puzzle", "match", "mahjong", "block", "jigsaw", "bubble", "tile"] },
  { key: "Arcade", words: ["arcade", "retro", "classic", "runner", "endless", "flyer", "stack"] },
  { key: "Stratégie", words: ["strategy", "tower", "defense", "defence", "management", "empire", "war"] },
  { key: "Simulation", words: ["simulation", "simulator", "farm", "life", "build", "city", "tycoon"] },
  { key: "Casual", words: ["casual", "clicker", "idle", "girls", "cooking", "dress", "makeover", "hyper"] },
  { key: "Réflexion", words: ["brain", "logic", "quiz", "trivia", "math", "memory", "thinking"] },
  { key: "Multijoueur", words: ["multiplayer", "multi player", "2 player", "2player", ".io", "io game", "duo"] },
];

function deriveCategories(text) {
  return CATEGORY_RULES.filter((rule) => rule.words.some((word) => text.includes(word))).map((rule) => rule.key);
}

function normalize(game) {
  const tags = String(game.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
  const category = game.category || "Casual";
  const text = `${game.title || ""} ${category} ${tags.join(" ")}`.toLowerCase();
  const width = Number(game.width) || 0;
  const height = Number(game.height) || 0;

  const shortGame = ["casual", "arcade", "clicker", "cooking", "girls", "puzzle"].some((word) => text.includes(word));
  const hardGame = ["shoot", "battle", "survival", "war", "racing", "boss"].some((word) => text.includes(word));
  const mediumGame = ["puzzle", "strategy", "logic", "brain", "tower"].some((word) => text.includes(word));

  return {
    id: String(game.id),
    title: game.title || "Jeu sans titre",
    description: String(game.description || "").slice(0, 320),
    instructions: String(game.instructions || "").slice(0, 300),
    url: game.url,
    thumb: game.thumb,
    category,
    tags: tags.slice(0, 6),
    categories: Array.from(new Set([category, ...deriveCategories(text)])),
    width,
    height,
    format: height > width ? "portrait" : "landscape",
    compatibility: height > width ? "mobile" : "desktop",
    duration: shortGame ? "short" : "long",
    difficulty: hardGame ? "hard" : mediumGame ? "medium" : "easy",
  };
}

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action && body.action !== "catalog") {
      return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    const cachedResponse = (stale = false) => Response.json({
      games: cache.games,
      total: cache.games.length,
      cached: true,
      stale,
      source: cache.source,
      updated_at: new Date(cache.at).toISOString(),
    });

    if (!body.refresh && cache.games.length && Date.now() - cache.at < CACHE_TTL_MS) {
      return cachedResponse();
    }

    const base44 = createClientFromRequest(req);

    // Cold start : on repart du dernier catalogue valide persisté.
    if (!cache.games.length) {
      const persisted = await loadPersistedCache(base44);
      if (persisted) {
        cache = { at: persisted.at, games: persisted.games, source: persisted.source };
        if (!body.refresh && Date.now() - cache.at < CACHE_TTL_MS) return cachedResponse();
      }
    }

    // Pagination jusqu'à épuisement du flux (et non plus 3 pages fixes = 144 jeux).
    const seen = new Set();
    const games = [];
    let hadError = false;
    let exhausted = false;

    for (let start = 1; start <= MAX_PAGES && !exhausted; start += BATCH_SIZE) {
      const pageNumbers = Array.from({ length: Math.min(BATCH_SIZE, MAX_PAGES - start + 1) }, (_, i) => start + i);
      const results = await Promise.allSettled(pageNumbers.map((page) => fetchPage(page)));

      const before = games.length;
      for (const result of results) {
        if (result.status !== "fulfilled") {
          hadError = true;
          console.error(`[gameCatalog] page abandonnée: ${result.reason?.message || result.reason}`);
          continue;
        }
        const batch = result.value;
        if (batch.length < PAGE_SIZE) exhausted = true;
        for (const raw of batch) {
          if (!raw?.id || !raw?.url || seen.has(String(raw.id))) continue;
          seen.add(String(raw.id));
          games.push(normalize(raw));
        }
      }
      if (games.length === before && !hadError) exhausted = true;
    }

    if (!games.length) {
      if (cache.games.length) {
        console.error("[gameCatalog] flux live indisponible, catalogue de secours servi (stale)");
        return cachedResponse(true);
      }
      console.error("[gameCatalog] flux live indisponible et aucun cache disponible");
      return Response.json({ error: "Catalogue indisponible" }, { status: 502 });
    }

    // Une page en échec ne doit pas faire disparaître des jeux déjà connus.
    if (hadError) {
      for (const game of cache.games) {
        if (!seen.has(game.id)) { seen.add(game.id); games.push(game); }
      }
    }

    cache = { at: Date.now(), games, source: "public-feed" };
    await savePersistedCache(base44, games, cache.at);

    return Response.json({
      games,
      total: games.length,
      cached: false,
      stale: false,
      source: cache.source,
      updated_at: new Date(cache.at).toISOString(),
    });
  } catch (error) {
    console.error(`[gameCatalog] erreur inattendue: ${error?.message || error}`);
    if (cache.games.length) {
      return Response.json({
        games: cache.games,
        total: cache.games.length,
        cached: true,
        stale: true,
        source: cache.source,
        updated_at: new Date(cache.at).toISOString(),
      });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}