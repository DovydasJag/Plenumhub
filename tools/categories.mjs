import { readFileSync, readdirSync } from "node:fs";

export const WORDS_DIR = new URL("../site/data/words/", import.meta.url);

// Categories that shouldn't appear in the same puzzle (one contains the other).
export const CONFLICTS = [["animal", "bird"]];

export function loadCategories() {
  const out = {};
  for (const file of readdirSync(WORDS_DIR).sort()) {
    if (!file.endsWith(".json")) continue;
    const id = file.slice(0, -5);
    const data = JSON.parse(readFileSync(new URL(file, WORDS_DIR), "utf8"));
    out[id] = { id, label: data.label, noun: data.noun, words: data.words };
  }
  return out;
}

export function conflicts(a, b) {
  return CONFLICTS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}
