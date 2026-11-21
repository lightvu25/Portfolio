import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ASSET_DIR = path.join(ROOT, "asset");
const PUBLIC_DIR = path.join(ROOT, "public");

function toAsciiSlug(rawName) {
  return rawName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (m) => (m === "đ" ? "d" : "D"))
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function syncFolder(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return [];
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  const synced = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    fs.copyFileSync(srcPath, destPath);
    synced.push({ name: entry.name, srcPath, destPath });
  }
  return synced;
}

const syncedAvatars = syncFolder(
  path.join(ASSET_DIR, "avatar"),
  path.join(PUBLIC_DIR, "asset", "avatar")
);

const syncedCvs = syncFolder(
  path.join(ASSET_DIR, "cv"),
  path.join(PUBLIC_DIR, "asset", "cv")
);

const asciiCvs = [];
const publicCvDir = path.join(PUBLIC_DIR, "cv");
if (syncedCvs.length > 0) {
  fs.mkdirSync(publicCvDir, { recursive: true });
  for (const item of syncedCvs) {
    const ext = path.extname(item.name);
    if (ext.toLowerCase() !== ".pdf") continue;
    const base = path.basename(item.name, ext);
    const asciiName = `${toAsciiSlug(base)}${ext.toLowerCase()}`;
    const asciiDest = path.join(publicCvDir, asciiName);
    fs.copyFileSync(item.srcPath, asciiDest);
    asciiCvs.push(asciiName);
  }
}

console.log(
  `[sync-assets] Avatars synced (${syncedAvatars.length}):`,
  syncedAvatars.map((x) => `public/asset/avatar/${x.name}`).join(", ") || "none"
);
console.log(
  `[sync-assets] CVs synced (${syncedCvs.length}):`,
  [
    ...syncedCvs.map((x) => `public/asset/cv/${x.name}`),
    ...asciiCvs.map((x) => `public/cv/${x}`),
  ].join(", ") || "none"
);
