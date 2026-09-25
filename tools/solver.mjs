// Finds par: the fewest leftover tiles achievable with our word lists.
// 1. For each category, keep only words that can be spelled from the pool.
// 2. Try combinations longest-first, pruning any branch that can't beat the best so far.
import { counts, fits, subtract } from "../site/js/letters.js";

export function formable(words, have) {
  const list = [...new Set(words)].filter((w) => w.length >= 3 && fits(w, have));
  return list.sort((a, b) => b.length - a.length || (a < b ? -1 : a > b ? 1 : 0));
}

export function solve(pool, lists) {
  const have = counts(pool);
  const forms = lists.map((l) => formable(l, have));
  const [A, B, C] = forms;
  const maxB = B.length ? B[0].length : 0;
  const maxC = C.length ? C[0].length : 0;
  let best = -1;
  let solution = null;

  for (const a of A) {
    if (a.length + maxB + maxC <= best) break;
    const h1 = subtract(have, a);
    for (const b of B) {
      if (a.length + b.length + maxC <= best) break;
      if (b === a || !fits(b, h1)) continue;
      const h2 = subtract(h1, b);
      for (const c of C) {
        if (a.length + b.length + c.length <= best) break;
        if (c === a || c === b || !fits(c, h2)) continue;
        best = a.length + b.length + c.length;
        solution = [a, b, c];
        break; // C is sorted longest-first, so this is the best c for (a, b)
      }
    }
  }

  return { par: solution ? pool.length - best : null, solution, formable: forms };
}
