const FEED_URL = "https://gamemonetize.com/feed.php";
const PAGES = 3;
const PAGE_SIZE = 48;
const CACHE_TTL_MS = 15 * 60 * 1000;

let cache = { at: 0, games: [], source: "public-feed" };

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

    if (cache.games.length && Date.now() - cache.at < CACHE_TTL_MS) {
      return Response.json({
        games: cache.games,
        total: cache.games.length,
        cached: true,
        source: cache.source,
        updated_at: new Date(cache.at).toISOString(),
      });
    }

    const requests = Array.from({ length: PAGES }, (_, index) =>
      fetch(`${FEED_URL}?format=0&num=${PAGE_SIZE}&page=${index + 1}`, {
        signal: AbortSignal.timeout(15000),
        headers: { "User-Agent": "MATRIX-NexusGame/1.0" },
      })
    );

    const responses = await Promise.allSettled(requests);
    const batches = await Promise.allSettled(
      responses
        .filter((result) => result.status === "fulfilled" && result.value.ok)
        .map((result) => result.value.json())
    );

    const seen = new Set();
    const games = [];
    for (const batch of batches) {
      if (batch.status !== "fulfilled" || !Array.isArray(batch.value)) continue;
      for (const raw of batch.value) {
        if (!raw?.id || !raw?.url || seen.has(String(raw.id))) continue;
        seen.add(String(raw.id));
        games.push(normalize(raw));
      }
    }

    if (!games.length) {
      if (cache.games.length) {
        return Response.json({
          games: cache.games,
          total: cache.games.length,
          cached: true,
          source: cache.source,
          updated_at: new Date(cache.at).toISOString(),
        });
      }
      return Response.json({ error: "Catalogue indisponible" }, { status: 502 });
    }

    cache = { at: Date.now(), games, source: "public-feed" };

    return Response.json({
      games,
      total: games.length,
      cached: false,
      source: cache.source,
      updated_at: new Date(cache.at).toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}