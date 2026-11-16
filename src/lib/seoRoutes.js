import { pickOgImage, pickOgImageAlt, ogCategory } from "@/lib/ogImages";

export const SITE_URL = "https://matrix-hub.app";
export const SITE_NAME = "Matrix Hub";
export const SITE_LOCALE = "en_US";
export const DEFAULT_IMAGE =
  "https://media.base44.com/images/public/69e14a987a927963a9924d5a/d423a042e_Code_Generated_Image1.png";

/**
 * English titles, descriptions and Open Graph visuals for every public route.
 * Title format: "[Page name] — Matrix Hub" or "Matrix Hub — ..." for the home page.
 * `image` overrides the thematic image automatically assigned by ogCategory().
 */
const ROUTES = {
  "/": {
    title: "Matrix Hub — Live streaming, gaming servers & creator community",
    description:
      "Matrix Hub brings YouTube and Twitch streaming, Nexus and Discord game servers, creator tools, mini-games and a worldwide gaming community together in one platform.",
  },
  "/stream": {
    title: "Video streaming and live channels — Matrix Hub",
    description:
      "Watch videos, shorts and live streams, launch your own channel and edit your clips with the built-in Matrix Hub studio.",
  },
  "/trending": {
    title: "Trending videos and streams — Matrix Hub",
    description:
      "Discover the most watched videos, live streams and shorts trending across the Matrix Hub streaming community.",
  },
  "/twitch": {
    title: "Live on Twitch — Matrix Hub",
    description:
      "Follow your favourite Twitch streams, browse categories and chat with the community live on Matrix Hub.",
  },
  "/nexus": {
    title: "Nexus — Gaming hubs, voice rooms and community servers — Matrix Hub",
    description:
      "Join Matrix Hub Nexus servers: text and voice channels, custom roles, forums and community moderation built for gamers worldwide.",
  },
  "/shorts": {
    title: "Shorts — Short and viral game clips — Matrix Hub",
    description:
      "Scroll Matrix Hub Shorts: gaming clips, stream highlights and short videos from the creative community.",
  },
  "/best-serveurs": {
    title: "Best Serveur — Game server directory — Matrix Hub",
    description:
      "Browse and vote for the best game servers: Nexus and Discord communities, categories, player recruitment and community ads.",
  },
  "/best-creator": {
    title: "Best Creator — YouTube and Twitch creator rankings — Matrix Hub",
    description:
      "Discover and vote for the best content creators on YouTube, Twitch, TikTok, Instagram and Snapchat with monthly Matrix Hub rankings.",
  },
  "/nexus-game": {
    title: "Nexus Game — Online games and virtual casino — Matrix Hub",
    description:
      "Explore the Nexus Game catalogue: roulette, slots, blackjack, scratch cards and hundreds of HTML5 games playable on Matrix Hub with the TRIX virtual currency.",
  },
  "/progression": {
    title: "Levels, achievements and progression — Matrix Hub",
    description:
      "Track your Matrix Hub progression: levels, achievements, XP, leaderboards and community rewards.",
  },
  "/tuto-gaming": {
    title: "Tuto Gaming — Game guides, wikis and walkthroughs — Matrix Hub",
    description:
      "Guides, tutorials, collaborative wikis and databases for your favourite games: Farming Simulator, Fortnite, Minecraft, Dofus and many more on Matrix Hub.",
  },
  "/farming": {
    title: "Farming Simulator 25 — Mods, guides and tutorials — Matrix Hub",
    description:
      "Download Farming Simulator 25 mods, read tutorials and browse community categories and tips to progress faster on Matrix Hub.",
  },
  "/minecraft": {
    title: "Minecraft — Mods, encyclopedia and guides — Matrix Hub",
    description:
      "Explore Minecraft on Matrix Hub: Modrinth mod catalogue, block encyclopedia, crafting recipes and community guides.",
  },
  "/dofus": {
    title: "Dofus — Stuff builder, classes, quests and guides — Matrix Hub",
    description:
      "Optimise your Dofus character: stuff builder, characteristics, classes, spells, quests, almanax and world maps on Matrix Hub.",
  },
  "/rocket-league": {
    title: "Rocket League — Shop, presets and stats — Matrix Hub",
    description:
      "Track the Rocket League item shop, build your car presets, browse the item catalogue and check rank statistics on Matrix Hub.",
  },
  "/valheim": {
    title: "Valheim — Guides, bosses, gear and seeds — Matrix Hub",
    description:
      "Valheim guides, bosses, equipment, resources and seed sharing: find the perfect map and progress with the Matrix Hub community.",
  },
  "/rust": {
    title: "Rust — Raid calculator, guides and servers — Matrix Hub",
    description:
      "Calculate your raids, read base-building guides and find servers and resources to survive longer in Rust on Matrix Hub.",
  },
  "/valorant": {
    title: "Valorant — Agents, weapons and guides — Matrix Hub",
    description:
      "Agent profiles, weapon statistics, maps and Valorant guides to prepare your matches and climb the competitive ranks on Matrix Hub.",
  },
  "/gta-6": {
    title: "GTA VI — News, vehicles and guides — Matrix Hub",
    description:
      "Everything about GTA VI: news, vehicles, characters, weapons, locations and community guides ahead of launch on Matrix Hub.",
  },
  "/fortnite-maps": {
    title: "Fortnite Maps — Creative map codes — Matrix Hub",
    description:
      "Find the best Fortnite map codes: tycoon, horror, deathrun, parkour, RPG and battle royale maps with stats and community votes.",
  },
  "/fortnite-shop": {
    title: "Fortnite item shop today — Skins and items — Matrix Hub",
    description:
      "Browse today's Fortnite item shop: skins, pickaxes, emotes and V-Bucks packs updated daily on Matrix Hub.",
  },
  "/fortnite-cosmetics": {
    title: "Fortnite cosmetics — Skins, pickaxes and emotes — Matrix Hub",
    description:
      "Browse the full Fortnite cosmetics catalogue: outfits, back blings, pickaxes, emotes and rarities, search and vote on Matrix Hub.",
  },
  "/fortnite-stats": {
    title: "Fortnite stats — Player profiles and leaderboards — Matrix Hub",
    description:
      "Look up any Fortnite player's stats: wins, K/D, ranks and career history directly on Matrix Hub.",
  },
  "/about": {
    title: "About Matrix Hub — The all-in-one gaming platform",
    description:
      "Learn about the Matrix Hub mission: bringing streaming, community, games and creative tools together for creators and gamers worldwide.",
  },
  "/contact": {
    title: "Contact and support — Matrix Hub",
    description:
      "Contact the Matrix Hub team about a question, a partnership, a technical issue or a community moderation request.",
  },
  "/privacy": {
    title: "Privacy and cookie policy — Matrix Hub",
    description:
      "How Matrix Hub collects, uses and protects your personal data: cookies, connected services, payments, hosting and your rights.",
  },
};

