// Board state and rules. Pure functions: every change returns a new board.
// A board holds tile indices into `pool`, never letters, so the same tile can't be used twice.

export const MIN_LEN = 3;
export const ROW_COUNT = 3;

export function newBoard(number, pool) {
  return {
    v: 1,
    number,
    pool,
    rows: [[], [], []],
    active: 0,
    order: Array.from(pool, (_, i) => i),
    status: [null, null, null],
    done: false,
    left: null,
  };
}

export function rowOf(board, i) {
  return board.rows.findIndex((r) => r.includes(i));
}

export function isFree(board, i) {
  return Number.isInteger(i) && i >= 0 && i < board.pool.length && rowOf(board, i) === -1;
}

export function freeTiles(board) {
  return board.order.filter((i) => isFree(board, i));
}

function clearStatus(board, row) {
  return board.status.map((s, k) => (k === row ? null : s));
}

export function place(board, i, row = board.active) {
  if (board.done || !isFree(board, i) || row < 0 || row >= ROW_COUNT) return board;
  return {
    ...board,
    rows: board.rows.map((r, k) => (k === row ? [...r, i] : r)),
    status: clearStatus(board, row),
  };
}

// Typing a letter takes the first free matching tile, in the order the pool is shown.
export function placeLetter(board, letter) {
  const l = String(letter).toLowerCase();
  const i = board.order.find((k) => board.pool[k] === l && isFree(board, k));
  if (i === undefined || board.done) return { board, index: -1 };
  return { board: place(board, i), index: i };
}

export function unplace(board, i) {
  const row = rowOf(board, i);
  if (board.done || row === -1) return board;
  return {
    ...board,
    rows: board.rows.map((r, k) => (k === row ? r.filter((x) => x !== i) : r)),
    status: clearStatus(board, row),
  };
}

export function backspace(board) {
  const r = board.rows[board.active];
  if (board.done || r.length === 0) return { board, index: -1 };
  const i = r[r.length - 1];
  return { board: unplace(board, i), index: i };
}

export function setActive(board, row) {
  const active = Math.max(0, Math.min(ROW_COUNT - 1, row));
  return active === board.active ? board : { ...board, active };
}

export function rowWord(board, row) {
  return board.rows[row].map((i) => board.pool[i]).join("");
}

export function leftover(board) {
  return board.pool.length - board.rows.reduce((n, r) => n + r.length, 0);
}

// category: { label, noun, set }
export function validateWord(word, category) {
  if (!word) return { ok: false, reason: "Empty." };
  if (word.length < MIN_LEN) return { ok: false, reason: "Too short." };
  if (!category.set.has(word)) return { ok: false, reason: `Not ${category.noun} we know.` };
  return { ok: true, reason: "Good." };
}

export function checkBoard(board, categories) {
  const results = board.rows.map((_, r) => {
    const word = rowWord(board, r);
    return { word, ...validateWord(word, categories[r]) };
  });
  // The same word can't count twice (colour and fruit both allow "lime").
  for (let r = 1; r < results.length; r++) {
    if (!results[r].ok) continue;
    const prev = results.findIndex((x, k) => k < r && x.ok && x.word === results[r].word);
    if (prev !== -1) results[r] = { word: results[r].word, ok: false, reason: `Already used in row ${prev + 1}.` };
  }
  return results;
}

export function applyCheck(board, categories) {
  const results = checkBoard(board, categories);
  return { board: { ...board, status: results.map(({ ok, reason }) => ({ ok, reason })) }, results };
}

export function finish(board, categories) {
  const { board: checked, results } = applyCheck(board, categories);
  if (!results.every((r) => r.ok)) return { board: checked, finished: false, results };
  return { board: { ...checked, done: true, left: leftover(checked) }, finished: true, results };
}

export function shuffle(board, rand = Math.random) {
  const order = board.order.slice();
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...board, order };
}

// Saved boards come from localStorage, so treat them as untrusted.
export function restore(saved, number, pool) {
  try {
    if (!saved || saved.v !== 1 || saved.number !== number || saved.pool !== pool) return null;
    const n = pool.length;
    const seen = new Set();
    const rows = saved.rows;
    if (!Array.isArray(rows) || rows.length !== ROW_COUNT) return null;
    for (const r of rows) {
      if (!Array.isArray(r)) return null;
      for (const i of r) {
        if (!Number.isInteger(i) || i < 0 || i >= n || seen.has(i)) return null;
        seen.add(i);
      }
    }
    const order = saved.order;
    if (!Array.isArray(order) || order.length !== n || new Set(order).size !== n || order.some((i) => !Number.isInteger(i) || i < 0 || i >= n)) return null;
    const board = { ...newBoard(number, pool), rows: rows.map((r) => r.slice()), order: order.slice() };
    board.active = Number.isInteger(saved.active) ? Math.max(0, Math.min(ROW_COUNT - 1, saved.active)) : 0;
    if (Array.isArray(saved.status) && saved.status.length === ROW_COUNT) {
      board.status = saved.status.map((s) => (s && typeof s.ok === "boolean" && typeof s.reason === "string" ? { ok: s.ok, reason: s.reason } : null));
    }
    if (saved.done === true && Number.isInteger(saved.left)) {
      board.done = true;
      board.left = leftover(board);
    }
    return board;
  } catch {
    return null;
  }
}

// A small fixed tilt for each tile, the same all day: within ±1.5 degrees.
export function tileRotation(number, index) {
  let h = (number * 374761393 + index * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return Math.round(((h / 4294967295) * 3 - 1.5) * 100) / 100;
}
