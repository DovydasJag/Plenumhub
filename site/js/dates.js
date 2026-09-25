// Date-to-puzzle mapping. Uses the player's local calendar date, like Wordle:
// the puzzle changes at local midnight, and daylight-saving changes don't matter
// because we compare calendar dates, not elapsed milliseconds.

const DAY_MS = 86400000;

export function parseISODate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`Bad date: ${iso}`);
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

export function dayIndex(launchISO, now = new Date()) {
  const l = parseISODate(launchISO);
  const launch = Date.UTC(l.y, l.m - 1, l.d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - launch) / DAY_MS);
}

// Before launch day we show No. 1. After the list runs out it starts again from the top.
export function pickPuzzle(puzzles, index) {
  const i = Math.max(0, index);
  return { number: i + 1, puzzle: puzzles[i % puzzles.length] };
}

export function nextMidnight(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
}

export function formatCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export function formatDateline(now = new Date()) {
  return now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}
