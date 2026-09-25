// Sorts and de-duplicates every word list, and stops on anything that isn't
// a single lowercase A-Z word of 3+ letters. Run: node tools/tidy-words.mjs
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { WORDS_DIR } from "./categories.mjs";

let bad = 0;
for (const file of readdirSync(WORDS_DIR).sort()) {
  if (!file.endsWith(".json")) continue;
  const url = new URL(file, WORDS_DIR);
  const data = JSON.parse(readFileSync(url, "utf8"));
  const words = [...new Set(data.words)].sort();
  for (const w of words) {
    if (!/^[a-z]{3,}$/.test(w)) {
      console.error(`${file}: "${w}" is not a lowercase A-Z word of 3+ letters`);
      bad++;
    }
  }
  const dupes = data.words.length - words.length;
  const lines = [];
  let line = "   ";
  for (const w of words) {
    const piece = ` "${w}",`;
    if (line.length + piece.length > 112) {
      lines.push(line);
      line = "   ";
    }
    line += piece;
  }
  lines.push(line.replace(/,$/, ""));
  const json = `{\n  "label": ${JSON.stringify(data.label)},\n  "noun": ${JSON.stringify(data.noun)},\n  "words": [\n${lines.join("\n")}\n  ]\n}\n`;
  writeFileSync(url, json);
  console.log(`${file.padEnd(16)} ${String(words.length).padStart(4)} words${dupes ? `  (${dupes} duplicate${dupes > 1 ? "s" : ""} removed)` : ""}`);
}
if (bad) process.exit(1);
