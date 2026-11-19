import fs from "node:fs";
import path from "node:path";

/**
 * Next.js 16 `output: "export"` emits nested RSC segment files such as
 * `out/services/__next.services/__PAGE__.txt`, while the client router requests
 * flat dot-separated paths (`/services/__next.services.__PAGE__.txt`) on plain
 * static file hosts. Copying flat sibling aliases makes `./out` work cleanly on
 * every static host without custom rewrite rules.
 */
const OUT_DIR = path.resolve(process.cwd(), "out");

function flattenNextSegments(parentDir, segmentDirName, currentDir, parts) {
  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    const full = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      flattenNextSegments(parentDir, segmentDirName, full, [
        ...parts,
        entry.name,
      ]);
    } else if (entry.isFile() && entry.name.endsWith(".txt")) {
      const flatName = `${[segmentDirName, ...parts, entry.name].join(".")}`;
      const dest = path.join(parentDir, flatName);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(full, dest);
      }
    }
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) {
      flattenNextSegments(dir, entry.name, full, []);
    } else if (entry.name !== "_next") {
      walk(full);
    }
  }
}

if (fs.existsSync(OUT_DIR)) {
  walk(OUT_DIR);
}
