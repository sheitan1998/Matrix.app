import test from "node:test";
import assert from "node:assert/strict";
import {
  fortniteCosmeticPath,
  fortniteMapPath,
  normalizeFortniteMapCode,
} from "../src/lib/fortniteRoutes.js";
import {
  getFortniteImageCandidates,
  getFortniteMediaBadge,
  getFortniteVideoCandidates,
  getFortniteVideoUrl,
  isOfficialFortniteVideoUrl,
} from "../src/lib/fortniteMedia.js";
import { getFortniteItemStyle, getRarityStyle } from "../src/components/fortnite/rarityUtils.js";
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

test("extracts official direct videos from explicit nested API fields", () => {
  const item = {
    showcaseVideo: "zE5ceBq3ylI",
    video: { url: "https://media.fortnite-api.com/cosmetics/main.mp4" },
    gameplayItem: [{ videoUrl: "https://cdn-live.prd.on.epicgames.com/gameplay.webm" }],
    displayAssets: [{ videos: [{ src: "https://cdn.fortnite-api.com/assets/preview.mp4" }] }],
    newDisplayAsset: { video: "https://youtube.com/embed/not-allowed.mp4" },
  };
  assert.deepEqual(getFortniteVideoCandidates(item), [
    "https://media.fortnite-api.com/cosmetics/main.mp4",
    "https://cdn-live.prd.on.epicgames.com/gameplay.webm",
    "https://cdn.fortnite-api.com/assets/preview.mp4",
  ]);
  assert.equal(getFortniteVideoUrl({ showcaseVideo: "zE5ceBq3ylI" }), "");
  assert.equal(getFortniteVideoUrl({ video: "https://fnggcdn.com/items/3740/video.mp4" }), "");
});

test("Fortnite media keeps the official background and image fallback under native video", async () => {
  const source = await import("node:fs/promises")
    .then(({ readFile }) => readFile(new URL("../src/components/fortnite/FortniteMedia.jsx", import.meta.url), "utf8"));
  assert.match(source, /<video[\s\S]*?\sautoPlay\s[\s\S]*?\sloop\s[\s\S]*?\smuted\s[\s\S]*?\splaysInline\s/);
  assert.match(source, /onError=\{advanceVideoCandidate\}/);
  assert.match(source, /setVideoIndex\(index => index \+ 1\)/);
  assert.match(source, /setVideoIndex\(0\)/);
  assert.ok(source.indexOf("<img") < source.indexOf("<video"), "the image fallback stays mounted behind video candidates");
  assert.doesNotMatch(source, /Vidéo indisponible/);
  assert.match(source, /className="w-full h-full object-cover"/);
});

test("uses API colors first and faithful series or rarity backgrounds as fallback", () => {
  const apiStyle = getFortniteItemStyle({
    rarity: "rare",
    shop_colors: { color1: "5cf2f3ff", color3: "004c71ff" },
  });
  assert.match(apiStyle.bg, /#5cf2f3 0%/);
  assert.match(apiStyle.bg, /#004c71 100%/);
  assert.equal(getFortniteItemStyle({ series: "Icon Series", rarity: "uncommon" }).bg, getRarityStyle("icon").bg);
  assert.equal(getFortniteItemStyle({ series: "Marvel Series" }).bg, getRarityStyle("marvel").bg);
  assert.equal(getFortniteItemStyle({ series: "Star Wars Series" }).bg, getRarityStyle("starwars").bg);
  assert.equal(getFortniteItemStyle({ series: "Gaming Legends Series" }).bg, getRarityStyle("gaminglegends").bg);
  assert.equal(getFortniteItemStyle({ rarity: "legendary" }).bg, getRarityStyle("legendary").bg);
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
