import { CONFIG } from "./config.js";
import { dayIndex, pickPuzzle, nextMidnight, formatCountdown, formatDateline } from "./dates.js";
import * as G from "./game.js";
import { shareText, resultLine } from "./share.js";
import { record, computeStats } from "./stats.js";
import { load, save } from "./storage.js";
import { mountAd } from "./ads.js";

const $ = (sel) => document.querySelector(sel);
const moving = () => !matchMedia("(prefers-reduced-motion: reduce)").matches;
const SVG = "http://www.w3.org/2000/svg";

const els = {};
const state = { board: null, puzzle: null, number: 0, day: 0, cats: [], tiles: [], slots: [], rows: [] };

// ---------------------------------------------------------------------------
// Start-up

async function init() {
  for (const id of ["game", "board", "pool", "left-count", "shuffle", "actions", "check", "done", "message", "result",
    "result-title", "best-title", "best-same", "best-list", "best-left", "note", "note-text", "share", "copied", "share-fallback",
    "countdown", "live"]) {
    els[id.replace(/-(\w)/g, (_, c) => c.toUpperCase())] = document.getElementById(id);
  }

  try {
    const now = new Date();
    state.day = dayIndex(CONFIG.launchDate, now);
    const puzzles = await getJSON("../data/puzzles.json");
    const { number, puzzle } = pickPuzzle(puzzles, state.day);
    state.number = number;
    state.puzzle = puzzle;
    const lists = await Promise.all(puzzle.categories.map((id) => getJSON(`../data/words/${id}.json`)));
    state.cats = lists.map((l) => ({ label: l.label, noun: l.noun, set: new Set(l.words) }));
    $("#puzzle-no").textContent = `No. ${number}`;
    const date = $("#puzzle-date");
    date.textContent = formatDateline(now);
    date.dateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    state.board = G.restore(load("board", null), number, puzzle.pool) || G.newBoard(number, puzzle.pool);
  } catch (err) {
    console.error(err);
    els.game.replaceChildren(Object.assign(document.createElement("p"), {
      className: "message",
      textContent: "Today's puzzle didn't load. Check your connection and refresh the page.",
    }));
    return;
  }

  build();
  layout(false);
  render();
  bind();

  if (state.board.done) showResult(false);

  if (!load("seen-help", false)) {
    save("seen-help", true);
    openSheet("help");
  } else if (!state.board.done) {
    els.board.focus({ preventScroll: true });
  }

  setInterval(checkNewDay, 30000);
  document.addEventListener("visibilitychange", checkNewDay);
  mountAd($("#ad"));
}

