import { test } from "node:test";
import assert from "node:assert/strict";
import { shareText, resultLine, numberWord } from "../site/js/share.js";

test("share text matches the agreed format", () => {
  const text = shareText({ name: "Plenum", number: 42, lengths: [5, 4, 6], left: 2, par: 1, url: "https://example.com" });
  assert.equal(text, "Plenum #42\n▮▮▮▮▮ ▮▮▮▮ ▮▮▮▮▮▮\n2 left (par 1)\nhttps://example.com");
});

test("share text gives nothing away but word lengths", () => {
  const text = shareText({ name: "Plenum", number: 1, lengths: [3, 4, 3], left: 1, par: 1, url: "https://example.com" });
  const [, blocks, score] = text.split("\n");
  assert.equal(blocks, "▮▮▮ ▮▮▮▮ ▮▮▮");
  assert.match(blocks, /^[▮ ]+$/);
  assert.match(score, /^\d+ left \(par \d+\)$/);
});

test("result line reads plainly", () => {
  assert.equal(resultLine(2, 1), "Two left. Par was one.");
  assert.equal(resultLine(1, 1), "One left. That's par.");
  assert.equal(resultLine(3, 3), "Three left. That's par.");
  assert.equal(resultLine(9, 2), "Nine left. Par was two.");
});

test("number words", () => {
  assert.equal(numberWord(0), "none");
  assert.equal(numberWord(12, true), "Twelve");
  assert.equal(numberWord(40), "40");
});
