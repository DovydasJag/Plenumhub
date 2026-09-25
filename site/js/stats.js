// Stats are derived from a history of finished puzzles: { [number]: { left, par } }.

export function record(history, number, left, par) {
  if (history[number]) return history; // first finish counts
  return { ...history, [number]: { left, par } };
}

export function computeStats(history, today) {
  const nums = Object.keys(history)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .sort((a, b) => a - b);
  const done = new Set(nums);

  let best = 0;
  let run = 0;
  let prev = null;
  for (const n of nums) {
    run = prev !== null && n === prev + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = n;
  }

  // A streak survives until the end of today even if today isn't done yet.
  let current = 0;
  let n = done.has(today) ? today : today - 1;
  while (done.has(n)) {
    current++;
    n--;
  }

  const dist = [0, 0, 0, 0, 0]; // par, +1, +2, +3, +4 or more
  for (const k of nums) {
    const over = Math.max(0, history[k].left - history[k].par);
    dist[Math.min(4, over)]++;
  }

  return { played: nums.length, current, best, dist };
}
