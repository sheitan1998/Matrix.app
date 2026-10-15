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
  getFortniteVideoUrl,
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

test("accepts only secure MP4 or WebM Fortnite previews", () => {
  assert.equal(getFortniteVideoUrl({ video: "https://cdn.example/emote.mp4" }), "https://cdn.example/emote.mp4");
  assert.equal(getFortniteVideoUrl({ images: { animated: "https://cdn.example/skin.webm?v=2" } }), "https://cdn.example/skin.webm?v=2");
  assert.equal(getFortniteVideoUrl({ video: "http://cdn.example/emote.mp4" }), "");
  assert.equal(getFortniteVideoUrl({ video: "https://cdn.example/file.svg" }), "");
  assert.equal(getFortniteVideoUrl({ video: "   " }), "");
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
