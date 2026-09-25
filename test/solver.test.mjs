// The solver, on puzzles small enough to check by hand, and against brute force on real ones.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { solve, formable } from "../tools/solver.mjs";
import { loadCategories } from "../tools/categories.mjs";
import { counts, fits, subtract } from "../site/js/letters.js";

const cats = loadCategories();

// No pruning, no cleverness: try every combination.
function bruteForce(pool, lists) {
  const have = counts(pool);
  const [A, B, C] = lists.map((l) => formable(l, have));
  let best = -1;
  for (const a of A) for (const b of B) for (const c of C) {
    if (a === b || b === c || a === c) continue;
    const h1 = subtract(have, a);
    if (!fits(b, h1)) continue;
    if (!fits(c, subtract(h1, b))) continue;
    best = Math.max(best, a.length + b.length + c.length);
  }
  return best < 0 ? null : pool.length - best;
}

test("taking the longest first word isn't always best", () => {
  // ABCDEF would block DEF, so the answer is ABC + DEF + GHI with nothing left.
  const r = solve("abcdefghi", [["abcdef", "abc"], ["def"], ["ghi"]]);
  assert.equal(r.par, 0);
  assert.deepEqual(r.solution, ["abc", "def", "ghi"]);
});

test("par counts the tiles no combination can use", () => {
  // Pool has an extra Z nothing can use; CART + BEE + TAR uses the rest.
  const r = solve("cartbeetarz", [["cart", "cat"], ["bee"], ["tar", "rat"]]);
  assert.equal(r.par, 1);
  assert.equal(r.solution.join("").length, 10);
});

test("the same word can't be used twice", () => {
  assert.equal(solve("limelimepea", [["lime"], ["lime"], ["pea"]]).par, null);
  const r = solve("limelimepea", [["lime"], ["lime", "mile"], ["pea"]]);
  assert.equal(r.par, 0);
  assert.deepEqual(r.solution, ["lime", "mile", "pea"]);
});

test("words under three letters never count", () => {
  assert.equal(solve("oxcatfig", [["ox", "cat"], ["cat", "fig"], ["fig"]]).par, null);
});

test("no solution when a category has nothing formable", () => {
  assert.equal(solve("aaaaaa", [["cat"], ["dog"], ["fig"]]).par, null);
});

test("the How to play example: CAT, PERU, FIG leaves one", () => {
  const lists = [cats.animal.words, cats.country.words, cats.fruit.words];
  const r = solve("catperufigo", lists);
  assert.equal(r.par, 1);
  assert.equal(r.par, bruteForce("catperufigo", lists));
});

test("par matches brute force on the first 40 generated puzzles", () => {
  const puzzles = JSON.parse(readFileSync(new URL("../site/data/puzzles.json", import.meta.url), "utf8"));
  for (const p of puzzles.slice(0, 40)) {
    const lists = p.categories.map((c) => cats[c].words);
    assert.equal(solve(p.pool, lists).par, bruteForce(p.pool, lists), `puzzle #${p.id}`);
  }
});
