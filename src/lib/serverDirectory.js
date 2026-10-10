import { base44 } from "@/api/base44Client";

const DISCORD_LINK_RE = /discord\.gg|discord\.com|discordapp\.com/i;

// The invite link is the source of truth: a Discord invite = Discord universe, anything else = Nexus
export const detectServerType = (link) => (DISCORD_LINK_RE.test(link || "") ? "discord" : "nexus");

export const serverScore = (s) => (s.votes_month || 0) + (s.boosts || 0) * 2;

export const sortByScore = (list) => [...list].sort((a, b) => serverScore(b) - serverScore(a));

export const slugify = (text) =>
  (text || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Strictly isolated query: only real server ads (no player ads) of ONE universe
export const fetchUniverseServers = (serverType, extraQuery = {}) =>
  base44.entities.ServerAd.filter({ type: "server", server_type: serverType, ...extraQuery }, "-created_date", 500);

// Unified query: fetches all server ads (Nexus + Discord combined) in one call
export const fetchAllServers = (extraQuery = {}) =>
  base44.entities.ServerAd.filter({ type: "server", ...extraQuery }, "-created_date", 500);