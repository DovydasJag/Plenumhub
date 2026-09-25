// Date-to-puzzle mapping, including around midnight and across daylight-saving changes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dayIndex, pickPuzzle, nextMidnight, formatCountdown } from "../site/js/dates.js";

test("launch day is puzzle No. 1, the next day No. 2", () => {
  assert.equal(dayIndex("2026-09-25", new Date(2026, 8, 25, 0, 0, 0)), 0);
  assert.equal(dayIndex("2026-09-25", new Date(2026, 8, 25, 23, 59, 59, 999)), 0);
  assert.equal(dayIndex("2026-09-25", new Date(2026, 8, 26, 0, 0, 0)), 1);
  assert.equal(dayIndex("2026-09-25", new Date(2027, 8, 25, 12)), 365);
  assert.equal(dayIndex("2026-09-25", new Date(2028, 8, 25, 12)), 731, "2028 is a leap year");
});

test("the puzzle changes exactly at local midnight", () => {
  const before = new Date(2026, 10, 3, 23, 59, 59, 999);
  const after = new Date(2026, 10, 4, 0, 0, 0, 0);
  assert.equal(dayIndex("2026-09-25", after) - dayIndex("2026-09-25", before), 1);
});

test("before launch shows No. 1; after the list runs out it starts again", () => {
  const puzzles = ["a", "b", "c"];
  assert.deepEqual(pickPuzzle(puzzles, -5), { number: 1, puzzle: "a" });
  assert.deepEqual(pickPuzzle(puzzles, 0), { number: 1, puzzle: "a" });
  assert.deepEqual(pickPuzzle(puzzles, 2), { number: 3, puzzle: "c" });
  assert.deepEqual(pickPuzzle(puzzles, 3), { number: 4, puzzle: "a" });
});

test("next midnight and the countdown", () => {
  const now = new Date(2026, 8, 25, 20, 30, 15);
  assert.equal(nextMidnight(now).getTime(), new Date(2026, 8, 26).getTime());
  assert.equal(formatCountdown(nextMidnight(now) - now), "03:29:45");
  assert.equal(formatCountdown(-5), "00:00:00");
});

// Time zones are process-wide, so each zone runs in its own child process.
const ZONES = [
  // zone, a day when the clocks change there
  ["Europe/Vilnius", [2026, 9, 25]], // clocks back, 04:00 -> 03:00
  ["Europe/London", [2027, 2, 28]], // clocks forward, 01:00 -> 02:00
  ["America/New_York", [2026, 10, 1]], // clocks back
  ["Australia/Sydney", [2026, 9, 4]], // clocks forward
  ["America/Santiago", [2026, 8, 6]], // clocks forward at midnight: 00:00 doesn't exist that day
];

const CHILD = `
  import { dayIndex, nextMidnight } from ${JSON.stringify(new URL("../site/js/dates.js", import.meta.url).href)};
  const [y, m, d] = JSON.parse(process.argv[1]);
  const out = [];
  for (let day = -2; day <= 2; day++) {
    for (const h of [0, 1, 2, 3, 4, 12, 23]) {
      const t = new Date(y, m, d + day, h, 30);
      out.push({ day, h, idx: dayIndex("2026-01-01", t), offset: t.getTimezoneOffset(),
        next: dayIndex("2026-01-01", nextMidnight(t)), nextAfter: nextMidnight(t) > t });
    }
  }
  const last = new Date(y, m, d, 23, 59, 59, 999);
  const first = new Date(last.getTime() + 1);
  out.push({ edge: true, a: dayIndex("2026-01-01", last), b: dayIndex("2026-01-01", first) });
  console.log(JSON.stringify(out));
`;

for (const [zone, date] of ZONES) {
  test(`daylight saving in ${zone}`, () => {
    const raw = execFileSync(process.execPath, ["--input-type=module", "-e", CHILD, JSON.stringify(date)], {
      env: { ...process.env, TZ: zone },
      cwd: fileURLToPath(new URL("..", import.meta.url)),
      encoding: "utf8",
    });
    const rows = JSON.parse(raw);
    const edge = rows.pop();
    const offsets = new Set(rows.map((r) => r.offset));
    assert.ok(offsets.size > 1, `the clocks really did change in ${zone} (offsets ${[...offsets]})`);
    const base = rows.find((r) => r.day === 0 && r.h === 12).idx;
    for (const r of rows) {
      assert.equal(r.idx, base + r.day, `${zone}: day ${r.day} at ${r.h}:30`);
      assert.equal(r.next, r.idx + 1, `${zone}: next midnight is the next puzzle`);
      assert.ok(r.nextAfter);
    }
    assert.equal(edge.b - edge.a, 1, `${zone}: changes at midnight`);
  });
}
