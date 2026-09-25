// Letter accounting: tiles can't be used twice, and returning tiles restores the pool.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as G from "../site/js/game.js";
import { counts, fits, subtract } from "../site/js/letters.js";

const POOL = "catperufigoa"; // two As, at index 1 and 11
const fresh = () => G.newBoard(7, POOL);
const placed = (b) => b.rows.flat();

test("counts, fits and subtract agree", () => {
  const have = counts("banana");
  assert.equal(have[0], 3);
  assert.ok(fits("nab", have));
  assert.ok(!fits("bbn", have), "only one B");
  assert.deepEqual(subtract(have, "ban"), counts("ana"));
});

test("a tile can only be placed once, even in a different row", () => {
  let b = G.place(fresh(), 0, 0);
  const again = G.place(b, 0, 1);
  assert.equal(again, b, "second placement of tile 0 is ignored");
  b = G.place(b, 0, 0);
  assert.deepEqual(placed(b), [0]);
});

test("typing a letter takes the first free matching tile in display order", () => {
  let b = fresh();
  let r = G.placeLetter(b, "a");
  assert.equal(r.index, 1);
  b = r.board;
  r = G.placeLetter(b, "A"); // case doesn't matter
  assert.equal(r.index, 11);
  b = r.board;
  r = G.placeLetter(b, "a");
  assert.equal(r.index, -1, "no third A");
  assert.equal(r.board, b, "board unchanged when the letter has run out");
});

test("display order decides which duplicate tile is taken", () => {
  const b = { ...fresh(), order: [11, ...Array.from({ length: 11 }, (_, i) => i)] };
  assert.equal(G.placeLetter(b, "a").index, 11);
});

test("letters not in the pool can't be placed", () => {
  assert.equal(G.placeLetter(fresh(), "z").index, -1);
});

test("returning a tile puts it back in the pool", () => {
  let b = fresh();
  for (const ch of "cat") b = G.placeLetter(b, ch).board;
  assert.equal(G.freeTiles(b).length, POOL.length - 3);
  assert.equal(G.leftover(b), POOL.length - 3);
  b = G.unplace(b, 1);
  assert.equal(G.rowWord(b, 0), "ct");
  assert.ok(G.isFree(b, 1));
  assert.equal(G.freeTiles(b).length, POOL.length - 2);
  const all = G.unplace(G.unplace(b, 0), 2);
  assert.deepEqual(new Set(G.freeTiles(all)), new Set(Array.from(POOL, (_, i) => i)));
  assert.equal(G.leftover(all), POOL.length);
});

test("backspace returns the last tile of the active row only", () => {
  let b = fresh();
  for (const ch of "cat") b = G.placeLetter(b, ch).board;
  b = G.setActive(b, 1);
  b = G.placeLetter(b, "p").board;
  const r = G.backspace(b);
  assert.equal(r.index, 3);
  assert.equal(G.rowWord(r.board, 0), "cat", "other rows untouched");
  assert.equal(G.rowWord(r.board, 1), "");
  assert.equal(G.backspace(r.board).index, -1, "nothing to remove in an empty row");
});

test("changing a row clears that row's check result but not the others", () => {
  let b = fresh();
  b = { ...b, status: [{ ok: true, reason: "Good." }, { ok: false, reason: "Too short." }, null] };
  b = G.setActive(b, 1);
  b = G.placeLetter(b, "p").board;
  assert.deepEqual(b.status[0], { ok: true, reason: "Good." });
  assert.equal(b.status[1], null);
});

test("nothing moves once the puzzle is done", () => {
  let b = G.placeLetter(fresh(), "c").board;
  b = { ...b, done: true };
  assert.equal(G.placeLetter(b, "a").board, b);
  assert.equal(G.unplace(b, 0), b);
  assert.equal(G.backspace(b).board, b);
});

test("active row stays within the three rows", () => {
  assert.equal(G.setActive(fresh(), -1).active, 0);
  assert.equal(G.setActive(fresh(), 7).active, 2);
});

test("shuffle keeps every tile exactly once", () => {
  let seed = 1;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const b = G.shuffle(fresh(), rand);
  assert.deepEqual([...b.order].sort((x, y) => x - y), Array.from(POOL, (_, i) => i));
});

test("a saved board is restored only if it is sound", () => {
  let b = fresh();
  for (const ch of "cat") b = G.placeLetter(b, ch).board;
  const saved = JSON.parse(JSON.stringify(b));
  assert.deepEqual(G.restore(saved, 7, POOL).rows, b.rows);
  assert.equal(G.restore(saved, 8, POOL), null, "different day");
  assert.equal(G.restore(saved, 7, "xyz"), null, "different pool");
  assert.equal(G.restore({ ...saved, rows: [[0, 0], [], []] }, 7, POOL), null, "same tile twice");
  assert.equal(G.restore({ ...saved, rows: [[99], [], []] }, 7, POOL), null, "tile out of range");
  assert.equal(G.restore({ ...saved, order: [0, 1] }, 7, POOL), null, "broken order");
  assert.equal(G.restore("garbage", 7, POOL), null);
  assert.equal(G.restore(null, 7, POOL), null);
});

test("tile tilt is fixed per tile per day and within 1.5 degrees", () => {
  for (let day = 1; day < 50; day++) {
    for (let i = 0; i < 15; i++) {
      const r = G.tileRotation(day, i);
      assert.ok(r >= -1.5 && r <= 1.5, `${r}`);
      assert.equal(r, G.tileRotation(day, i));
    }
  }
  const spread = new Set(Array.from({ length: 15 }, (_, i) => G.tileRotation(3, i)));
  assert.ok(spread.size > 10, "tiles aren't all tilted the same way");
});