/** Member / private routes: never indexed. */
const NOINDEX_PREFIXES = [
  "/admin",
  "/mon-profil",
  "/profil-createur",
  "/profile",
  "/wallet",
  "/notifications",
  "/oauth",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/mfa",
  "/dashboard",
  "/upload",
  "/studio",
  "/live-bot",
  "/affiliate",
  "/boutique-matrix",
  "/boutique-nexus",
  "/market",
  "/recherche-joueur",
  "/recherche-createur",
  "/playlists",
  "/outils",
  "/video-studio",
  "/subscriptions",
  "/trending",
  "/watch",
  "/live",
  "/channel",
  "/search",
  "/nexus/invite",
  "/auth",
  "/experience",
  "/vue",
];

function titleize(slug) {
  return String(slug || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Game / server / listing / content detail pages: metadata built from the slug. */
function resolveDynamic(parts) {
  if (parts[0] === "tuto-gaming" && parts[1] && !parts[2]) {
    const game = titleize(parts[1]);
    return {
      title: `${game} — Guides, wiki and walkthroughs — Matrix Hub`,
      description: `${game} guides, tutorials, collaborative wiki and tips shared by the Matrix Hub gaming community.`,
      image: pickOgImage("/tuto-gaming"),
    };
  }
  if (parts[0] === "tuto-gaming" && parts[2] === "quest") {
    const game = titleize(parts[1]);
    return {
      title: `${game} quest — Step-by-step guide — Matrix Hub`,
      description: `Complete walkthrough of this ${game} quest on Matrix Hub: steps, rewards and community tips.`,
      image: pickOgImage("/tuto-gaming"),
    };
  }
  if (parts[0] === "tuto-gaming" && parts[2] === "wiki") {
    const game = titleize(parts[1]);
    return {
      title: `${game} wiki entry — Data and tips — Matrix Hub`,
      description: `${game} wiki entry on Matrix Hub: item details, stats, tips and community contributions.`,
      image: pickOgImage("/tuto-gaming"),
    };
  }
  if (parts[0] === "tuto-gaming" && parts[1] === "farming-simulator-25" && parts[2] === "mods") {
    return {
      title: "Farming Simulator 25 mods — Download and install — Matrix Hub",
      description:
        "Browse Farming Simulator 25 mods on Matrix Hub: tractors, tools, maps and installation guides for PC and console.",
      image: pickOgImage("/farming"),
    };
  }
  if (parts[0] === "tuto-gaming" && parts[1] === "farming-simulator-25" && parts[2]) {
    const category = titleize(parts[2]);
    return {
      title: `Farming Simulator 25 — ${category} mods — Matrix Hub`,
      description: `${category} mods for Farming Simulator 25 on Matrix Hub: downloads, descriptions and community ratings.`,
      image: pickOgImage("/farming"),
    };
  }
  if (parts[0] === "jeu" && parts[1]) {
    const game = titleize(parts[1]);
    return {
      title: `${game} — Shop, quests and achievements — Matrix Hub`,
      description: `${game} database on Matrix Hub: in-game shop, quests, collections and achievements with live public data.`,
      image: pickOgImage("/jeu"),
    };
  }
  if (parts[0] === "servers" && parts[1]) {
    const name = titleize(parts[1]);
    return {
      title: `${name} — Game server profile — Matrix Hub`,
      description: `Discover ${name} on Matrix Hub: description, votes, boosts and how to join this gaming community server.`,
      image: pickOgImage("/best-serveurs"),
    };
  }
  if (parts[0] === "best-serveurs" && parts[1] === "category" && parts[2]) {
    const category = titleize(parts[2]);
    return {
      title: `${category} game servers — Best Serveur — Matrix Hub`,
      description: `Directory of ${category} game servers ranked by votes on Matrix Hub: descriptions, links and player recruitment.`,
      image: pickOgImage("/best-serveurs"),
    };
  }
  if (parts[0] === "creator" && parts[1]) {
    const name = titleize(parts[1]);
    return {
      title: `${name} — Creator profile — Matrix Hub`,
      description: `Public profile of ${name} on Matrix Hub: channels, content and links from the creator community.`,
      image: pickOgImage("/creator"),
    };
  }
  if (parts[0] === "fortnite-maps" && parts[1]) {
    const code = titleize(parts[1]);
    return {
      title: `Fortnite map ${code} — Creative code and stats — Matrix Hub`,
      description: `Fortnite creative map ${code} on Matrix Hub: gameplay details, statistics, player votes and the map code to play it.`,
      image: pickOgImage("/fortnite-maps"),
    };
  }
  if (parts[0] === "fortnite-cosmetics" && parts[1]) {
    const name = titleize(parts[1]);
    return {
      title: `${name} — Fortnite cosmetic — Matrix Hub`,
      description: `${name} Fortnite cosmetic on Matrix Hub: images, rarity, release details and community votes.`,
      image: pickOgImage("/fortnite-cosmetics"),
    };
  }
  if (parts[0] === "page" && parts[1]) {
    const name = titleize(parts[1]);
    return {
      title: `${name} — Matrix Hub`,
      description: `${name} on Matrix Hub: live streaming, gaming hubs and community servers.`,
      image: pickOgImage("/page"),
    };
  }
  if (parts[0] === "twitch" && parts[1] === "watch" && parts[2]) {
    const channel = titleize(parts[2]);
    return {
      title: `${channel} — Twitch live stream — Matrix Hub`,
      description: `Watch ${channel} live on Matrix Hub with Twitch chat, stream info and viewer statistics.`,
      image: pickOgImage("/twitch/watch"),
    };
  }
  if (parts[0] === "twitch" && parts[1] === "channel" && parts[2]) {
    const channel = titleize(parts[2]);
    return {
      title: `${channel} — Twitch channel profile — Matrix Hub`,
      description: `${channel} on Matrix Hub: stream schedule, latest videos, clips and channel statistics.`,
      image: pickOgImage("/twitch/channel"),
    };
  }
  if (parts[0] === "twitch" && parts[1] === "category" && parts[2]) {
    const category = titleize(parts[2]);
    return {
      title: `${category} — Live Twitch streams — Matrix Hub`,
      description: `Watch ${category} live streams on Matrix Hub: top channels, viewers and live gameplay.`,
      image: pickOgImage("/twitch"),
    };
  }
  if (parts[0] === "watch" && parts[1]) {
    return {
      title: "Watch video — Matrix Hub",
      description: "Watch this video on Matrix Hub with comments, related content and creator information.",
      noindex: true,
      image: pickOgImage("/watch"),
    };
  }
  if (parts[0] === "live" && parts[1]) {
    return {
      title: "Live stream — Matrix Hub",
      description: "Watch this live stream on Matrix Hub with real-time chat, reactions and viewer count.",
      noindex: true,
      image: pickOgImage("/live"),
    };
  }
  if (parts[0] === "channel" && parts[1]) {
    return {
      title: "Creator channel — Matrix Hub",
      description: "Creator channel on Matrix Hub: videos, streams, playlists and subscriber information.",
      noindex: true,
      image: pickOgImage("/channel"),
    };
  }
  return null;
}

/**
 * resolveSeo — metadata to apply for a given pathname.
 * Every route receives an English title, description and Open Graph image.
 */
export function resolveSeo(pathname) {
  const path = (pathname || "/").replace(/\/+$/, "") || "/";
  const parts = path.split("/").filter(Boolean);
  const image = pickOgImage(path);
  const imageAlt = pickOgImageAlt(path);

  const finish = (seo) => ({
    image,
    imageAlt,
    type: "website",
    ogCategory: ogCategory(path),
    ...seo,
    path,
  });

  if (ROUTES[path]) return finish(ROUTES[path]);

  const dynamic = resolveDynamic(parts);
  if (dynamic) return finish(dynamic);

  const isPrivate = NOINDEX_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/")
  );
  if (isPrivate || parts[0] === "404") {
    return finish({
      noindex: true,
      title: "Member area — Matrix Hub",
      description: "Private Matrix Hub area, available after signing in to your account.",
    });
  }

  // Toute autre route reçoit quand même un titre et une description anglais.
  const label = titleize(parts[parts.length - 1] || "Home");
  return finish({
    title: `${label} — Matrix Hub`,
    description: `${label} on Matrix Hub: live streaming, gaming guides, community servers and creator tools.`,
  });
}