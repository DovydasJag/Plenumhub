// Word validation per category, and the word lists themselves.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as G from "../site/js/game.js";
import { loadCategories } from "../tools/categories.mjs";

const cats = loadCategories();
const cat = (id) => ({ label: cats[id].label, noun: cats[id].noun, set: new Set(cats[id].words) });

test("validation reasons are plain and specific", () => {
  const animal = cat("animal");
  assert.deepEqual(G.validateWord("", animal), { ok: false, reason: "Empty." });
  assert.deepEqual(G.validateWord("ox", animal), { ok: false, reason: "Too short." });
  assert.deepEqual(G.validateWord("carrot", animal), { ok: false, reason: "Not an animal we know." });
  assert.deepEqual(G.validateWord("otter", animal), { ok: true, reason: "Good." });
  assert.equal(G.validateWord("apple", cat("country")).reason, "Not a country we know.");
  assert.equal(G.validateWord("apple", cat("clothing")).reason, "Not an item of clothing we know.");
});

test("each category accepts its own words and rejects others", () => {
  const cases = {
    animal: ["cat", "zebra", "otter"], country: ["peru", "chad", "wales"], fruit: ["fig", "lemon", "kiwi"],
    vegetable: ["pea", "leek", "aubergine", "eggplant"], colour: ["red", "grey", "gray"], instrument: ["oboe", "tuba"],
    sport: ["golf", "judo"], bodypart: ["ear", "elbow"], clothing: ["hat", "scarf"], element: ["tin", "iron"],
    job: ["chef", "nurse"], kitchen: ["pan", "whisk"], tree: ["oak", "yew"], flower: ["rose", "tulip"],
    vehicle: ["bus", "tram"], language: ["thai", "welsh"], shape: ["cube", "oval"], furniture: ["bed", "sofa"],
    bird: ["owl", "wren"], capital: ["rome", "oslo"],
  };
  for (const [id, words] of Object.entries(cases)) {
    for (const w of words) assert.ok(G.validateWord(w, cat(id)).ok, `${w} should be ${cats[id].noun}`);
  }
  assert.ok(!G.validateWord("peru", cat("fruit")).ok);
  assert.ok(!G.validateWord("fig", cat("country")).ok);
});

test("British and American spellings are both accepted", () => {
  const pairs = [
    ["colour", "grey", "gray"], ["element", "aluminium", "aluminum"], ["element", "sulphur", "sulfur"],
    ["element", "caesium", "cesium"], ["clothing", "pyjamas", "pajamas"], ["vehicle", "aeroplane", "airplane"],
    ["bodypart", "oesophagus", "esophagus"], ["job", "jeweller", "jeweler"], ["job", "labourer", "laborer"],
    ["colour", "ochre", "ocher"], ["vegetable", "chilli", "chili"], ["instrument", "synthesiser", "synthesizer"],
  ];
  for (const [id, uk, us] of pairs) {
    assert.ok(cats[id].words.includes(uk), `${id}: ${uk}`);
    assert.ok(cats[id].words.includes(us), `${id}: ${us}`);
  }
});

test("the same word can't count in two rows", () => {
  const pool = "limelimeapea";
  let b = G.newBoard(1, pool);
  const rowsCats = [cat("fruit"), cat("colour"), cat("vegetable")];
  for (const ch of "lime") b = G.placeLetter(b, ch).board;
  b = G.setActive(b, 1);
  for (const ch of "lime") b = G.placeLetter(b, ch).board;
  b = G.setActive(b, 2);
  for (const ch of "pea") b = G.placeLetter(b, ch).board;
  const results = G.checkBoard(b, rowsCats);
  assert.equal(results[0].ok, true);
  assert.deepEqual(results[1], { word: "lime", ok: false, reason: "Already used in row 1." });
  assert.equal(results[2].ok, true);
  assert.equal(G.finish(b, rowsCats).finished, false);
});

test("finishing needs three words that count, and records what's left", () => {
  const pool = "catperufigo";
  const rowsCats = [cat("animal"), cat("country"), cat("fruit")];
  let b = G.newBoard(1, pool);
  for (const ch of "cat") b = G.placeLetter(b, ch).board;
  b = G.setActive(b, 1);
  for (const ch of "per") b = G.placeLetter(b, ch).board;
  let r = G.finish(b, rowsCats);
  assert.equal(r.finished, false);
  assert.equal(r.board.status[1].reason, "Not a country we know.");
  assert.equal(r.board.status[2].reason, "Empty.");
  b = G.placeLetter(r.board, "u").board;
  b = G.setActive(b, 2);
  for (const ch of "fig") b = G.placeLetter(b, ch).board;
  r = G.finish(b, rowsCats);
  assert.equal(r.finished, true);
  assert.equal(r.board.done, true);
  assert.equal(r.board.left, 1);
});

test("word lists are tidy: lowercase A-Z, 3+ letters, no duplicates", () => {
  for (const [id, c] of Object.entries(cats)) {
    assert.ok(c.label && c.noun, `${id} has a label and noun`);
    assert.equal(new Set(c.words).size, c.words.length, `${id} has duplicates`);
    for (const w of c.words) assert.match(w, /^[a-z]{3,}$/, `${id}: "${w}"`);
  }
});

test("the big categories have 150+ words", () => {
  for (const id of ["animal", "country", "job", "clothing"]) {
    assert.ok(cats[id].words.length >= 150, `${id}: ${cats[id].words.length}`);
  }
});

test("no rude or loaded words slipped in", () => {
  const banned = ["ass", "bitch", "cock", "tit", "tits", "booby", "shag", "pussy", "coon", "dick", "butt", "penis", "nipple"];
  for (const [id, c] of Object.entries(cats)) {
    for (const b of banned) assert.ok(!c.words.includes(b), `${id} contains ${b}`);
  }
});
