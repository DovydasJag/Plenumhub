import { VOWELS } from "../site/js/letters.js";

// Returns a reason string if the pool is awkward, otherwise null.
export function poolProblem(pool) {
  if (pool.length < 12 || pool.length > 15) return "pool not 12-15 tiles";
  const letters = [...pool];
  const vowels = letters.filter((l) => VOWELS.has(l)).length;
  if (vowels > 6) return "more than 6 vowels";
  if (vowels < 3) return "fewer than 3 vowels";
  if (pool.includes("q") && !pool.includes("u")) return "Q without U";
  const tally = {};
  for (const l of letters) tally[l] = (tally[l] || 0) + 1;
  if (Object.values(tally).some((n) => n >= 4)) return "same letter 4+ times";
  if (letters.filter((l) => "jqxz".includes(l)).length > 2) return "too many of J/Q/X/Z";
  return null;
}

// Takes a solver result. Returns a reason string if the puzzle is trivial or impossible.
export function puzzleProblem(result) {
  if (result.par === null) return "no solution";
  if (result.par === 0) return "par 0 (every tile usable)";
  if (result.formable.some((f) => f.length < 3)) return "fewer than 3 formable words in a category";
  return null;
}
