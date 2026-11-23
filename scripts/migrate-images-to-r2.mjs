#!/usr/bin/env node
/**
 * Batch migration: compress + resize existing images and move them to Cloudflare R2.
 * See scripts/README-images.md. Never deletes or overwrites old files/URLs.
 *
 *   node scripts/migrate-images-to-r2.mjs --dry-run
 *   node scripts/migrate-images-to-r2.mjs --entity Listing --limit 50
 *   node scripts/migrate-images-to-r2.mjs --rollback migration-output/rollback.json
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { parseArgs } from "node:util";
import sharp from "sharp";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@base44/sdk";
import { computeTargetSize, getUsagePreset, shouldSkipOptimization } from "../src/lib/imageSizing.js";

// entity -> { field: usage }. Array fields are handled item by item.
const TARGETS = {
  Listing: { photos: "listing" },
  ServerAd: {
    gallery_images: "gallery",
    cover_image: "banner",
    banner_url: "banner",
    profile_image: "thumbnail",
    logo_url: "icon",
    server_icon: "icon",
  },
  Server: { icon_url: "icon", banner_url: "banner" },
  CreatorChannel: { avatar_url: "thumbnail", banner_url: "banner" },
};

const { values: args } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
    entity: { type: "string", multiple: true },
    limit: { type: "string" },
    out: { type: "string", default: "migration-output" },
    rollback: { type: "string" },
    help: { type: "boolean", default: false },
  },
});

if (args.help) {
  console.log("Flags: --dry-run  --entity <Name> (repeatable)  --limit <n records/entity>  --out <dir>  --rollback <rollback.json>");
  process.exit(0);
}

function requireEnv(names) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    console.error(`Missing environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}

const readJson = (file, fallback) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback);
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

requireEnv(["BASE44_APP_ID", "BASE44_TOKEN"]);
const base44 = createClient({
  appId: process.env.BASE44_APP_ID,
  token: process.env.BASE44_TOKEN,
  serverUrl: process.env.BASE44_SERVER_URL || "https://base44.app",
  requiresAuth: false,
});

// ---- Rollback: restore previous values recorded during a migration run
if (args.rollback) {
  const entries = readJson(args.rollback, []);
  for (const e of entries) {
    if (args["dry-run"]) { console.log(`[dry-run] restore ${e.entity}#${e.id}`); continue; }
    await base44.entities[e.entity].update(e.id, e.before);
    console.log(`restored ${e.entity}#${e.id}`);
  }
  process.exit(0);
}

requireEnv(["R2_ENDPOINT", "R2_BUCKET", "R2_PUBLIC_URL", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"]);
const PUBLIC_BASE = process.env.R2_PUBLIC_URL.replace(/\/+$/, "");
const BUCKET = process.env.R2_BUCKET;
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT.replace(/\/+$/, ""),
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});

fs.mkdirSync(args.out, { recursive: true });
const MAP_FILE = path.join(args.out, "url-map.json");
const ROLLBACK_FILE = path.join(args.out, "rollback.json");
const REPORT_FILE = path.join(args.out, "report.json");
const urlMap = readJson(MAP_FILE, {}); // old URL -> { new, key, bytesBefore, bytesAfter }
const rollback = readJson(ROLLBACK_FILE, []);
const report = { startedAt: new Date().toISOString(), dryRun: args["dry-run"], items: [], totals: {} };
const counts = { migrated: 0, reused: 0, skipped: 0, failed: 0, bytesBefore: 0, bytesAfter: 0 };

function logItem(item) {
  report.items.push(item);
  console.log(`${item.status.padEnd(9)} ${item.entity}#${item.id}.${item.field} ${item.url}${item.reason ? ` (${item.reason})` : ""}`);
}

async function processUrl(url, usage) {
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) return { status: "skipped", reason: "not-http" };
  if (url.startsWith(`${PUBLIC_BASE}/`)) return { status: "skipped", reason: "already-on-r2" };
  if (urlMap[url]) return { status: "reused", newUrl: urlMap[url].new };
  if (shouldSkipOptimization({ name: new URL(url).pathname })) return { status: "skipped", reason: "gif/svg/video" };

  const res = await fetch(url);
  if (!res.ok) return { status: "failed", reason: `download ${res.status}` };
  const type = res.headers.get("content-type") || "";
  if (!type.startsWith("image/") || shouldSkipOptimization({ type })) return { status: "skipped", reason: `type ${type}` };
  const input = Buffer.from(await res.arrayBuffer());

  const meta = await sharp(input, { animated: true }).metadata();
  if ((meta.pages || 1) > 1) return { status: "skipped", reason: "animated" };

  const preset = getUsagePreset(usage);
  const target = computeTargetSize(meta.width, meta.height, preset.maxEdge);
  const output = await sharp(input)
    .rotate()
    .resize({ width: target.width, height: target.height, fit: "inside", withoutEnlargement: true })
    .webp({ quality: Math.round(preset.quality * 100) })
    .toBuffer();
  if (!target.resized && output.length >= input.length) return { status: "skipped", reason: "not-smaller" };

  // Deterministic key => re-running never creates duplicates.
  const key = `migrated/${preset.folder}/${crypto.createHash("sha1").update(url).digest("hex").slice(0, 20)}.webp`;
  const newUrl = `${PUBLIC_BASE}/${key}`;
  if (args["dry-run"]) {
    return { status: "dry-run", newUrl, bytesBefore: input.length, bytesAfter: output.length };
  }

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET, Key: key, Body: output, ContentType: "image/webp",
    CacheControl: "public, max-age=31536000, immutable",
  }));
  const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
  if (head.ContentLength !== output.length) return { status: "failed", reason: "r2 verify size mismatch" };
  const check = await fetch(newUrl, { method: "HEAD" });
  if (!check.ok) return { status: "failed", reason: `public url ${check.status}` };

  urlMap[url] = { new: newUrl, key, bytesBefore: input.length, bytesAfter: output.length };
  writeJson(MAP_FILE, urlMap);
  return { status: "migrated", newUrl, bytesBefore: input.length, bytesAfter: output.length };
}

const entities = args.entity?.length ? args.entity : Object.keys(TARGETS);
const limit = args.limit ? Number(args.limit) : Infinity;
const PAGE = 100;

for (const entity of entities) {
  const fields = TARGETS[entity];
  if (!fields) { console.error(`Unknown entity: ${entity}`); continue; }
  let seen = 0;
  for (let skip = 0; seen < limit; skip += PAGE) {
    const records = await base44.entities[entity].list("created_date", PAGE, skip);
    if (!records?.length) break;
    for (const rec of records) {
      if (seen++ >= limit) break;
      const before = {};
      const after = {};
      for (const [field, usage] of Object.entries(fields)) {
        const value = rec[field];
        if (!value) continue;
        const urls = Array.isArray(value) ? value : [value];
        const replaced = [];
        for (const url of urls) {
          let r;
          try { r = await processUrl(url, usage); } catch (e) { r = { status: "failed", reason: e.message }; }
          const bucket = r.status === "dry-run" ? "migrated" : r.status;
          counts[bucket] += 1;
          counts.bytesBefore += r.bytesBefore || 0;
          counts.bytesAfter += r.bytesAfter || 0;
          logItem({ entity, id: rec.id, field, url, status: r.status, newUrl: r.newUrl, reason: r.reason, bytesBefore: r.bytesBefore, bytesAfter: r.bytesAfter });
          replaced.push(r.newUrl && (r.status === "migrated" || r.status === "reused") ? r.newUrl : url);
        }
        if (replaced.some((u, i) => u !== urls[i])) {
          before[field] = value;
          after[field] = Array.isArray(value) ? replaced : replaced[0];
        }
      }
      // References are only updated after every new file is uploaded and verified.
      if (Object.keys(after).length && !args["dry-run"]) {
        rollback.push({ entity, id: rec.id, before, after, at: new Date().toISOString() });
        writeJson(ROLLBACK_FILE, rollback);
        await base44.entities[entity].update(rec.id, after);
      }
    }
    if (records.length < PAGE) break;
  }
}

report.finishedAt = new Date().toISOString();
report.totals = { ...counts, savedBytes: counts.bytesBefore - counts.bytesAfter };
writeJson(REPORT_FILE, report);
console.log("\nDone:", report.totals, `\nReport: ${REPORT_FILE}`);
