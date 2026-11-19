import fs from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.resolve(process.cwd(), "src/content");
const PLACEHOLDER_CALL = /placeholder\(\s*(["'`])([\s\S]*?)\1\s*\)/g;

const files = fs
  .readdirSync(CONTENT_DIR)
  .filter((f) => f.endsWith(".ts"))
  .sort();

let total = 0;
console.log("Editable Content Placeholders Audit (src/content/):\n");

for (const file of files) {
  const fullPath = path.join(CONTENT_DIR, file);
  const source = fs.readFileSync(fullPath, "utf8");
  const lines = source.split(/\r?\n/);

  const matches = [];
  for (const match of source.matchAll(PLACEHOLDER_CALL)) {
    const idx = match.index ?? 0;
    const lineNum = source.slice(0, idx).split(/\r?\n/).length;
    const label = match[2].replace(/\s+/g, " ").trim();
    const contextLine = lines[lineNum - 1]?.trim() ?? "";
    matches.push({ lineNum, label, contextLine });
  }

  if (matches.length > 0) {
    console.log(`  src/content/${file} (${matches.length})`);
    for (const m of matches) {
      total++;
      console.log(`    L${String(m.lineNum).padStart(3, " ")}: [${m.label}]`);
    }
    console.log("");
  }
}

console.log(`Total placeholders remaining to customize: ${total}`);
