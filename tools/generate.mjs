// Generates puzzles into site/data/puzzles.json and prints a summary.
//
//   node tools/generate.mjs              keep existing puzzles (and their notes), re-solve them, top up to --count
//   node tools/generate.mjs --fresh      start again from scratch (refuses if any notes are written, unless --force)
//   options: --count 400  --seed 20260925
//
// Each puzzle: 3 categories, one word from each (10-13 letters in total), plus 2-3 decoy letters,
// shuffled into a pool of 12-15 tiles. The solver then works out par and one best solution.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { loadCategories, conflicts } from "./categories.mjs";
import { solve } from "./solver.mjs";
import { poolProblem, puzzleProblem } from "./rules.mjs";

const OUT = new URL("../site/data/puzzles.json", import.meta.url);

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const COUNT = Number(opt("count", 400));
const SEED = Number(opt("seed", 20260925));
const FRESH = args.includes("--fresh");
const FORCE = args.includes("--force");

// ---- helpers ---------------------------------------------------------------

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Decoy letters, weighted roughly by English frequency. No Q: a lone Q is never fair.
const DECOY_WEIGHTS = {
  e: 12, a: 9, i: 8, o: 8, n: 7, r: 7, t: 7, s: 6, l: 5, d: 4, u: 3, c: 3, m: 3, g: 3, h: 3, p: 3,
  b: 2, f: 2, w: 2, y: 2, k: 1, v: 1, j: 0.5, x: 0.5, z: 0.5,
};
const DECOY_BAG = Object.entries(DECOY_WEIGHTS);
const DECOY_TOTAL = DECOY_BAG.reduce((n, [, w]) => n + w, 0);

function decoyLetter(rand) {
  let x = rand() * DECOY_TOTAL;
  for (const [l, w] of DECOY_BAG) if ((x -= w) < 0) return l;
  return "e";
}

