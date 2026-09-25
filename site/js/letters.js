// Letter-count helpers shared by the game, the generator and the solver.

const A = 97;

export function counts(str) {
  const c = new Array(26).fill(0);
  for (let i = 0; i < str.length; i++) c[str.charCodeAt(i) - A]++;
  return c;
}

// True if `word` can be spelled from the letters in `have` (a counts array).
export function fits(word, have) {
  const need = new Array(26).fill(0);
  for (let i = 0; i < word.length; i++) {
    const k = word.charCodeAt(i) - A;
    if (++need[k] > have[k]) return false;
  }
  return true;
}

export function subtract(have, word) {
  const out = have.slice();
  for (let i = 0; i < word.length; i++) out[word.charCodeAt(i) - A]--;
  return out;
}

export const VOWELS = new Set(["a", "e", "i", "o", "u"]);

export function isWordShaped(word) {
  return /^[a-z]+$/.test(word);
}
