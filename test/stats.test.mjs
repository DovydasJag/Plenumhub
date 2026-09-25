import { test } from "node:test";
import assert from "node:assert/strict";
import { record, computeStats } from "../site/js/stats.js";

test("only the first finish of a puzzle is recorded", () => {
  let h = record({}, 3, 2, 1);
  h = record(h, 3, 1, 1);
  assert.deepEqual(h, { 3: { left: 2, par: 1 } });
});

test("streaks and distribution", () => {
  let h = {};
  for (const [n, left, par] of [[1, 1, 1], [2, 3, 1], [3, 2, 2], [5, 6, 1], [6, 1, 1], [7, 2, 1]]) h = record(h, n, left, par);
  const s = computeStats(h, 7);
  assert.equal(s.played, 6);
  assert.equal(s.current, 3, "5, 6, 7");
  assert.equal(s.best, 3);
  assert.deepEqual(s.dist, [3, 1, 1, 0, 1]);
});

test("a streak survives until today ends, then breaks", () => {
  const h = { 4: { left: 1, par: 1 }, 5: { left: 1, par: 1 } };
  assert.equal(computeStats(h, 6).current, 2, "today not played yet");
  assert.equal(computeStats(h, 7).current, 0, "missed a day");
});

test("empty history", () => {
  assert.deepEqual(computeStats({}, 10), { played: 0, current: 0, best: 0, dist: [0, 0, 0, 0, 0] });
});