function shuffled(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- main ------------------------------------------------------------------

function main() {
  const cats = loadCategories();
  const ids = Object.keys(cats);
  const rand = mulberry32(SEED);

  let existing = [];
  if (existsSync(OUT) && !FRESH) {
    existing = JSON.parse(readFileSync(OUT, "utf8"));
  } else if (existsSync(OUT) && FRESH && !FORCE) {
    const old = JSON.parse(readFileSync(OUT, "utf8"));
    const notes = old.filter((p) => p.note && p.note.trim()).length;
    if (notes) {
      console.error(`Refusing --fresh: ${notes} puzzle(s) have setter's notes. Add --force to throw them away.`);
      process.exit(1);
    }
  }

  const puzzles = [];
  const rejected = {};
  const reject = (why) => (rejected[why] = (rejected[why] || 0) + 1);
  const changedPar = [];
  const nowBroken = [];

  // Keep what's already there (players may have played it), but re-solve against the current word lists.
  for (const p of existing) {
    const result = solve(p.pool, p.categories.map((c) => cats[c].words));
    const problem = puzzleProblem(result);
    if (problem) nowBroken.push(`#${p.id}: ${problem}`);
    if (result.par !== p.par) changedPar.push(`#${p.id}: ${p.par} -> ${result.par}`);
    puzzles.push({ ...p, par: result.par, solution: result.solution, note: p.note ?? "" });
  }

  const usage = Object.fromEntries(ids.map((id) => [id, 0]));
  const recentSeeds = [];
  const recentTriples = [];
  const seenPools = new Set(puzzles.map((p) => p.pool));
  for (const p of puzzles) for (const c of p.categories) usage[c]++;

  let attempts = 0;
  while (puzzles.length < COUNT) {
    attempts++;
    if (attempts > COUNT * 2000) {
      console.error(`Stuck after ${puzzles.length} puzzles. Rejections so far:`, rejected);
      throw new Error("Generator is stuck; loosen the rules or add words.");
    }
    const prev = puzzles.length ? puzzles[puzzles.length - 1].categories : [];

    // Least-used categories first, with a little randomness, avoiding yesterday's and conflicting pairs.
    const order = ids
      .map((id) => ({ id, k: usage[id] + rand() * 3 + (prev.includes(id) ? 100 : 0) }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.id);
    const chosen = [];
    for (const id of order) {
      if (chosen.length === 3) break;
      if (chosen.some((c) => conflicts(c, id))) continue;
      chosen.push(id);
    }
    const triple = [...chosen].sort().join(",");
    if (recentTriples.includes(triple)) {
      reject("same three categories as a recent puzzle");
      continue;
    }

    // Pick the words: first a set of lengths adding up to 10-13, then a word of each length,
    // preferring words that haven't been an answer recently.
    const byLength = chosen.map((id) => {
      const m = new Map();
      for (const w of cats[id].words) if (w.length <= 8) m.set(w.length, [...(m.get(w.length) || []), w]);
      return m;
    });
    const target = 10 + Math.floor(rand() * 4);
    const combos = [];
    for (const [a] of byLength[0]) for (const [b] of byLength[1]) for (const [c] of byLength[2]) {
      if (a + b + c === target) combos.push([a, b, c]);
    }
    if (!combos.length) {
      reject("couldn't fit three words into 10-13 letters");
      continue;
    }
    const lengths = combos[Math.floor(rand() * combos.length)];
    const seeds = lengths.map((len, k) => {
      const all = byLength[k].get(len);
      const fresh = all.filter((w) => !recentSeeds.includes(w));
      const list = fresh.length ? fresh : all;
      return list[Math.floor(rand() * list.length)];
    });
    if (new Set(seeds).size < 3) {
      reject("same word picked twice");
      continue;
    }
    const [w1, w2, w3] = seeds;

    const letters = (w1 + w2 + w3).split("");
    const decoys = letters.length >= 13 ? 2 : 2 + Math.floor(rand() * 2);
    for (let i = 0; i < decoys; i++) letters.push(decoyLetter(rand));
    const pool = shuffled(letters, rand).join("");

    const poolIssue = poolProblem(pool);
    if (poolIssue) {
      reject(poolIssue);
      continue;
    }
    if (seenPools.has(pool)) {
      reject("duplicate pool");
      continue;
    }

    const categories = shuffled(chosen, rand);
    const result = solve(pool, categories.map((c) => cats[c].words));
    const issue = puzzleProblem(result);
    if (issue) {
      reject(issue);
      continue;
    }

    puzzles.push({ id: puzzles.length + 1, categories, pool, par: result.par, solution: result.solution, note: "" });
    seenPools.add(pool);
    for (const c of categories) usage[c]++;
    recentSeeds.push(w1, w2, w3);
    if (recentSeeds.length > 360) recentSeeds.splice(0, 3);
    recentTriples.push(triple);
    if (recentTriples.length > 90) recentTriples.shift();
  }

  const body = puzzles.map((p) => "  " + JSON.stringify(p).replace(/,"/g, ', "').replace(/":/g, '": ')).join(",\n");
  writeFileSync(OUT, `[\n${body}\n]\n`);

  // ---- summary ----
  const parDist = {};
  for (const p of puzzles) parDist[p.par] = (parDist[p.par] || 0) + 1;
  const sizes = {};
  for (const p of puzzles) sizes[p.pool.length] = (sizes[p.pool.length] || 0) + 1;
  const kept = existing.length;
  console.log(`Puzzles: ${puzzles.length}  (${kept} kept, ${puzzles.length - kept} new, seed ${SEED})`);
  console.log(`Par:        ${Object.keys(parDist).sort().map((k) => `par ${k}: ${parDist[k]}`).join("   ")}`);
  console.log(`Pool size:  ${Object.keys(sizes).sort((a, b) => a - b).map((k) => `${k} tiles: ${sizes[k]}`).join("   ")}`);
  console.log("Category use:");
  const u = Object.fromEntries(ids.map((id) => [id, 0]));
  for (const p of puzzles) for (const c of p.categories) u[c]++;
  console.log("  " + ids.map((id) => `${id} ${u[id]}`).join(", "));
  const totalRejected = Object.values(rejected).reduce((a, b) => a + b, 0);
  console.log(`Rejected candidates: ${totalRejected}`);
  for (const [why, n] of Object.entries(rejected).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(6)}  ${why}`);
  if (changedPar.length) console.log(`Par changed after re-solving (word lists edited?): ${changedPar.join(", ")}`);
  if (nowBroken.length) console.log(`WARNING: existing puzzles that now break the rules: ${nowBroken.join(", ")}`);
}

main();