async function getJSON(rel) {
  const res = await fetch(new URL(rel, import.meta.url));
  if (!res.ok) throw new Error(`${rel}: ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// DOM

function build() {
  state.cats.forEach((cat, r) => {
    const row = document.createElement("div");
    row.className = "row";
    row.dataset.row = String(r);

    const head = document.createElement("div");
    head.className = "row-head";
    const label = document.createElement("button");
    label.type = "button";
    label.className = "row-label";
    label.setAttribute("aria-describedby", `row${r}-status`);
    const num = document.createElement("span");
    num.className = "row-num";
    num.textContent = String(r + 1);
    label.append(num, document.createTextNode(cat.label));
    head.append(label);

    const tilesBox = document.createElement("div");
    tilesBox.className = "row-tiles";
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    tilesBox.append(cursor);

    const status = document.createElement("p");
    status.className = "row-status";
    status.id = `row${r}-status`;

    row.append(head, tilesBox, status);
    els.board.append(row);
    state.rows.push({ row, label, tilesBox, cursor, status });
  });

  const { pool } = state.board;
  for (let i = 0; i < pool.length; i++) {
    const t = document.createElement("button");
    t.type = "button";
    t.className = "tile";
    t.dataset.i = String(i);
    t.dataset.letter = pool[i];
    t.textContent = pool[i].toUpperCase();
    t.style.setProperty("--rot", `${G.tileRotation(state.number, i)}deg`);
    state.tiles.push(t);
    const slot = document.createElement("div");
    slot.className = "slot";
    state.slots.push(slot);
    els.pool.append(slot);
  }
}

// Put every tile where the board says it belongs. Moved tiles glide from their old spot (FLIP).
function layout(animate = true) {
  const { board } = state;
  const anim = animate && moving();
  const before = anim ? state.tiles.map((t) => (t.isConnected ? t.getBoundingClientRect() : null)) : [];
  const wasInPool = state.tiles.map((t) => Boolean(t.closest(".pool")));

  board.order.forEach((i, pos) => {
    const slot = state.slots[pos];
    const tile = G.isFree(board, i) ? state.tiles[i] : null;
    if (tile && tile.parentNode !== slot) slot.replaceChildren(tile);
    if (!tile && slot.firstChild) slot.replaceChildren();
    slot.classList.toggle("is-empty", !tile);
  });

  board.rows.forEach((idxs, r) => {
    const { tilesBox, cursor } = state.rows[r];
    const want = idxs.map((i) => state.tiles[i]);
    const now = [...tilesBox.children].filter((c) => c !== cursor);
    if (now.length !== want.length || now.some((c, k) => c !== want[k])) tilesBox.replaceChildren(...want, cursor);
  });

  if (!anim) return;
  state.tiles.forEach((t, i) => {
    const a = before[i];
    if (!a) return;
    const b = t.getBoundingClientRect();
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    const rot = `rotate(${G.tileRotation(state.number, i)}deg)`;
    const inPool = Boolean(t.closest(".pool"));
    t.animate(
      [{ transform: `translate(${dx}px, ${dy}px) ${wasInPool[i] ? rot : "rotate(0deg)"}` }, { transform: inPool ? rot : "rotate(0deg)" }],
      { duration: 160, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
    );
  });
}

function mark(ok) {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("class", "mark");
  svg.setAttribute("viewBox", "0 0 14 14");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(SVG, "path");
  path.setAttribute("d", ok ? "M1.5 7.5l3.5 3.5L12.5 3" : "M3 3l8 8M11 3l-8 8");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2");
  svg.append(path);
  return svg;
}

function render() {
  const { board } = state;
  const done = board.done;
  els.game.classList.toggle("is-done", done);

  state.rows.forEach((R, r) => {
    const active = r === board.active && !done;
    R.row.classList.toggle("is-active", active);
    R.label.setAttribute("aria-pressed", String(active));
    R.label.disabled = done;
    const s = board.status[r];
    R.row.classList.toggle("is-good", Boolean(s && s.ok));
    R.row.classList.toggle("is-bad", Boolean(s && !s.ok));
    if (s) {
      const text = document.createElement("span");
      text.textContent = s.reason;
      R.status.replaceChildren(mark(s.ok), text);
    } else {
      R.status.replaceChildren();
    }
  });

  state.tiles.forEach((t, i) => {
    const r = G.rowOf(board, i);
    const L = board.pool[i].toUpperCase();
    t.setAttribute("aria-label", r === -1 ? `Letter ${L}` : `${L} in ${state.cats[r].label}. Send back`);
    t.disabled = done;
  });

  const left = G.leftover(board);
  els.leftCount.textContent = `${left} left`;
  els.shuffle.hidden = done;
}

function update(board, { animate = true } = {}) {
  state.board = board;
  save("board", board);
  layout(animate);
  render();
}

// ---------------------------------------------------------------------------
// Actions

function say(text) {
  els.live.textContent = "";
  requestAnimationFrame(() => {
    els.live.textContent = text;
  });
}

function setMessage(text) {
  els.message.textContent = text;
}

function spell(word) {
  return word ? word.toUpperCase().split("").join(" ") : "empty";
}

function speakRow(r) {
  say(`${state.cats[r].label}: ${spell(G.rowWord(state.board, r))}`);
}

function typeLetter(key) {
  const { board, index } = G.placeLetter(state.board, key);
  if (index === -1) {
    const msg = `No ${key.toUpperCase()} left.`;
    setMessage(msg);
    say(msg);
    return;
  }
  setMessage("");
  update(board);
  speakRow(board.active);
}

function removeLast() {
  const { board, index } = G.backspace(state.board);
  if (index === -1) return;
  setMessage("");
  update(board);
  speakRow(board.active);
}

function switchRow(row) {
  update(G.setActive(state.board, row), { animate: false });
  say(`${state.cats[state.board.active].label}. ${spell(G.rowWord(state.board, state.board.active))}.`);
}

function doCheck() {
  const { board, results } = G.applyCheck(state.board, state.cats);
  update(board, { animate: false });
  const all = results.every((r) => r.ok);
  setMessage(all ? "All three count. Press Done when you're happy." : "");
  say(results.map((r, k) => `${state.cats[k].label}: ${spell(r.word)}. ${r.reason}`).join(" ") + (all ? " All three count." : ""));
}

function doDone() {
  const { board, finished, results } = G.finish(state.board, state.cats);
  if (!finished) {
    update(board, { animate: false });
    const msg = "Not yet. Every row needs a word that counts.";
    setMessage(msg);
    say(`${msg} ${results.filter((r) => !r.ok).map((r) => r.reason).join(" ")}`);
    return;
  }
  state.board = board;
  save("board", board);
  save("history", record(load("history", {}), state.number, board.left, state.puzzle.par));
  setMessage("");
  render();
  showResult(true);
}

function doShuffle() {
  update(G.shuffle(state.board));
  say("Shuffled.");
}

// ---------------------------------------------------------------------------
// Result

function miniTiles(word) {
  const wrap = document.createElement("span");
  wrap.className = "mini-tiles";
  const sr = document.createElement("span");
  sr.className = "sr-only";
  sr.textContent = word;
  wrap.append(sr);
  for (const ch of word) {
    const s = document.createElement("span");
    s.setAttribute("aria-hidden", "true");
    s.textContent = ch;
    wrap.append(s);
  }
  return wrap;
}

function leftoverLetters(pool, words) {
  const rest = pool.split("");
  for (const ch of words.join("")) rest.splice(rest.indexOf(ch), 1);
  return rest.sort().join("");
}

function showResult(fresh) {
  const { board, puzzle, cats } = state;
  els.actions.hidden = true;
  els.resultTitle.textContent = resultLine(board.left, puzzle.par);

  const mine = board.rows.map((_, r) => G.rowWord(board, r));
  const same = puzzle.solution.every((w, k) => w === mine[k]);
  els.bestTitle.textContent = !same && board.left === puzzle.par ? "Another way to par" : "Best possible";
  els.bestSame.hidden = !same;
  els.bestList.replaceChildren(
    ...puzzle.solution.flatMap((w, k) => {
      const dt = document.createElement("dt");
      dt.textContent = cats[k].label;
      const dd = document.createElement("dd");
      dd.append(miniTiles(w));
      return [dt, dd];
    }),
  );
  els.bestLeft.replaceChildren(miniTiles(leftoverLetters(puzzle.pool, puzzle.solution)));

  const note = (puzzle.note || "").trim();
  els.note.hidden = !note;
  els.noteText.textContent = note;

  els.result.hidden = false;
  $(".stamp").classList.toggle("is-new", fresh);
  startCountdown();

  if (fresh) {
    els.resultTitle.focus({ preventScroll: true });
    els.result.scrollIntoView({ behavior: moving() ? "smooth" : "auto", block: "nearest" });
    say(`Done. ${resultLine(board.left, puzzle.par)}`);
  }
}

let countdownTimer = 0;
function startCountdown() {
  clearInterval(countdownTimer);
  const tick = () => {
    const now = new Date();
    if (dayIndex(CONFIG.launchDate, now) !== state.day) return checkNewDay();
    els.countdown.textContent = formatCountdown(nextMidnight(now) - now);
  };
  tick();
  countdownTimer = setInterval(tick, 1000);
}

function checkNewDay() {
  if (dayIndex(CONFIG.launchDate, new Date()) === state.day || $("#new-day")) return;
  clearInterval(countdownTimer);
  const p = document.createElement("p");
  p.id = "new-day";
  p.className = "message";
  p.append("A new puzzle is out. ");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "textlink";
  btn.textContent = "Load it";
  btn.addEventListener("click", () => location.reload());
  p.append(btn);
  els.game.prepend(p);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* try the old way */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

let copiedTimer = 0;
function flash(text) {
  els.copied.textContent = text;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => (els.copied.textContent = ""), 2500);
}

async function doShare() {
  const b = state.board;
  const text = shareText({
    name: CONFIG.name,
    number: state.number,
    lengths: b.rows.map((r) => r.length),
    left: b.left,
    par: state.puzzle.par,
    url: CONFIG.siteUrl,
  });
  els.shareFallback.hidden = true;
  if (navigator.share && matchMedia("(pointer: coarse)").matches) {
    try {
      await navigator.share({ text });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
  }
  if (await copyText(text)) {
    flash("Copied.");
  } else {
    els.shareFallback.textContent = text;
    els.shareFallback.hidden = false;
    flash("Couldn't copy. Here it is to select.");
  }
}

// ---------------------------------------------------------------------------
// Sheets (How to play, Stats)

function openSheet(id) {
  const dialog = document.getElementById(id);
  if (id === "stats") fillStats();
  dialog.showModal();
  // Stats has no main action, so the sheet itself takes focus rather than its Close link.
  if (id === "stats") dialog.focus();
}

function fillStats() {
  const history = load("history", {});
  const s = computeStats(history, state.number);
  $("#st-played").textContent = String(s.played);
  $("#st-current").textContent = String(s.current);
  $("#st-best").textContent = String(s.best);
  const today = history[state.number];
  const todayBucket = today ? Math.min(4, Math.max(0, today.left - today.par)) : -1;
  const max = Math.max(1, ...s.dist);
  const names = ["Par", "1 over", "2 over", "3 over", "4+ over"];
  $("#st-dist").replaceChildren(
    ...s.dist.map((n, k) => {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.scope = "row";
      th.textContent = names[k];
      const td = document.createElement("td");
      const bar = document.createElement("span");
      bar.className = `bar${n === 0 ? " is-zero" : ""}`;
      bar.style.setProperty("--w", `${(n / max) * 100}%`);
      bar.textContent = String(n);
      td.append(bar);
      if (k === todayBucket) {
        const mark = document.createElement("span");
        mark.className = "today";
        mark.textContent = "today";
        th.append(mark);
      }
      tr.append(th, td);
      return tr;
    }),
  );
}

// ---------------------------------------------------------------------------
// Input

function inTypingMode(target) {
  return target === document.body || target === document.documentElement || target === els.board;
}

function focusFreeTileFrom(pos) {
  const { order } = state.board;
  for (let k = 0; k < order.length; k++) {
    const i = order[(pos + k) % order.length];
    if (G.isFree(state.board, i)) return state.tiles[i].focus();
  }
  els.check.focus();
}

function bind() {
  // Mouse clicks on game controls shouldn't pull focus off the board, so typing and Tab keep working.
  document.addEventListener("mousedown", (e) => {
    if (e.target.closest(".tile, .row, #check, #shuffle, [data-open]")) e.preventDefault();
  });

  els.pool.addEventListener("click", (e) => {
    const t = e.target.closest(".tile");
    if (!t || state.board.done) return;
    const i = Number(t.dataset.i);
    if (!G.isFree(state.board, i)) return;
    const pos = state.board.order.indexOf(i);
    setMessage("");
    update(G.place(state.board, i));
    if (e.detail === 0) focusFreeTileFrom(pos);
    speakRow(state.board.active);
  });

  els.board.addEventListener("click", (e) => {
    const rowEl = e.target.closest(".row");
    if (!rowEl || state.board.done) return;
    const r = Number(rowEl.dataset.row);
    const t = e.target.closest(".tile");
    if (t) {
      setMessage("");
      update(G.setActive(G.unplace(state.board, Number(t.dataset.i)), r));
      if (e.detail === 0) {
        const last = state.board.rows[r].at(-1);
        (last === undefined ? state.rows[r].label : state.tiles[last]).focus();
      }
      speakRow(r);
    } else if (r !== state.board.active) {
      switchRow(r);
    }
  });

  els.check.addEventListener("click", doCheck);
  els.done.addEventListener("click", doDone);
  els.shuffle.addEventListener("click", doShuffle);
  els.share.addEventListener("click", doShare);

  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]");
    if (open) openSheet(open.dataset.open);
    const close = e.target.closest("[data-close]");
    if (close) close.closest("dialog").close();
  });

  for (const dialog of document.querySelectorAll("dialog")) {
    // A click on the dimmed backdrop closes the sheet.
    dialog.addEventListener("click", (e) => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) dialog.close();
    });
    dialog.addEventListener("close", () => {
      if (!state.board.done && inTypingMode(document.activeElement)) els.board.focus({ preventScroll: true });
    });
  }

  document.addEventListener("keydown", onKey);
}

function onKey(e) {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  if (document.querySelector("dialog[open]") || state.board.done) return;
  const t = e.target;
  const onControl = t instanceof Element && Boolean(t.closest("button, a, input, textarea, select"));

  if (e.key.length === 1 && /^[a-z]$/i.test(e.key)) {
    e.preventDefault();
    typeLetter(e.key);
    return;
  }

  switch (e.key) {
    case "Backspace":
      e.preventDefault();
      removeLast();
      break;
    case "Enter":
      if (onControl) return; // let the focused button do its own thing
      e.preventDefault();
      doCheck();
      break;
    case "ArrowUp":
    case "ArrowDown":
      e.preventDefault();
      switchRow(state.board.active + (e.key === "ArrowUp" ? -1 : 1));
      break;
    case "Tab": {
      if (!inTypingMode(t)) return; // normal Tab once you're moving around the controls
      const next = state.board.active + (e.shiftKey ? -1 : 1);
      e.preventDefault();
      if (next < 0) $("[data-open='stats']").focus();
      else if (next >= G.ROW_COUNT) focusFreeTileFrom(0);
      else switchRow(next);
      break;
    }
    default:
  }
}

init();
