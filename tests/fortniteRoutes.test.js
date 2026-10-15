import test from "node:test";
import assert from "node:assert/strict";
import {
  fortniteCosmeticPath,
  fortniteMapPath,
  normalizeFortniteMapCode,
} from "../src/lib/fortniteRoutes.js";
import { getFortniteVideoUrl } from "../src/lib/fortniteMedia.js";

test("normalizes valid Fortnite island codes", () => {
  assert.equal(normalizeFortniteMapCode(" 1234-5678-9012 "), "1234-5678-9012");
  assert.equal(normalizeFortniteMapCode("invalid"), "");
  assert.equal(normalizeFortniteMapCode(null), "");
});

test("builds canonical map links from map codes", () => {
  assert.equal(fortniteMapPath({ map_code: "1234-5678-9012" }), "/fortnite-maps/1234-5678-9012");
  assert.equal(fortniteMapPath({ map_code: "invalid" }), "/fortnite-maps");
});

test("builds encoded cosmetic links and rejects missing identifiers", () => {
  assert.equal(fortniteCosmeticPath({ id: "CID 001/A" }), "/fortnite-cosmetics/CID%20001%2FA");
  assert.equal(fortniteCosmeticPath({}), "/fortnite-cosmetics");
});

test("accepts only secure MP4 or WebM Fortnite previews", () => {
  assert.equal(getFortniteVideoUrl({ video: "https://cdn.example/emote.mp4" }), "https://cdn.example/emote.mp4");
  assert.equal(getFortniteVideoUrl({ images: { animated: "https://cdn.example/skin.webm?v=2" } }), "https://cdn.example/skin.webm?v=2");
  assert.equal(getFortniteVideoUrl({ video: "http://cdn.example/emote.mp4" }), "");
  assert.equal(getFortniteVideoUrl({ video: "https://cdn.example/file.svg" }), "");
});
