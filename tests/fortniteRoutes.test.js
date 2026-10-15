import test from "node:test";
import assert from "node:assert/strict";
import {
  fortniteCosmeticPath,
  fortniteMapPath,
  normalizeFortniteMapCode,
} from "../src/lib/fortniteRoutes.js";
import {
  FORTNITE_MEDIA_BACKGROUND_CLASS,
  getFortniteImageCandidates,
  getFortniteMediaBadge,
  getFortniteVideoUrl,
  isOfficialFortniteVideoUrl,
} from "../src/lib/fortniteMedia.js";
import { canonicalUrl, copyText, shareOrCopy } from "../src/lib/share.js";

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

test("accepts only direct official MP4 or WebM Fortnite previews", () => {
  assert.equal(
    getFortniteVideoUrl({ gameplayItem: "https://media.fortnite-api.com/gameplay/emote.mp4" }),
    "https://media.fortnite-api.com/gameplay/emote.mp4",
  );
  assert.equal(
    getFortniteVideoUrl({ images: { animated: "https://cdn-live.prd.on.epicgames.com/skin.webm?v=2" } }),
    "https://cdn-live.prd.on.epicgames.com/skin.webm?v=2",
  );
  assert.equal(getFortniteVideoUrl({ video: "https://youtube.com/watch?v=abc" }), "");
  assert.equal(getFortniteVideoUrl({ video: "https://youtu.be/abc" }), "");
  assert.equal(getFortniteVideoUrl({ video: "https://youtube.com/embed/abc.mp4" }), "");
  assert.equal(getFortniteVideoUrl({ video: "https://cdn.example/emote.mp4" }), "");
  assert.equal(getFortniteVideoUrl({ video: "http://fortnite-api.com/emote.mp4" }), "");
  assert.equal(getFortniteVideoUrl({ video: "https://fortnite-api.com/cosmetics/emote" }), "");
  assert.equal(getFortniteVideoUrl({ video: "https://fortnite-api.com/file.mp4.html" }), "");
  assert.equal(getFortniteVideoUrl({ video: "   " }), "");
  assert.equal(isOfficialFortniteVideoUrl("https://fortnite-api.com/emote.mp4"), true);
  assert.equal(isOfficialFortniteVideoUrl("https://epicgames.com/emote.webm"), true);
  assert.equal(isOfficialFortniteVideoUrl("https://notepicgames.com/emote.mp4"), false);
});

test("Fortnite media uses required HTML5 attributes and a dark non-green fallback", async () => {
  const source = await import("node:fs/promises")
    .then(({ readFile }) => readFile(new URL("../src/components/fortnite/FortniteMedia.jsx", import.meta.url), "utf8"));
  assert.match(source, /<video[\s\S]*?\sautoPlay\s[\s\S]*?\sloop\s[\s\S]*?\smuted\s[\s\S]*?\splaysInline\s/);
  assert.equal(FORTNITE_MEDIA_BACKGROUND_CLASS, "bg-[#080b12]/95 backdrop-blur-xl");
  assert.doesNotMatch(FORTNITE_MEDIA_BACKGROUND_CLASS, /green|emerald|#(?:0f0|00ff00|22c55e)/i);
});

test("prefers official HD images and exposes contextual media badges", () => {
  const item = {
    type: "outfit",
    image: "https://cdn.example/default.png",
    images: {
      featured: "https://cdn.example/featured.png",
      large: "https://cdn.example/large.png",
      icon: "https://cdn.example/render?id=icon",
    },
  };
  assert.deepEqual(getFortniteImageCandidates(item), [
    "https://cdn.example/featured.png",
    "https://cdn.example/large.png",
    "https://cdn.example/default.png",
    "https://cdn.example/render?id=icon",
  ]);
  assert.equal(getFortniteMediaBadge(item, true), "Skin");
  assert.equal(getFortniteMediaBadge({ type: "emote" }, true), "Emote");
  assert.equal(getFortniteMediaBadge({}, true), "Statique");
});

test("builds canonical absolute Fortnite share URLs", () => {
  assert.equal(
    canonicalUrl(fortniteMapPath({ map_code: "1234-5678-9012" }), { origin: "https://matrix.example" }),
    "https://matrix.example/fortnite-maps/1234-5678-9012",
  );
  assert.equal(
    canonicalUrl(fortniteCosmeticPath({ id: "CID 001/A" }), { origin: "https://matrix.example" }),
    "https://matrix.example/fortnite-cosmetics/CID%20001%2FA",
  );
});

test("copies with the legacy clipboard fallback and reports failures", async () => {
  let copied = false;
  const input = { value: "", style: {}, setAttribute() {}, select() {}, remove() {} };
  const documentRef = {
    body: { appendChild() {} },
    createElement: () => input,
    execCommand(command) { copied = command === "copy"; return copied; },
  };
  await copyText("share me", documentRef, {});
  assert.equal(input.value, "share me");
  assert.equal(copied, true);
});

test("uses native sharing when available and falls back to the clipboard on failure", async () => {
  const result = await shareOrCopy(
    { title: "Map", text: "Fortnite", url: "https://matrix.example/fortnite-maps/1234-5678-9012" },
    { share: async () => {} },
    {},
  );
  assert.equal(result, "shared");
  let copied = "";
  const fallback = await shareOrCopy(
    { title: "Map", url: "https://matrix.example" },
    { share: async () => { throw new Error("denied"); }, clipboard: { writeText: async value => { copied = value; } } },
    {},
  );
  assert.equal(fallback, "copied");
  assert.equal(copied, "https://matrix.example");
});
