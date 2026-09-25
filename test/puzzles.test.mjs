// Every puzzle in puzzles.json follows the rules and its stored par is right.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadCategories, conflicts } from "../tools/categories.mjs";
import { solve } from "../tools/solver.mjs";
import { poolProblem, puzzleProblem } from "../tools/rules.mjs";
import { counts, fits, subtract } from "../site/js/letters.js";

const puzzles = JSON.parse(readFileSync(new URL("../site/data/puzzles.json", import.meta.url), "utf8"));
const cats = loadCategories();

test("at least a year of puzzles, numbered in order", () => {
  assert.ok(puzzles.length >= 365, `${puzzles.length}`);
  puzzles.forEach((p, i) => assert.equal(p.id, i + 1));
});

test("each puzzle has three sensible categories and a clean pool", () => {
  for (const p of puzzles) {
    assert.equal(p.categories.length, 3, `#${p.id}`);
    assert.equal(new Set(p.categories).size, 3, `#${p.id} repeats a category`);
    for (const c of p.categories) assert.ok(cats[c], `#${p.id}: unknown category ${c}`);
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) assert.ok(!conflicts(p.categories[i], p.categories[j]), `#${p.id}`);
    assert.match(p.pool, /^[a-z]{12,15}$/, `#${p.id}`);
    assert.equal(poolProblem(p.pool), null, `#${p.id}: ${poolProblem(p.pool)}`);
    assert.equal(typeof p.note, "string", `#${p.id} note`);
  }
});

test("each stored solution is legal and leaves exactly par", () => {
  for (const p of puzzles) {
    let have = counts(p.pool);
    p.solution.forEach((w, k) => {
      assert.ok(cats[p.categories[k]].words.includes(w), `#${p.id}: ${w} isn't in ${p.categories[k]}`);
      assert.ok(fits(w, have), `#${p.id}: ${w} reuses a tile`);
      have = subtract(have, w);
    });
    assert.equal(new Set(p.solution).size, 3, `#${p.id}: repeated word`);
    assert.equal(p.pool.length - p.solution.join("").length, p.par, `#${p.id}`);
  }
});

test("no puzzle is trivial or impossible, and par is still right for the current word lists", () => {
  for (const p of puzzles) {
    const r = solve(p.pool, p.categories.map((c) => cats[c].words));
    assert.equal(puzzleProblem(r), null, `#${p.id}: ${puzzleProblem(r)}`);
    assert.ok(r.par >= 1, `#${p.id}`);
    assert.equal(r.par, p.par, `#${p.id}: par is ${r.par} now; run npm run generate to re-solve`);
  }
});
