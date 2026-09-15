import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const tauriConfigPath = path.join(repoRoot, "src-tauri", "tauri.conf.json");
const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, "utf8"));

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = ""] = arg.split("=");
    return [key.replace(/^--/, ""), value];
  })
);

const version = args.get("version") || tauriConfig.version;
const notes = args.get("notes") || "Nouvelle mise à jour de Matrix.";
const baseUrl = (args.get("base-url") || "https://matrix-hub.app/downloads").replace(/\/+$/, "");

const candidateRoots = [
  path.join(repoRoot, "src-tauri", "target", "release", "bundle"),
  path.join(repoRoot, "src-tauri", "target", "release"),
  path.join(repoRoot, "target", "release", "bundle"),
  path.join(repoRoot, "target", "release"),
];

function walk(dirPath, allFiles = []) {
  if (!fs.existsSync(dirPath)) return allFiles;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, allFiles);
      continue;
    }
    allFiles.push(fullPath);
  }
  return allFiles;
}

function detectPlatformKey(fileName) {
  const lowerName = fileName.toLowerCase();
  const isArm64 = lowerName.includes("arm64") || lowerName.includes("aarch64");
  const arch = isArm64 ? "aarch64" : "x86_64";

  if (lowerName.endsWith(".msi") || lowerName.endsWith(".exe")) return `windows-${arch}`;
  if (lowerName.endsWith(".app.tar.gz") || lowerName.endsWith(".dmg")) return `darwin-${arch}`;
  if (lowerName.endsWith(".appimage") || lowerName.endsWith(".deb") || lowerName.endsWith(".rpm")) {
    return `linux-${arch}`;
  }
  return null;
}

const bundleFiles = candidateRoots.flatMap((root) => walk(root));
const installers = bundleFiles.filter((filePath) => {
  const fileName = path.basename(filePath).toLowerCase();
  return (
    !fileName.endsWith(".sig") &&
    (fileName.endsWith(".msi") ||
      fileName.endsWith(".exe") ||
      fileName.endsWith(".appimage") ||
      fileName.endsWith(".deb") ||
      fileName.endsWith(".rpm") ||
      fileName.endsWith(".app.tar.gz") ||
      fileName.endsWith(".dmg"))
  );
});

const platforms = {};
for (const installerPath of installers) {
  const platformKey = detectPlatformKey(path.basename(installerPath));
  if (!platformKey || platforms[platformKey]) continue;

  const signaturePath = `${installerPath}.sig`;
  if (!fs.existsSync(signaturePath)) continue;

  const fileName = path.basename(installerPath);
  platforms[platformKey] = {
    signature: fs.readFileSync(signaturePath, "utf8").trim(),
    url: `${baseUrl}/${encodeURIComponent(fileName)}`,
  };
}

if (Object.keys(platforms).length === 0) {
  throw new Error("No signed updater artifact found to generate latest.json.");
}

const latestJson = {
  version,
  notes,
  pub_date: new Date().toISOString(),
  platforms,
};

fs.writeFileSync(path.join(repoRoot, "latest.json"), `${JSON.stringify(latestJson, null, 2)}\n`, "utf8");
console.log("latest.json generated:", JSON.stringify(latestJson, null, 2));
